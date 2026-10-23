import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import {
  createMilestoneSchema,
  updateMilestoneSchema,
  linkTaskSchema,
  manualCompleteSchema
} from './schema';

const router = Router();

// 1. List project milestones
router.get('/projects/:id/milestones', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().list(req.params.id, userId, req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 2. Create milestone under project
router.post('/projects/:id/milestones', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = createMilestoneSchema.parse(req.body);
    const result = await getService().create(req.params.id, userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 3. Get single project milestone
router.get('/projects/:id/milestones/:milestoneId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getById(req.params.id, req.params.milestoneId, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 4. Update project milestone
router.patch('/projects/:id/milestones/:milestoneId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = updateMilestoneSchema.parse(req.body);
    const result = await getService().update(req.params.id, req.params.milestoneId, userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 5. Delete project milestone
router.delete('/projects/:id/milestones/:milestoneId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().delete(req.params.id, req.params.milestoneId, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 6. Link task to milestone
router.post('/projects/:id/milestones/:milestoneId/tasks', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { taskId } = linkTaskSchema.parse(req.body);
    const result = await getService().linkTask(req.params.id, req.params.milestoneId, userId, taskId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 7. Unlink task from milestone
router.delete('/projects/:id/milestones/:milestoneId/tasks/:taskId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().unlinkTask(req.params.id, req.params.milestoneId, userId, req.params.taskId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 8. Manual complete milestone with required rationale
router.post('/projects/:id/milestones/:milestoneId/complete', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { rationale } = manualCompleteSchema.parse(req.body);
    const result = await getService().manualComplete(req.params.id, req.params.milestoneId, userId, rationale);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 9. Direct milestone routes
router.get('/milestones/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getByIdDirect(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/milestones/:id/history', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getHistory(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
