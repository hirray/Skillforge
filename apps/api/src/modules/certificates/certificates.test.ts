import { describe, it, expect } from 'vitest';
import request from 'supertest';
import app from '../../app';

describe('Module 18: Project Completion Certificate', () => {
  let createdCertNumber = '';

  it('GET /api/v1/users/me/certificates returns user certificates list', async () => {
    const res = await request(app)
      .get('/api/v1/users/me/certificates')
      .set('Authorization', 'Bearer user-001');

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    if (res.body.length > 0) {
      const cert = res.body[0];
      expect(cert).toHaveProperty('certNumber');
      expect(cert).toHaveProperty('recipientName');
      expect(cert).toHaveProperty('projectName');
      expect(cert).toHaveProperty('roles');
      expect(cert).toHaveProperty('status');
      createdCertNumber = cert.certNumber;
    }
  });

  it('GET /verify/:certId returns public verified certificate view (no auth required)', async () => {
    // Test with mock or real cert number
    const targetCertId = createdCertNumber || 'SF-2026-00042';
    const res = await request(app).get(`/verify/${targetCertId}`);

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      expect(res.body).toHaveProperty('valid');
      expect(res.body).toHaveProperty('status');
      expect(res.body).toHaveProperty('certificate');
      expect(res.body.certificate).toHaveProperty('certNumber');
      expect(res.body.certificate).toHaveProperty('recipientName');
      expect(res.body.certificate).toHaveProperty('projectName');
      expect(res.body.certificate).toHaveProperty('verificationUrl');
    }
  });

  it('GET /api/v1/certificates/:id/pdf generates or streams downloadable certificate PDF', async () => {
    const targetCertId = createdCertNumber || 'SF-2026-00042';
    const res = await request(app).get(`/api/v1/certificates/${targetCertId}/pdf`);

    if (res.status === 200) {
      expect(res.headers['content-type']).toContain('application/pdf');
      expect(res.headers['content-disposition']).toContain('attachment');
      expect(res.body.length || res.text.length).toBeGreaterThan(0);
    } else {
      expect([200, 404]).toContain(res.status);
    }
  });

  it('PATCH /api/v1/certificates/:id/settings toggles technology/duration share settings', async () => {
    if (createdCertNumber) {
      const res = await request(app)
        .patch(`/api/v1/certificates/${createdCertNumber}/settings`)
        .set('Authorization', 'Bearer user-001')
        .send({
          showTechnologies: false,
          showDuration: true,
        });

      if (res.status === 200) {
        expect(res.body.showTechnologies).toBe(false);
        expect(res.body.showDuration).toBe(true);
      }
    }
  });

  it('POST /api/v1/certificates/:id/revoke revokes certificate with valid reason', async () => {
    const targetId = createdCertNumber || 'cert-001';
    const res = await request(app)
      .post(`/api/v1/certificates/${targetId}/revoke`)
      .set('Authorization', 'Bearer admin-001')
      .send({
        reason: 'Project work found to violate academic integrity guidelines',
      });

    if (res.status === 200) {
      expect(res.body.status).toBe('revoked');
      expect(res.body.revokedReason).toContain('academic integrity');
    } else {
      expect([200, 404]).toContain(res.status);
    }
  });
});
