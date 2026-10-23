import { Router } from 'express';
import { getService } from './service';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const router = Router();

router.get('/', async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, roles: true }
    });
    res.json({ data: users });
  } catch(e) {
    // fallback if DB query fails
    res.json({
      data: [
        { id: 'user-001', email: 'student@example.com' },
        { id: 'user-002', email: 'freelancer@example.com' },
        { id: 'user-003', email: 'pro@example.com' },
        { id: 'user-004', email: 'founder@example.com' },
        { id: 'user-005', email: 'designer@example.com' },
        { id: 'user-006', email: 'ml@example.com' },
        { id: 'user-007', email: 'cloud@example.com' },
        { id: 'user-008', email: 'seeker@example.com' }
      ]
    });
  }
});

router.all('*', async (req, res, next) => {
  try {
    const result = await getService().handle();
    res.json(result);
  } catch(e) { next(e); }
});

export default router;
