import { Router } from 'express';
import { getService } from './service';
import { createManualNoteSchema, createDisputeSchema, resolveDisputeSchema } from './schema';

const router = Router();

// 1. GET /projects/:id/contributions
router.get('/projects/:id/contributions', async (req, res, next) => {
  try {
    const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'user-001';
    const result = await getService().getProjectContributions(req.params.id, viewerId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 2. GET /projects/:id/contributions/:userId
router.get('/projects/:id/contributions/:userId', async (req, res, next) => {
  try {
    const viewerId = (req.headers['x-user-id'] as string) || (req.query.viewerId as string) || 'user-001';
    const result = await getService().getUserContributionProfile(req.params.id, req.params.userId, viewerId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// 3. POST /projects/:id/contributions/manual-note
router.post('/projects/:id/contributions/manual-note', async (req, res, next) => {
  try {
    const actorId = (req.headers['x-user-id'] as string) || (req.body.actorId as string) || 'user-001';
    const parsed = createManualNoteSchema.parse(req.body);
    const result = await getService().createManualNote(req.params.id, actorId, parsed);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// 4. POST /contributions/:id/dispute
router.post('/contributions/:id/dispute', async (req, res, next) => {
  try {
    const raisedBy = (req.headers['x-user-id'] as string) || (req.body.raisedBy as string) || 'user-001';
    const parsed = createDisputeSchema.parse(req.body);
    const result = await getService().raiseDispute(req.params.id, raisedBy, parsed.reason);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// 5. POST /contributions/disputes/:id/resolve
router.post('/contributions/disputes/:id/resolve', async (req, res, next) => {
  try {
    const actorId = (req.headers['x-user-id'] as string) || (req.body.actorId as string) || 'user-001';
    const parsed = resolveDisputeSchema.parse(req.body);
    const result = await getService().resolveDispute(req.params.id, actorId, parsed);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Support direct /api/v1/contribution routes
router.get('/', async (req, res, next) => {
  try {
    const projectId = (req.query.projectId as string) || 'all';
    const viewerId = (req.headers['x-user-id'] as string) || 'user-001';
    const result = await getService().getProjectContributions(projectId, viewerId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/manual-note', async (req, res, next) => {
  try {
    const projectId = req.body.projectId || 'all';
    const actorId = (req.headers['x-user-id'] as string) || (req.body.actorId as string) || 'user-001';
    const parsed = createManualNoteSchema.parse(req.body);
    const result = await getService().createManualNote(projectId, actorId, parsed);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

router.post('/dispute', async (req, res, next) => {
  try {
    const eventId = req.body.eventId;
    const raisedBy = (req.headers['x-user-id'] as string) || (req.body.raisedBy as string) || 'user-001';
    const parsed = createDisputeSchema.parse(req.body);
    const result = await getService().raiseDispute(eventId, raisedBy, parsed.reason);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
