import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import {
  createHackathonSchema,
  updateStatusSchema,
  joinEventSchema,
  registerProjectSchema,
} from './schema';

const router = Router();

// GET /api/v1/hackathons - List hackathon events
router.get('/', async (req, res, next) => {
  try {
    const { status } = req.query;
    const events = await getService().listEvents({
      status: status as string,
    });
    res.json(events);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/hackathons - Create a new event
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createHackathonSchema.parse(req.body);
    const event = await getService().createEvent((req as any).user.id, data);
    res.status(201).json(event);
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/hackathons/:id - Get event detail, participant pool & team board
router.get('/:id', async (req, res, next) => {
  try {
    const event = await getService().getEvent(req.params.id);
    res.json(event);
  } catch (e) {
    next(e);
  }
});

// DELETE /api/v1/hackathons/:id - Delete or archive event
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().deleteEvent(req.params.id, (req as any).user.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /api/v1/hackathons/:id/status - Status transitions
router.patch('/:id/status', requireAuth, async (req, res, next) => {
  try {
    const data = updateStatusSchema.parse(req.body);
    const event = await getService().updateStatus(req.params.id, (req as any).user.id, data.status);
    res.json(event);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/hackathons/:id/join - Join as participant
router.post('/:id/join', requireAuth, async (req, res, next) => {
  try {
    const data = joinEventSchema.parse(req.body);
    const participant = await getService().joinEvent(req.params.id, (req as any).user.id, data);
    res.status(201).json(participant);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/hackathons/:id/projects - Fast-track sprint project registration
router.post('/:id/projects', requireAuth, async (req, res, next) => {
  try {
    const data = registerProjectSchema.parse(req.body);
    const project = await getService().registerProject(req.params.id, (req as any).user.id, data);
    res.status(201).json(project);
  } catch (e) {
    next(e);
  }
});

export default router;
