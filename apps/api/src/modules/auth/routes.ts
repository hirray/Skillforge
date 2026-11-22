import { Router, Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  verifyEmailSchema,
  changePasswordSchema,
  deletionRequestSchema,
} from './schema';
import { RealAuthService } from './real';
import { requireAuth } from '../../core/auth';
import { config } from '../../config';

const router = Router();
const service = new RealAuthService();

const getIp = (req: Request) => {
  return (req.headers['x-forwarded-for'] as string) || req.socket.remoteAddress || '127.0.0.1';
};

// POST /auth/register
router.post('/register', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = registerSchema.parse(req.body);
    const result = await service.register({ ...data, ip: getIp(req) });
    res.status(201).json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/login
router.post('/login', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = loginSchema.parse(req.body);
    const deviceLabel = (req.headers['user-agent'] as string) || 'Web Browser';
    const result = await service.login({ ...data, ip: getIp(req), deviceLabel });
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/dev-login/:userId and POST /auth/dev-login
router.post(['/dev-login/:userId', '/dev-login'], async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (process.env.NODE_ENV === 'production') {
      return res.status(403).json({ error: { code: 'FORBIDDEN', message: 'Development login disabled in production' } });
    }
    const userId = req.params.userId || req.body.userId || 'user-001';
    const result = await service.devLogin(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/refresh
router.post('/refresh', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = refreshSchema.parse(req.body);
    const deviceLabel = (req.headers['user-agent'] as string) || 'Web Browser';
    const result = await service.refresh(data.refreshToken, deviceLabel);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/logout
router.post('/logout', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const raw = req.body?.refreshToken;
    const result = await service.logout(raw);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/logout-all
router.post('/logout-all', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await service.logoutAll(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /auth/me
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await service.getMe(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/forgot-password
router.post('/forgot-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await service.forgotPassword(data.email);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/reset-password
router.post('/reset-password', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await service.resetPassword(data.token, data.newPassword);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/verify-email
router.post('/verify-email', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await service.verifyEmail(data.token);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/change-password
router.post('/change-password', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const data = changePasswordSchema.parse(req.body);
    const result = await service.changePassword(userId, data.currentPassword, data.newPassword);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// GET /auth/sessions
router.get('/sessions', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await service.getSessions(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// DELETE /auth/sessions/:id
router.delete('/sessions/:id', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await service.revokeSession(userId, req.params.id);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/deactivate
router.post('/deactivate', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const result = await service.deactivateAccount(userId);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

// POST /auth/delete-request
router.post('/delete-request', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = (req as any).user.id;
    const data = deletionRequestSchema.parse(req.body || {});
    const result = await service.requestDeletion(userId, data.reason);
    res.json(result);
  } catch (e) {
    next(e);
  }
});

export default router;
