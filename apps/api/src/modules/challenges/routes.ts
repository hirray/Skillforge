import { Router, Request, Response, NextFunction } from 'express';
import { ChallengeService } from './real';
import {
  createChallengeSchema,
  updateChallengeSchema,
  submitChallengeEntrySchema,
  reviewChallengeEntrySchema,
} from './schema';

const router = Router();
const service = new ChallengeService();

const getAuthUser = (req: Request) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return (req.query.userId as string) || (req.headers['x-user-id'] as string) || 'recruiter-001';
};

// GET /challenges - List company challenges
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { companyId, status, skill } = req.query;
    const result = await service.listChallenges({
      companyId: companyId as string,
      status: status as string,
      skill: skill as string,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /challenges - Publish a company challenge
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const data = createChallengeSchema.parse(req.body);
    const result = await service.createChallenge(data, recruiterId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// GET /challenges/:id - Get challenge detail
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await service.getChallenge(req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /challenges/:id - Update challenge
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const data = updateChallengeSchema.parse(req.body);
    const result = await service.updateChallenge(req.params.id, data, recruiterId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /challenges/:id/entries - Submit team project entry
router.post('/:id/entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const data = submitChallengeEntrySchema.parse(req.body);
    const result = await service.submitEntry(req.params.id, data, userId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// GET /challenges/:id/entries - List team entries
router.get('/:id/entries', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = getAuthUser(req);
    const result = await service.listEntries(req.params.id, userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;

// Also export router for PATCH /challenge-entries/:id
export const challengeEntriesRouter = Router();

challengeEntriesRouter.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const data = reviewChallengeEntrySchema.parse(req.body);
    const result = await service.reviewEntry(req.params.id, data, recruiterId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});
