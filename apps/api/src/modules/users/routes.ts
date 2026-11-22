import { Router, Request, Response, NextFunction } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import {
  updateProfileSchema,
  updateAvailabilitySchema,
  updateVisibilitySchema,
  addSkillSchema,
  addEducationSchema,
  addExperienceSchema,
  addCertificationSchema,
  updateLearningGoalsSchema,
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

// GET /users/me - Current user's full profile
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().getMe(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /users/me - Update profile
router.patch('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = updateProfileSchema.parse(req.body);
    const result = await getService().updateMe(userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PUT /users/me/availability
router.put('/me/availability', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = updateAvailabilitySchema.parse(req.body);
    const result = await getService().updateAvailability(userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PUT /users/me/visibility
router.put('/me/visibility', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = updateVisibilitySchema.parse(req.body);
    const result = await getService().updateVisibility(userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /users/me/skills
router.post('/me/skills', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = addSkillSchema.parse(req.body);
    const result = await getService().addSkill(userId, data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// DELETE /users/me/skills/:id
router.delete('/me/skills/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().removeSkill(userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /users/me/education
router.post('/me/education', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = addEducationSchema.parse(req.body);
    const result = await getService().addEducation(userId, data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// DELETE /users/me/education/:id
router.delete('/me/education/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().removeEducation(userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /users/me/experience
router.post('/me/experience', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = addExperienceSchema.parse(req.body);
    const result = await getService().addExperience(userId, data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// DELETE /users/me/experience/:id
router.delete('/me/experience/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().removeExperience(userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /users/me/certifications
router.post('/me/certifications', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = addCertificationSchema.parse(req.body);
    const result = await getService().addCertification(userId, data);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// DELETE /users/me/certifications/:id
router.delete('/me/certifications/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await getService().removeCertification(userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PUT /users/me/learning-goals
router.put('/me/learning-goals', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = updateLearningGoalsSchema.parse(req.body);
    const result = await getService().updateLearningGoals(userId, data.goals);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /users/:id - Public profile view with visibility projection
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const viewerId = (req as any).user?.id || getAuthUser(req);
    const viewerRoles = (req as any).user?.roles || (viewerId.includes('recruiter') ? ['recruiter'] : ['individual']);
    const result = await getService().getPublicProfile(req.params.id, { id: viewerId, roles: viewerRoles });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
