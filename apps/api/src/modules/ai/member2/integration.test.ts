import {
  describe,
  it,
  expect,
  beforeAll,
  afterAll,
  beforeEach,
  vi,
} from 'vitest';
vi.hoisted(() => {
  Object.assign(process.env, {
    RESUMES_SOURCE: 'real',
    AI_RESUME_SOURCE: 'real',
    AI_REQUIREMENTS_SOURCE: 'real',
    AI_MATCH_SOURCE: 'real',
    AI_HEALTH_SOURCE: 'real',
    AI_JOBMATCH_SOURCE: 'real',
    ANALYTICS_SOURCE: 'real',
    MEMBER2_EXTENSIONS: 'true',
    RESUME_RETRY_DELAY_MS: '10',
    AI_REQUEST_TIMEOUT_MS: '500',
  });
});
// @ts-ignore Existing project does not include Supertest types.
import request from 'supertest';
import app from '../../../app';
import { prisma } from './db';
import { config } from '../../../config';
import { realService as resumes } from '../../resumes/real';
import { recordEvent } from './events';
import { suppress, safeRate } from '../../analytics/real';

const owner = 'm2-test-owner',
  member = 'm2-test-member',
  stranger = 'm2-test-stranger',
  recruiter = 'm2-test-recruiter',
  otherRecruiter = 'm2-test-other-recruiter',
  admin = 'm2-test-admin';
const projectId = 'm2-test-project',
  companyId = 'm2-test-company',
  jobId = 'm2-test-job',
  skillId = 'm2-test-skill';
const auth = (id = owner) => ({ Authorization: `Bearer ${id}` });
const fetchMock = vi.fn();
const createdResumes: string[] = [];
let pdfIndex = 0;
const extractionData = () => ({
  contact: { name: 'Synthetic Test' },
  skills: [
    {
      id: 'skills-0',
      section: 'skills',
      value: {
        name: 'Test Skill',
        canonicalSkillId: skillId,
        level: 'intermediate',
      },
      confidence: 0.95,
      confidenceLabel: 'High',
      evidence: 'Test Skill',
      reason: 'Found explicitly.',
    },
  ],
  education: [
    {
      id: 'education-0',
      section: 'education',
      value: { institution: 'Synthetic College', degree: 'BSc' },
      confidence: 0.7,
      evidence: 'Synthetic College | BSc',
      reason: 'Found in section.',
    },
  ],
  experience: [],
  certifications: [],
  links: [],
  projects: [],
  warnings: [],
  proposals: [],
  reasons: ['Synthetic fixture.'],
});
const outputCandidate = () => ({
  userId: member,
  name: 'Synthetic Member',
  score: 0.7,
  rank: 1,
  reasons: ['Covers Test Skill.', 'Available 12 hours per week.'],
  matchedSkills: ['Test Skill'],
  signals: { required: 0.7 },
  weights: { required: 0.5 },
  caveats: [],
  verifiedProjects: [],
});
function stubSuccess(url: string, options: any) {
  const input = JSON.parse(options.body);
  const response = url.endsWith('/ai/resume/parse')
    ? {
        extractionId: 'python-id',
        data: extractionData(),
        reasons: ['Fixture.'],
      }
    : url.endsWith('/ai/requirements')
      ? {
          skills: [],
          roles: [],
          modules: [],
          gap: { covered: [], partial: [], missing: [] },
          questions: [],
          warnings: [],
          needsClarification: false,
          reasons: ['Fixture.'],
          team: input.team,
        }
      : url.endsWith('/ai/health')
        ? {
            status: 'Healthy',
            score: 1,
            signals: [],
            reasons: ['No risk.'],
            recommendedActions: [],
            sampleSize: input.tasks.length,
            computedAt: new Date().toISOString(),
          }
        : {
            candidates: [outputCandidate()],
            noStrongMatches: false,
            sampleSize: 1,
            ranker: 'baseline',
            relaxationSuggestions: [],
          };
  return Promise.resolve({ ok: true, json: async () => response });
}
async function upload(id = owner) {
  const result = await request(app)
    .post('/api/v1/resumes')
    .set(auth(id))
    .attach('file', Buffer.from(`%PDF-1.4\nsynthetic test ${pdfIndex++}`), {
      filename: 'test.pdf',
      contentType: 'application/pdf',
    });
  expect(result.status).toBe(202);
  createdResumes.push(result.body.data.id);
  return result.body.data.id as string;
}
async function waitForStatus(id: string, status: string) {
  await vi.waitFor(
    async () => {
      expect((await prisma.resume.findUnique({ where: { id } }))?.status).toBe(
        status
      );
    },
    { timeout: 5000, interval: 25 }
  );
}

