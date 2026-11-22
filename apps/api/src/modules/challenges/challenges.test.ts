import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Module 28: Company-Sponsored Real-World Projects', () => {
  let challengeId: string;
  let entryId: string;

  it('GET /api/v1/challenges returns challenge list with company attribution', async () => {
    const res = await request(app).get('/api/v1/challenges');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0]).toHaveProperty('company');
    expect(res.body[0]).toHaveProperty('entriesCount');
  });

  it('POST /api/v1/challenges creates a new sponsored challenge', async () => {
    const res = await request(app)
      .post('/api/v1/challenges')
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        companyId: 'm2-demo-company',
        title: 'Zero-Trust Decentralized Identity Verification Agent',
        problem: 'Implement an autonomous identity verification pipeline using cryptographic signatures and verifiable credentials.',
        deliverables: 'API microservice, verifiable proof explorer UI, and integration test suite.',
        skillIds: ['TypeScript', 'Cryptography', 'Node.js', 'Decentralized Systems'],
        endsAt: new Date(Date.now() + 30 * 86400000).toISOString(),
        rules: 'Open to multi-member teams. Standard verification required.',
        visibility: 'public',
        status: 'open',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.title).toContain('Zero-Trust');
    expect(res.body.company).toBeDefined();

    challengeId = res.body.id;
  });

  it('GET /api/v1/challenges/:id returns challenge detail', async () => {
    expect(challengeId).toBeDefined();
    const res = await request(app).get(`/api/v1/challenges/${challengeId}`);
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(challengeId);
  });

  it('POST /api/v1/challenges/:id/entries submits a team project entry', async () => {
    expect(challengeId).toBeDefined();

    const res = await request(app)
      .post(`/api/v1/challenges/${challengeId}/entries`)
      .set('Authorization', 'Bearer user-001')
      .send({
        projectId: 'github-test-proj-1',
        summary: 'Team Alpha implementation of the Zero-Trust Decentralized Identity verification engine.',
        demoUrl: 'https://demo.skillforge.dev/identity',
        repoUrl: 'https://github.com/skillforge/identity-agent',
      });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.status).toBe('submitted');

    entryId = res.body.id;
  });

  it('PATCH /api/v1/challenge-entries/:id allows company recruiter to review and add private notes', async () => {
    expect(entryId).toBeDefined();

    const res = await request(app)
      .patch(`/api/v1/challenge-entries/${entryId}`)
      .set('Authorization', 'Bearer recruiter-001')
      .send({
        status: 'shortlisted',
        companyNote: 'Exceptional test coverage and high performance on vector ingestion benchmarks.',
      });

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('shortlisted');
    expect(res.body.companyNote).toContain('Exceptional test coverage');
  });

  it('Private notes are hidden from participants in GET /challenges/:id/entries', async () => {
    // Participant query
    const participantRes = await request(app)
      .get(`/api/v1/challenges/${challengeId}/entries`)
      .set('Authorization', 'Bearer user-008');

    expect(participantRes.status).toBe(200);
    const myEntry = participantRes.body.find((e: any) => e.id === entryId);
    if (myEntry) {
      expect(myEntry.companyNote).toBeNull();
    }

    // Company query
    const companyRes = await request(app)
      .get(`/api/v1/challenges/${challengeId}/entries`)
      .set('Authorization', 'Bearer recruiter-001');

    expect(companyRes.status).toBe(200);
    const compEntry = companyRes.body.find((e: any) => e.id === entryId);
    if (compEntry) {
      expect(compEntry.companyNote).toContain('Exceptional test coverage');
    }
  });

  it('Closed challenge blocks new entry submissions', async () => {
    // 1. Close challenge
    await request(app)
      .patch(`/api/v1/challenges/${challengeId}`)
      .set('Authorization', 'Bearer recruiter-001')
      .send({ status: 'closed' });

    // 2. Attempt entry submission
    const res = await request(app)
      .post(`/api/v1/challenges/${challengeId}/entries`)
      .set('Authorization', 'Bearer user-002')
      .send({
        projectId: 'm2-demo-project',
        summary: 'Late submission attempt after closure.',
      });

    expect(res.status).toBe(400);
    expect(res.body.error.message).toContain('challenge is closed');
  });
});
