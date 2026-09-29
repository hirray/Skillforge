import { Router } from 'express';
import { getService } from './service';

const router = Router();
router.all('*', async (req, res, next) => {
  try {
    const result = await getService().handle();
    res.json(result);
  } catch(e) { next(e); }
});

export default router;