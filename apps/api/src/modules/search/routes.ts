import { Router, Request, Response, NextFunction } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import { bookmarkSchema, searchFiltersSchema } from './schema';

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

// GET /search - Universal faceted search
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const filters = searchFiltersSchema.parse(req.query);
    const viewerId = (req as any).user?.id || getAuthUser(req);
    const viewerRoles = (req as any).user?.roles || (viewerId.includes('recruiter') ? ['recruiter'] : ['individual']);

    const result = await getService().universalSearch(filters, { id: viewerId, roles: viewerRoles });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /search/feed or /feed - Opportunity Discovery Feed (Module 26)
router.get(['/feed', '/opportunities-feed'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().getOpportunityFeed(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /search/bookmarks or /bookmarks
router.get(['/bookmarks', '/saved'], requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().listBookmarks(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /search/bookmarks
router.post(['/bookmarks', '/saved'], requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = bookmarkSchema.parse(req.body);
    const result = await getService().addBookmark(userId, data.targetType, data.targetId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// DELETE /search/bookmarks/:id
router.delete(['/bookmarks/:id', '/saved/:id'], requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().removeBookmark(userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
