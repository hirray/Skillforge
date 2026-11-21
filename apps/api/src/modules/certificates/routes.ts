import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import { revokeCertificateSchema, updateShareSettingsSchema, issueCertificateSchema } from './schema';

const router = Router();

// GET /users/me/certificates
router.get('/users/me/certificates', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const certs = await getService().getCertificates(userId);
    res.json(certs);
  } catch (e) {
    next(e);
  }
});

// Also support /api/v1/certificates/me directly
router.get('/me', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const certs = await getService().getCertificates(userId);
    res.json(certs);
  } catch (e) {
    next(e);
  }
});

// GET /verify/:certId (Public verification, NO AUTH REQUIRED)
router.get('/verify/:certId', async (req, res, next) => {
  try {
    const certId = req.params.certId;
    const result = await getService().verifyCertificate(certId);
    if (!result.certificate && result.status === 'not_found') {
      return res.status(404).json({ valid: false, status: 'not_found', message: 'Certificate not found' });
    }
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /certificates/:id/revoke (Admin reasoned revocation)
router.post('/certificates/:id/revoke', requireAuth, async (req, res, next) => {
  try {
    const parsed = revokeCertificateSchema.parse(req.body);
    const adminId = (req as any).user.id;
    const certId = req.params.id;
    const result = await getService().revokeCertificate(certId, parsed.reason, adminId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Also support POST /:id/revoke when router is mounted at /api/v1/certificates
router.post('/:id/revoke', requireAuth, async (req, res, next) => {
  try {
    const parsed = revokeCertificateSchema.parse(req.body);
    const adminId = (req as any).user.id;
    const certId = req.params.id;
    const result = await getService().revokeCertificate(certId, parsed.reason, adminId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /project/:projectId (Get all certificates issued for a project)
router.get('/project/:projectId', async (req, res, next) => {
  try {
    const projectId = req.params.projectId;
    const certs = await (getService() as any).getCertificatesByProject(projectId);
    res.json(certs);
  } catch (e) {
    next(e);
  }
});

// POST /certificates/:id/reinstate & /:id/reinstate (Reinstate/restore a revoked certificate)
router.post('/certificates/:id/reinstate', requireAuth, async (req, res, next) => {
  try {
    const certId = req.params.id;
    const result = await (getService() as any).reinstateCertificate(certId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/reinstate', requireAuth, async (req, res, next) => {
  try {
    const certId = req.params.id;
    const result = await (getService() as any).reinstateCertificate(certId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /certificates/:id/approve & /:id/approve (Project owner verification & approval)
router.post('/certificates/:id/approve', requireAuth, async (req, res, next) => {
  try {
    const certId = req.params.id;
    const ownerName = req.body?.ownerName || (req as any).user?.name || (req as any).user?.id || 'Project Owner';
    const result = await (getService() as any).approveCertificate(certId, ownerName);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/:id/approve', requireAuth, async (req, res, next) => {
  try {
    const certId = req.params.id;
    const ownerName = req.body?.ownerName || (req as any).user?.name || (req as any).user?.id || 'Project Owner';
    const result = await (getService() as any).approveCertificate(certId, ownerName);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /certificates/:id/pdf (Download PDF credential)
router.get('/:id/pdf', async (req, res, next) => {
  try {
    const certId = req.params.id;
    const pdfBuffer = await getService().generatePdf(certId);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="SkillForge-Certificate-${certId}.pdf"`);
    res.send(pdfBuffer);
  } catch (e) {
    next(e);
  }
});

// PATCH /certificates/:id/settings (Toggle share visibility of technologies / duration)
router.patch('/:id/settings', requireAuth, async (req, res, next) => {
  try {
    const parsed = updateShareSettingsSchema.parse(req.body);
    const userId = (req as any).user.id;
    const certId = req.params.id;
    const result = await getService().updateShareSettings(certId, parsed, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /certificates/issue (Admin/System/Dev trigger for project completion certificate issuance)
router.post('/issue', requireAuth, async (req, res, next) => {
  try {
    const parsed = issueCertificateSchema.parse(req.body);
    const result = await (getService() as any).issueCertificatesForProject?.(parsed.projectId);
    res.json(result || { issued: true });
  } catch (e) {
    next(e);
  }
});

export default router;
