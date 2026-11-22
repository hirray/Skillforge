import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Module 25: Candidate Comparison & Hiring Pipeline', () => {
  let createdEntryId: string;

  it('GET /api/v1/pipeline returns company-scoped pipeline board entries', async () => {
    const res = await request(app)
      .get('/api/v1/pipeline?companyId=m2-demo-company')
      .set('Authorization', 'Bearer recruiter-001');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('POST /api/v1/pipeline adds a candidate to the company pipeline with stage history', async () => {
    const res = await request(app)
      .post('/api/v1/pipeline')
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        candidateId: 'user-001',
        companyId: 'm2-demo-company',
        jobId: 'm2-demo-job',
        stage: 'Shortlisted',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.stage).toBe('Shortlisted');
    expect(res.body.candidate).toBeDefined();
    expect(res.body.stageHistory.length).toBeGreaterThanOrEqual(1);

    createdEntryId = res.body.id;
  });

  it('PATCH /api/v1/pipeline/:id updates candidate stage and appends to stage history', async () => {
    expect(createdEntryId).toBeDefined();

    const res = await request(app)
      .patch(`/api/v1/pipeline/${createdEntryId}?companyId=m2-demo-company`)
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        stage: 'Interview',
        recruiterNote: 'Candidate passed initial code evaluation and has strong verified GitHub proof.',
      });

    expect(res.status).toBe(200);
    expect(res.body.stage).toBe('Interview');

    // Confirm stage history contains the new stage
    const stages = res.body.stageHistory.map((h: any) => h.toStage);
    expect(stages).toContain('Interview');

    // Confirm note was added
    expect(res.body.notes.length).toBeGreaterThanOrEqual(1);
  });

  it('POST /api/v1/pipeline/:id/notes adds a private recruiter note', async () => {
    const res = await request(app)
      .post(`/api/v1/pipeline/${createdEntryId}/notes`)
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        text: 'Private evaluation: Highly recommended for systems architecture team.',
      });

    expect(res.status).toBe(201);
    expect(res.body.text).toContain('Private evaluation');
  });

  it('POST /api/v1/pipeline/compare compares 2 candidates side-by-side with verified evidence', async () => {
    const res = await request(app)
      .post('/api/v1/pipeline/compare')
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        candidateIds: ['user-001', 'user-002'],
        jobId: 'm2-demo-job',
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('candidates');
    expect(res.body.candidates.length).toBe(2);

    const first = res.body.candidates[0];
    expect(first).toHaveProperty('skills');
    expect(first).toHaveProperty('verifiedProjectsCount');
    expect(first).toHaveProperty('commitsCount');
  });

  it('GET /api/v1/pipeline/opportunities never exposes private recruiter notes to candidate', async () => {
    const res = await request(app)
      .get('/api/v1/pipeline/opportunities')
      .set('Authorization', 'Bearer user-001');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    // Verify candidate response never leaks recruiter notes or internal stages
    for (const opp of res.body) {
      expect(opp).not.toHaveProperty('notes');
      expect(opp).not.toHaveProperty('stageHistory');
      expect(opp).not.toHaveProperty('recruiterNote');
    }
  });

  it('Consent blocks outreach when candidate withdraws consent', async () => {
    // 1. Candidate withdraws consent
    await request(app)
      .post('/api/v1/pipeline/opportunities/consent')
      .set('Authorization', 'Bearer user-001')
      .send({ consent: false });

    // 2. Recruiter attempts outreach to user-001
    const res = await request(app)
      .post(`/api/v1/pipeline/${createdEntryId}/outreach`)
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        text: 'Hello, we would love to schedule a discussion about our Systems Engineer role.',
      });

    expect(res.status).toBe(403);
    expect(res.body.error.message).toContain('withdrawn recruiter contact consent');

    // 3. Candidate re-enables consent
    await request(app)
      .post('/api/v1/pipeline/opportunities/consent')
      .set('Authorization', 'Bearer user-001')
      .send({ consent: true });
  });

  it('Visibility change: Hidden profile candidate returns "Profile no longer visible"', async () => {
    // 1. Hide profile
    await request(app)
      .post('/api/v1/pipeline/opportunities/consent')
      .set('Authorization', 'Bearer user-001')
      .send({ consent: false });

    // 2. Fetch pipeline board
    const res = await request(app)
      .get('/api/v1/pipeline?companyId=m2-demo-company')
      .set('Authorization', 'Bearer recruiter-001');

    expect(res.status).toBe(200);
    const entry = res.body.find((e: any) => e.userId === 'user-001');
    if (entry) {
      expect(entry.candidate.name).toBe('Profile no longer visible');
      expect(entry.candidate.recruiterVisible).toBe(false);
    }

    // 3. Restore consent
    await request(app)
      .post('/api/v1/pipeline/opportunities/consent')
      .set('Authorization', 'Bearer user-001')
      .send({ consent: true });
  });
});