beforeAll(async () => {
  vi.stubGlobal('fetch', fetchMock);
  for (const id of [owner, member, stranger, recruiter, otherRecruiter, admin])
    await prisma.user.upsert({
      where: { id },
      update: {},
      create: {
        id,
        email: `${id}@example.test`,
        roles: JSON.stringify([
          id === admin
            ? 'admin'
            : id.includes('recruiter')
              ? 'recruiter'
              : 'user',
        ]),
      },
    });
  await prisma.skill.upsert({
    where: { id: skillId },
    update: {},
    create: { id: skillId, name: 'Test Skill', category: 'Test' },
  });
  await prisma.project.upsert({
    where: { id: projectId },
    update: {},
    create: {
      id: projectId,
      ownerId: owner,
      title: 'Member 2 integration test',
      status: 'Active',
    },
  });
  await prisma.projectMember.create({
    data: { projectId, userId: member, role: 'Engineer' },
  });
  await prisma.projectRole.create({ data: { projectId, title: 'Engineer' } });
  await prisma.projectRequirement.create({
    data: { projectId, skillName: 'Test Skill' },
  });
  await prisma.aiCandidateProfile.upsert({
    where: { userId: member },
    update: { matchingOptIn: true, recruiterVisible: true },
    create: {
      userId: member,
      name: 'Synthetic Member',
      matchingOptIn: true,
      recruiterVisible: true,
      hoursPerWeek: 12,
    },
  });
  await prisma.company.upsert({
    where: { id: companyId },
    update: {},
    create: { id: companyId, name: 'Synthetic company' },
  });
  await prisma.recruiterMember.create({
    data: { companyId, userId: recruiter },
  });
  await prisma.job.upsert({
    where: { id: jobId },
    update: {},
    create: {
      id: jobId,
      companyId,
      title: 'Test Engineer',
      status: 'Published',
    },
  });
  await prisma.aiJobRequirements.upsert({
    where: { jobId },
    update: {},
    create: {
      jobId,
      requirementsJson: JSON.stringify([{ name: 'Test Skill' }]),
    },
  });
});
beforeEach(() => {
  fetchMock.mockReset();
  fetchMock.mockImplementation(stubSuccess);
});
afterAll(async () => {
  for (const id of createdResumes) {
    try {
      const r = await prisma.resume.findUnique({ where: { id } });
      if (r) await resumes.delete(id, r.userId);
    } catch {}
  }
  await prisma.skillEvidence.deleteMany({
    where: { userId: { in: [owner, member] } },
  });
  await prisma.education.deleteMany({ where: { userId: owner } });
  await prisma.userSkill.deleteMany({ where: { userId: owner, skillId } });
  await prisma.resumeAccessLog.deleteMany({
    where: { userId: { in: [owner, member] } },
  });
  await prisma.matchOutcome.deleteMany({ where: { projectId } });
  await prisma.aiMatchRun.deleteMany({ where: { projectId } });
  await prisma.candidateMatch.deleteMany({ where: { jobId } });
  await prisma.aiJobRequirements.deleteMany({ where: { jobId } });
  await prisma.job.deleteMany({ where: { id: jobId } });
  await prisma.recruiterMember.deleteMany({ where: { companyId } });
  await prisma.company.deleteMany({ where: { id: companyId } });
  await prisma.projectInvitation.deleteMany({ where: { projectId } });
  await prisma.project.deleteMany({ where: { id: projectId } });
  await prisma.aiCandidateProfile.deleteMany({
    where: { userId: { in: [owner, member, stranger] } },
  });
  await prisma.metricEvent.deleteMany({
    where: { OR: [{ projectId }, { actorId: { in: [owner, member] } }] },
  });
  await prisma.skill.deleteMany({ where: { id: skillId } });
  await prisma.user.deleteMany({
    where: {
      id: { in: [owner, member, stranger, recruiter, otherRecruiter, admin] },
    },
  });
  vi.unstubAllGlobals();
});

