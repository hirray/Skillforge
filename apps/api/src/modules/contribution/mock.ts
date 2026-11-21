export class MockService {
  private events: any[] = [
    {
      id: 'mock-contrib-001',
      userId: 'user-001',
      projectId: 'project-001',
      detail: 'Implemented user authentication middleware with JWT verification',
      type: 'commit',
      source: 'github',
      externalId: 'gh-commit-a1b2c3d',
      externalLogin: 'hirray',
      referenceUrl: 'https://github.com/skillforge-org/skillforge-sandbox/commit/a1b2c3d',
      occurredAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      metadataJson: JSON.stringify({ additions: 140, deletions: 12 }),
      createdAt: new Date().toISOString(),
      user: { id: 'user-001', email: 'user1@example.com' },
      disputes: [],
      adjustments: [],
    },
    {
      id: 'mock-contrib-002',
      userId: 'user-001',
      projectId: 'project-001',
      detail: 'Completed task: Setup PostgreSQL database and Prisma schema models',
      type: 'task',
      source: 'task',
      externalId: 'task-001',
      referenceUrl: null,
      occurredAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      metadataJson: JSON.stringify({ taskId: 'task-001', status: 'Done' }),
      createdAt: new Date().toISOString(),
      user: { id: 'user-001', email: 'user1@example.com' },
      disputes: [],
      adjustments: [],
    },
    {
      id: 'mock-contrib-003',
      userId: 'user-002',
      projectId: 'project-001',
      detail: 'Reviewed PR #12: Design system token bindings and responsive layout',
      type: 'review',
      source: 'github',
      externalId: 'gh-rev-8841',
      externalLogin: 'designer_dev',
      referenceUrl: 'https://github.com/skillforge-org/skillforge-sandbox/pull/12',
      occurredAt: new Date(Date.now() - 3600000 * 12).toISOString(),
      metadataJson: JSON.stringify({ state: 'APPROVED' }),
      createdAt: new Date().toISOString(),
      user: { id: 'user-002', email: 'user2@example.com' },
      disputes: [],
      adjustments: [],
    },
    {
      id: 'mock-contrib-004',
      userId: 'user-002',
      projectId: 'project-001',
      detail: 'Architected Figma component specs and CSS design tokens',
      type: 'manual',
      source: 'manual',
      externalId: null,
      referenceUrl: 'https://figma.com/design-spec',
      occurredAt: new Date(Date.now() - 3600000 * 72).toISOString(),
      metadataJson: JSON.stringify({
        justification: 'Documented offline design workshop deliverables approved by lead',
        recordedBy: 'user-001',
      }),
      createdAt: new Date().toISOString(),
      user: { id: 'user-002', email: 'user2@example.com' },
      disputes: [],
      adjustments: [],
    },
  ];

  private disputes: any[] = [];
  private adjustments: any[] = [];

  async getProjectContributions(projectId: string, _viewerUserId?: string) {
    const list = this.events.filter((e) => e.projectId === projectId || projectId === 'all');
    return {
      projectId,
      totalEvents: list.length,
      contributions: list.map((ev) => ({
        ...ev,
        disputes: this.disputes.filter((d) => d.eventId === ev.id),
        adjustments: this.adjustments.filter((a) => a.eventId === ev.id),
      })),
    };
  }

  async getUserContributionProfile(projectId: string, targetUserId: string, _viewerUserId?: string) {
    const userEvents = this.events.filter(
      (e) => (e.projectId === projectId || projectId === 'all') && e.userId === targetUserId
    );

    const commits = userEvents.filter((e) => e.type === 'commit').length;
    const prs = userEvents.filter((e) => e.type === 'pr').length;
    const reviews = userEvents.filter((e) => e.type === 'review').length;
    const tasks = userEvents.filter((e) => e.type === 'task').length;
    const manualNotes = userEvents.filter((e) => e.source === 'manual').length;

    const narrative = [
      `Active project contributor with ${tasks} recorded tasks completed and ${commits} verified commits.`,
      reviews > 0 ? `Participated in peer code quality through ${reviews} documented reviews.` : null,
      manualNotes > 0 ? `Includes ${manualNotes} verified manual evidence entries attested by the project owner.` : null,
    ]
      .filter(Boolean)
      .join(' ');

    return {
      projectId,
      userId: targetUserId,
      narrativeSummary: narrative || 'Recorded project activity across codebase and task management.',
      roles: ['Fullstack Developer'],
      evidenceBreakdown: {
        commits,
        pullRequests: prs,
        codeReviews: reviews,
        tasksCompleted: tasks,
        manualNotes,
      },
      events: userEvents.map((ev) => ({
        ...ev,
        disputes: this.disputes.filter((d) => d.eventId === ev.id),
        adjustments: this.adjustments.filter((a) => a.eventId === ev.id),
      })),
    };
  }

  async createManualNote(projectId: string, actorUserId: string, data: any) {
    const newEvent = {
      id: `manual-contrib-${Date.now()}`,
      userId: data.targetUserId || actorUserId,
      projectId,
      detail: data.detail,
      type: 'manual',
      source: 'manual',
      externalId: `manual-${Date.now()}`,
      referenceUrl: data.referenceUrl || null,
      occurredAt: new Date().toISOString(),
      metadataJson: JSON.stringify({
        justification: data.justification,
        recordedBy: actorUserId,
      }),
      createdAt: new Date().toISOString(),
      user: { id: data.targetUserId || actorUserId, email: 'contributor@example.com' },
      disputes: [],
      adjustments: [],
    };
    this.events.unshift(newEvent);
    return newEvent;
  }

  async raiseDispute(eventId: string, raisedByUserId: string, reason: string) {
    const dispute = {
      id: `dispute-${Date.now()}`,
      eventId,
      raisedBy: raisedByUserId,
      reason,
      status: 'open',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.disputes.push(dispute);
    return dispute;
  }

  async resolveDispute(disputeId: string, actorUserId: string, data: any) {
    const dispute = this.disputes.find((d) => d.id === disputeId);
    if (dispute) {
      dispute.status = data.action;
      dispute.updatedAt = new Date().toISOString();
    }
    const adjustment = {
      id: `adj-${Date.now()}`,
      eventId: dispute?.eventId || 'unknown',
      actorId: actorUserId,
      action: data.action,
      reason: data.note || 'Resolution applied',
      before: 'Original record',
      after: data.adjustmentDetail || 'Dispute updated',
      createdAt: new Date().toISOString(),
    };
    this.adjustments.push(adjustment);
    return { dispute, adjustment };
  }
}
