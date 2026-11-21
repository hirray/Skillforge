import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import {
  createProfileSchema,
  updateProfileSchema,
  requestMentorshipSchema,
  respondRequestSchema,
  createFeedbackSchema,
} from './schema';

const router = Router();

// ==========================================
// MENTOR PROFILES & DIRECTORY
// ==========================================

// GET /api/v1/mentors - Directory listing
router.get('/', async (req, res, next) => {
  try {
    const { skill, domain, format, search } = req.query;
    const mentors = await getService().listMentors({
      skill: skill as string,
      domain: domain as string,
      format: format as string,
      search: search as string,
    });
    res.json(mentors);
  } catch (e) {
    next(e);
  }
});

// GET /api/v1/mentors/profile - Current user profile
router.get('/profile', requireAuth, async (req, res, next) => {
  try {
    const userId = (req.query.userId as string) || (req as any).user.id;
    const profile = await getService().getProfile(userId);
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/mentors/profile or POST /api/v1/mentors - Create/Update profile
router.post('/profile', requireAuth, async (req, res, next) => {
  try {
    const data = createProfileSchema.parse(req.body);
    const profile = await getService().upsertProfile((req as any).user.id, data);
    res.status(201).json(profile);
  } catch (e) {
    next(e);
  }
});

router.put('/profile', requireAuth, async (req, res, next) => {
  try {
    const data = updateProfileSchema.parse(req.body);
    const profile = await getService().upsertProfile((req as any).user.id, data);
    res.json(profile);
  } catch (e) {
    next(e);
  }
});

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createProfileSchema.parse(req.body);
    const profile = await getService().upsertProfile((req as any).user.id, data);
    res.status(201).json(profile);
  } catch (e) {
    next(e);
  }
});

// ==========================================
// MENTORSHIP REQUESTS
// ==========================================

// GET /api/v1/mentors/requests - Inbox or sent requests
router.get('/requests', requireAuth, async (req, res, next) => {
  try {
    const { role, projectId, status } = req.query;
    const requests = await getService().listRequests((req as any).user.id, {
      role: role as 'mentor' | 'owner',
      projectId: projectId as string,
      status: status as string,
    });
    res.json(requests);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/mentors/requests - Request mentorship
router.post('/requests', requireAuth, async (req, res, next) => {
  try {
    const data = requestMentorshipSchema.parse(req.body);
    const request = await getService().requestMentorship((req as any).user.id, data);
    res.status(201).json(request);
  } catch (e) {
    next(e);
  }
});

// POST /api/v1/mentors/requests/:id/respond - Accept or decline
router.post('/requests/:id/respond', requireAuth, async (req, res, next) => {
  try {
    const data = respondRequestSchema.parse(req.body);
    const result = await getService().respondRequest(req.params.id, (req as any).user.id, {
      response: data.response,
      note: data.note || undefined,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// ==========================================
// PROJECT MENTOR FEEDBACK & REQUESTS
// ==========================================

// GET /projects/:id/mentor-feedback
router.get('/projects/:id/mentor-feedback', async (req, res, next) => {
  try {
    const milestoneId = req.query.milestoneId as string;
    const feedback = await getService().listFeedback(req.params.id, milestoneId);
    res.json(feedback);
  } catch (e) {
    next(e);
  }
});

// POST /projects/:id/mentor-feedback
router.post('/projects/:id/mentor-feedback', requireAuth, async (req, res, next) => {
  try {
    const data = createFeedbackSchema.parse(req.body);
    const feedback = await getService().createFeedback(req.params.id, (req as any).user.id, data);
    res.status(201).json(feedback);
  } catch (e) {
    next(e);
  }
});

// GET /projects/:id/mentor-requests
router.get('/projects/:id/mentor-requests', requireAuth, async (req, res, next) => {
  try {
    const requests = await getService().listProjectRequests(req.params.id);
    res.json(requests);
  } catch (e) {
    next(e);
  }
});

export default router;
