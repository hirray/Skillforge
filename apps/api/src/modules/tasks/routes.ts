import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import { createTaskSchema, updateTaskSchema, createCommentSchema } from './schema';

const router = Router();

// 1. List project tasks
router.get('/projects/:id/tasks', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().list(req.params.id, userId, req.query);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 2. Create task under project
router.post('/projects/:id/tasks', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = createTaskSchema.parse(req.body);
    const result = await getService().create(req.params.id, userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 3. Get single project task
router.get('/projects/:id/tasks/:taskId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getById(req.params.id, req.params.taskId, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 4. Update project task
router.patch('/projects/:id/tasks/:taskId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const data = updateTaskSchema.parse(req.body);
    const result = await getService().update(req.params.id, req.params.taskId, userId, data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 5. Delete project task
router.delete('/projects/:id/tasks/:taskId', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().delete(req.params.id, req.params.taskId, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 6. Add comment to project task
router.post('/projects/:id/tasks/:taskId/comments', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { content } = createCommentSchema.parse(req.body);
    const result = await getService().addComment(req.params.id, req.params.taskId, userId, content);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 7. Get task history
router.get('/tasks/:id/history', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getHistory(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 8. Direct task routes: /tasks/:id
router.get('/tasks/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const result = await getService().getByIdDirect(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/tasks/:id/comments', requireAuth, async (req, res, next) => {
  try {
    const userId = (req as any).user.id;
    const { content } = createCommentSchema.parse(req.body);
    const taskRes = await getService().getByIdDirect(req.params.id, userId);
    if (!taskRes.data) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Task not found' } });
    }
    const result = await getService().addComment(taskRes.data.projectId, req.params.id, userId, content);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.get('/reminders', requireAuth, async (req, res, next) => {
  try {
    const reminders = await getService().checkReminders();
    res.json({ data: reminders });
  } catch (e) {
    next(e);
  }
});

export default router;
