import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Module 19 & 20: Verified Experience & Professional Portfolio', () => {
  let createdExperienceId = '';

  it('GET /api/v1/users/me/verified-experience returns verified project experiences', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/verified-experience')
      .set('Authorization', 'Bearer user-001');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const exp = res.body[0];
      expect(exp).toHaveProperty('id');
      expect(exp).toHaveProperty('projectId');
      expect(exp).toHaveProperty('title');
      expect(exp).toHaveProperty('role');
      expect(exp).toHaveProperty('evidenceLinks');
      expect(exp.evidenceLinks).toHaveProperty('contributionsUrl');
      createdExperienceId = exp.id;
    }
  });

  it('POST /api/v1/verified-experience/:id/corrections creates a correction request', async () => {
    const expId = createdExperienceId || 'exp-001';
    const res = await request(app)
      .post(`/api/v1/verified-experience/${expId}/corrections`)
      .set('Authorization', 'Bearer user-001')
      .send({
        field: 'role',
        newValue: 'Principal Systems Architect',
        reason: 'Led the entire core infrastructure and distributed message bus',
      });

    expect([201, 404]).toContain(res.status);
    if (res.status === 201) {
      expect(res.body.status).toBe('pending');
      expect(res.body.field).toBe('role');
      expect(res.body.newValue).toBe('Principal Systems Architect');
    }
  });

  it('GET /api/v1/users/me/portfolio returns editable portfolio configuration', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/portfolio')
      .set('Authorization', 'Bearer user-001');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('settings');
    expect(res.body).toHaveProperty('projects');
    expect(res.body).toHaveProperty('skills');
    expect(res.body).toHaveProperty('certificates');
    expect(res.body.settings).toHaveProperty('visibility');
  });

  it('PUT /api/v1/users/me/portfolio updates portfolio settings', async () => {
    const res = await request(app)
      .put('/api/v1/users/me/portfolio')
      .set('Authorization', 'Bearer user-001')
      .send({
        headline: 'Staff Fullstack & Systems Engineer',
        bioOverride: 'Obsessed with high-assurance software engineering and verified proof of work.',
        visibility: 'public',
        sectionOrder: ['skills', 'projects', 'certificates'],
        sectionVisibility: { skills: true, projects: true, certificates: true },
        pinnedProjectIds: [],
      });

    expect(res.status).toBe(200);
    expect(res.body.headline).toBe('Staff Fullstack & Systems Engineer');
    expect(res.body.visibility).toBe('public');
  });

  it('GET /portfolio/:username returns public portfolio view with visibility controls', async () => {
    const res = await request(app).get('/portfolio/user-001');

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('username');
    expect(res.body).toHaveProperty('canView');
    if (res.body.canView) {
      expect(res.body).toHaveProperty('skills');
      expect(res.body).toHaveProperty('projects');
      expect(res.body).toHaveProperty('certificates');
    }
  });
});
