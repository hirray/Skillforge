import { Router, Request, Response, NextFunction } from 'express';
import { config } from '../../config';
import { requireAuth } from '../../core/auth';
import { realService } from './real';
import {
  requirementSchema,
  matchSchema,
  jobMatchSchema,
  savedRequirementsSchema,
  preferenceSchema,
} from './schema';
import { fail } from './member2/db';
import { realService as resumes } from '../resumes/real';

const router = Router();
export const integrationRouter = Router();
const run =
  (fn: (req: Request) => Promise<any>) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      res.json(await fn(req));
    } catch (e) {
      next(e);
    }
  };
const user = (req: Request) => (req as any).user.id as string;
const extensions = (_req: Request, _res: Response, next: NextFunction) => {
  if (config.MEMBER2_EXTENSIONS !== 'true')
    return next({
      status: 404,
      code: 'EXTENSION_DISABLED',
      message: 'This proposed endpoint is disabled pending contract review.',
    });
  next();
};
router.post(
  '/requirements',
  requireAuth,
  run((req) =>
    realService.requirements(user(req), requirementSchema.parse(req.body))
  )
);
router.post(
  '/match',
  requireAuth,
  run((req) => realService.match(user(req), matchSchema.parse(req.body)))
);
router.post(
  '/job-match',
  requireAuth,
  run((req) => realService.jobMatch(user(req), jobMatchSchema.parse(req.body)))
);
router.post(
  '/resume/parse',
  requireAuth,
  run(async (req) => {
    if (!req.body.resumeId)
      fail(
        400,
        'INVALID_INPUT',
        'resumeId is required. Upload through /resumes first.'
      );
    return resumes.extraction(String(req.body.resumeId), user(req));
  })
);
router.get(
  '/context',
  requireAuth,
  extensions,
  run((req) => realService.context(user(req)))
);
router.patch(
  '/preferences',
  requireAuth,
  extensions,
  run((req) =>
    realService.preference(user(req), preferenceSchema.parse(req.body))
  )
);
router.get(
  '/job-match/:jobId',
  requireAuth,
  extensions,
  run((req) => realService.storedJobMatches(req.params.jobId, user(req)))
);
integrationRouter.get(
  '/projects/:id/requirements',
  requireAuth,
  run((req) => realService.getRequirements(req.params.id, user(req)))
);
integrationRouter.put(
  '/projects/:id/requirements',
  requireAuth,
  run((req) =>
    realService.saveRequirements(
      req.params.id,
      user(req),
      savedRequirementsSchema.parse(req.body).requirements
    )
  )
);
integrationRouter.get(
  '/projects/:id/health',
  requireAuth,
  run((req) => realService.health(req.params.id, user(req)))
);
export default router;
