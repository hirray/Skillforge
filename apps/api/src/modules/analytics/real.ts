import fs from 'fs/promises';
import path from 'path';
import { prisma, admin } from '../ai/member2/db';
import { config } from '../../config';
import { analyticsCache } from '../ai/member2/events';

export function safeRate(
  numerator: number,
  denominator: number
): number | null {
  return denominator ? numerator / denominator : null;
}
export function suppress(value: number | null, sampleSize: number) {
  return {
    value: sampleSize >= 5 ? value : null,
    sampleSize,
    suppressed: sampleSize < 5,
  };
}

export class RealService {
  async handle() {
    return {};
  }
  async summary(userId: string, start: Date, end: Date) {
    await admin(userId);
    if (config.ANALYTICS_SOURCE === 'mock')
      return {
        data: {
          mode: 'mock',
          sampleSize: 0,
          range: { from: start.toISOString(), to: end.toISOString() },
          syntheticEvents: 0,
          platform: [],
          matching: [],
          projects: [],
          recruiters: [],
          series: [],
          eventCounts: [],
          evaluation: {
            scenarios: 0,
            verdict:
              'Sample mode. Enable real analytics to evaluate persisted activity.',
          },
        },
      };
    const cacheKey = `${start.toISOString()}:${end.toISOString()}`;
    const cached = analyticsCache.get(cacheKey);
    if (cached && cached.expires > Date.now()) return { data: cached.data };
    const where = { createdAt: { gte: start, lte: end } };
    const [
      profiles,
      projects,
      invitations,
      accepted,
      activeTeams,
      completed,
      verified,
      certificates,
      milestones,
      milestonesDone,
      tasks,
      overdue,
      shortlists,
      contacts,
      recommendedSent,
      recommendedAccepted,
      recommendedJoined,
      cohortRows,
      series,
      eventCounts,
    ] = await Promise.all([
      prisma.user.count({ where }),
      prisma.project.count({ where }),
      prisma.projectInvitation.count({ where }),
      prisma.projectInvitation.count({
        where: { ...where, status: { in: ['accepted', 'Accepted'] } },
      }),
      prisma.project.count({ where: { ...where, status: 'Active' } }),
      prisma.project.count({
        where: { ...where, status: { in: ['Completed', 'Verified'] } },
      }),
      prisma.project.count({ where: { ...where, status: 'Verified' } }),
      prisma.certificate.count({ where }),
      prisma.milestone.count({ where }),
      prisma.milestone.count({ where: { ...where, status: 'Done' } }),
      prisma.task.count({ where }),
      prisma.task.count({
        where: {
          ...where,
          status: { not: 'Done' },
          dueDate: { lt: new Date() },
        },
      }),
      prisma.shortlist.count(),
      prisma.metricEvent.count({
        where: {
          type: 'CandidateContacted',
          occurredAt: { gte: start, lte: end },
        },
      }),
      prisma.matchOutcome.count({
        where: {
          ...where,
          sourceRunId: { not: null },
          event: 'invitation_sent',
        },
      }),
      prisma.matchOutcome.count({
        where: {
          ...where,
          sourceRunId: { not: null },
          event: 'invitation_accepted',
        },
      }),
      prisma.matchOutcome.count({
        where: { ...where, sourceRunId: { not: null }, event: 'member_joined' },
      }),
      prisma.$queryRaw<
        { sampleSize: bigint }[]
      >`SELECT COUNT(DISTINCT "actorId") AS sampleSize FROM "MetricEvent" WHERE "occurredAt" >= ${start} AND "occurredAt" <= ${end}`,
      prisma.$queryRaw<
        any[]
      >`SELECT date("occurredAt" / 1000, 'unixepoch') AS day, "type", COUNT(*) AS count, COUNT(DISTINCT "actorId") AS sampleSize FROM "MetricEvent" WHERE "occurredAt" >= ${start} AND "occurredAt" <= ${end} GROUP BY day, "type" ORDER BY day`,
      prisma.metricEvent.groupBy({
        by: ['type', 'synthetic'],
        where: { occurredAt: { gte: start, lte: end } },
        _count: { _all: true },
      }),
    ]);
    const sampleSize = Number(cohortRows[0]?.sampleSize || 0);
    const recommendedPeople = (
      await prisma.matchOutcome.groupBy({
        by: ['userId'],
        where: { ...where, sourceRunId: { not: null } },
      })
    ).length;
    const [completeProfiles, downstream, verifiedDuration] = await Promise.all([
      prisma.$queryRaw<
        any[]
      >`SELECT COUNT(*) AS total FROM "AiCandidateProfile" a WHERE a."name" != '' AND a."headline" != '' AND a."hoursPerWeek" > 0 AND a."updatedAt" >= ${start} AND a."updatedAt" <= ${end} AND EXISTS (SELECT 1 FROM "UserSkill" s WHERE s."userId" = a."userId")`,
      prisma.$queryRaw<
        any[]
      >`SELECT COUNT(DISTINCT m."projectId") AS total, COUNT(DISTINCT CASE WHEN p."status" IN ('Completed','Verified') THEN m."projectId" END) AS completed FROM "MatchOutcome" m JOIN "Project" p ON p."id" = m."projectId" WHERE m."sourceRunId" IS NOT NULL AND m."event" = 'member_joined' AND m."createdAt" >= ${start} AND m."createdAt" <= ${end}`,
      prisma.$queryRaw<
        any[]
      >`SELECT AVG((e.finished - p."createdAt") / 86400000.0) AS days, COUNT(*) AS sample FROM (SELECT "projectId", MIN("occurredAt") AS finished FROM "MetricEvent" WHERE "type" = 'ProjectVerified' AND "occurredAt" >= ${start} AND "occurredAt" <= ${end} GROUP BY "projectId") e JOIN "Project" p ON p."id" = e."projectId" WHERE e.finished >= p."createdAt"`,
    ]);
    const eventTotal = (type: string) =>
      eventCounts
        .filter((e) => e.type === type)
        .reduce((sum, e) => sum + e._count._all, 0);
    const live = config.ANALYTICS_SOURCE === 'real';
    const metric = (
      label: string,
      value: number | null,
      sample = sampleSize,
      moduleLive = true
    ) => ({
      label,
      ...suppress(moduleLive ? value : 0, sample),
      live: moduleLive,
    });
    let evaluation: any = {
      verdict: 'Run npm run eval:matching to generate the evaluation report.',
      scenarios: 0,
    };
    try {
      evaluation = JSON.parse(
        await fs.readFile(
          path.resolve(__dirname, '../../../../../docs/AI_EVAL_REPORT.json'),
          'utf8'
        )
      );
    } catch {}
    const syntheticEvents = eventCounts
      .filter((e) => e.synthetic)
      .reduce((sum, e) => sum + e._count._all, 0);
    const data = {
      mode: live ? 'real' : 'mock',
      sampleSize,
      range: { from: start.toISOString(), to: end.toISOString() },
      syntheticEvents,
      platform: [
        metric(
          'Profiles created',
          profiles,
          sampleSize,
          config.AUTH_SOURCE === 'real'
        ),
        metric(
          'Profiles completed (adapter)',
          Number(completeProfiles[0]?.total || 0),
          sampleSize,
          process.env.USERS_SOURCE === 'real'
        ),
        metric(
          'Projects created',
          projects,
          sampleSize,
          config.PROJECTS_SOURCE === 'real'
        ),
        metric(
          'Invitations sent',
          invitations,
          sampleSize,
          config.TEAM_SOURCE === 'real'
        ),
        metric(
          'Invitations accepted',
          accepted,
          sampleSize,
          config.TEAM_SOURCE === 'real'
        ),
        metric(
          'Active teams',
          activeTeams,
          sampleSize,
          config.TEAM_SOURCE === 'real'
        ),
        metric('Completed projects', completed),
        metric(
          'Verified projects',
          verified,
          sampleSize,
          process.env.VERIFICATION_SOURCE === 'real'
        ),
        metric(
          'Certificates issued',
          certificates,
          sampleSize,
          process.env.CERTIFICATES_SOURCE === 'real'
        ),
      ],
      matching: [
        metric(
          'Recommendation acceptance rate',
          safeRate(recommendedAccepted, recommendedSent),
          recommendedPeople
        ),
        metric(
          'Recommendation join rate',
          safeRate(recommendedJoined, recommendedSent),
          recommendedPeople
        ),
        metric(
          'Recommended-team completion rate',
          safeRate(
            Number(downstream[0]?.completed || 0),
            Number(downstream[0]?.total || 0)
          ),
          recommendedPeople
        ),
      ],
      projects: [
        metric(
          'Milestone completion rate',
          safeRate(milestonesDone, milestones),
          sampleSize,
          config.MILESTONES_SOURCE === 'real'
        ),
        metric(
          'Overdue task rate',
          safeRate(overdue, tasks),
          sampleSize,
          config.TASKS_SOURCE === 'real'
        ),
        metric(
          'Rescue events',
          eventTotal('ProjectRescued'),
          sampleSize,
          eventTotal('ProjectRescued') > 0
        ),
        metric(
          'Days to verification',
          verifiedDuration[0]?.days ?? null,
          sampleSize,
          Number(verifiedDuration[0]?.sample || 0) > 0
        ),
      ],
      recruiters: [
        metric(
          'Talent searches',
          eventTotal('TalentSearch'),
          sampleSize,
          process.env.TALENT_SOURCE === 'real'
        ),
        metric(
          'Shortlisted candidates (all time)',
          shortlists,
          sampleSize,
          process.env.PIPELINE_SOURCE === 'real'
        ),
        metric(
          'Candidate contacts',
          contacts,
          sampleSize,
          process.env.PIPELINE_SOURCE === 'real'
        ),
        metric(
          'Candidate response rate',
          safeRate(eventTotal('CandidateResponded'), contacts),
          sampleSize,
          process.env.PIPELINE_SOURCE === 'real'
        ),
      ],
      series: series.map((row) => ({
        day: row.day,
        type: row.type,
        ...suppress(Number(row.count), Number(row.sampleSize)),
      })),
      eventCounts: eventCounts.map((row) => ({
        type: row.type,
        synthetic: row.synthetic,
        ...suppress(row._count._all, sampleSize),
      })),
      evaluation,
      definitions: 'docs/member2/METRICS.md',
    };
    if (analyticsCache.size >= 100) analyticsCache.clear();
    analyticsCache.set(cacheKey, { expires: Date.now() + 30000, data });
    return { data };
  }
}
export const realService = new RealService();
