import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService } from './real';
import { DomainEvent } from '@skillforge/contract';

const mockPrisma = vi.hoisted(() => ({
  project: {
    findUnique: vi.fn(),
  },
  projectMember: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
  },
  user: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
  chatRoom: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  message: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
  },
  messageReport: {
    create: vi.fn(),
  },
  report: {
    create: vi.fn(),
  },
  activityFeedEntry: {
    findMany: vi.fn(),
    count: vi.fn(),
    create: vi.fn(),
  },
  notification: {
    create: vi.fn(),
  },
  task: {
    findUnique: vi.fn(),
    findMany: vi.fn(),
  },
}));

const mockEventBus = vi.hoisted(() => {
  const listeners: Record<string, Function[]> = {};
  return {
    emitEvent: vi.fn((event: string, payload: any) => {
      (listeners[event] || []).forEach((cb) => cb(payload));
    }),
    onEvent: vi.fn((event: string, cb: Function) => {
      listeners[event] = listeners[event] || [];
      listeners[event].push(cb);
    }),
    listeners,
  };
});

const mockSocket = vi.hoisted(() => ({
  broadcastToProject: vi.fn(),
  broadcastToChat: vi.fn(),
  removeUserFromProjectRoom: vi.fn(),
}));

vi.mock('@prisma/client', () => ({
  PrismaClient: vi.fn(() => mockPrisma),
}));

vi.mock('../../core/eventBus', () => ({
  eventBus: mockEventBus,
}));

vi.mock('../../core/socket', () => mockSocket);

