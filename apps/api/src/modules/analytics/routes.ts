import { Router } from 'express';
import { z } from 'zod';
import { requireAuth } from '../../core/auth';
import { realService } from './real';
const router = Router();
router.get('/summary', requireAuth, async (req, res, next) => {
  try {
    const dates = z
      .object({
        from: z.string().datetime().optional(),
        to: z.string().datetime().optional(),
      })
      .parse(req.query);
    const end = dates.to ? new Date(dates.to) : new Date();
    const start = dates.from
      ? new Date(dates.from)
      : new Date(end.getTime() - 30 * 86400000);
    if (start > end || end.getTime() - start.getTime() > 366 * 86400000)
      return res
        .status(400)
        .json({
          error: {
            code: 'INVALID_RANGE',
            message: 'Choose a date range of at most 366 days.',
          },
        });
    res.json(await realService.summary((req as any).user.id, start, end));
  } catch (e) {
    next(e);
  }
});
export default router;
