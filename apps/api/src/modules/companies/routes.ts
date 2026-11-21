import { Router } from 'express';
import { getService } from './service';
import { createCompanySchema, updateCompanySchema, addRecruiterSchema } from './schema';
import { requireAuth } from '../../core/auth';

const router = Router();

// Helper to extract active user ID safely
const getUserId = (req: any): string => {
  return req.user?.id || req.headers['x-user-id'] || 'user-001';
};

/* ====================================================================
 * COMPANY & RECRUITER ROUTES
 * Frozen Contract: POST /companies, GET /companies/{id}, PATCH /companies/{id}, POST /companies/{id}/recruiters
 * ==================================================================== */

// List all companies / directory
router.get('/', async (req, res, next) => {
  try {
    const result = await getService().listCompanies();
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// List companies where active user is a recruiter
router.get('/me/mine', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await getService().listUserCompanies(userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Create company (POST /companies)
router.post('/', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = createCompanySchema.parse(req.body);
    const result = await getService().createCompany(userId, body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Get company profile (GET /companies/:id)
router.get('/:id', async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const result = await getService().getCompany(req.params.id, userId);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Update company profile (PATCH /companies/:id)
router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = updateCompanySchema.parse(req.body);
    const result = await getService().updateCompany(req.params.id, userId, body);
    res.json({ data: result });
  } catch (err) {
    next(err);
  }
});

// Add/Invite recruiter (POST /companies/:id/recruiters)
router.post('/:id/recruiters', requireAuth, async (req, res, next) => {
  try {
    const userId = getUserId(req);
    const body = addRecruiterSchema.parse(req.body);
    const result = await getService().addRecruiter(req.params.id, userId, body);
    res.status(201).json({ data: result });
  } catch (err) {
    next(err);
  }
});

export default router;
