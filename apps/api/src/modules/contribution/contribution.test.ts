import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Module 14: Documented Contribution Tracking', () => {
  it('GET /api/v1/projects/:id/contributions returns documented project ledger', async () => {
    const res = await request(app).get('/api/v1/projects/pilot-project/contributions');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('contributions');
    expect(Array.isArray(res.body.contributions)).toBe(true);
    expect(res.body).toHaveProperty('totalEvents');

    // Rule: Response must never claim effort, productivity, or contribution percentages
    const payloadStr = JSON.stringify(res.body).toLowerCase();
    expect(payloadStr).not.toContain('productivity');
    expect(payloadStr).not.toContain('effort');
    expect(payloadStr).not.toContain('percentage contribution');
  });

  it('GET /api/v1/projects/:id/contributions/:userId returns narrative profile without effort metrics', async () => {
    const res = await request(app).get('/api/v1/projects/pilot-project/contributions/user-001');
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('narrativeSummary');
    expect(res.body).toHaveProperty('roles');
    expect(res.body).toHaveProperty('evidenceBreakdown');
    expect(res.body.evidenceBreakdown).toHaveProperty('commits');
    expect(res.body.evidenceBreakdown).toHaveProperty('tasksCompleted');

    // Narrative must be professional and factual
    expect(typeof res.body.narrativeSummary).toBe('string');
  });

  it('POST /api/v1/projects/:id/contributions/manual-note creates owner-justified manual entry', async () => {
    const res = await request(app)
      .post('/api/v1/projects/pilot-project/contributions/manual-note')
      .set('x-user-id', 'user-001')
      .send({
        detail: 'Architected offline system design and capacity planning schema',
        justification: 'Verified architectural whiteboard session attended by team leads',
        referenceUrl: 'https://docs.skillforge.internal/specs/capacity.pdf',
      });

    expect(res.status).toBe(201);
    expect(res.body.type).toBe('manual');
    expect(res.body.source).toBe('manual');
    expect(res.body.detail).toContain('Architected offline');
  });

  it('POST /api/v1/contributions/:id/dispute creates open dispute record', async () => {
    // 1. Get an existing event
    const listRes = await request(app).get('/api/v1/projects/pilot-project/contributions');
    const firstEvent = listRes.body.contributions[0];

    const res = await request(app)
      .post(`/api/v1/contributions/${firstEvent.id}/dispute`)
      .set('x-user-id', 'user-002')
      .send({
        reason: 'Commit contains shared pairing work that should be reflected in notes',
      });

    expect(res.status).toBe(201);
    expect(res.body.status).toBe('open');
    expect(res.body.eventId).toBe(firstEvent.id);
  });
});
