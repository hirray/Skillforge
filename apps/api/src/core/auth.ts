import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@skillforge/contract';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: { code: ErrorCode.UNAUTHENTICATED, message: 'Missing token' } });
  }
  // mock decode
  (req as any).user = { id: auth.replace('Bearer ', ''), roles: ['user'] };
  next();
};