describe('Member 2 HTTP and persistence integration', () => {
  it('requires authentication and resolves actual database identities', async () => {
    expect(
      (
        await request(app)
          .post('/api/v1/ai/requirements')
          .send({ description: 'test' })
      ).status
    ).toBe(401);
    expect(
      (await request(app).get('/api/v1/ai/context').set(auth('does-not-exist')))
        .status
    ).toBe(401);
  });
  it('keeps inherited project and task routes working', async () => {
    expect((await request(app).get('/api/v1/projects')).status).toBe(200);
    expect(
      (
        await request(app)
          .get(`/api/v1/projects/${projectId}/tasks`)
          .set(auth())
      ).status
    ).toBe(200);
  });
  it('rejects invalid, oversized, active-content, and spoofed uploads without rows', async () => {
    const before = await prisma.resume.count({ where: { userId: owner } });
    for (const [filename, content] of [
      ['bad.txt', '%PDF-1.4'],
      ['bad.pdf', 'not a pdf'],
      ['bad.pdf', '%PDF-1.4 /JavaScript evil'],
    ]) {
      expect(
        (
          await request(app)
            .post('/api/v1/resumes')
            .set(auth())
            .attach('file', Buffer.from(content), {
              filename,
              contentType: 'application/pdf',
            })
        ).status
      ).toBe(400);
    }
    expect(
      (
        await request(app)
          .post('/api/v1/resumes')
          .set(auth())
          .attach('file', Buffer.alloc(10 * 1024 * 1024 + 1), {
            filename: 'large.pdf',
            contentType: 'application/pdf',
          })
      ).status
    ).toBe(400);
    expect(await prisma.resume.count({ where: { userId: owner } })).toBe(
      before
    );
  });
  it('queues parsing, deduplicates by hash and never writes a profile before confirmation', async () => {
    const before = await prisma.userSkill.count({ where: { userId: owner } });
    const buffer = Buffer.from(`%PDF-1.4\nduplicate fixture ${pdfIndex++}`);
    const a = await request(app)
      .post('/api/v1/resumes')
      .set(auth())
      .attach('file', buffer, {
        filename: 'same.pdf',
        contentType: 'application/pdf',
      });
    createdResumes.push(a.body.data.id);
    const b = await request(app)
      .post('/api/v1/resumes')
      .set(auth())
      .attach('file', buffer, {
        filename: 'same.pdf',
        contentType: 'application/pdf',
      });
    expect(b.body.data.id).toBe(a.body.data.id);
    expect(b.body.data.reused).toBe(true);
    await waitForStatus(a.body.data.id, 'ready');
    expect(await prisma.userSkill.count({ where: { userId: owner } })).toBe(
      before
    );
    const r = await request(app)
      .get(`/api/v1/resumes/${a.body.data.id}/extraction`)
      .set(auth());
    expect(r.body.data.skills[0].evidence).toBeTruthy();
  });
  it('confirms only selected items, records edits and remains idempotent', async () => {
    const id = await upload();
    await waitForStatus(id, 'ready');
    const extraction = await prisma.resumeExtraction.findFirst({
      where: { resumeId: id },
    });
    const decisions = {
      extractionId: extraction!.id,
      decisions: [
        { id: 'skills-0', action: 'accepted' },
        {
          id: 'education-0',
          action: 'edited',
          value: { institution: 'Edited College', degree: 'BSc' },
        },
      ],
    };
    const response = await request(app)
      .post(`/api/v1/resumes/${id}/confirm`)
      .set(auth())
      .send(decisions);
    expect(response.status).toBe(200);
    expect(
      (
        await request(app)
          .post(`/api/v1/resumes/${id}/confirm`)
          .set(auth())
          .send(decisions)
      ).body.data.reused
    ).toBe(true);
    expect(
      await prisma.education.count({
        where: { userId: owner, institution: 'Edited College' },
      })
    ).toBe(1);
    expect(
      (
        await prisma.education.findFirst({
          where: { userId: owner, institution: 'Edited College' },
        })
      )?.origin
    ).toBe('resume_ai_edited');
    expect(
      (
        await request(app)
          .post(`/api/v1/resumes/${id}/confirm`)
          .set(auth())
          .send({ ...decisions, decisions: [] })
      ).status
    ).toBe(409);
  });
  it('does not write discarded items or accept injected extraction items', async () => {
    const id = await upload();
    await waitForStatus(id, 'ready');
    const e = await prisma.resumeExtraction.findFirst({
      where: { resumeId: id },
    });
    expect(
      (
        await request(app)
          .post(`/api/v1/resumes/${id}/confirm`)
          .set(auth())
          .send({
            extractionId: e!.id,
            decisions: [{ id: 'injected', action: 'accepted' }],
          })
      ).status
    ).toBe(400);
    const before = await prisma.education.count({ where: { userId: owner } });
    expect(
      (
        await request(app)
          .post(`/api/v1/resumes/${id}/confirm`)
          .set(auth())
          .send({
            extractionId: e!.id,
            decisions: [{ id: 'education-0', action: 'discarded' }],
          })
      ).status
    ).toBe(200);
    expect(await prisma.education.count({ where: { userId: owner } })).toBe(
      before
    );
  });
  it('protects original downloads by owner, signature, expiry and account binding', async () => {
    const id = await upload();
    await waitForStatus(id, 'ready');
    const signed = await request(app)
      .get(`/api/v1/resumes/${id}/download`)
      .set(auth());
    expect(signed.status).toBe(200);
    expect(
      (await request(app).get(signed.body.data.url).set(auth())).status
    ).toBe(200);
    expect(
      (await request(app).get(signed.body.data.url).set(auth(member))).status
    ).toBe(404);
    expect(
      (
        await request(app)
          .get(signed.body.data.url.replace(/expires=\d+/, 'expires=0'))
          .set(auth())
      ).status
    ).toBe(403);
    expect(
      (
        await request(app)
          .get(signed.body.data.url.replace(/token=[a-f0-9]+/, 'token=bad'))
          .set(auth())
      ).status
    ).toBe(403);
    expect(
      (await request(app).get(`/api/v1/resumes/${id}`).set(auth(stranger)))
        .status
    ).toBe(404);
    expect(
      await prisma.resumeAccessLog.count({ where: { resumeId: id } })
    ).toBe(1);
  });
  it('retries transient failures three times, exposes failure, and allows explicit retry', async () => {
    fetchMock.mockRejectedValue(new Error('service unavailable'));
    const id = await upload();
    await waitForStatus(id, 'failed');
    expect((await prisma.resume.findUnique({ where: { id } }))?.attempts).toBe(
      3
    );
    fetchMock.mockImplementation(stubSuccess);
    expect(
      (await request(app).post(`/api/v1/resumes/${id}/retry`).set(auth()))
        .status
    ).toBe(200);
    await waitForStatus(id, 'ready');
  });
  it('supports mock extraction without making any AI request', async () => {
    const old = config.AI_RESUME_SOURCE;
    config.AI_RESUME_SOURCE = 'mock';
    try {
      const id = await upload();
      await waitForStatus(id, 'ready');
      const r = await request(app)
        .get(`/api/v1/resumes/${id}/extraction`)
        .set(auth());
      expect(r.body.data.mode).toBe('mock');
      expect(fetchMock).not.toHaveBeenCalled();
    } finally {
      config.AI_RESUME_SOURCE = old;
    }
  });
  it('restricts requirement persistence to owners and records provenance', async () => {
    expect(
      (
        await request(app)
          .put(`/api/v1/projects/${projectId}/requirements`)
          .set(auth(member))
          .send({ requirements: [] })
      ).status
    ).toBe(403);
    const r = await request(app)
      .put(`/api/v1/projects/${projectId}/requirements`)
      .set(auth())
      .send({
        requirements: [
          {
            name: 'Test Skill',
            proficiency: 'advanced',
            type: 'required',
            source: 'ai_edited',
          },
        ],
      });
    expect(r.status).toBe(200);
    expect(r.body.data[0].source).toBe('ai_edited');
    expect(
      (
        await request(app)
          .post('/api/v1/ai/requirements')
          .set(auth(stranger))
          .send({ projectId, description: 'a project' })
      ).status
    ).toBe(403);
  });
  it('stores match explanations and enforces owner-only matching', async () => {
    expect(
      (
        await request(app)
          .post('/api/v1/ai/match')
          .set(auth(member))
          .send({ projectId })
      ).status
    ).toBe(403);
    const result = await request(app)
      .post('/api/v1/ai/match')
      .set(auth())
      .send({ projectId });
    expect(result.status).toBe(200);
    expect(result.body.data.runId).toBeTruthy();
    const run = await prisma.aiMatchRun.findUnique({
      where: { id: result.body.data.runId },
    });
    expect(JSON.parse(run!.resultJson).candidates[0].reasons.length).toBe(2);
  });
  it('records invitation outcomes idempotently and attributes recommendations', async () => {
    const invitation = await prisma.projectInvitation.create({
      data: {
        projectId,
        inviterId: owner,
        inviteeId: member,
        role: 'Engineer',
        status: 'accepted',
        expiresAt: new Date(Date.now() + 86400000),
      },
    });
    await recordEvent('InvitationSent', {
      projectId,
      invitationId: invitation.id,
      userId: member,
    });
    await recordEvent('InvitationSent', {
      projectId,
      invitationId: invitation.id,
      userId: member,
    });
    await recordEvent('InvitationResponded', {
      invitationId: invitation.id,
      status: 'Accepted',
    });
    await recordEvent('MemberJoined', { projectId, userId: member });
    expect(
      await prisma.matchOutcome.count({
        where: { projectId, event: 'invitation_sent' },
      })
    ).toBe(1);
    expect(
      await prisma.matchOutcome.count({
        where: { projectId, sourceRunId: { not: null } },
      })
    ).toBe(3);
  });
  it('restricts job matching to the owning company and preserves stored explanations', async () => {
    expect(
      (
        await request(app)
          .post('/api/v1/ai/job-match')
          .set(auth(otherRecruiter))
          .send({ jobId })
      ).status
    ).toBe(403);
    const result = await request(app)
      .post('/api/v1/ai/job-match')
      .set(auth(recruiter))
      .send({ jobId, constraints: { location: 'hard' } });
    expect(result.status).toBe(200);
    expect(await prisma.candidateMatch.count({ where: { jobId } })).toBe(1);
    const stored = await request(app)
      .get(`/api/v1/ai/job-match/${jobId}`)
      .set(auth(recruiter));
    expect(stored.body.data.stale).toBe(false);
    await prisma.aiJobRequirements.update({
      where: { jobId },
      data: { minimumExperience: 5 },
    });
    expect(
      (
        await request(app)
          .get(`/api/v1/ai/job-match/${jobId}`)
          .set(auth(recruiter))
      ).body.data.stale
    ).toBe(true);
  });
  it('removes newly opted-out candidates from stored recruiter results', async () => {
    await prisma.aiCandidateProfile.update({
      where: { userId: member },
      data: { recruiterVisible: false },
    });
    expect(
      (
        await request(app)
          .get(`/api/v1/ai/job-match/${jobId}`)
          .set(auth(recruiter))
      ).body.data.candidates
    ).toEqual([]);
    await prisma.aiCandidateProfile.update({
      where: { userId: member },
      data: { recruiterVisible: true },
    });
  });
  it('protects health data with project membership', async () => {
    expect(
      (
        await request(app)
          .get(`/api/v1/projects/${projectId}/health`)
          .set(auth(stranger))
      ).status
    ).toBe(403);
    expect(
      (
        await request(app)
          .get(`/api/v1/projects/${projectId}/health`)
          .set(auth(member))
      ).status
    ).toBe(200);
  });
  it('keeps prior explanations and stores an empty latest job-matching run', async () => {
    const before = await prisma.candidateMatch.count({ where: { jobId } });
    expect(before).toBeGreaterThan(0);
    fetchMock.mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        candidates: [],
        noStrongMatches: true,
        sampleSize: 1,
        relaxationSuggestions: ['Review the constraints.'],
        ranker: 'baseline',
      }),
    });
    const result = await request(app)
      .post('/api/v1/ai/job-match')
      .set(auth(recruiter))
      .send({ jobId });
    expect(result.status).toBe(200);
    expect(await prisma.candidateMatch.count({ where: { jobId } })).toBe(
      before
    );
    const latest = await request(app)
      .get(`/api/v1/ai/job-match/${jobId}`)
      .set(auth(recruiter));
    expect(latest.body.data.candidates).toEqual([]);
    expect(latest.body.data.noStrongMatches).toBe(true);
  });
  it('resolves an edited skill name instead of trusting its old canonical ID', async () => {
    const id = await upload();
    await waitForStatus(id, 'ready');
    const e = await prisma.resumeExtraction.findFirst({
      where: { resumeId: id },
    });
    const result = await request(app)
      .post(`/api/v1/resumes/${id}/confirm`)
      .set(auth())
      .send({
        extractionId: e!.id,
        decisions: [
          {
            id: 'skills-0',
            action: 'edited',
            value: { name: 'Definitely Not A Known Skill' },
          },
        ],
      });
    expect(result.status).toBe(422);
    expect(
      (await prisma.resumeExtraction.findUnique({ where: { id: e!.id } }))
        ?.confirmedAt
    ).toBeNull();
  });
  it('supports an explicit analytics mock without leaking live aggregates', async () => {
    const previous = config.ANALYTICS_SOURCE;
    config.ANALYTICS_SOURCE = 'mock';
    try {
      const r = await request(app)
        .get('/api/v1/analytics/summary')
        .set(auth(admin));
      expect(r.body.data.mode).toBe('mock');
      expect(r.body.data.platform).toEqual([]);
      expect(r.body.data.sampleSize).toBe(0);
    } finally {
      config.ANALYTICS_SOURCE = previous;
    }
  });
  it('protects analytics with persisted admin roles and handles invalid ranges', async () => {
    expect(
      (await request(app).get('/api/v1/analytics/summary').set(auth())).status
    ).toBe(403);
    const result = await request(app)
      .get('/api/v1/analytics/summary')
      .set(auth(admin));
    expect(result.status).toBe(200);
    expect(Array.isArray(result.body.data.platform)).toBe(true);
    expect(
      (
        await request(app)
          .get(
            '/api/v1/analytics/summary?from=2020-01-01T00:00:00Z&to=2026-11-14T00:00:00Z'
          )
          .set(auth(admin))
      ).status
    ).toBe(400);
  });
  it('suppresses small cohorts and never divides by zero', () => {
    expect(suppress(4, 4).value).toBeNull();
    expect(suppress(6, 5).value).toBe(6);
    expect(safeRate(0, 0)).toBeNull();
    expect(safeRate(2, 4)).toBe(0.5);
  });
  it('keeps proposed endpoints disabled until explicitly enabled', async () => {
    config.MEMBER2_EXTENSIONS = 'false';
    try {
      expect(
        (await request(app).get('/api/v1/ai/context').set(auth())).status
      ).toBe(404);
    } finally {
      config.MEMBER2_EXTENSIONS = 'true';
    }
  });
});
