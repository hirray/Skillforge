import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService } from './real';
import { ErrorCode } from '@skillforge/contract';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
  },
  project: {
    findUnique: vi.fn(),
  },
  mentorProfile: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  mentorshipRequest: {
    findFirst: vi.fn(),
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn(),
  },
  mentorFeedback: {
    findMany: vi.fn(),
    create: vi.fn(),
  },
  milestone: {
    findUnique: vi.fn(),
  },
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

vi.mock('../../core/eventBus', () => ({
  eventBus: {
    emitEvent: vi.fn(),
  },
}));

describe('Module 27: Mentor / Expert Layer RealService', () => {
  let service: RealService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RealService();
    mockPrisma.mentorshipRequest.updateMany.mockResolvedValue({ count: 0 });
  });

  describe('27.1 Opt-in Mentor Profile & Directory', () => {
    it('creates or updates a mentor profile with skills, domains, and formats', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-003', email: 'pro@example.com' });
      mockPrisma.mentorProfile.upsert.mockResolvedValue({
        id: 'prof-1',
        userId: 'user-003',
        expertiseSkillIds: JSON.stringify(['React', 'TypeScript']),
        domains: JSON.stringify(['Web', 'SaaS']),
        availability: '5 hrs/week',
        formats: JSON.stringify(['async_review', 'live_call']),
        bio: 'Senior architect',
        active: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-003', email: 'pro@example.com', name: 'Pro Dev' },
      });

      const profile = await service.upsertProfile('user-003', {
        expertiseSkillIds: ['React', 'TypeScript'],
        domains: ['Web', 'SaaS'],
        availability: '5 hrs/week',
        formats: ['async_review', 'live_call'],
        bio: 'Senior architect',
      });

      expect(profile.userId).toBe('user-003');
      expect(profile.expertiseSkillIds).toEqual(['React', 'TypeScript']);
      expect(profile.domains).toEqual(['Web', 'SaaS']);
      expect(profile.availability).toBe('5 hrs/week');
      expect(profile.formats).toContain('async_review');
    });

    it('lists active mentors and filters by skill chips and domain chips', async () => {
      mockPrisma.mentorProfile.findMany.mockResolvedValue([
        {
          id: 'prof-1',
          userId: 'user-003',
          expertiseSkillIds: JSON.stringify(['React', 'TypeScript']),
          domains: JSON.stringify(['Web', 'Frontend']),
          availability: '5 hrs/week',
          formats: JSON.stringify(['async_review']),
          bio: 'Frontend expert',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 'user-003', email: 'pro@example.com', name: 'Pro Dev' },
        },
        {
          id: 'prof-2',
          userId: 'user-004',
          expertiseSkillIds: JSON.stringify(['Python', 'PyTorch']),
          domains: JSON.stringify(['AI/ML', 'Data']),
          availability: '3 hrs/week',
          formats: JSON.stringify(['live_call']),
          bio: 'ML researcher',
          active: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          user: { id: 'user-004', email: 'ml@example.com', name: 'ML Lead' },
        },
      ]);

      const reactMentors = await service.listMentors({ skill: 'React' });
      expect(reactMentors).toHaveLength(1);
      expect(reactMentors[0].userId).toBe('user-003');

      const mlMentors = await service.listMentors({ domain: 'AI/ML' });
      expect(mlMentors).toHaveLength(1);
      expect(mlMentors[0].userId).toBe('user-004');
    });
  });

  describe('27.2 Mentorship Requests & Auto-Expiry', () => {
    it('creates a mentorship request with a 7-day auto-expiry window', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        title: 'Alpha Project',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }],
      });
      mockPrisma.mentorProfile.findUnique.mockResolvedValue({
        userId: 'user-003',
        active: true,
      });
      mockPrisma.mentorshipRequest.findFirst.mockResolvedValue(null);
      mockPrisma.mentorshipRequest.create.mockImplementation(({ data }) => ({
        id: 'req-1',
        ...data,
        project: { id: 'proj-1', title: 'Alpha Project', stage: 'Idea' },
        mentor: { id: 'user-003', email: 'pro@example.com' },
      }));

      const req = await service.requestMentorship('user-001', {
        projectId: 'proj-1',
        mentorId: 'user-003',
        scope: 'general',
        message: 'We would love feedback on our system design',
        proposedTime: 'Next Tuesday 3pm UTC',
      });

      expect(req.id).toBe('req-1');
      expect(req.status).toBe('pending');
      // Verify expiry is set roughly 7 days in the future
      const diffMs = new Date(req.expiresAt).getTime() - Date.now();
      const diffDays = diffMs / (1000 * 60 * 60 * 24);
      expect(diffDays).toBeGreaterThan(6.9);
      expect(diffDays).toBeLessThanOrEqual(7.1);
    });

    it('rejects requesting an active project member as mentor (400)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }],
      });

      await expect(
        service.requestMentorship('user-001', {
          projectId: 'proj-1',
          mentorId: 'user-002', // already member
          message: 'Please mentor us',
        })
      ).rejects.toMatchObject({
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('rejects duplicate pending requests for the same mentor & project (400)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [],
      });
      mockPrisma.mentorProfile.findUnique.mockResolvedValue({
        userId: 'user-003',
        active: true,
      });
      mockPrisma.mentorshipRequest.findFirst.mockResolvedValue({
        id: 'req-existing',
        status: 'pending',
        expiresAt: new Date(Date.now() + 500000),
      });

      await expect(
        service.requestMentorship('user-001', {
          projectId: 'proj-1',
          mentorId: 'user-003',
          message: 'Second duplicate request',
        })
      ).rejects.toMatchObject({
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('allows the mentor to accept or decline the request', async () => {
      mockPrisma.mentorshipRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        projectId: 'proj-1',
        mentorId: 'user-003',
        status: 'pending',
        expiresAt: new Date(Date.now() + 100000),
      });
      mockPrisma.mentorshipRequest.update.mockResolvedValue({
        id: 'req-1',
        projectId: 'proj-1',
        mentorId: 'user-003',
        status: 'accepted',
      });

      const accepted = await service.respondRequest('req-1', 'user-003', { response: 'accept' });
      expect(accepted.status).toBe('accepted');
    });

    it('forbids other users from responding to the mentorship request (403)', async () => {
      mockPrisma.mentorshipRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        projectId: 'proj-1',
        mentorId: 'user-003',
        status: 'pending',
        expiresAt: new Date(Date.now() + 100000),
      });

      await expect(
        service.respondRequest('req-1', 'user-intruder', { response: 'accept' })
      ).rejects.toMatchObject({
        status: 403,
        code: ErrorCode.FORBIDDEN,
      });
    });
  });

  describe('27.3 Scoped Read-Only Access & 27.4 Advisory Feedback', () => {
    it('allows an accepted mentor to leave advisory feedback tagged with isAdvisory: true', async () => {
      mockPrisma.mentorshipRequest.findFirst.mockResolvedValue({
        id: 'req-1',
        projectId: 'proj-1',
        mentorId: 'user-003',
        status: 'accepted',
      });
      mockPrisma.mentorFeedback.create.mockResolvedValue({
        id: 'fb-1',
        projectId: 'proj-1',
        mentorId: 'user-003',
        text: 'Consider decoupling the state management here.',
        isAdvisory: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const feedback = await service.createFeedback('proj-1', 'user-003', {
        text: 'Consider decoupling the state management here.',
      });

      expect(feedback.isAdvisory).toBe(true);
      expect(feedback.text).toContain('Consider decoupling');
    });

    it('rejects feedback from non-accepted mentors (403)', async () => {
      mockPrisma.mentorshipRequest.findFirst.mockResolvedValue(null);

      await expect(
        service.createFeedback('proj-1', 'user-not-mentor', {
          text: 'Unsolicited comment',
        })
      ).rejects.toMatchObject({
        status: 403,
        code: ErrorCode.FORBIDDEN,
      });
    });
  });
});
