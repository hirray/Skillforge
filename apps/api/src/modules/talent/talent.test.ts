import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Module 23: Recruiter Talent Search & Filtering', () => {
  it('POST /api/v1/talent/search returns recruiter-visible candidates with evidence highlights', async () => {
    const res = await request(app)
      .post('/api/v1/talent/search')
      .send({
        skills: ['TypeScript'],
        limit: 10,
      });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('candidates');
    expect(Array.isArray(res.body.candidates)).toBe(true);
    expect(res.body).toHaveProperty('total');

    if (res.body.candidates.length > 0) {
      const candidate = res.body.candidates[0];
      expect(candidate).toHaveProperty('name');
      expect(candidate).toHaveProperty('headline');
      expect(candidate).toHaveProperty('whyThisCandidate');
      expect(candidate).toHaveProperty('evidenceHighlights');
      expect(candidate.recruiterVisible).toBe(true);
    }
  });

  it('POST /api/v1/talent/search filters by workMode and availability', async () => {
    const res = await request(app)
      .post('/api/v1/talent/search')
      .send({
        workMode: 'remote',
        availability: 'immediate',
      });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.candidates)).toBe(true);
    for (const c of res.body.candidates) {
      expect(['remote', 'flexible']).toContain(c.workMode);
    }
  });

  it('POST & GET /api/v1/talent/saved-searches saves and retrieves company search presets', async () => {
    const createRes = await request(app)
      .post('/api/v1/talent/saved-searches')
      .set('x-user-id', 'recruiter-001')
      .send({
        name: 'React and TypeScript Senior Talent',
        companyId: 'm2-demo-company',
        filters: {
          skills: ['React', 'TypeScript'],
          minExperienceYears: 3,
        },
      });

    expect(createRes.status).toBe(201);
    expect(createRes.body.name).toBe('React and TypeScript Senior Talent');

    const getRes = await request(app)
      .get('/api/v1/talent/saved-searches?companyId=m2-demo-company')
      .set('x-user-id', 'recruiter-001');

    expect(getRes.status).toBe(200);
    expect(getRes.body).toHaveProperty('searches');
    expect(getRes.body.searches.some((s: any) => s.name === 'React and TypeScript Senior Talent')).toBe(true);
  });
});
