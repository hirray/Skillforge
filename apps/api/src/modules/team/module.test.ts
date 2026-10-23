import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService } from './real';

const mockPrisma = vi.hoisted(() => ({
  project: {
    findUnique: vi.fn(),
    update: vi.fn()
  },
  user: {
    findUnique: vi.fn()
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
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn()
  },
  projectMember: {
    findUnique: vi.fn(),
    findFirst: vi.fn(),
    findMany: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
  },
  projectRole: {
    update: vi.fn()
  },
  memberRoleHistory: {
    create: vi.fn()
  },
  ownershipTransfer: {
    findFirst: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updateMany: vi.fn()
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

describe('Team RealService Unit Tests', () => {
  let service: RealService;

  beforeEach(() => {
    service = new RealService();
    vi.clearAllMocks();
  });

  // 1. Owner authorization checks
  describe('Owner Authorization Checks', () => {
    it('should reject non-owner sending invitation', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        roles: [{ id: 'r1', title: 'Frontend', openings: 2, filled: 0 }],
        members: []
      });

      try {
        await service.createInvitation('p1', 'non-owner-user', { userId: 'u2', role: 'Frontend' });
        expect.fail('Should have thrown 403');
      } catch (e: any) {
        expect(e.status).toBe(403);
      }
    });

    it('should reject non-owner removing member', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ id: 'm1', userId: 'u2', status: 'active' }]
      });

      try {
        await service.removeMember('p1', 'u2', 'non-owner-user', { reason: 'No contribution' });
        expect.fail('Should have thrown 403');
      } catch (e: any) {
        expect(e.status).toBe(403);
      }
    });

    it('should reject non-owner changing member role', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });

      try {
        await service.updateMemberRole('p1', 'u2', 'non-owner-user', { role: 'Backend Lead' });
        expect.fail('Should have thrown 403');
      } catch (e: any) {
        expect(e.status).toBe(403);
      }
    });
  });

  // 2. Invitation Expiry
  describe('Invitation Expiry Guard', () => {
    it('should reject response to expired invitation and update status to Expired', async () => {
      const pastDate = new Date(Date.now() - 24 * 60 * 60 * 1000); // 1 day ago
      mockPrisma.projectInvitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        projectId: 'p1',
        userId: 'u2',
        role: 'Frontend',
        status: 'Pending',
        expiresAt: pastDate,
        project: { roles: [{ id: 'r1', title: 'Frontend', openings: 2, filled: 0 }], members: [] }
      });
      mockPrisma.projectInvitation.update.mockResolvedValue({ id: 'inv-1', status: 'Expired' });

      try {
        await service.respondInvitation('inv-1', 'u2', { response: 'accept' });
        expect.fail('Should have thrown 400 for expired invitation');
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.code).toBe('INVITATION_EXPIRED');
        expect(mockPrisma.projectInvitation.update).toHaveBeenCalledWith(
          expect.objectContaining({ data: expect.objectContaining({ status: 'Expired' }) })
        );
      }
    });
  });

  // 3. Role No Longer Exists / Closed Edge Case
  describe('Role No Longer Available Edge Case', () => {
    it('should auto-invalidate invitation if role was deleted before acceptance', async () => {
      const futureDate = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000);
      mockPrisma.projectInvitation.findUnique.mockResolvedValue({
        id: 'inv-1',
        projectId: 'p1',
        userId: 'u2',
        role: 'DeletedRole',
        status: 'Pending',
        expiresAt: futureDate,
        project: { roles: [{ id: 'r1', title: 'OtherRole', openings: 1, filled: 0 }], members: [] }
      });
      mockPrisma.projectInvitation.update.mockResolvedValue({ id: 'inv-1', status: 'Declined' });

      try {
        await service.respondInvitation('inv-1', 'u2', { response: 'accept' });
        expect.fail('Should have thrown 400');
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.code).toBe('ROLE_NO_LONGER_EXISTS');
        expect(e.message).toBe('This role is no longer available');
      }
    });
  });

  // 4. Optimistic Locking on Join Requests
  describe('Join Request Optimistic Locking', () => {
    it('should throw 409 conflict if join request is no longer pending or version mismatch', async () => {
      mockPrisma.joinRequest.findUnique.mockResolvedValue({
        id: 'req-1',
        projectId: 'p1',
        userId: 'u3',
        status: 'Accepted', // already accepted by another admin/request
        version: 2,
        project: { ownerId: 'owner-1', roles: [], members: [] }
      });

      try {
        await service.respondJoinRequest('req-1', 'owner-1', { action: 'accept', version: 1 });
        expect.fail('Should have thrown 409 conflict');
      } catch (e: any) {
        expect(e.status).toBe(409);
        expect(e.code).toBe('CONCURRENCY_CONFLICT');
      }
    });
  });

  // 5. Leave & Remove preserves history (does NOT delete rows)
  describe('Leave and Remove preserves history', () => {
    it('removeMember marks member status as removed without calling prisma delete', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [{ id: 'm1', userId: 'u2', status: 'active' }]
      });
      mockPrisma.projectMember.findFirst.mockResolvedValue({
        id: 'm1',
        projectId: 'p1',
        userId: 'u2',
        status: 'active'
      });
      mockPrisma.projectMember.update.mockResolvedValue({
        id: 'm1',
        status: 'removed',
        removalReason: 'Inactivity'
      });

      const res = await service.removeMember('p1', 'u2', 'owner-1', { reason: 'Inactivity' });
      expect(mockPrisma.projectMember.delete).not.toHaveBeenCalled();
      expect(mockPrisma.projectMember.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'removed', removalReason: 'Inactivity' })
        })
      );
      expect(res.data.member.status).toBe('removed');
    });

    it('leaveProject marks member status as left without calling prisma delete', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1'
      });
      mockPrisma.projectMember.findFirst.mockResolvedValue({
        id: 'm1',
        projectId: 'p1',
        userId: 'u2',
        status: 'active'
      });
      mockPrisma.projectMember.update.mockResolvedValue({
        id: 'm1',
        status: 'left',
        leaveReason: 'Personal reasons'
      });

      const res = await service.leaveProject('p1', 'u2', { reason: 'Personal reasons' });
      expect(mockPrisma.projectMember.delete).not.toHaveBeenCalled();
      expect(mockPrisma.projectMember.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'left', leaveReason: 'Personal reasons' })
        })
      );
      expect(res.data.member.status).toBe('left');
    });
  });

  // 6. Ownership transfer
  describe('Ownership Transfer', () => {
    it('initializes pending transfer and keeps original owner until accepted', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: 'p1',
        ownerId: 'owner-1',
        members: [
          { id: 'm1', userId: 'owner-1', status: 'active' },
          { id: 'm2', userId: 'u2', status: 'active' }
        ]
      });
      mockPrisma.ownershipTransfer.create.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        currentOwnerId: 'owner-1',
        newOwnerId: 'u2',
        status: 'Pending'
      });

      const res = await service.initiateOwnershipTransfer('p1', 'owner-1', { newOwnerId: 'u2' });
      expect(res.data.status).toBe('Pending');
      // project ownerId was NOT updated yet
      expect(mockPrisma.project.update).not.toHaveBeenCalled();
    });

    it('transfers ownership only when new owner explicitly accepts', async () => {
      mockPrisma.ownershipTransfer.findFirst.mockResolvedValue({
        id: 't1',
        projectId: 'p1',
        currentOwnerId: 'owner-1',
        newOwnerId: 'u2',
        status: 'Pending'
      });
      mockPrisma.ownershipTransfer.update.mockResolvedValue({ id: 't1', status: 'Accepted' });
      mockPrisma.projectMember.findFirst.mockResolvedValue({ id: 'm1', userId: 'owner-1', status: 'active' });

      await service.respondOwnershipTransfer('p1', 'u2', { action: 'accept' });
      expect(mockPrisma.project.update).toHaveBeenCalledWith({
        where: { id: 'p1' },
        data: { ownerId: 'u2' }
      });
    });
  });
});
