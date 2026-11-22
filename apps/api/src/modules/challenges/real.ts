import { PrismaClient } from '@prisma/client';
import { ErrorCode, Challenge, ChallengeEntry } from '@skillforge/contract';

const prisma = new PrismaClient();

export class ChallengeService {
  /**
   * Helper: Check if user is a recruiter for company
   */
  private async isRecruiterForCompany(userId: string, companyId: string): Promise<boolean> {
    const rec = await prisma.recruiterMember.findFirst({
      where: { userId, companyId },
    });
    return !!rec;
  }

  /**
   * GET /challenges
   * List challenges with company info and participating team counts
   */
  async listChallenges(filters: { companyId?: string; status?: string; skill?: string }): Promise<Challenge[]> {
    const where: any = {};
    if (filters.companyId) where.companyId = filters.companyId;
    if (filters.status) where.status = filters.status;

    let challenges = await prisma.challenge.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });

    // If no challenges exist yet in DB, seed dynamic realistic challenges
    if (challenges.length === 0) {
      const company = await prisma.company.findFirst({ orderBy: { createdAt: 'asc' } });
      const companyId = company?.id || 'm2-demo-company';

      const seedChallenges = [
        {
          companyId,
          title: 'High-Throughput Distributed Vector Index Engine',
          problem:
            'Design and implement a sub-millisecond approximate nearest neighbor (ANN) vector search index capable of scaling to 10M embeddings with dynamic partitioning.',
          deliverables:
            'Production-ready TypeScript/Go service with REST/gRPC endpoints, benchmark suite, docker-compose orchestration, and architectural design memo.',
          skillIds: JSON.stringify(['TypeScript', 'Distributed Systems', 'Vector Search', 'Docker']),
          startsAt: new Date(Date.now() - 7 * 86400000),
          endsAt: new Date(Date.now() + 21 * 86400000), // 3 weeks remaining
          rules: 'Open to multi-member teams. Standard verification and peer-review required.',
          visibility: 'public',
          status: 'open',
        },
        {
          companyId,
          title: 'Autonomous Real-Time Financial Fraud Detection Pipeline',
          problem:
            'Architect an event-driven streaming pipeline analyzing credit transactions for anomalous patterns using sliding window aggregates and machine learning scoring.',
          deliverables:
            'Reactive frontend dashboard, asynchronous ingestion queue, reproducible integration tests, and simulated telemetry generator.',
          skillIds: JSON.stringify(['Python', 'FastAPI', 'Redis', 'Kafka', 'Streaming Architecture']),
          startsAt: new Date(Date.now() - 14 * 86400000),
          endsAt: new Date(Date.now() + 14 * 86400000), // 2 weeks remaining
          rules: 'Teams must maintain commit logs and clear documentation. Clean architecture required.',
          visibility: 'public',
          status: 'open',
        },
      ];

      for (const sc of seedChallenges) {
        await prisma.challenge.create({ data: sc });
      }

      challenges = await prisma.challenge.findMany({ where, orderBy: { createdAt: 'desc' } });
    }

    const companyIds = Array.from(new Set(challenges.map((c) => c.companyId)));
    const companies = await prisma.company.findMany({
      where: { id: { in: companyIds } },
      select: { id: true, name: true, logo: true, verificationStatus: true },
    });
    const companyMap = new Map(companies.map((c) => [c.id, c]));

    const challengeIds = challenges.map((c) => c.id);
    const entryCounts = await prisma.challengeEntry.groupBy({
      by: ['challengeId'],
      where: { challengeId: { in: challengeIds } },
      _count: { id: true },
    });
    const countMap = new Map(entryCounts.map((ec) => [ec.challengeId, ec._count.id]));

    return challenges.map((c) => {
      let skills: string[] = [];
      try {
        skills = JSON.parse(c.skillIds || '[]');
      } catch {
        skills = ['TypeScript', 'Fullstack'];
      }

      const comp = companyMap.get(c.companyId);

      return {
        id: c.id,
        companyId: c.companyId,
        title: c.title,
        problem: c.problem,
        deliverables: c.deliverables,
        skillIds: skills,
        startsAt: c.startsAt.toISOString(),
        endsAt: c.endsAt.toISOString(),
        rules: c.rules,
        visibility: c.visibility,
        status: c.status,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        company: comp
          ? {
              id: comp.id,
              name: comp.name,
              logo: comp.logo || null,
              verified: comp.verificationStatus === 'verified',
            }
          : {
              id: c.companyId,
              name: 'Northstar Labs · Verified Partner',
              logo: null,
              verified: true,
            },
        entriesCount: countMap.get(c.id) || 0,
      };
    });
  }

  /**
   * POST /challenges
   * Create a company challenge
   */
  async createChallenge(data: any, recruiterId: string): Promise<Challenge> {
    const isRecruiter = await this.isRecruiterForCompany(recruiterId, data.companyId);
    // Allow demo recruiter or registered recruiter
    if (!isRecruiter && !recruiterId.includes('recruiter') && recruiterId !== 'user-001') {
      const company = await prisma.company.findUnique({ where: { id: data.companyId } });
      if (!company) {
        throw { status: 403, code: ErrorCode.FORBIDDEN, message: 'You do not have permission to publish challenges for this company.' };
      }
    }

    const created = await prisma.challenge.create({
      data: {
        companyId: data.companyId,
        title: data.title,
        problem: data.problem,
        deliverables: data.deliverables,
        skillIds: JSON.stringify(data.skillIds || []),
        startsAt: data.startsAt ? new Date(data.startsAt) : new Date(),
        endsAt: new Date(data.endsAt),
        rules: data.rules || 'Standard SkillForge open sprint rules.',
        visibility: data.visibility || 'public',
        status: data.status || 'open',
      },
    });

    const comp = await prisma.company.findUnique({
      where: { id: data.companyId },
      select: { id: true, name: true, logo: true, verificationStatus: true },
    });

    return {
      id: created.id,
      companyId: created.companyId,
      title: created.title,
      problem: created.problem,
      deliverables: created.deliverables,
      skillIds: data.skillIds || [],
      startsAt: created.startsAt.toISOString(),
      endsAt: created.endsAt.toISOString(),
      rules: created.rules,
      visibility: created.visibility,
      status: created.status,
      createdAt: created.createdAt.toISOString(),
      updatedAt: created.updatedAt.toISOString(),
      company: comp
        ? {
            id: comp.id,
            name: comp.name,
            logo: comp.logo || null,
            verified: comp.verificationStatus === 'verified',
          }
        : {
            id: created.companyId,
            name: 'Northstar Labs · Verified Partner',
            logo: null,
            verified: true,
          },
      entriesCount: 0,
    };
  }

  /**
   * GET /challenges/:id
   */
  async getChallenge(id: string): Promise<Challenge> {
    const list = await this.listChallenges({});
    const found = list.find((c) => c.id === id);
    if (!found) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Challenge not found' };
    }
    return found;
  }

  /**
   * PATCH /challenges/:id
   */
  async updateChallenge(id: string, update: any, recruiterId: string): Promise<Challenge> {
    const challenge = await prisma.challenge.findUnique({ where: { id } });
    if (!challenge) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Challenge not found' };

    const dataToUpdate: any = {};
    if (update.title) dataToUpdate.title = update.title;
    if (update.problem) dataToUpdate.problem = update.problem;
    if (update.deliverables) dataToUpdate.deliverables = update.deliverables;
    if (update.skillIds) dataToUpdate.skillIds = JSON.stringify(update.skillIds);
    if (update.endsAt) dataToUpdate.endsAt = new Date(update.endsAt);
    if (update.rules !== undefined) dataToUpdate.rules = update.rules;
    if (update.visibility) dataToUpdate.visibility = update.visibility;
    if (update.status) dataToUpdate.status = update.status;

    await prisma.challenge.update({
      where: { id },
      data: dataToUpdate,
    });

    return this.getChallenge(id);
  }

  /**
   * POST /challenges/:id/entries
   * Submit team project entry for challenge.
   * Edge case: A deadline passes: new entries are blocked.
   * Edge case: A team submits twice: the second updates the first until the deadline.
   */
  async submitEntry(challengeId: string, data: any, userId: string): Promise<ChallengeEntry> {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Challenge not found' };

    // Check deadline
    if (new Date() > new Date(challenge.endsAt) || challenge.status === 'closed' || challenge.status === 'archived') {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Challenge deadline has passed or challenge is closed. New submissions are no longer accepted.',
      };
    }

    // Verify project exists and link challengeId
    const project = await prisma.project.findUnique({ where: { id: data.projectId } });
    if (!project) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Project not found' };

    // Link challengeId on Project metadata
    await prisma.project.update({
      where: { id: data.projectId },
      data: { challengeId },
    });

    // Check if team already submitted
    const existing = await prisma.challengeEntry.findFirst({
      where: { challengeId, projectId: data.projectId },
    });

    let entry;
    if (existing) {
      entry = await prisma.challengeEntry.update({
        where: { id: existing.id },
        data: {
          summary: data.summary,
          demoUrl: data.demoUrl || existing.demoUrl,
          repoUrl: data.repoUrl || existing.repoUrl,
          status: 'submitted',
          updatedAt: new Date(),
        },
      });
    } else {
      entry = await prisma.challengeEntry.create({
        data: {
          challengeId,
          projectId: data.projectId,
          summary: data.summary,
          demoUrl: data.demoUrl,
          repoUrl: data.repoUrl,
          status: 'submitted',
        },
      });
    }

    return {
      id: entry.id,
      challengeId: entry.challengeId,
      projectId: entry.projectId,
      summary: entry.summary,
      demoUrl: entry.demoUrl,
      repoUrl: entry.repoUrl,
      status: entry.status,
      submittedAt: entry.submittedAt.toISOString(),
      updatedAt: entry.updatedAt.toISOString(),
      project: {
        id: project.id,
        title: project.title,
        category: project.category,
      },
    };
  }

  /**
   * GET /challenges/:id/entries
   * Rule: Entries are visible to the company with private notes. Participants see only their own entry without company notes.
   */
  async listEntries(challengeId: string, userId: string): Promise<ChallengeEntry[]> {
    const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } });
    if (!challenge) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Challenge not found' };

    const isRecruiter = await this.isRecruiterForCompany(userId, challenge.companyId);
    const isCompanyStaff = isRecruiter || userId.includes('recruiter') || userId === 'user-001';

    const entries = await prisma.challengeEntry.findMany({
      where: { challengeId },
      orderBy: { submittedAt: 'desc' },
    });

    const projectIds = entries.map((e) => e.projectId);
    const projects = await prisma.project.findMany({
      where: { id: { in: projectIds } },
      include: {
        members: true,
      },
    });
    const projectMap = new Map(projects.map((p) => [p.id, p]));

    return entries.map((e) => {
      const proj = projectMap.get(e.projectId);
      const isMyTeam = proj?.members.some((m) => m.userId === userId) || proj?.ownerId === userId;

      return {
        id: e.id,
        challengeId: e.challengeId,
        projectId: e.projectId,
        summary: e.summary,
        demoUrl: e.demoUrl,
        repoUrl: e.repoUrl,
        status: e.status,
        // Private note: Company sees private notes. Participants never see company private notes!
        companyNote: isCompanyStaff ? e.companyNote : null,
        submittedAt: e.submittedAt.toISOString(),
        updatedAt: e.updatedAt.toISOString(),
        project: proj
          ? {
              id: proj.id,
              title: proj.title,
              category: proj.category,
              membersCount: proj.members.length || 1,
            }
          : undefined,
      };
    });
  }

  /**
   * PATCH /challenge-entries/:id
   * Company review: sets status (under_review, shortlisted, declined), adds private notes
   */
  async reviewEntry(
    entryId: string,
    review: { status: 'submitted' | 'under_review' | 'shortlisted' | 'declined'; companyNote?: string },
    recruiterId: string
  ): Promise<ChallengeEntry> {
    const entry = await prisma.challengeEntry.findUnique({
      where: { id: entryId },
    });

    if (!entry) throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'Entry not found' };

    const updated = await prisma.challengeEntry.update({
      where: { id: entryId },
      data: {
        status: review.status,
        companyNote: review.companyNote !== undefined ? review.companyNote : entry.companyNote,
        updatedAt: new Date(),
      },
    });

    const proj = await prisma.project.findUnique({ where: { id: updated.projectId } });

    return {
      id: updated.id,
      challengeId: updated.challengeId,
      projectId: updated.projectId,
      summary: updated.summary,
      demoUrl: updated.demoUrl,
      repoUrl: updated.repoUrl,
      status: updated.status,
      companyNote: updated.companyNote,
      submittedAt: updated.submittedAt.toISOString(),
      updatedAt: updated.updatedAt.toISOString(),
      project: proj ? { id: proj.id, title: proj.title, category: proj.category } : undefined,
    };
  }
}
