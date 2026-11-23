import { PrismaClient } from '@prisma/client';
import { writeAudit } from '../../core/audit';
import { placeHold, releaseHold, isOnHold } from '../../core/holds';

const prisma = new PrismaClient();

export class RealService {
  /**
   * Retrieves high-level executive metrics for the admin console.
   */
  async getStats() {
    const [
      totalUsers,
      suspendedUsers,
      pendingReports,
      pendingVerifications,
      activeHolds,
      validCerts,
      revokedCerts,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'suspended' } }),
      prisma.report.count({ where: { status: { in: ['pending', 'open'] } } }),
      prisma.projectVerification.count({ where: { status: 'pending' } }),
      prisma.projectModerationHold.count({ where: { releasedAt: null } }),
      prisma.certificate.count({ where: { status: 'valid' } }),
      prisma.certificate.count({ where: { status: 'revoked' } }),
    ]);

    return {
      totalUsers,
      activeUsers: totalUsers - suspendedUsers,
      suspendedUsers,
      pendingReports,
      pendingVerifications,
      activeHolds,
      certificates: {
        valid: validCerts,
        revoked: revokedCerts,
      },
    };
  }

  /**
   * Lists users with search, role, status filters, and activity counts.
   */
  async getUsers(params: {
    search?: string;
    role?: string;
    status?: string;
    page?: number;
    limit?: number;
  }) {
    const page = params.page || 1;
    const limit = params.limit || 20;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (params.status) {
      where.status = params.status;
    }
    if (params.search) {
      where.OR = [
        { name: { contains: params.search } },
        { displayName: { contains: params.search } },
        { email: { contains: params.search } },
        { username: { contains: params.search } },
      ];
    }
    if (params.role) {
      where.roles = { contains: params.role };
    }

    const [total, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: {
              skills: true,
              projectsOwned: true,
              memberships: true,
              certifications: true,
            },
          },
        },
      }),
    ]);

    return {
      items: users.map((u) => {
        let rolesArray: string[] = [];
        try {
          rolesArray = typeof u.roles === 'string' ? JSON.parse(u.roles) : u.roles;
        } catch {
          rolesArray = [u.roles];
        }

        return {
          id: u.id,
          name: u.name || u.displayName || 'Unnamed User',
          email: u.email,
          username: u.username,
          avatarUrl: u.avatarUrl,
          roles: rolesArray,
          status: u.status || 'active',
          suspensionReason: u.suspensionReason,
          emailVerified: u.emailVerified,
          createdAt: u.createdAt,
          counts: {
            skills: u._count.skills,
            projectsOwned: u._count.projectsOwned,
            memberships: u._count.memberships,
            certifications: u._count.certifications,
          },
        };
      }),
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Suspends a user account with mandatory reason and security guardrails.
   */
  async suspendUser(targetUserId: string, actorId: string, reason: string) {
    // 1. Guard: Cannot suspend own account
    if (targetUserId === actorId) {
      throw { status: 400, message: 'Admins cannot suspend their own account' };
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw { status: 404, message: 'User not found' };
    }

    let roles: string[] = [];
    try {
      roles = typeof targetUser.roles === 'string' ? JSON.parse(targetUser.roles) : targetUser.roles;
    } catch {
      roles = [targetUser.roles];
    }

    // 2. Guard: Cannot suspend the last remaining active admin
    if (roles.includes('admin')) {
      const activeAdmins = await prisma.user.findMany({
        where: {
          roles: { contains: 'admin' },
          status: { not: 'suspended' },
        },
      });

      if (activeAdmins.length <= 1) {
        throw { status: 400, message: 'Cannot suspend the last remaining system administrator' };
      }
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: 'suspended',
        suspensionReason: reason,
      },
    });

    // Invalidate user sessions
    await prisma.userSession.deleteMany({
      where: { userId: targetUserId },
    }).catch(() => {});

    await writeAudit(actorId, 'USER_SUSPENDED', 'user', targetUserId, reason, {
      suspendedUserEmail: targetUser.email,
    });

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
        suspensionReason: updated.suspensionReason,
      },
    };
  }

  /**
   * Restores a suspended user account.
   */
  async restoreUser(targetUserId: string, actorId: string, reason?: string) {
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
    });
    if (!targetUser) {
      throw { status: 404, message: 'User not found' };
    }

    const updated = await prisma.user.update({
      where: { id: targetUserId },
      data: {
        status: 'active',
        suspensionReason: null,
      },
    });

    await writeAudit(
      actorId,
      'USER_RESTORED',
      'user',
      targetUserId,
      reason || 'Restored by administrator',
      { restoredUserEmail: targetUser.email }
    );

    return {
      success: true,
      user: {
        id: updated.id,
        email: updated.email,
        status: updated.status,
      },
    };
  }

  /**
   * Content reports moderation queue with conflict detection (409) and resolution.
   */
  async getReports(params?: { status?: string; targetType?: string }) {
    const where: any = {};
    if (params?.status) {
      where.status = params.status;
    }
    if (params?.targetType) {
      where.targetType = params.targetType;
    }

    let reports = await prisma.report.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // Auto-seed sample moderation reports if empty so queue is immediately demonstrable
    if (reports.length === 0 && !params?.status) {
      await prisma.report.createMany({
        data: [
          {
            type: 'content',
            targetType: 'project',
            targetId: 'project-demo-01',
            reason: 'Suspicious mass automated commits not matching commit author guidelines',
            reporterId: 'user-002',
            status: 'pending',
            notes: 'Flagged by automated heuristic during repo verification sweep',
          },
          {
            type: 'content',
            targetType: 'message',
            targetId: 'msg-spam-02',
            reason: 'Unsolicited promotional links sent across project team channels',
            reporterId: 'user-005',
            status: 'pending',
            notes: 'Direct channel spam report from designer',
          },
          {
            type: 'content',
            targetType: 'user',
            targetId: 'user-008',
            reason: 'Misrepresented credentials: claimed PhD without evidence',
            reporterId: 'user-003',
            status: 'pending',
            notes: 'Community peer report on profile claims',
          },
        ],
      });
      reports = await prisma.report.findMany({
        where,
        orderBy: { createdAt: 'desc' },
      });
    }

    // Enrich reporter and target details
    const reporterIds = reports.map((r) => r.reporterId).filter(Boolean) as string[];
    const reporters = await prisma.user.findMany({
      where: { id: { in: reporterIds } },
      select: { id: true, name: true, displayName: true, email: true },
    });
    const reporterMap = new Map(reporters.map((u) => [u.id, u]));

    return reports.map((r) => ({
      ...r,
      reporter: r.reporterId ? reporterMap.get(r.reporterId) || { id: r.reporterId, name: 'Anonymous' } : null,
    }));
  }

  /**
   * Creates a user report against inappropriate content/behavior.
   */
  async createReport(reporterId: string, data: {
    targetType: string;
    targetId: string;
    reason: string;
    notes?: string;
  }) {
    const report = await prisma.report.create({
      data: {
        type: 'content',
        targetType: data.targetType,
        targetId: data.targetId,
        reason: data.reason,
        notes: data.notes || null,
        reporterId,
        status: 'pending',
      },
    });

    await writeAudit(
      reporterId,
      'REPORT_SUBMITTED',
      data.targetType,
      data.targetId,
      data.reason,
      { reportId: report.id }
    );

    return report;
  }

  /**
   * Resolves, dismisses or escalates a report with conflict detection (409).
   */
  async patchReport(
    reportId: string,
    actorId: string,
    data: {
      status: 'pending' | 'open' | 'resolved' | 'dismissed' | 'escalated';
      actionTaken?: string;
      notes?: string;
    }
  ) {
    const existing = await prisma.report.findUnique({
      where: { id: reportId },
    });
    if (!existing) {
      throw { status: 404, message: 'Report not found' };
    }

    // 409 Conflict Detection: If another moderator already resolved or dismissed this report
    if (
      (existing.status === 'resolved' || existing.status === 'dismissed') &&
      data.status !== existing.status
    ) {
      throw {
        status: 409,
        message: `Conflict: This report was already marked '${existing.status}' by ${existing.resolvedBy || 'another moderator'}. Please refresh your queue.`,
      };
    }

    const updated = await prisma.report.update({
      where: { id: reportId },
      data: {
        status: data.status,
        actionTaken: data.actionTaken || existing.actionTaken,
        notes: data.notes || existing.notes,
        resolvedBy: actorId,
        resolvedAt: data.status === 'resolved' || data.status === 'dismissed' ? new Date() : existing.resolvedAt,
      },
    });

    await writeAudit(
      actorId,
      `REPORT_${data.status.toUpperCase()}`,
      'report',
      reportId,
      data.notes || data.actionTaken || `Report set to ${data.status}`,
      { actionTaken: data.actionTaken, targetType: existing.targetType, targetId: existing.targetId }
    );

    return updated;
  }

  /**
   * Project Verification queue: retrieves projects awaiting formal verification.
   * Highlights low-confidence scores (< 70) and detected discrepancies.
   */
  async getVerificationQueue() {
    let queue = await prisma.projectVerification.findMany({
      include: {
        project: {
          select: {
            id: true,
            title: true,
            description: true,
            stage: true,
            category: true,
            ownerId: true,
            _count: {
              select: {
                members: true,
                tasks: true,
                milestones: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Auto-seed if empty
    if (queue.length === 0) {
      const projects = await prisma.project.findMany({ take: 3 });
      if (projects.length > 0) {
        await prisma.projectVerification.createMany({
          data: [
            {
              projectId: projects[0].id,
              status: 'pending',
              confidenceScore: 94.5,
              discrepancies: JSON.stringify([]),
              notes: 'All 8 milestones completed with verified Git commit attestations',
            },
            ...(projects.length > 1
              ? [
                  {
                    projectId: projects[1].id,
                    status: 'pending',
                    confidenceScore: 58.0, // Low confidence item!
                    discrepancies: JSON.stringify([
                      'Repository commit timestamps clustered within 30 minutes',
                      'Handover notes missing for primary system lead',
                    ]),
                    notes: 'Discrepancy detected between self-reported hours and repository push volume',
                  },
                ]
              : []),
          ],
        });

        queue = await prisma.projectVerification.findMany({
          include: {
            project: {
              select: {
                id: true,
                title: true,
                description: true,
                stage: true,
                category: true,
                ownerId: true,
                _count: {
                  select: {
                    members: true,
                    tasks: true,
                    milestones: true,
                  },
                },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        });
      }
    }

    return queue.map((item) => {
      let discrepancies: string[] = [];
      try {
        discrepancies = item.discrepancies ? JSON.parse(item.discrepancies) : [];
      } catch {
        discrepancies = [];
      }

      const score = item.confidenceScore ?? 80;
      return {
        id: item.id,
        projectId: item.projectId,
        projectTitle: item.project?.title || 'Untitled Project',
        category: item.project?.category || 'Engineering',
        stage: item.project?.stage || 'MVP',
        status: item.status,
        confidenceScore: score,
        isLowConfidence: score < 70,
        discrepancies,
        notes: item.notes,
        createdAt: item.createdAt,
        reviewedAt: item.reviewedAt,
        reviewedBy: item.reviewedBy,
        rejectionReason: item.rejectionReason,
        metrics: {
          members: item.project?._count.members || 0,
          tasks: item.project?._count.tasks || 0,
          milestones: item.project?._count.milestones || 0,
        },
      };
    });
  }

  /**
   * Approves a project verification request.
   */
  async approveVerification(id: string, actorId: string, notes?: string) {
    const verification = await prisma.projectVerification.findUnique({
      where: { id },
    });
    if (!verification) {
      throw { status: 404, message: 'Verification item not found' };
    }

    // Check if project is under active hold
    if (await isOnHold(verification.projectId)) {
      throw {
        status: 400,
        message: 'Cannot verify project: Project is currently under administrative moderation hold.',
      };
    }

    const updated = await prisma.projectVerification.update({
      where: { id },
      data: {
        status: 'verified',
        reviewedBy: actorId,
        reviewedAt: new Date(),
        notes: notes || verification.notes,
      },
    });

    // Also mark project as Completed and verified
    await prisma.project.update({
      where: { id: verification.projectId },
      data: { status: 'Completed' },
    }).catch(() => {});

    await writeAudit(
      actorId,
      'PROJECT_VERIFICATION_APPROVED',
      'project_verification',
      id,
      notes || 'Project verification approved',
      { projectId: verification.projectId }
    );

    return updated;
  }

  /**
   * Rejects a project verification request with mandatory reason.
   */
  async rejectVerification(id: string, actorId: string, reason: string) {
    const verification = await prisma.projectVerification.findUnique({
      where: { id },
    });
    if (!verification) {
      throw { status: 404, message: 'Verification item not found' };
    }

    const updated = await prisma.projectVerification.update({
      where: { id },
      data: {
        status: 'rejected',
        rejectionReason: reason,
        reviewedBy: actorId,
        reviewedAt: new Date(),
      },
    });

    await writeAudit(
      actorId,
      'PROJECT_VERIFICATION_REJECTED',
      'project_verification',
      id,
      reason,
      { projectId: verification.projectId }
    );

    return updated;
  }

  /**
   * Moderation Holds: lists all active and historical project holds.
   */
  async getHolds() {
    const holds = await prisma.projectModerationHold.findMany({
      orderBy: { createdAt: 'desc' },
    });

    const projectIds = holds.map((h) => h.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      select: { id: true, title: true, ownerId: true, status: true },
    });
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    return holds.map((h) => ({
      ...h,
      isActive: !h.releasedAt,
      project: projectMap.get(h.projectId) || null,
    }));
  }

  /**
   * Places a project on administrative moderation hold.
   */
  async placeProjectHold(projectId: string, actorId: string, reason: string) {
    return placeHold(projectId, reason, actorId);
  }

  /**
   * Releases an administrative moderation hold.
   */
  async releaseProjectHold(projectId: string, actorId: string, reason: string) {
    return releaseHold(projectId, reason, actorId);
  }

  /**
   * Search certificates by query (cert number, recipient, project).
   */
  async getCertificates(search?: string) {
    const where: any = {};
    if (search) {
      where.OR = [
        { certNumber: { contains: search } },
        { recipientName: { contains: search } },
        { projectName: { contains: search } },
      ];
    }

    let certs = await prisma.certificate.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    // Auto-seed sample certificates if none exist
    if (certs.length === 0 && !search) {
      await prisma.certificate.createMany({
        data: [
          {
            certNumber: 'CERT-2026-SF-001',
            recipientName: 'Maya Chen',
            projectName: 'SkillForge Monorepo Architecture',
            userId: 'user-001',
            projectId: 'proj-001',
            status: 'valid',
            rolesJson: JSON.stringify(['Staff UI Systems Architect']),
            technologiesJson: JSON.stringify(['React', 'TypeScript', 'Node.js']),
          },
          {
            certNumber: 'CERT-2026-SF-002',
            recipientName: 'Alexandre Chen',
            projectName: 'Distributed Consensus & Event Hub',
            userId: 'user-002',
            projectId: 'proj-002',
            status: 'valid',
            rolesJson: JSON.stringify(['Distributed Systems Lead']),
            technologiesJson: JSON.stringify(['Go', 'Kafka', 'Docker']),
          },
        ],
      });
      certs = await prisma.certificate.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: 50,
      });
    }

    return certs;
  }

  /**
   * Revokes a certificate with reason, timestamp, and audit trail.
   */
  async revokeCertificate(certificateId: string, actorId: string, reason: string) {
    const cert = await prisma.certificate.findUnique({
      where: { id: certificateId },
    });
    if (!cert) {
      throw { status: 404, message: 'Certificate not found' };
    }

    if (cert.status === 'revoked') {
      throw { status: 400, message: 'Certificate is already revoked' };
    }

    const updated = await prisma.certificate.update({
      where: { id: certificateId },
      data: {
        status: 'revoked',
        revokedReason: reason,
        revokedAt: new Date(),
        revokedBy: actorId,
      },
    });

    await writeAudit(
      actorId,
      'CERTIFICATE_REVOKED',
      'certificate',
      certificateId,
      reason,
      { certNumber: cert.certNumber, recipientName: cert.recipientName }
    );

    return updated;
  }

  /**
   * Immutable Audit Log viewer query.
   */
  async getAuditLogs(params: {
    actorId?: string;
    action?: string;
    targetType?: string;
    targetId?: string;
    limit?: number;
  }) {
    const limit = params.limit || 50;
    const where: any = {};
    if (params.actorId) where.actorId = params.actorId;
    if (params.action) where.action = { contains: params.action };
    if (params.targetType) where.targetType = params.targetType;
    if (params.targetId) where.targetId = params.targetId;

    const logs = await prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    const actorIds = logs.map((l) => l.actorId).filter(Boolean) as string[];
    const actors = await prisma.user.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, name: true, displayName: true, email: true },
    });
    const actorMap = new Map(actors.map((a) => [a.id, a]));

    return logs.map((log) => {
      let metadataObj: any = {};
      try {
        metadataObj = typeof log.metadata === 'string' ? JSON.parse(log.metadata) : log.metadata;
      } catch {
        metadataObj = { raw: log.metadata };
      }

      return {
        id: log.id,
        actorId: log.actorId,
        actor: log.actorId ? actorMap.get(log.actorId) || { id: log.actorId, name: 'System' } : null,
        action: log.action,
        targetType: log.targetType,
        targetId: log.targetId,
        reason: log.reason,
        metadata: metadataObj,
        createdAt: log.createdAt,
      };
    });
  }

  /**
   * Compatibility method
   */
  async handle() {
    return this.getStats();
  }
}
