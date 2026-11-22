import { Router, Request, Response, NextFunction } from 'express';
import { getService } from './service';
import {
  createShortlistSchema,
  updatePipelineStageSchema,
  compareCandidatesSchema,
  addNoteSchema,
  outreachMessageSchema,
  opportunityResponseSchema,
  contactConsentSchema,
} from './schema';

const router = Router();

const getAuthUser = (req: Request) => {
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
  return (req.query.userId as string) || 'recruiter-001';
};

// GET /pipeline - List shortlisted candidates in pipeline board
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const { companyId, jobId, stage } = req.query;
    const result = await getService().getPipeline({
      companyId: companyId as string,
      jobId: jobId as string,
      stage: stage as string,
      recruiterId,
    });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /pipeline - Add candidate to pipeline
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const data = createShortlistSchema.parse(req.body);
    const result = await getService().addToPipeline(data, recruiterId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// POST /pipeline/compare - Compare 2 to 4 candidates side-by-side
router.post('/compare', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = compareCandidatesSchema.parse(req.body);
    const result = await getService().compareCandidates(data);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Candidate Opportunities Inbox (candidate-facing, never includes recruiter notes or internal stages)
router.get(['/opportunities', '/opportunities/me'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getAuthUser(req);
    const result = await getService().getCandidateOpportunities(candidateId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Candidate response to opportunity
router.post('/opportunities/:id/respond', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getAuthUser(req);
    const data = opportunityResponseSchema.parse(req.body);
    const result = await getService().respondToOpportunity(req.params.id, candidateId, data.status);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// Candidate toggle contact consent
router.post(['/opportunities/consent', '/candidate/consent'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const candidateId = getAuthUser(req);
    const consent = req.body.consent !== undefined
      ? req.body.consent
      : req.body.recruiterVisible !== undefined
      ? req.body.recruiterVisible
      : true;
    const result = await getService().setContactConsent(candidateId, consent);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// PATCH /pipeline/:id - Move candidate stage or add recruiter note
router.patch('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const data = updatePipelineStageSchema.parse(req.body);
    const companyId = req.query.companyId as string | undefined;
    const result = await getService().updatePipelineEntry(req.params.id, data, recruiterId, companyId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /pipeline/:id/notes - Add private recruiter note
router.post('/:id/notes', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const data = addNoteSchema.parse(req.body);
    const result = await getService().addNote(req.params.id, data.text, recruiterId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// POST /pipeline/:id/outreach or /pipeline/outreach - Send message to candidate
router.post(['/:id/outreach', '/outreach'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    const recruiterId = getAuthUser(req);
    const entryId = req.params.id || req.body.entryId;
    if (!entryId) {
      return res.status(400).json({ code: 'VALIDATION_ERROR', message: 'Missing pipeline entry ID' });
    }
    const data = outreachMessageSchema.parse(req.body);
    const result = await getService().sendOutreach(entryId, data.text, recruiterId);
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
