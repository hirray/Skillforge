import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService } from './real';
import { ErrorCode } from '@skillforge/contract';

const mockPrisma = vi.hoisted(() => ({
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  hackathonEvent: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  eventParticipant: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    upsert: vi.fn(),
  },
  project: {
    findMany: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
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

describe('Module 29: Hackathon / Sprint Mode RealService', () => {
  let service: RealService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RealService();
    mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-001', email: 'user-001@example.com' });
    mockPrisma.hackathonEvent.findMany.mockResolvedValue([]);
  });

  describe('29.1 Event Configuration & Time-Boxed Windows', () => {
    it('creates a hackathon sprint event with scaled start/end timestamps', async () => {
      const startsAt = new Date(Date.now() + 1000 * 60 * 60);
      const endsAt = new Date(Date.now() + 1000 * 60 * 60 * 49);

      mockPrisma.hackathonEvent.create.mockResolvedValue({
        id: 'ev-1',
        name: 'AI Agentic Hackathon',
        description: '48hr build sprint',
        theme: 'Autonomous Agents',
        startsAt,
        endsAt,
        rules: 'Standard hackathon rules',
        suggestedSkillIds: JSON.stringify(['TypeScript', 'Python']),
        status: 'open',
        organizerId: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        organizer: { id: 'user-001', email: 'organizer@example.com' },
      });

      const event = await service.createEvent('user-001', {
        name: 'AI Agentic Hackathon',
        description: '48hr build sprint',
        theme: 'Autonomous Agents',
        startsAt: startsAt.toISOString(),
        endsAt: endsAt.toISOString(),
        rules: 'Standard hackathon rules',
        suggestedSkillIds: ['TypeScript', 'Python'],
      });

      expect(event.id).toBe('ev-1');
      expect(event.theme).toBe('Autonomous Agents');
      expect(event.suggestedSkillIds).toEqual(['TypeScript', 'Python']);
    });

    it('rejects events where start time does not precede end time (400)', async () => {
      const startsAt = new Date(Date.now() + 10000);
      const endsAt = new Date(Date.now() - 10000);

      await expect(
        service.createEvent('user-001', {
          name: 'Invalid Timing',
          description: 'Broken window',
          theme: 'Test',
          startsAt: startsAt.toISOString(),
          endsAt: endsAt.toISOString(),
        })
      ).rejects.toMatchObject({
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
      });
    });

    it('allows organizer to transition event status (open -> running -> ended)', async () => {
      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({
        id: 'ev-1',
        organizerId: 'user-001',
        status: 'open',
      });
      mockPrisma.hackathonEvent.update.mockResolvedValue({
        id: 'ev-1',
        name: 'Event',
        description: 'Desc',
        theme: 'Theme',
        startsAt: new Date(),
        endsAt: new Date(),
        status: 'running',
        organizerId: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
        suggestedSkillIds: '[]',
      });

      const updated = await service.updateStatus('ev-1', 'user-001', 'running');
      expect(updated.status).toBe('running');
    });

    it('forbids non-organizers from altering event status (403)', async () => {
      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({
        id: 'ev-1',
        organizerId: 'user-001',
        status: 'open',
      });

      await expect(
        service.updateStatus('ev-1', 'user-intruder', 'ended')
      ).rejects.toMatchObject({
        status: 403,
        code: ErrorCode.FORBIDDEN,
      });
    });
  });

  describe('29.2 Participant Pool & Looking for Team', () => {
    it('registers user into the participant pool with lookingForTeam status', async () => {
      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({ id: 'ev-1' });
      mockPrisma.eventParticipant.upsert.mockResolvedValue({
        id: 'part-1',
        eventId: 'ev-1',
        userId: 'user-002',
        lookingForTeam: true,
        skillsSnapshot: JSON.stringify(['React', 'GraphQL']),
        createdAt: new Date(),
        updatedAt: new Date(),
        user: { id: 'user-002', email: 'dev@example.com' },
      });

      const participant = await service.joinEvent('ev-1', 'user-002', {
        lookingForTeam: true,
        skillsSnapshot: ['React', 'GraphQL'],
      });

      expect(participant.lookingForTeam).toBe(true);
      expect(participant.skillsSnapshot).toContain('React');
    });
  });

  describe('29.3 Sprint Defaults & Auto-Created Scaled Milestones', () => {
    it('fast-tracks sprint project creation and automatically provisions 3 scaled milestones', async () => {
      const startsAt = new Date('2026-12-01T00:00:00.000Z');
      const endsAt = new Date('2026-12-03T00:00:00.000Z'); // 48h event

      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({
        id: 'ev-1',
        status: 'open',
        startsAt,
        endsAt,
      });
      mockPrisma.project.findFirst.mockResolvedValue(null);
      mockPrisma.project.create.mockImplementation(({ data }) => ({
        id: 'proj-sprint-1',
        ...data,
        milestones: data.milestones.create,
      }));
      mockPrisma.eventParticipant.upsert.mockResolvedValue({ id: 'p1' });

      const project: any = await service.registerProject('ev-1', 'user-001', {
        title: 'Neural Synthesizer',
        description: 'Audio AI sprint demo',
        skills: ['Python', 'WebSockets'],
      });

      expect(project.id).toBe('proj-sprint-1');
      expect(project.eventId).toBe('ev-1');
      expect(project.duration).toBe('Hackathon Sprint');

      // Verify 3 auto-created milestones
      expect(project.milestones).toHaveLength(3);
      expect(project.milestones[0].title).toContain('Ideate & Technical Architecture');
      expect(project.milestones[1].title).toContain('Core Feature Build & Integration');
      expect(project.milestones[2].title).toContain('Sprint Demo & Final Polish');

      // Verify scaled dates
      expect(new Date(project.milestones[0].dueDate).getTime()).toBeLessThan(
        new Date(project.milestones[1].dueDate).getTime()
      );
      expect(new Date(project.milestones[1].dueDate).getTime()).toBeLessThan(
        new Date(project.milestones[2].dueDate).getTime()
      );
    });

    it('rejects duplicate project registrations by the same owner in the same event (400)', async () => {
      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({
        id: 'ev-1',
        status: 'running',
        startsAt: new Date(),
        endsAt: new Date(Date.now() + 100000),
      });
      mockPrisma.project.findFirst.mockResolvedValue({
        id: 'proj-existing',
      });

      await expect(
        service.registerProject('ev-1', 'user-001', {
          title: 'Duplicate Project',
          description: 'Second team',
        })
      ).rejects.toMatchObject({
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
      });
    });
  });

  describe('29.4 Archive-Only Deletion Policy', () => {
    it('safely transitions event to archived if registered teams exist (archive-only rule)', async () => {
      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({
        id: 'ev-1',
        organizerId: 'user-001',
        status: 'open',
      });
      mockPrisma.project.count.mockResolvedValue(3); // 3 teams exist!
      mockPrisma.hackathonEvent.update.mockResolvedValue({
        id: 'ev-1',
        name: 'Sprint Event',
        description: 'Desc',
        theme: 'Theme',
        startsAt: new Date(),
        endsAt: new Date(),
        suggestedSkillIds: '[]',
        status: 'archived',
        organizerId: 'user-001',
        createdAt: new Date(),
        updatedAt: new Date(),
      });

      const res = await service.deleteEvent('ev-1', 'user-001');

      expect(res.archived).toBe(true);
      expect(res.event?.status).toBe('archived');
      expect(mockPrisma.hackathonEvent.delete).not.toHaveBeenCalled();
    });

    it('hard deletes event if no teams have registered yet', async () => {
      mockPrisma.hackathonEvent.findUnique.mockResolvedValue({
        id: 'ev-1',
        organizerId: 'user-001',
        status: 'open',
      });
      mockPrisma.project.count.mockResolvedValue(0); // 0 teams
      mockPrisma.hackathonEvent.delete.mockResolvedValue({ id: 'ev-1' });

      const res = await service.deleteEvent('ev-1', 'user-001');

      expect(res.deleted).toBe(true);
      expect(mockPrisma.hackathonEvent.delete).toHaveBeenCalledWith({ where: { id: 'ev-1' } });
    });
  });
});
