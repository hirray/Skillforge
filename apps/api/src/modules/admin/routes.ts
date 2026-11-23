import { Router, Request, Response, NextFunction } from 'express';
import { getService } from './service';
import { requireAuth, requireRole } from '../../core/auth';
import {
  suspendUserSchema,
  restoreUserSchema,
  createReportSchema,
  patchReportSchema,
  projectHoldSchema,
  releaseHoldSchema,
  revokeCertificateSchema,
  verificationDecisionSchema,
  adminUserQuerySchema,
  auditLogQuerySchema,
} from './schema';

const router = Router();

const getActorId = (req: Request): string => {
  return (req as any).user?.id || 'admin-001';
};

// 1. Executive Platform Stats
router.get(
  '/stats',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const stats = await getService().getStats();
      res.json({ success: true, data: stats });
    } catch (e) {
      next(e);
    }
  }
);

// 2. User Management
router.get(
  '/users',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = adminUserQuerySchema.parse(req.query);
      const result = await getService().getUsers(query);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/users/:id/suspend',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = suspendUserSchema.parse(req.body);
      const actorId = getActorId(req);
      const result = await getService().suspendUser(req.params.id, actorId, reason);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/users/:id/restore',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = restoreUserSchema.parse(req.body);
      const actorId = getActorId(req);
      const result = await getService().restoreUser(req.params.id, actorId, reason);
      res.json(result);
    } catch (e) {
      next(e);
    }
  }
);

// 3. Content Reports Queue
// Users can submit reports
router.post(
  '/reports',
  requireAuth,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = createReportSchema.parse(req.body);
      const reporterId = getActorId(req);
      const report = await getService().createReport(reporterId, payload);
      res.status(201).json({ success: true, data: report });
    } catch (e) {
      next(e);
    }
  }
);

// Moderators and admins can view reports
router.get(
  '/reports',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const status = req.query.status as string | undefined;
      const targetType = req.query.targetType as string | undefined;
      const reports = await getService().getReports({ status, targetType });
      res.json({ success: true, data: reports });
    } catch (e) {
      next(e);
    }
  }
);

// Moderators and admins can patch/resolve reports (with 409 conflict detection)
router.patch(
  '/reports/:id',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const payload = patchReportSchema.parse(req.body);
      const actorId = getActorId(req);
      const updated = await getService().patchReport(req.params.id, actorId, payload);
      res.json({ success: true, data: updated });
    } catch (e) {
      next(e);
    }
  }
);

// 4. Verification Queue
router.get(
  '/verification-queue',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const queue = await getService().getVerificationQueue();
      res.json({ success: true, data: queue });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/verification-queue/:id/approve',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { notes } = verificationDecisionSchema.parse(req.body);
      const actorId = getActorId(req);
      const result = await getService().approveVerification(req.params.id, actorId, notes);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/verification-queue/:id/reject',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = verificationDecisionSchema.parse(req.body);
      if (!reason) {
        return res.status(400).json({ error: 'Rejection reason is mandatory' });
      }
      const actorId = getActorId(req);
      const result = await getService().rejectVerification(req.params.id, actorId, reason);
      res.json({ success: true, data: result });
    } catch (e) {
      next(e);
    }
  }
);

// 5. Moderation Holds
router.get(
  '/holds',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const holds = await getService().getHolds();
      res.json({ success: true, data: holds });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/projects/:id/hold',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = projectHoldSchema.parse(req.body);
      const actorId = getActorId(req);
      const hold = await getService().placeProjectHold(req.params.id, actorId, reason);
      res.json({ success: true, data: hold });
    } catch (e) {
      next(e);
    }
  }
);

router.delete(
  '/projects/:id/hold',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = releaseHoldSchema.parse(req.body);
      const actorId = getActorId(req);
      const released = await getService().releaseProjectHold(req.params.id, actorId, reason);
      res.json({ success: true, data: released });
    } catch (e) {
      next(e);
    }
  }
);

// 6. Certificate Revocation & Lookup
router.get(
  '/certificates',
  requireAuth,
  requireRole('admin', 'moderator'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const search = req.query.search as string | undefined;
      const certs = await getService().getCertificates(search);
      res.json({ success: true, data: certs });
    } catch (e) {
      next(e);
    }
  }
);

router.post(
  '/certificates/:id/revoke',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { reason } = revokeCertificateSchema.parse(req.body);
      const actorId = getActorId(req);
      const revoked = await getService().revokeCertificate(req.params.id, actorId, reason);
      res.json({ success: true, data: revoked });
    } catch (e) {
      next(e);
    }
  }
);

// 7. Audit Log Trail
router.get(
  '/audit-logs',
  requireAuth,
  requireRole('admin'),
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const query = auditLogQuerySchema.parse(req.query);
      const logs = await getService().getAuditLogs(query);
      res.json({ success: true, data: logs });
    } catch (e) {
      next(e);
    }
  }
);

export default router;
