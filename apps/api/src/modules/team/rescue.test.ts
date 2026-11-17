import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService } from './real';
import { DomainEvent } from '@skillforge/contract';
import { eventBus } from '../../core/eventBus';

const mockPrisma = vi.hoisted(() => ({
  project: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn()
  },
  projectGap: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  handoverNote: {
    findMany: vi.fn(),
    create: vi.fn()
  },
  projectInvitation: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  joinRequest: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  projectMember: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  projectRole: {
    create: vi.fn(),
    update: vi.fn()
  },
  projectRequirement: {
    findMany: vi.fn()
  },
  task: {
    findFirst: vi.fn(),
    findMany: vi.fn(),
    updateMany: vi.fn()
  },
  taskComment: {
    findFirst: vi.fn()
  }
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma)
}));

vi.mock('../../core/eventBus', () => ({
  eventBus: {
    emitEvent: vi.fn()
  }
}));

describe('Project Rescue & Replacement (PRD Area 16)', () => {
  let service: RealService;

  beforeEach(() => {
    service = new RealService();
    vi.clearAllMocks();
  });

  // 1. MemberLeft creates a draft gap & preserves outgoing member history
  describe('Trigger: MemberLeft & History Attribution', () => {
    it('creates a draft gap and marks open tasks for reassignment when member is removed', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ id: 'm1', userId: 'departed-1', role: 'ML Engineer', status: 'active' }]
      });
      mockPrisma.projectMember.findFirst.mockResolvedValue({
        id: 'm1',
        projectId: 'p1',
        userId: 'departed-1',
        role: 'ML Engineer',
        status: 'active'
      });
      mockPrisma.projectMember.update.mockResolvedValue({
        id: 'm1',
        userId: 'departed-1',
        role: 'ML Engineer',
        status: 'removed',
        removalReason: 'Moving to another company'
      });
      mockPrisma.task.updateMany.mockResolvedValue({ count: 2 });
      mockPrisma.projectRequirement.findMany.mockResolvedValue([
        { skillName: 'Python' },
        { skillName: 'PyTorch' }
      ]);
      mockPrisma.projectGap.create.mockResolvedValue({
        id: 'gap-auto-1',
        projectId: 'p1',
        roleTitle: 'ML Engineer',
        skillsJson: JSON.stringify(['Python', 'PyTorch']),
        targetProficiency: 'intermediate',
        hoursPerWeek: 10,
        status: 'open',
        origin: 'member_left',
        departedUserId: 'departed-1'
      });

      const res = await service.removeMember('p1', 'departed-1', 'owner-1', {
        reason: 'Moving to another company'
      });

      // Member history is preserved (status: removed, not deleted)
      expect(mockPrisma.projectMember.delete).not.toHaveBeenCalled();
      expect(mockPrisma.projectMember.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'removed', removalReason: 'Moving to another company' })
        })
      );

      // Tasks flagged for reassignment
      expect(mockPrisma.task.updateMany).toHaveBeenCalledWith({
        where: {
          projectId: 'p1',
          assigneeId: 'departed-1',
          status: { in: ['To Do', 'In Progress', 'In Review'] }
        },
        data: { needsReassignment: true }
      });

      // Auto draft gap created prefilled with departing role & skills
      expect(mockPrisma.projectGap.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: 'p1',
            roleTitle: 'ML Engineer',
            origin: 'member_left',
            departedUserId: 'departed-1'
          })
        })
      );

      expect(eventBus.emitEvent).toHaveBeenCalledWith(
        DomainEvent.GapOpened,
        expect.objectContaining({ gapId: 'gap-auto-1', projectId: 'p1', origin: 'member_left' })
      );
      expect(eventBus.emitEvent).toHaveBeenCalledWith(
        DomainEvent.MemberLeft,
        { projectId: 'p1', userId: 'departed-1' }
      );
      expect(res.data.gap).toBeDefined();
    });

    it('creates a draft gap when a member voluntarily leaves project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });
      mockPrisma.projectMember.findFirst.mockResolvedValue({
        id: 'm2',
        projectId: 'p1',
        userId: 'volunteer-leave',
        role: 'Backend Developer',
        status: 'active'
      });
      mockPrisma.projectMember.update.mockResolvedValue({
        id: 'm2',
        status: 'left',
        leaveReason: 'Relocating'
      });
      mockPrisma.task.updateMany.mockResolvedValue({ count: 1 });
      mockPrisma.projectRequirement.findMany.mockResolvedValue([{ skillName: 'Node.js' }]);
      mockPrisma.projectGap.create.mockResolvedValue({
        id: 'gap-auto-2',
        projectId: 'p1',
        roleTitle: 'Backend Developer',
        skillsJson: JSON.stringify(['Node.js']),
        status: 'open',
        origin: 'member_left'
      });

      const res = await service.leaveProject('p1', 'volunteer-leave', { reason: 'Relocating' });
      expect(mockPrisma.projectMember.delete).not.toHaveBeenCalled();
      expect(res.data.member.status).toBe('left');
      expect(mockPrisma.projectGap.create).toHaveBeenCalled();
      expect(eventBus.emitEvent).toHaveBeenCalledWith(
        DomainEvent.GapOpened,
        expect.objectContaining({ origin: 'member_left' })
      );
    });
  });

  // 2. Owner-only authorization for gaps
  describe('Owner-Only Authorization', () => {
    it('rejects non-owner from creating a gap', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });

      await expect(
        service.createGap('p1', 'unauthorized-user', {
          roleTitle: 'DevOps Engineer',
          skills: ['Docker', 'AWS'],
          hoursPerWeek: 15
        })
      ).rejects.toMatchObject({ status: 403 });
    });

    it('rejects non-owner from updating a gap', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });

      await expect(
        service.updateGap('p1', 'gap-1', 'unauthorized-user', {
          status: 'cancelled'
        })
      ).rejects.toMatchObject({ status: 403 });
    });
  });

  // 3. Gap closes on invitation accept & normal join request accept
  describe('Gap Closure Lifecycle', () => {
    it('closes gap automatically when gap-linked invitation is accepted', async () => {
      mockPrisma.projectInvitation.findUnique.mockResolvedValue({
        id: 'inv-gap-1',
        projectId: 'p1',
        inviteeId: 'candidate-1',
        role: 'ML Engineer',
        gapId: 'gap-001',
        status: 'pending',
        expiresAt: new Date(Date.now() + 86400000),
        project: {
          roles: [{ id: 'role-1', title: 'ML Engineer', openings: 1, filled: 0 }],
          members: []
        }
      });
      mockPrisma.projectInvitation.update.mockResolvedValue({ id: 'inv-gap-1', status: 'accepted' });
      mockPrisma.projectMember.create.mockResolvedValue({ id: 'm-new', userId: 'candidate-1' });
      mockPrisma.projectRole.update.mockResolvedValue({ id: 'role-1', filled: 1 });
      mockPrisma.projectGap.update.mockResolvedValue({ id: 'gap-001', status: 'filled' });

      await service.respondInvitation('inv-gap-1', 'candidate-1', { response: 'accept' });

      expect(mockPrisma.projectGap.update).toHaveBeenCalledWith({
        where: { id: 'gap-001' },
        data: { status: 'filled' }
      });
      expect(eventBus.emitEvent).toHaveBeenCalledWith(
        DomainEvent.GapFilled,
        expect.objectContaining({ gapId: 'gap-001', projectId: 'p1', replacementUserId: 'candidate-1' })
      );
    });

    it('closes gap automatically when regular join request is accepted for matching role', async () => {
      mockPrisma.joinRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        projectId: 'p1',
        userId: 'candidate-2',
        role: 'ML Engineer',
        status: 'Pending',
        version: 1,
        project: {
          ownerId: 'owner-1',
          roles: [{ id: 'role-1', title: 'ML Engineer', openings: 1, filled: 0 }],
          members: []
        }
      });
      mockPrisma.joinRequest.update.mockResolvedValue({ id: 'req-1', status: 'Accepted' });
      mockPrisma.projectMember.create.mockResolvedValue({ id: 'm-new', userId: 'candidate-2' });
      mockPrisma.projectRole.update.mockResolvedValue({ id: 'role-1', filled: 1 });
      mockPrisma.projectGap.findFirst.mockResolvedValue({
        id: 'gap-002',
        projectId: 'p1',
        roleTitle: 'ML Engineer',
        status: 'open'
      });
      mockPrisma.projectGap.update.mockResolvedValue({ id: 'gap-002', status: 'filled' });

      await service.respondJoinRequest('req-1', 'owner-1', { action: 'accept', version: 1 });

      expect(mockPrisma.projectGap.update).toHaveBeenCalledWith({
        where: { id: 'gap-002' },
        data: { status: 'filled' }
      });
      expect(eventBus.emitEvent).toHaveBeenCalledWith(
        DomainEvent.GapFilled,
        expect.objectContaining({ gapId: 'gap-002', projectId: 'p1', replacementUserId: 'candidate-2' })
      );
    });
  });

  // 4. Candidate Summary vs Full Handover Visibility
  describe('Handover Visibility Gating', () => {
    it('shows full handover details to project owner and active team members', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ id: 'm1', userId: 'active-member-1', status: 'active' }]
      });
      mockPrisma.handoverNote.findMany.mockResolvedValue([
        {
          id: 'hn-1',
          projectId: 'p1',
          gapId: 'gap-1',
          authorId: 'departed-1',
          workState: 'Finished core pipeline. API routes need bug fix.',
          unfinishedTasksJson: JSON.stringify(['task-101', 'task-102']),
          repoInfo: 'Branch: feature/ml-v2; Needs GPU flag',
          decisions: 'Chose FastAPI for speed and async concurrency.',
          candidateSummary: 'Takes over ML deployment and API wiring.',
          createdAt: new Date()
        }
      ]);

      const res = await service.getHandover('p1', 'owner-1', 'gap-1');
      const note = res.data[0] as any;
      expect(note.workState).toBe('Finished core pipeline. API routes need bug fix.');
      expect(note.unfinishedTasks).toEqual(['task-101', 'task-102']);
      expect(note.repoInfo).toBe('Branch: feature/ml-v2; Needs GPU flag');
      expect(note.decisions).toBe('Chose FastAPI for speed and async concurrency.');
    });

    it('restricts external candidates / non-members to only candidateSummary', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ id: 'm1', userId: 'active-member-1', status: 'active' }]
      });
      mockPrisma.handoverNote.findMany.mockResolvedValue([
        {
          id: 'hn-1',
          projectId: 'p1',
          gapId: 'gap-1',
          authorId: 'departed-1',
          workState: 'Internal sensitive server credentials and state',
          unfinishedTasksJson: JSON.stringify(['task-101']),
          repoInfo: 'Private keys stored in .env',
          decisions: 'Secret architecture choice',
          candidateSummary: 'Takes over ML deployment and API wiring.',
          createdAt: new Date()
        }
      ]);

      // Non-member candidate queries handover before accepting
      const res = await service.getHandover('p1', 'candidate-external-id', 'gap-1');
      const note = res.data[0] as any;
      expect(note.candidateSummary).toBe('Takes over ML deployment and API wiring.');
      // Sensitive fields must NOT be leaked
      expect(note.workState).toBeUndefined();
      expect(note.unfinishedTasks).toBeUndefined();
      expect(note.repoInfo).toBeUndefined();
      expect(note.decisions).toBeUndefined();
    });
  });

  // 5. Inactivity detection threshold
  describe('Inactivity Detection Threshold', () => {
    it('detects inactive members exceeding threshold days and prompts owner', async () => {
      const twentyDaysAgo = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000);
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [
          { id: 'm-owner', userId: 'owner-1', role: 'Lead', status: 'active', joinedAt: twentyDaysAgo },
          { id: 'm-inactive', userId: 'inactive-user', role: 'UI Designer', status: 'active', joinedAt: twentyDaysAgo, user: { id: 'inactive-user', email: 'designer@example.com' } }
        ]
      });
      mockPrisma.task.findMany.mockResolvedValue([{ id: 't1' }]);
      mockPrisma.task.findFirst.mockResolvedValue(null);
      mockPrisma.taskComment.findFirst.mockResolvedValue(null);

      const res = await service.checkInactivity('p1', 'owner-1', 14);
      expect(res.data.inactiveMembers).toHaveLength(1);
      expect(res.data.inactiveMembers[0].userId).toBe('inactive-user');
      expect(res.data.inactiveMembers[0].inactiveDays).toBeGreaterThanOrEqual(19);
    });
  });

  // 6. Duplicate Gap Warning and Merge
  describe('Duplicate Gap Warning & Merging', () => {
    it('warns when an open gap for the same role already exists unless merge flag is provided', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });
      mockPrisma.projectGap.findFirst.mockResolvedValue({
        id: 'gap-existing-1',
        projectId: 'p1',
        roleTitle: 'Frontend Engineer',
        skillsJson: JSON.stringify(['React']),
        hoursPerWeek: 10,
        status: 'open'
      });

      await expect(
        service.createGap('p1', 'owner-1', {
          roleTitle: 'Frontend Engineer',
          skills: ['TypeScript'],
          hoursPerWeek: 15
        })
      ).rejects.toMatchObject({
        status: 409,
        code: 'DUPLICATE_GAP_WARNING'
      });
    });

    it('merges skills when merge flag is confirmed', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });
      mockPrisma.projectGap.findFirst.mockResolvedValue({
        id: 'gap-existing-1',
        projectId: 'p1',
        roleTitle: 'Frontend Engineer',
        skillsJson: JSON.stringify(['React']),
        hoursPerWeek: 10,
        targetProficiency: 'intermediate',
        status: 'open'
      });
      mockPrisma.projectGap.update.mockResolvedValue({
        id: 'gap-existing-1',
        projectId: 'p1',
        roleTitle: 'Frontend Engineer',
        skillsJson: JSON.stringify(['React', 'TypeScript']),
        hoursPerWeek: 15,
        targetProficiency: 'advanced',
        status: 'open'
      });

      const res = await service.createGap('p1', 'owner-1', {
        roleTitle: 'Frontend Engineer',
        skills: ['TypeScript'],
        hoursPerWeek: 15,
        targetProficiency: 'advanced',
        merge: true
      });

      expect((res.data as any).merged).toBe(true);
      expect(res.data.skills).toContain('React');
      expect(res.data.skills).toContain('TypeScript');
    });
  });
});
