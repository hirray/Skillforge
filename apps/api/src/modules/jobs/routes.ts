import { Router } from 'express';
import { getService } from './service';
import { createJobSchema, updateJobSchema, applyJobSchema, listJobsQuerySchema } from './schema';
import { requireAuth } from '../../core/auth';

const router = Router();

// Helper to extract active user ID safely
const getUserId = (req: any): string => {
  return req.user?.id || req.headers['x-user-id'] || 'user-001';
};

/* ====================================================================
 * JOB POSTING & OPPORTUNITY ENDPOINTS
 * Frozen Contract: GET /jobs, POST /jobs, GET /jobs/{id}, PATCH /jobs/{id}, DELETE /jobs/{id}, POST /jobs/{id}/interest
 * ==================================================================== */

// List jobs (GET /jobs)
router.get('/', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const query = listJobsQuerySchema.parse(req.query);
    const result = await getService().listJobs(query, userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Create job (POST /jobs)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = createJobSchema.parse(req.body);
    const result = await getService().createJob(userId, body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Get job detail (GET /jobs/:id)
router.get('/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await getService().getJob(req.params.id, userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Update job (PATCH /jobs/:id)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = updateJobSchema.parse(req.body);
    const result = await getService().updateJob(req.params.id, userId, body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Delete/Archive job (DELETE /jobs/:id)
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await getService().deleteJob(req.params.id, userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Express Interest / Apply (POST /jobs/:id/interest)
router.post('/:id/interest', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = applyJobSchema.parse(req.body);
    const result = await getService().applyJob(req.params.id, userId, body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
