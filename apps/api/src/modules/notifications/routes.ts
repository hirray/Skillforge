import { Router, Request, Response, NextFunction } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import { updatePreferencesSchema } from './schema';

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

// GET /notifications - List user's notifications
router.get('/', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const unreadOnly = req.query.unreadOnly === 'true';
    const category = req.query.category as string | undefined;
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : undefined;
    const result = await getService().listNotifications(userId, { unreadOnly, category, limit });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /notifications/:id/read - Mark one as read
router.patch('/:id/read', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().markAsRead(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /notifications/read-all - Mark all as read
router.post('/read-all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().markAllAsRead(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /notifications/preferences - Get notification settings
router.get('/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().getPreferences(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PUT /notifications/preferences - Update notification settings
router.put('/preferences', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = updatePreferencesSchema.parse(req.body);
    const result = await getService().updatePreferences(userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
