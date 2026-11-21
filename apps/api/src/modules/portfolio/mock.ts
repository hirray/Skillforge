import {
  VerifiedProjectExperience,
  CorrectionRequest,
  PortfolioSettings,
  PublicPortfolioView,
  ErrorCode,
} from '@skillforge/contract';

export class MockService {
  private mockSettings: Map<string, PortfolioSettings> = new Map([
    [
      'user-001',
      {
        userId: 'user-001',
        visibility: 'public',
        headline: 'Staff Systems Architect & Fullstack Lead',
        bioOverride: 'Building verified proof-of-work engineering engines and distributed systems.',
        sectionOrder: ['skills', 'projects', 'certificates'],
        sectionVisibility: { skills: true, projects: true, certificates: true },
        pinnedProjectIds: ['proj-001'],
      },
    ],
  ]);

  private mockCorrections: CorrectionRequest[] = [];

  async getVerifiedExperience(userId: string): Promise<VerifiedProjectExperience[]> {
    return [
      {
        id: 'exp-001',
        projectId: 'proj-001',
        title: 'SkillForge Monorepo & AI Intelligence Suite',
        description: 'Architected asynchronous job execution pipelines, SQLite/Prisma schema migrations, and REST API contracts.',
        role: 'Fullstack Lead & Core Contributor',
        technologies: ['TypeScript', 'React', 'Node.js', 'Prisma', 'SQLite'],
        duration: '4 months',
        completedAt: '2026-11-20T12:00:00.000Z',
        verifiedAt: '2026-11-20T12:00:00.000Z',
        status: 'verified',
        evidenceLinks: {
          contributionsUrl: '/projects/proj-001?tab=contributions',
          certificateUrl: '/verify/SF-2026-00042',
          certNumber: 'SF-2026-00042',
          repositoryUrl: 'https://github.com/skillforge/skillforge-sandbox',
        },
        skillEvidences: [
          { skillName: 'TypeScript', level: 'advanced', occurredAt: '2026-11-18T14:00:00.000Z' },
          { skillName: 'React', level: 'advanced', occurredAt: '2026-11-19T09:30:00.000Z' },
          { skillName: 'Prisma', level: 'intermediate', occurredAt: '2026-11-20T11:00:00.000Z' },
        ],
      },
      {
        id: 'exp-002',
        projectId: 'proj-002',
        title: 'Winter Global AI & Agentic Sprint 2026',
        description: 'Designed reactive frontend workspace and verified proof export protocols in high-velocity build marathon.',
        role: 'Systems Architect',
        technologies: ['Python', 'FastAPI', 'Redis', 'Docker'],
        duration: '6 weeks',
        completedAt: '2026-11-15T10:00:00.000Z',
        verifiedAt: '2026-11-15T10:00:00.000Z',
        status: 'verified',
        evidenceLinks: {
          contributionsUrl: '/projects/proj-002?tab=contributions',
          certificateUrl: '/verify/SF-2026-00043',
          certNumber: 'SF-2026-00043',
        },
        skillEvidences: [
          { skillName: 'Python', level: 'advanced', occurredAt: '2026-11-12T10:00:00.000Z' },
          { skillName: 'FastAPI', level: 'advanced', occurredAt: '2026-11-14T16:00:00.000Z' },
        ],
      },
    ];
  }

  async createCorrectionRequest(
    experienceId: string,
    data: { field: string; newValue: string; reason: string },
    userId: string
  ): Promise<CorrectionRequest> {
    const correction: CorrectionRequest = {
      id: `corr-${Date.now()}`,
      experienceId,
      requestedBy: userId,
      field: data.field,
      newValue: data.newValue,
      status: 'pending',
      reason: data.reason,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.mockCorrections.push(correction);
    return correction;
  }

  async listCorrectionRequests(experienceId: string): Promise<CorrectionRequest[]> {
    return this.mockCorrections.filter((c) => c.experienceId === experienceId);
  }

  async decideCorrectionRequest(
    id: string,
    decision: { status: 'approved' | 'rejected'; reason?: string },
    decidedBy: string
  ): Promise<CorrectionRequest> {
    const item = this.mockCorrections.find((c) => c.id === id);
    if (!item) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Correction request not found' };
    }
    item.status = decision.status;
    item.decidedBy = decidedBy;
    item.decidedAt = new Date().toISOString();
    return item;
  }

