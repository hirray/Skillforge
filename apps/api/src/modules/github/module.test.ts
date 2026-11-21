import { describe, it, expect, beforeEach } from 'vitest';
import { encryptToken, decryptToken } from './crypto';
import { callbackQuerySchema, linkRepoSchema } from './schema';
import { MockService } from './mock';
import { RealService } from './real';
import { syncRepository, GITHUB_SANDBOX_FIXTURES } from './sync';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Module 13: GitHub Integration', () => {
  describe('Token Security & Encryption', () => {
    it('encrypts and decrypts OAuth tokens deterministically using AES-256-GCM', () => {
      const sampleToken = 'gho_9876543210abcdef9876543210abcdef_SkillForge';
      const encrypted = encryptToken(sampleToken);
      expect(encrypted).not.toBe(sampleToken);
      expect(encrypted.split(':')).toHaveLength(3);

      const decrypted = decryptToken(encrypted);
      expect(decrypted).toBe(sampleToken);
    });

    it('throws an error when decrypting tampered or invalid payloads', () => {
      expect(() => decryptToken('invalid_token_string')).toThrow();
    });
  });

  describe('Contract Schema Validation', () => {
    it('validates repository linking parameters', () => {
      const valid = linkRepoSchema.safeParse({
        owner: 'skillforge-org',
        name: 'skillforge-core',
      });
      expect(valid.success).toBe(true);

      const invalid = linkRepoSchema.safeParse({
        owner: '',
        name: '',
      });
      expect(invalid.success).toBe(false);
    });

    it('validates OAuth callback query parameters', () => {
      const valid = callbackQuerySchema.safeParse({
        code: 'oauth_code_12345',
        state: 'secure_state_abc',
      });
      expect(valid.success).toBe(true);

      const missingCode = callbackQuerySchema.safeParse({});
      expect(missingCode.success).toBe(false);
    });
  });

  describe('MockService (Phase 0 Compatibility)', () => {
    const mockService = new MockService();

    it('generates a valid connect URL with state', async () => {
      const res = await mockService.getConnectUrl('user-001');
      expect(res.url).toContain('https://github.com/login/oauth/authorize');
      expect(res.url).toContain('read:user,repo');
      expect(res.state).toBeDefined();
    });

    it('handles callback and links user identity', async () => {
      const res = await mockService.handleCallback('user-002', 'test-gh-user');
      expect(res.success).toBe(true);
      expect(res.username).toBe('test-gh-user');

      const status = await mockService.getStatus('user-002');
      expect(status.connected).toBe(true);
      expect(status.username).toBe('test-gh-user');
    });

    it('supports linking repos and retrieving activity', async () => {
      const repo = await mockService.linkRepo('proj-001', {
        owner: 'facebook',
        name: 'react',
      });
      expect(repo.name).toBe('react');

      const repos = await mockService.getProjectRepos('proj-001');
      expect(repos.length).toBeGreaterThan(0);
    });

    it('handles disconnect cleanly', async () => {
      await mockService.disconnect('user-002');
      const status = await mockService.getStatus('user-002');
      expect(status.connected).toBe(false);
    });
  });

  describe('RealService & Incremental Sync', () => {
    const realService = new RealService();
    const testUserId = 'user-001';
    let testProjectId = 'github-test-proj-1';

    beforeEach(async () => {
      // Ensure test project exists
      await prisma.project.upsert({
        where: { id: testProjectId },
        update: {},
        create: {
          id: testProjectId,
          ownerId: testUserId,
          title: 'GitHub Integration Testbed Project',
          description: 'A test project for GitHub event ingestion',
          status: 'Active',
          stage: 'Prototype',
        },
      });
    });

    it('connects user with encrypted token and returns status', async () => {
      const callback = await realService.handleCallback(testUserId, 'test-octocat-account');
      expect(callback.success).toBe(true);
      expect(callback.username).toBe('test-octocat-account');

      const status = await realService.getStatus(testUserId);
      expect(status.connected).toBe(true);
      expect(status.username).toBe('test-octocat-account');
    });

    it('links repository to project and ingests contribution events idempotently', async () => {
      const repo = await realService.linkRepo(testProjectId, {
        owner: 'skillforge-org',
        name: 'sandbox-repo',
      });
      expect(repo.owner).toBe('skillforge-org');
      expect(repo.name).toBe('sandbox-repo');

      // Run syncRepository
      const syncResult1 = await syncRepository(testProjectId, repo.id);
      expect(syncResult1.syncedCount).toBeGreaterThan(0);

      // Re-running sync must be idempotent without primary key or unique constraint violations
      const syncResult2 = await syncRepository(testProjectId, repo.id);
      expect(syncResult2.eventsCount).toBe(syncResult1.eventsCount);

      // Check contribution events in DB
      const events = await prisma.contributionEvent.findMany({
        where: { projectId: testProjectId, source: 'github' },
      });
      expect(events.length).toBeGreaterThan(0);
      expect(events.some((e) => e.type === 'commit')).toBe(true);
    });

    it('revokes integration on disconnect', async () => {
      const res = await realService.disconnect(testUserId);
      expect(res.success).toBe(true);

      const status = await realService.getStatus(testUserId);
      expect(status.connected).toBe(false);
    });
  });
});
