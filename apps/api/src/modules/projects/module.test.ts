import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RealService } from './real';
import { ErrorCode } from '@skillforge/contract';

const mockPrisma = vi.hoisted(() => ({
  project: {
    findUnique: vi.fn(),
    update: vi.fn(),
    create: vi.fn(),
    findMany: vi.fn()
  }
}));

vi.mock('@prisma/client', () => {
  return {
    PrismaClient: vi.fn(() => mockPrisma)
  };
});

vi.mock('../../core/eventBus', () => ({
  eventBus: {
    emitEvent: vi.fn()
  }
}));

describe('Projects RealService', () => {
  let service: RealService;

  beforeEach(() => {
    service = new RealService();
    vi.clearAllMocks();
  });

  describe('update (team-size-reduction guard)', () => {
    it('should throw if maxTeamSize is below current members count', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: '1',
        ownerId: 'user-1',
        members: [{ id: 'm1' }, { id: 'm2' }, { id: 'm3' }]
      });

      try {
        await service.update('1', 'user-1', { maxTeamSize: 2 });
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.status).toBe(422);
        expect(e.message).toMatch(/cannot be below current member count/);
      }
    });

    it('should throw if non-owner tries to update', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: '1',
        ownerId: 'user-1',
        members: []
      });

      try {
        await service.update('1', 'user-2', { title: 'new' });
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.status).toBe(403);
      }
    });
  });

  describe('transition', () => {
    it('should throw if non-owner tries to transition', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: '1',
        ownerId: 'user-1',
        status: 'Draft'
      });

      try {
        await service.transition('1', 'user-2', 'Recruiting');
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.status).toBe(403);
      }
    });

    it('should allow Draft to Recruiting', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: '1',
        ownerId: 'user-1',
        status: 'Draft'
      });
      mockPrisma.project.update.mockResolvedValue({ id: '1', status: 'Recruiting' });

      const res = await service.transition('1', 'user-1', 'Recruiting');
      expect(res.data.status).toBe('Recruiting');
    });

    it('should block Draft to Active (invalid transition)', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: '1',
        ownerId: 'user-1',
        status: 'Draft'
      });

      try {
        await service.transition('1', 'user-1', 'Active');
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.message).toMatch(/Invalid transition/);
      }
    });

    it('should only allow Completed to Archived', async () => {
      mockPrisma.project.findUnique.mockResolvedValue({
        id: '1',
        ownerId: 'user-1',
        status: 'Completed'
      });

      try {
        await service.transition('1', 'user-1', 'Draft');
        expect.fail('Should have thrown');
      } catch (e: any) {
        expect(e.status).toBe(400);
        expect(e.message).toMatch(/Only Archived is allowed/);
      }
    });
  });
});
