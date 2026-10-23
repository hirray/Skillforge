import { Router } from 'express';
import { getService } from './service';
import { requireAuth } from '../../core/auth';
import { createProjectSchema, updateProjectSchema, transitionProjectSchema } from './schema';

const router = Router();

router.post('/', requireAuth, async (req, res, next) => {
  try {
    const data = createProjectSchema.parse(req.body);
    const result = await getService().create((req as any).user.id, data);
    res.json(result);
  } catch(e) { next(e); }
});

router.get('/', async (req, res, next) => {
  try {
    const filters = req.query;
    const result = await getService().list(filters);
    res.json(result);
  } catch(e) { next(e); }
});

router.get('/:id', async (req, res, next) => {
  try {
    const result = await getService().getById(req.params.id);
    res.json(result);
  } catch(e) { next(e); }
});

router.patch('/:id', requireAuth, async (req, res, next) => {
  try {
    const data = updateProjectSchema.parse(req.body);
    const result = await getService().update(req.params.id, (req as any).user.id, data);
    res.json(result);
  } catch(e) { next(e); }
});

router.post('/:id/transition', requireAuth, async (req, res, next) => {
  try {
    const { status } = transitionProjectSchema.parse(req.body);
    const result = await getService().transition(req.params.id, (req as any).user.id, status);
    res.json(result);
  } catch(e) { next(e); }
});

router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const result = await getService().delete(req.params.id, (req as any).user.id);
    res.json(result);
  } catch(e) { next(e); }
});

export default router;