describe('Project Room & Chat RealService Tests', () => {
  let service: RealService;

  beforeEach(() => {
    vi.clearAllMocks();
    service = new RealService();
  });

  describe('1:1 Chat Privacy (Server-side Enforcement)', () => {
    it('should strictly deny access (403 FORBIDDEN) to a non-participant even if they are project owner', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({
        id: 'direct-room-123',
        projectId: 'proj-1',
        type: 'direct',
        participant1Id: 'user-002',
        participant2Id: 'user-003',
      });

      // Project owner (user-001) tries to spy/read messages of 1:1 conversation between user-002 and user-003
      await expect(
        service.getDirectChatMessages('direct-room-123', 'user-001', {})
      ).rejects.toMatchObject({
        status: 403,
        code: 'FORBIDDEN',
      });
    });

    it('should allow access to participant1 or participant2', async () => {
      mockPrisma.chatRoom.findUnique.mockResolvedValue({
        id: 'direct-room-123',
        projectId: 'proj-1',
        type: 'direct',
        participant1Id: 'user-002',
        participant2Id: 'user-003',
      });
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }, { userId: 'user-003', status: 'active' }],
      });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-002', email: 'user2@example.com' },
        { id: 'user-003', email: 'user3@example.com' },
      ]);
      mockPrisma.message.findMany.mockResolvedValue([
        {
          id: 'msg-1',
          roomId: 'direct-room-123',
          senderId: 'user-002',
          content: 'Secret direct message',
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrisma.message.count.mockResolvedValue(1);

      const result = await service.getDirectChatMessages('direct-room-123', 'user-002', {});
      expect(result.items.length).toBe(1);
      expect(result.items[0].content).toBe('Secret direct message');
    });
  });

  describe('Former Member Message Labeling', () => {
    it('should label past messages as "Former member" when sender has left or was removed', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [
          { userId: 'user-001', status: 'active' },
          // user-002 has left and is no longer in active members
        ],
      });
      mockPrisma.chatRoom.findFirst.mockResolvedValue({
        id: 'group-room-1',
        projectId: 'proj-1',
        type: 'group',
      });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-001', email: 'owner@example.com' },
        { id: 'user-002', email: 'exmember@example.com' },
      ]);
      mockPrisma.message.findMany.mockResolvedValue([
        {
          id: 'msg-old',
          roomId: 'group-room-1',
          senderId: 'user-002',
          content: 'Old team message before leaving',
          deleted: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ]);
      mockPrisma.message.count.mockResolvedValue(1);

      const result = await service.getProjectMessages('proj-1', 'user-001', {});
      expect(result.items[0].senderName).toBe('Former member');
      expect(result.items[0].isFormerMember).toBe(true);
      expect(result.items[0].content).toBe('Old team message before leaving');
    });
  });

  describe('@Mention Picker and Restrictions', () => {
    it('should only permit active project members in mentions and send notifications to them', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        title: 'Alpha Project',
        ownerId: 'user-001',
        members: [
          { userId: 'user-002', status: 'active' },
          { userId: 'user-003', status: 'active' },
        ],
      });
      mockPrisma.chatRoom.findFirst.mockResolvedValue({
        id: 'group-room-1',
        projectId: 'proj-1',
        type: 'group',
      });
      mockPrisma.user.findMany.mockResolvedValue([
        { id: 'user-001', email: 'owner@example.com' },
        { id: 'user-002', email: 'dev2@example.com' },
        { id: 'user-003', email: 'dev3@example.com' },
      ]);
      mockPrisma.message.create.mockImplementation(({ data }) => ({
        id: 'msg-100',
        ...data,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      // Send with mention of user-002 (valid) and random-intruder (invalid)
      const sent = await service.sendProjectMessage('proj-1', 'user-001', {
        content: 'Hey @user-002 check this out',
        mentions: ['user-002', 'random-intruder'],
      });

      expect(sent.mentions).toEqual(['user-002']);
      expect(mockPrisma.notification.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            userId: 'user-002',
            type: 'mention',
          }),
        })
      );
    });
  });

  describe('Message Edit Window & Soft-Delete', () => {
    it('should allow editing within 10 minutes and add edited: true', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }],
      });
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        senderId: 'user-002',
        roomId: 'group-room-1',
        deleted: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 mins ago
        room: { type: 'group' },
      });
      mockPrisma.message.update.mockResolvedValue({
        id: 'msg-1',
        senderId: 'user-002',
        roomId: 'group-room-1',
        content: 'Updated content',
        edited: true,
        editedAt: new Date(),
        deleted: false,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        updatedAt: new Date(),
      });
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-002', email: 'u2@test.com' }]);

      const edited = await service.editMessage('proj-1', 'msg-1', 'user-002', { content: 'Updated content' });
      expect(edited.content).toBe('Updated content');
      expect(edited.edited).toBe(true);
    });

    it('should reject editing if older than 10 minutes', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }],
      });
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-1',
        senderId: 'user-002',
        roomId: 'group-room-1',
        deleted: false,
        createdAt: new Date(Date.now() - 15 * 60 * 1000), // 15 mins ago
        room: { type: 'group' },
      });

      await expect(
        service.editMessage('proj-1', 'msg-1', 'user-002', { content: 'Too late edit' })
      ).rejects.toMatchObject({
        status: 400,
        code: 'VALIDATION_ERROR',
      });
    });

    it('should soft-delete message and replace content with (deleted)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }],
      });
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-del',
        senderId: 'user-002',
        roomId: 'group-room-1',
        room: { type: 'group' },
      });
      mockPrisma.message.update.mockResolvedValue({
        id: 'msg-del',
        senderId: 'user-002',
        roomId: 'group-room-1',
        content: '(deleted)',
        deleted: true,
        deletedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      mockPrisma.user.findMany.mockResolvedValue([{ id: 'user-002', email: 'u2@test.com' }]);

      const deleted = await service.deleteMessage('proj-1', 'msg-del', 'user-002');
      expect(deleted.deleted).toBe(true);
      expect(deleted.content).toBe('(deleted)');
    });
  });

  describe('Report/Flag Message', () => {
    it('should create a MessageReport record in pending state', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        ownerId: 'user-001',
        members: [{ userId: 'user-002', status: 'active' }],
      });
      mockPrisma.message.findUnique.mockResolvedValue({
        id: 'msg-flag',
      });
      mockPrisma.report.create.mockResolvedValue({
        id: 'report-999',
        type: 'message',
        status: 'pending',
      });

      const res = await service.reportMessage('proj-1', 'msg-flag', 'user-002', {
        reason: 'Harassment or offensive language',
      });

      expect(res.success).toBe(true);
      expect(res.reportId).toBe('report-999');
    });
  });

  describe('Activity Feed Event Subscription', () => {
    it('should persist ActivityFeedEntry on MemberJoined and MemberLeft events', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({ id: 'user-005', email: 'designer@example.com' });
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'proj-1',
        title: 'Project Alpha',
        ownerId: 'user-001',
        members: [{ userId: 'user-001' }],
      });

      // Fire MemberJoined on event bus
      mockEventBus.emitEvent(DomainEvent.MemberJoined, { projectId: 'proj-1', userId: 'user-005' });
      await new Promise((r) => setTimeout(r, 20));

      expect(mockPrisma.activityFeedEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: 'proj-1',
            action: 'MemberJoined',
            userId: 'user-005',
          }),
        })
      );

      // Fire MemberLeft on event bus
      mockEventBus.emitEvent(DomainEvent.MemberLeft, { projectId: 'proj-1', userId: 'user-005' });
      await new Promise((r) => setTimeout(r, 20));

      expect(mockPrisma.activityFeedEntry.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            projectId: 'proj-1',
            action: 'MemberLeft',
            userId: 'user-005',
          }),
        })
      );
      expect(mockSocket.removeUserFromProjectRoom).toHaveBeenCalledWith('proj-1', 'user-005');
    });
  });
});
