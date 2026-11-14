import crypto from 'crypto';
import { config } from '../../config';
import { prisma, actor, projectAccess, parseJson, fail } from './member2/db';
import { callAI } from './member2/transport';
import { candidateSnapshots, taxonomy } from './member2/candidates';
import { healthCache, registerMember2Events } from './member2/events';

registerMember2Events();
const fingerprint = (v: unknown) =>
  crypto.createHash('sha256').update(JSON.stringify(v)).digest('hex');
const roleSkills = (title: string, requirements: any[]) => {
  const patterns: Record<string, RegExp> = {
    ml: /python|machine|vision|nlp/i,
    cloud: /aws|docker|cloud|ci\/cd/i,
    frontend: /react|typescript|css|design/i,
    backend: /node|sql|security|python/i,
    design: /figma|design/i,
  };
  const rule = Object.entries(patterns).find(([key]) =>
    title.toLowerCase().includes(key)
  )?.[1];
  return requirements
    .filter((r) => !rule || rule.test(r.skillName))
    .map((r) => r.skillName);
};

export class RealService {
  async handle() {
    return {};
  }
  async context(userId: string) {
    const user = await actor(userId);
    const memberships = await prisma.recruiterMember.findMany({
      where: { userId },
    });
    const [projects, jobs, preference] = await Promise.all([
      prisma.project.findMany({
        where: {
          OR: [
            { ownerId: userId },
            { members: { some: { userId, status: 'active' } } },
          ],
        },
        select: {
          id: true,
          title: true,
          ownerId: true,
          status: true,
          roles: { select: { title: true } },
        },
      }),
      prisma.job.findMany({
        where: { companyId: { in: memberships.map((m) => m.companyId) } },
        select: { id: true, title: true, companyId: true },
      }),
      prisma.aiCandidateProfile.findUnique({ where: { userId } }),
    ]);
    return {
      data: {
        user: {
          id: user.id,
          roles: parseJson(user.roles, [user.roles]),
          name: preference?.name || 'Workspace member',
        },
        projects,
        jobs,
        preference: preference
          ? {
              matchingOptIn: preference.matchingOptIn,
              recruiterVisible: preference.recruiterVisible,
              publicSkills: preference.publicSkills,
            }
          : {
              matchingOptIn: false,
              recruiterVisible: false,
              publicSkills: true,
            },
        extensionsEnabled: config.MEMBER2_EXTENSIONS === 'true',
        ranker: config.MATCH_RANKER,
      },
    };
  }
  async preference(
    userId: string,
    data: {
      matchingOptIn?: boolean;
      recruiterVisible?: boolean;
      publicSkills?: boolean;
    }
  ) {
    await actor(userId);
    const profile = await prisma.aiCandidateProfile.findUnique({
      where: { userId },
    });
    if (!profile)
      fail(
        409,
        'PROFILE_REQUIRED',
        'A profile must be added before enabling discovery. You are opted out by default.'
      );
    const result = await prisma.aiCandidateProfile.update({
      where: { userId },
      data,
    });
    return {
      data: {
        matchingOptIn: result.matchingOptIn,
        recruiterVisible: result.recruiterVisible,
        publicSkills: result.publicSkills,
      },
    };
  }
  async requirements(userId: string, input: any) {
    await actor(userId);
    const project = input.projectId
      ? await projectAccess(input.projectId, userId, true)
      : undefined;
    const teamIds = project
      ? [project.ownerId, ...project.members.map((m) => m.userId)]
      : [];
    const members = await prisma.user.findMany({
      where: { id: { in: teamIds } },
      include: { skills: { include: { skill: true } } },
    });
    const evidence = await prisma.skillEvidence.findMany({
      where: { userId: { in: teamIds } },
    });
    const profiles = await prisma.aiCandidateProfile.findMany({
      where: { userId: { in: teamIds } },
    });
    // Gap output discloses only shared member skills. Private skills are not
    // included in a named per-person team report.
    const team = members.map((m) => ({
      name: profiles.find((p) => p.userId === m.id)?.name || 'Team member',
      skills:
        profiles.find((p) => p.userId === m.id)?.publicSkills === false
          ? []
          : m.skills.map((s) => ({
              name: s.skill.name,
              level: s.level,
              evidence: evidence
                .filter((e) => e.userId === m.id && e.skillId === s.skillId)
                .map((e) => e.type),
            })),
    }));
    return {
      data: await callAI(
        '/ai/requirements',
        {
          ...input,
          description: input.description || project?.description || '',
          taxonomy: await taxonomy(),
          team,
        },
        'AI_REQUIREMENTS_SOURCE'
      ),
    };
  }
  async getRequirements(projectId: string, userId: string) {
    const project = await projectAccess(projectId, userId);
    return { data: project.requirements };
  }
  async saveRequirements(
    projectId: string,
    userId: string,
    requirements: any[]
  ) {
    await projectAccess(projectId, userId, true);
    const result = await prisma.$transaction(async (tx) => {
      await tx.projectRequirement.deleteMany({ where: { projectId } });
      for (const r of requirements)
        await tx.projectRequirement.create({
          data: {
            projectId,
            skillName: r.name,
            level: r.proficiency,
            isOptional: r.type === 'preferred',
            source: r.source,
          },
        });
      return tx.projectRequirement.findMany({ where: { projectId } });
    });
    healthCache.delete(projectId);
    return { data: result };
  }
  async match(userId: string, input: any) {
    const p = await projectAccess(input.projectId, userId, true);
    if (!p.requirements.some((r) => !r.isOptional))
      fail(
        422,
        'REQUIREMENTS_REQUIRED',
        'Add at least one required skill before matching.'
      );
    const declined = await prisma.projectInvitation.findMany({
      where: {
        projectId: p.id,
        status: { in: ['Declined', 'declined'] },
        updatedAt: { gte: new Date(Date.now() - 30 * 86400000) },
      },
    });
    const project = {
      id: p.id,
      ownerId: p.ownerId,
      description: p.description,
      memberIds: p.members.map((m) => m.userId),
      requirements: p.requirements.map((r) => ({
        name: r.skillName,
        isOptional: r.isOptional,
      })),
      roles: p.roles.map((r) => ({
        ...r,
        skills: roleSkills(r.title, p.requirements),
      })),
      duration: p.duration || '',
      hoursPerWeek: 10,
    };
    const snapshot = {
      projectId: p.id,
      project,
      candidates: await candidateSnapshots(),
      exclusions: declined.map((i) => i.inviteeId),
      filters: input.filters || {},
      ranker: config.MATCH_RANKER,
    };
    const result = await callAI('/ai/match', snapshot, 'AI_MATCH_SOURCE');
    const run = await prisma.aiMatchRun.create({
      data: {
        projectId: p.id,
        actorId: userId,
        ranker: config.MATCH_RANKER,
        inputsSnapshot: JSON.stringify(snapshot),
        resultJson: JSON.stringify(result),
      },
    });
    return { data: { ...result, runId: run.id } };
  }
  async health(projectId: string, userId: string) {
    const p = await projectAccess(projectId, userId);
    const cached = healthCache.get(projectId);
    if (cached && cached.expires > Date.now()) return { data: cached.data };
    const [tasks, milestones, activity, rooms] = await Promise.all([
      prisma.task.findMany({ where: { projectId } }),
      prisma.milestone.findMany({ where: { projectId } }),
      prisma.activityFeedEntry.findFirst({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        select: { createdAt: true },
      }),
      prisma.chatRoom.findMany({ where: { projectId }, select: { id: true } }),
    ]);
    const latestMessage = await prisma.message.findFirst({
      where: { roomId: { in: rooms.map((r) => r.id) } },
      orderBy: { createdAt: 'desc' },
      select: { createdAt: true },
    });
    const result = await callAI(
      '/ai/health',
      {
        project: {
          id: p.id,
          status: p.status,
          createdAt: p.createdAt,
          targetDate: p.targetDate,
        },
        tasks: tasks.map((t) => ({
          ...t,
          dependsOn: parseJson(t.dependsOn, []),
        })),
        milestones,
        activity: [activity?.createdAt, latestMessage?.createdAt].filter(
          Boolean
        ),
        now: new Date().toISOString(),
      },
      'AI_HEALTH_SOURCE'
    );
    healthCache.set(projectId, { expires: Date.now() + 300000, data: result });
    return { data: result };
  }
  private async jobAccess(jobId: string, userId: string) {
    await actor(userId);
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) fail(404, 'NOT_FOUND', 'Job not found.');
    const member = await prisma.recruiterMember.findFirst({
      where: { userId, companyId: job!.companyId },
    });
    if (!member)
      fail(
        403,
        'FORBIDDEN',
        'Only this company’s recruiters can run job matching.'
      );
    const details = await prisma.aiJobRequirements.findUnique({
      where: { jobId },
    });
    const snapshot = {
      id: job!.id,
      title: job!.title,
      status: job!.status,
      companyId: job!.companyId,
      requirements: parseJson<any[]>(details?.requirementsJson, []),
      minimumExperience: details?.minimumExperience || 0,
      location: details?.location || '',
      workMode: details?.workMode || 'flexible',
      updatedAt: details?.updatedAt.toISOString() || '',
    };
    return snapshot;
  }
  async jobMatch(userId: string, input: any) {
    const job = await this.jobAccess(input.jobId, userId);
    if (!job.requirements.some((r) => !r.isOptional))
      fail(
        422,
        'REQUIREMENTS_REQUIRED',
        'The job needs structured required skills before matching.'
      );
    const snapshot = {
      jobId: job.id,
      job,
      candidates: await candidateSnapshots(true),
      constraints: input.constraints || {},
    };
    const result = await callAI(
      '/ai/job-match',
      snapshot,
      'AI_JOBMATCH_SOURCE'
    );
    const jobHash = fingerprint(job);
    const runId = crypto.randomUUID();
    await prisma.$transaction(async (tx) => {
      await tx.metricEvent.create({
        data: {
          id: runId,
          type: 'JobMatchRun',
          actorId: userId,
          payloadJson: JSON.stringify({
            jobId: job.id,
            jobHash,
            result: { ...result, candidates: [] },
          }),
        },
      });
      for (const candidate of result.candidates)
        await tx.candidateMatch.create({
          data: {
            jobId: job.id,
            runId,
            userId: candidate.userId,
            score: candidate.score,
            explanationJson: JSON.stringify({
              ...candidate,
              jobHash,
              mode: result.mode,
            }),
            inputsSnapshot: JSON.stringify(snapshot),
          },
        });
    });
    return {
      data: { ...result, job: { id: job.id, title: job.title }, stale: false },
    };
  }
  async storedJobMatches(jobId: string, userId: string) {
    const job = await this.jobAccess(jobId, userId);
    const visible = await candidateSnapshots(true);
    const headers = await prisma.$queryRaw<
      any[]
    >`SELECT "id", "payloadJson" FROM "MetricEvent" WHERE "type" = 'JobMatchRun' AND json_extract("payloadJson", '$.jobId') = ${jobId} ORDER BY "occurredAt" DESC, "id" DESC LIMIT 1`;
    const header = headers[0];
    const metadata = parseJson<any>(header?.payloadJson, {});
    const rows = await prisma.candidateMatch.findMany({
      where: { jobId, ...(header ? { runId: header.id } : {}) },
      orderBy: [{ score: 'desc' }, { userId: 'asc' }],
    });
    const candidates = rows.flatMap((row) => {
      const profile = visible.find((c) => c.id === row.userId);
      if (!profile) return [];
      if (!profile.publicSkills && !profile.matchingOptIn) return [];
      const stored = parseJson<any>(row.explanationJson, {});
      if (!profile.publicSkills) {
        stored.matchedSkills = [];
        stored.reasons = [
          'Matches requested capabilities; private skill details are hidden.',
        ];
      }
      return [{ ...stored, stale: stored.jobHash !== fingerprint(job) }];
    });
    return {
      data: {
        ...(metadata.result || {}),
        candidates,
        job: { id: job.id, title: job.title },
        stale: metadata.jobHash
          ? metadata.jobHash !== fingerprint(job)
          : candidates.some((c) => c.stale),
      },
    };
  }
}
export const realService = new RealService();
