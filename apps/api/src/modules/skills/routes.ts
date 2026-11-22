import { Router, Request, Response, NextFunction } from 'express';
import { getService } from './service';
import { requireAuth, requireRole } from '../../core/auth';
import {
  proposeSkillSchema,
  addEvidenceSchema,
  mergeSkillSchema,
  createSkillAdminSchema,
} from './schema';

const router = Router();

const getAuthUser = (req: Request): string => {
  if ((req as any).user?.id) return (req as any).user.id;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const raw = authHeader.substring(7);
    if (raw.includes('.')) {
      try {
        const payload = JSON.parse(Buffer.from(raw.split('.')[1], 'base64').toString());
        if (payload?.id) return payload.id;
      } catch {}
    }
    return raw;
  }
  return (req.query.userId as string) || 'user-001';
};

// GET /skills - Search skill taxonomy with ranking
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q = req.query.q as string | undefined;
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const result = await getService().searchSkills({ q, category, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /skills/proposals - Propose new skill
router.post('/proposals', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = proposeSkillSchema.parse(req.body);
    const result = await getService().proposeSkill(userId, data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// Admin: GET /skills/admin/proposals
router.get('/admin/proposals', requireAuth, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const status = req.query.status as string | undefined;
    const result = await getService().listProposals(status);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Admin: POST /skills/admin/proposals/:id/approve
router.post('/admin/proposals/:id/approve', requireAuth, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getAuthUser(req);
    const result = await getService().approveProposal(req.params.id, adminId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Admin: POST /skills/admin/proposals/:id/reject
router.post('/admin/proposals/:id/reject', requireAuth, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getAuthUser(req);
    const reason = req.body.reason as string | undefined;
    const result = await getService().rejectProposal(req.params.id, adminId, reason);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Admin: POST /skills/admin/merge
router.post('/admin/merge', requireAuth, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getAuthUser(req);
    const data = mergeSkillSchema.parse(req.body);
    const result = await getService().mergeSkills(data.fromSkillId, data.toSkillId, adminId, data.reason);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Admin: POST /skills/admin/deprecate
router.post('/admin/deprecate', requireAuth, requireRole('admin'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const adminId = getAuthUser(req);
    const { skillId, reason } = req.body;
    if (!skillId) return res.status(400).json({ message: 'skillId is required' });
    const result = await getService().deprecateSkill(skillId, adminId, reason);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /skills/:id/evidence
router.post('/:id/evidence', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = addEvidenceSchema.parse(req.body);
    const result = await getService().addEvidence(req.params.id, userId, data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// GET /skills/:id/evidence
router.get('/:id/evidence', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().listEvidence(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /skills/:id - Get skill by ID
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await getService().getSkillById(req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
