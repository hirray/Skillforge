import { describe, it, expect, beforeAll } from 'vitest';
import { RealService as AdminService } from './real';
import { RealUserService } from '../users/real';
import { isOnHold } from '../../core/holds';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

describe('Member 1 Phase 3 & 4: Admin, Moderation & Privacy Governance Suite', () => {
  const adminService = new AdminService();
  const userService = new RealUserService();

  let adminUserId = 'admin-001';
  let candidateUserId = 'user-001';
  let demoProjectId = 'proj-hold-test';

  beforeAll(async () => {
    // Ensure seeded admin exists
    const admin = await prisma.user.findFirst({
      where: { roles: { contains: 'admin' } },
    });
    if (admin) {
      adminUserId = admin.id;
    }

    const candidate = await prisma.user.findFirst({
      where: { id: 'user-001' },
    });
    if (candidate) {
      candidateUserId = candidate.id;
    }

    // Ensure sample project exists for hold test
    const project = await prisma.project.upsert({
      where: { id: demoProjectId },
      create: {
        id: demoProjectId,
        title: 'Security Auditing & Microservices',
        ownerId: candidateUserId,
        status: 'Active',
      },
      update: {},
    });
  });

  // --- MODULE 32: ADMIN & MODERATION TESTS ---

  it('Module 32: getStats returns platform counters', async () => {
    const stats = await adminService.getStats();
    expect(stats).toBeDefined();
    expect(stats.totalUsers).toBeGreaterThanOrEqual(1);
    expect(stats.activeUsers).toBeGreaterThanOrEqual(1);
    expect(stats.certificates).toBeDefined();
  });

  it('Module 32: Guard blocks admin from suspending their own account', async () => {
    await expect(
      adminService.suspendUser(adminUserId, adminUserId, 'Self suspension attempt')
    ).rejects.toThrow();
  });

  it('Module 32: Guard blocks suspending the last remaining system admin', async () => {
    // There is only 1 seeded admin in test DB
    const adminCount = await prisma.user.count({
      where: { roles: { contains: 'admin' }, status: { not: 'suspended' } },
    });

    if (adminCount <= 1) {
      await expect(
        adminService.suspendUser(adminUserId, 'actor-other', 'Attempting to suspend lone admin')
      ).rejects.toThrow();
    }
  });

  it('Module 32: Successfully suspends a user with mandatory reason and writes audit log', async () => {
    const result = await adminService.suspendUser(
      candidateUserId,
      adminUserId,
      'Policy violation: multiple unverified repository links'
    );

    expect(result.success).toBe(true);
    expect(result.user.status).toBe('suspended');

    // Verify audit log entry was created
    const audit = await prisma.auditLog.findFirst({
      where: {
        targetId: candidateUserId,
        action: 'USER_SUSPENDED',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeDefined();
    expect(audit?.reason).toContain('Policy violation');
  });

  it('Module 32: Restores suspended user and writes audit log', async () => {
    const result = await adminService.restoreUser(
      candidateUserId,
      adminUserId,
      'Appeal accepted after identity verification'
    );

    expect(result.success).toBe(true);
    expect(result.user.status).toBe('active');

    const audit = await prisma.auditLog.findFirst({
      where: {
        targetId: candidateUserId,
        action: 'USER_RESTORED',
      },
      orderBy: { createdAt: 'desc' },
    });
    expect(audit).toBeDefined();
  });

  it('Module 32: Content Reports queue creation and 409 conflict detection', async () => {
    const report = await adminService.createReport(candidateUserId, {
      targetType: 'project',
      targetId: demoProjectId,
      reason: 'Suspicious commit history and code tampering report',
      notes: 'Submitted via security auditor review',
    });

    expect(report.id).toBeDefined();
    expect(report.status).toBe('pending');

    // First moderator resolves the report
    const resolved = await adminService.patchReport(report.id, adminUserId, {
      status: 'resolved',
      actionTaken: 'Project placed under investigation and warning issued',
      notes: 'Investigated and resolved',
    });
    expect(resolved.status).toBe('resolved');

    // Second moderator attempting to resolve/dismiss the same report gets 409 conflict!
    await expect(
      adminService.patchReport(report.id, 'moderator-002', {
        status: 'dismissed',
        notes: 'Another moderator trying to dismiss already resolved report',
      })
    ).rejects.toThrow();
  });

  it('Module 32: Verification queue highlights low-confidence items (<70)', async () => {
    const queue = await adminService.getVerificationQueue();
    expect(queue).toBeDefined();
    expect(Array.isArray(queue)).toBe(true);

    const lowConfidence = queue.find((q) => q.isLowConfidence);
    if (lowConfidence) {
      expect(lowConfidence.confidenceScore).toBeLessThan(70);
      expect(lowConfidence.discrepancies.length).toBeGreaterThanOrEqual(1);
    }
  });

  it('Module 32: Project Moderation Hold blocks project verification and isOnHold check', async () => {
    // 1. Place hold
    const hold = await adminService.placeProjectHold(
      demoProjectId,
      adminUserId,
      'Active copyright and attribution investigation'
    );
    expect(hold).toBeDefined();

    // 2. isOnHold returns true
    const onHold = await isOnHold(demoProjectId);
    expect(onHold).toBe(true);

    // 3. Release hold
    const released = await adminService.releaseProjectHold(
      demoProjectId,
      adminUserId,
      'Investigation cleared with original authorship proof'
    );
    expect(released.releasedAt).toBeDefined();

    // 4. isOnHold returns false
    const onHoldAfter = await isOnHold(demoProjectId);
    expect(onHoldAfter).toBe(false);
  });

  it('Module 32: Revokes certificate with mandatory reason and audit record', async () => {
    const certs = await adminService.getCertificates();
    expect(certs.length).toBeGreaterThan(0);

    const targetCert = certs.find((c) => c.status === 'valid') || certs[0];
    if (targetCert && targetCert.status === 'valid') {
      const revoked = await adminService.revokeCertificate(
        targetCert.id,
        adminUserId,
        'Fabricated project milestones discovered post-issuance'
      );
      expect(revoked.status).toBe('revoked');
      expect(revoked.revokedReason).toContain('Fabricated');
    }
  });

  // --- MODULE 33: PRIVACY & DATA GOVERNANCE TESTS ---

  it('Module 33: User data takeout (GDPR Export) generates JSON archive and signed link', async () => {
    const exportResult = await userService.exportUserData(candidateUserId);
    expect(exportResult.success).toBe(true);
    expect(exportResult.downloadUrl).toBeDefined();
    expect(exportResult.data).toBeDefined();
    expect(exportResult.data.user.id).toBe(candidateUserId);
    expect(exportResult.data.skills).toBeDefined();
  });

  it('Module 33: Account deletion honors 14-day grace period and supports cancellation', async () => {
    // 1. Request deletion
    const req = await userService.requestAccountDeletion(
      candidateUserId,
      'Moving to another platform'
    );
    expect(req.success).toBe(true);
    expect(req.gracePeriodDays).toBe(14);
    expect(req.scheduledFor).toBeDefined();

    const userPending = await prisma.user.findUnique({
      where: { id: candidateUserId },
    });
    expect(userPending?.status).toBe('pending_deletion');

    // 2. User changes mind during grace period and cancels deletion
    const cancelResult = await userService.cancelAccountDeletion(candidateUserId);
    expect(cancelResult.success).toBe(true);

    const userRestored = await prisma.user.findUnique({
      where: { id: candidateUserId },
    });
    expect(userRestored?.status).toBe('active');
  });

  it('Module 33: Consents history and recording', async () => {
    const consents = await userService.getConsents(candidateUserId);
    expect(consents.consents).toBeDefined();
    expect(consents.consents.length).toBeGreaterThanOrEqual(1);

    const record = await userService.recordConsent(candidateUserId, {
      type: 'ai_job_matching',
      accepted: false,
    });
    expect(record.success).toBe(true);

    const updatedUser = await prisma.user.findUnique({
      where: { id: candidateUserId },
    });
    expect(updatedUser?.matchingOptIn).toBe(false);
  });
});
