import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService, registerTaskEventListeners } from './real';
import { DomainEvent } from '@skillforge/contract';

const mockPrisma = vi.hoisted(() => ({
  project: {
    findUnique: vi.fn()
  },
  projectMember: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn()
  },
  task: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  taskComment: {
    create: vi.fn(),
    findMany: vi.fn()
  },
  taskHistory: {
    create: vi.fn(),
    createMany: vi.fn(),
    findMany: vi.fn()
  },
  taskDependency: {
    findMany: vi.fn(),
    createMany: vi.fn(),
    deleteMany: vi.fn()
  }
}));

const mockEventBus = vi.hoisted(() => {
  const listeners: Record<string, Function[]> = {};
  return {
    emitEvent: vi.fn((event: string, payload: any) => {
      (listeners[event] || []).forEach(cb => cb(payload));
    }),
    onEvent: vi.fn((event: string, cb: Function) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }),
    listeners
  };
});

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma)
}));

vi.mock('../../core/eventBus', () => ({
  eventBus: mockEventBus
}));

describe('Tasks RealService Unit Tests', () => {
  let service: RealService;

  beforeEach(() => {
    service = new RealService();
    vi.clearAllMocks();
  });

  describe('1. Membership & Authorization Restrictions', () => {
    it('should reject non-member trying to list tasks', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      try {
        await service.list('p1', 'intruder-user');
        expect.fail('Should have thrown 403');
      } catch (e: any) {
        expect(e.status).toBe(403);
      }
    });

    it('should reject assigning task to a non-member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      try {
        await service.create('p1', 'owner-1', {
          title: 'Design Logo',
          assigneeId: 'random-stranger'
        });
        expect.fail('Should have thrown 422');
      } catch (e: any) {
        expect(e.status).toBe(422);
        expect(e.code).toBe('INVALID_ASSIGNEE');
      }
    });

    it('should allow project owner or active member to create task', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      mockPrisma.task.create.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        title: 'Build API',
        status: 'To Do',
        priority: 'High',
        assigneeId: 'member-1',
        needsReassignment: false,
        labels: null,
        attachments: null
      });

      mockPrisma.task.findUnique.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        title: 'Build API',
        status: 'To Do',
        priority: 'High',
        assigneeId: 'member-1',
        needsReassignment: false,
        labels: '["Backend"]',
        attachments: '[]',
        comments: [],
        history: [],
        blockedBy: [],
        blocks: []
      });

      const res = await service.create('p1', 'member-1', {
        title: 'Build API',
        priority: 'High',
        assigneeId: 'member-1'
      });

      expect(res.data?.id).toBe('t1');
      expect(mockEventBus.emitEvent).toHaveBeenCalledWith(DomainEvent.TaskCreated, { taskId: 't1', projectId: 'p1' });
    });
  });

  describe('2. Completed Status Immutability & Reopening', () => {
    it('should preserve earlier completion and record history when reopened and completed again', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      const initialCompletedDate = new Date('2026-09-01T10:00:00Z');

      mockPrisma.task.findUnique.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        title: 'Setup DB',
        status: 'Done',
        completedAt: initialCompletedDate,
        assigneeId: 'member-1',
        needsReassignment: false
      });

      mockPrisma.task.update.mockResolvedValue({});

      // 1. Reopen task to In Progress
      await service.update('p1', 't1', 'member-1', { status: 'In Progress' });

      expect(mockPrisma.taskHistory.createMany).toHaveBeenCalledWith({
        data: [
          {
            taskId: 't1',
            field: 'status',
            oldValue: 'Done',
            newValue: 'In Progress',
            userId: 'member-1'
          }
        ]
      });

      // 2. Mark Done again
      mockPrisma.task.findUnique.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        title: 'Setup DB',
        status: 'In Progress',
        completedAt: initialCompletedDate,
        assigneeId: 'member-1',
        needsReassignment: false
      });

      await service.update('p1', 't1', 'member-1', { status: 'Done' });

      // Check task history records the second completion
      expect(mockPrisma.taskHistory.createMany).toHaveBeenCalledWith({
        data: [
          {
            taskId: 't1',
            field: 'status',
            oldValue: 'In Progress',
            newValue: 'Done',
            userId: 'member-1'
          }
        ]
      });

      // Confirm TaskCompleted domain event is emitted
      expect(mockEventBus.emitEvent).toHaveBeenCalledWith(DomainEvent.TaskCompleted, { taskId: 't1', projectId: 'p1' });
    });
  });

  describe('3. Dependency Cycle Detection', () => {
    it('should reject a self-dependency (A depends on A)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      mockPrisma.task.findUnique.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        title: 'Task 1',
        status: 'To Do'
      });

      try {
        await service.update('p1', 't1', 'owner-1', { dependsOnTaskIds: ['t1'] });
        expect.fail('Should have failed cycle check');
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.code).toBe('DEPENDENCY_CYCLE');
      }
    });

    it('should reject direct cyclic dependencies (A depends on B when B already depends on A)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      // task-B already depends on task-A
      mockPrisma.task.findUnique.mockImplementation(async ({ where }: any) => {
        if (where.id === 'task-A') {
          return { id: 'task-A', projectId: 'p1', title: 'Task A', status: 'To Do', dependsOn: '[]' };
        }
        if (where.id === 'task-B') {
          return { id: 'task-B', projectId: 'p1', title: 'Task B', status: 'To Do', dependsOn: JSON.stringify(['task-A']) };
        }
        return null;
      });

      try {
        // Attempting to make task-A depend on task-B
        await service.update('p1', 'task-A', 'owner-1', { dependsOnTaskIds: ['task-B'] });
        expect.fail('Should have failed dependency cycle check');
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.code).toBe('DEPENDENCY_CYCLE');
      }
    });
  });

  describe('4. Reaction to MemberLeft Event', () => {
    it('should unassign tasks and flag needsReassignment when a member leaves', async () => {
      registerTaskEventListeners();

      mockPrisma.task.findMany.mockResolvedValue([
        { id: 'task-101', projectId: 'p1', assigneeId: 'departing-user', status: 'In Progress' },
        { id: 'task-102', projectId: 'p1', assigneeId: 'departing-user', status: 'To Do' }
      ]);

      mockPrisma.task.update.mockResolvedValue({});
      mockPrisma.taskHistory.create.mockResolvedValue({});

      // Trigger DomainEvent.MemberLeft
      mockEventBus.emitEvent(DomainEvent.MemberLeft, {
        projectId: 'p1',
        userId: 'departing-user'
      });

      // Allow async event handler to execute
      await new Promise(r => setTimeout(r, 10));

      expect(mockPrisma.task.update).toHaveBeenCalledWith({
        where: { id: 'task-101' },
        data: { assigneeId: null, needsReassignment: true }
      });

      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith({
        data: {
          taskId: 'task-101',
          field: 'assigneeId',
          oldValue: 'departing-user',
          newValue: 'unassigned (member left)',
          userId: 'system'
        }
      });
    });
  });

  describe('5. Comments and History', () => {
    it('should add a comment and record comment in history', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ userId: 'member-1', status: 'active' }]
      });

      mockPrisma.task.findUnique.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        title: 'Task 1'
      });

      mockPrisma.taskComment.create.mockResolvedValue({
        id: 'c1',
        taskId: 't1',
        userId: 'member-1',
        content: 'Great progress on this task!',
        user: { id: 'member-1', email: 'member@test.com' }
      });

      const res = await service.addComment('p1', 't1', 'member-1', 'Great progress on this task!');
      expect(res.data.id).toBe('c1');
      expect(mockPrisma.taskHistory.create).toHaveBeenCalledWith({
        data: {
          taskId: 't1',
          field: 'comment',
          oldValue: null,
          newValue: 'Great progress on this task!',
          userId: 'member-1'
        }
      });
    });
  });
});
