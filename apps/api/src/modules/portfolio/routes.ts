import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import {
  updatePortfolioSchema,
  createCorrectionRequestSchema,
  decideCorrectionRequestSchema,
} from './schema';

const router = Router();

// Middleware to extract optional user info for public endpoints (to evaluate viewer permissions)
const optionalAuth = (req: any, res: any, next: any) => {
  const auth = req.headers.authorization;
  if (auth) {
    const rawToken = auth.replace(/^Bearer\s+/i, '').trim();
    let userId = rawToken;
    let userRoles = ['user'];
    if (rawToken.includes('.')) {
      try {
        const parts = rawToken.split('.');
        if (parts.length >= 2) {
          const json = Buffer.from(parts[1], 'base64').toString('utf8');
          const payload = JSON.parse(json);
          userId = payload._id || payload.id || payload.userId || payload.sub || rawToken;
          if (payload.role) userRoles = Array.isArray(payload.role) ? payload.role : [payload.role];
          else if (payload.roles) userRoles = payload.roles;
        }
      } catch {}
    }
    req.user = { id: userId, roles: userRoles };
  }
  next();
};

// GET /users/me/verified-experience
router.get('/users/me/verified-experience', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const experiences = await getService().getVerifiedExperience(userId);
    res.json(experiences);
  } catch (e) {
    next(e);
  }
});

// Also support direct /verified-experience
router.get('/verified-experience', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const experiences = await getService().getVerifiedExperience(userId);
    res.json(experiences);
  } catch (e) {
    next(e);
  }
});

// POST /verified-experience/:id/corrections
router.post('/verified-experience/:id/corrections', requireAuth, async (req, res, next) => {
  try {
    const parsed = createCorrectionRequestSchema.parse(req.body);
    const userId = (req as any).user.id;
    const experienceId = req.params.id;
    const result = await getService().createCorrectionRequest(experienceId, parsed, userId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// GET /verified-experience/:id/corrections
router.get('/verified-experience/:id/corrections', requireAuth, async (req, res, next) => {
  try {
    const experienceId = req.params.id;
    const result = await getService().listCorrectionRequests(experienceId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /verified-experience/corrections/:id/decide
router.patch('/verified-experience/corrections/:id/decide', requireAuth, async (req, res, next) => {
  try {
    const parsed = decideCorrectionRequestSchema.parse(req.body);
    const reviewerId = (req as any).user.id;
    const correctionId = req.params.id;
    const result = await getService().decideCorrectionRequest(correctionId, parsed, reviewerId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /users/me/portfolio
router.get('/users/me/portfolio', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const portfolio = await getService().getMyPortfolio(userId);
    res.json(portfolio);
  } catch (e) {
    next(e);
  }
});

// PUT /users/me/portfolio
router.put('/users/me/portfolio', requireAuth, async (req, res, next) => {
  try {
    const parsed = updatePortfolioSchema.parse(req.body);
    const userId = (req as any).user.id;
    const updated = await getService().updateMyPortfolio(userId, parsed);
    res.json(updated);
  } catch (e) {
    next(e);
  }
});

// GET /portfolio/:username (Public or visibility-aware)
router.get('/portfolio/:username', optionalAuth, async (req, res, next) => {
  try {
    const username = req.params.username;
    const viewer = (req as any).user;
    const portfolio = await getService().getPublicPortfolio(username, viewer);
    res.json(portfolio);
  } catch (e) {
    next(e);
  }
});

// Also support /u/:username
router.get('/u/:username', optionalAuth, async (req, res, next) => {
  try {
    const username = req.params.username;
    const viewer = (req as any).user;
    const portfolio = await getService().getPublicPortfolio(username, viewer);
    res.json(portfolio);
  } catch (e) {
    next(e);
  }
});

export default router;