  async getMyPortfolio(userId: string) {
    const settings = this.mockSettings.get(userId) || {
      userId,
      visibility: 'public',
      headline: 'Software Engineer',
      bioOverride: '',
      sectionOrder: ['skills', 'projects', 'certificates'],
      sectionVisibility: { skills: true, projects: true, certificates: true },
      pinnedProjectIds: [],
    };
    const projects = await this.getVerifiedExperience(userId);
    return {
      settings,
      projects,
      skills: [
        { name: 'TypeScript', level: 'advanced', verified: true, evidenceCount: 14 },
        { name: 'React', level: 'advanced', verified: true, evidenceCount: 22 },
        { name: 'Node.js', level: 'intermediate', verified: true, evidenceCount: 9 },
      ],
      certificates: [
        {
          certNumber: 'SF-2026-00042',
          projectName: 'SkillForge Monorepo & AI Intelligence Suite',
          roles: ['Fullstack Lead'],
          completedAt: '2026-11-20T12:00:00.000Z',
          verificationUrl: '/verify/SF-2026-00042',
        },
      ],
    };
  }

  async updateMyPortfolio(userId: string, data: Partial<PortfolioSettings>): Promise<PortfolioSettings> {
    const current = this.mockSettings.get(userId) || {
      userId,
      visibility: 'public',
      headline: '',
      bioOverride: '',
      sectionOrder: ['skills', 'projects', 'certificates'],
      sectionVisibility: { skills: true, projects: true, certificates: true },
      pinnedProjectIds: [],
    };

    const updated: PortfolioSettings = {
      ...current,
      ...data,
      sectionOrder: data.sectionOrder || current.sectionOrder,
      sectionVisibility: data.sectionVisibility || current.sectionVisibility,
      pinnedProjectIds: data.pinnedProjectIds || current.pinnedProjectIds,
    };

    this.mockSettings.set(userId, updated);
    return updated;
  }

  async getPublicPortfolio(username: string, viewer?: { id: string; roles: string[] }): Promise<PublicPortfolioView> {
    const settings = this.mockSettings.get('user-001')!;

    // Check visibility
    if (settings.visibility === 'private' && viewer?.id !== 'user-001') {
      return {
        username,
        name: 'Private Builder',
        headline: '',
        bio: '',
        visibility: 'private',
        canView: false,
        privateReason: 'This developer has configured their portfolio to be private.',
        skills: [],
        projects: [],
        certificates: [],
        settings: {
          sectionOrder: [],
          sectionVisibility: {},
          pinnedProjectIds: [],
        },
      };
    }

    const projects = await this.getVerifiedExperience('user-001');

    return {
      username,
      name: username === 'maya' ? 'Maya Chen' : 'Arjun Rao',
      avatar: null,
      headline: settings.headline || 'Verified Fullstack Builder',
      bio: settings.bioOverride || 'Demonstrating transparent, attested software execution evidence on SkillForge.',
      visibility: settings.visibility,
      canView: true,
      skills: [
        { name: 'TypeScript', level: 'advanced', verified: true, evidenceCount: 14 },
        { name: 'React', level: 'advanced', verified: true, evidenceCount: 22 },
        { name: 'Node.js', level: 'intermediate', verified: true, evidenceCount: 9 },
      ],
      projects,
      certificates: [
        {
          certNumber: 'SF-2026-00042',
          projectName: 'SkillForge Monorepo & AI Intelligence Suite',
          roles: ['Fullstack Lead'],
          completedAt: '2026-11-20T12:00:00.000Z',
          verificationUrl: '/verify/SF-2026-00042',
        },
      ],
      settings: {
        sectionOrder: settings.sectionOrder,
        sectionVisibility: settings.sectionVisibility,
        pinnedProjectIds: settings.pinnedProjectIds,
      },
    };
  }
}
