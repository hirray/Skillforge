import { Router } from 'express';
import { getService } from './service';
import { talentSearchSchema, createSavedSearchSchema } from './schema';

const router = Router();

// POST /talent/search (or /search)
const handleSearch = async (req: any, res: any, next: any) => {
  try {
    const parsed = talentSearchSchema.parse(req.body);
    const result = await getService().searchTalent(parsed);
    res.json(result);
  } catch (e) {
    next(e);
  }
};
router.post('/talent/search', handleSearch);
router.post('/search', handleSearch);
router.post('/', handleSearch);

// GET /talent/saved-searches (or /saved-searches)
const handleListSaved = async (req: any, res: any, next: any) => {
  try {
    const companyId = req.query.companyId as string;
    const recruiterId = (req.headers['x-user-id'] as string) || (req.query.recruiterId as string) || 'recruiter-001';
    const result = await getService().listSavedSearches(companyId, recruiterId);
    res.json(result);
  } catch (e) {
    next(e);
  }
};
router.get('/talent/saved-searches', handleListSaved);
router.get('/saved-searches', handleListSaved);

// POST /talent/saved-searches (or /saved-searches)
const handleCreateSaved = async (req: any, res: any, next: any) => {
  try {
    const recruiterId = (req.headers['x-user-id'] as string) || (req.body.recruiterId as string) || 'recruiter-001';
    const parsed = createSavedSearchSchema.parse(req.body);
    const result = await getService().createSavedSearch(parsed, recruiterId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
};
router.post('/talent/saved-searches', handleCreateSaved);
router.post('/saved-searches', handleCreateSaved);

export default router;
