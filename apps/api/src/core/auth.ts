import { Request, Response, NextFunction } from 'express';
import { ErrorCode } from '@skillforge/contract';

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: { code: ErrorCode.UNAUTHENTICATED, message: 'Missing token' } });
  }

  const rawToken = auth.replace(/^Bearer\s+/i, '').trim();
  let userId = rawToken;
  let userEmail: string | undefined;
  let userRoles = ['user'];

  // If token is a JWT (contains dots: header.payload.signature), decode the payload
  if (rawToken.includes('.')) {
    try {
      const parts = rawToken.split('.');
      if (parts.length >= 2) {
        const base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        const json = Buffer.from(base64, 'base64').toString('utf8');
        const payload = JSON.parse(json);
        userId = payload._id || payload.id || payload.userId || payload.sub || rawToken;
        userEmail = payload.email || (payload.nickname ? `${payload.nickname}@example.com` : undefined);
        if (payload.role) {
          userRoles = Array.isArray(payload.role) ? payload.role : [payload.role];
        } else if (payload.roles && Array.isArray(payload.roles)) {
          userRoles = payload.roles;
        }
      }
    } catch {
      // fallback to raw token
    }
  }

  (req as any).user = {
    id: userId,
    email: userEmail || `${userId}@example.com`,
    roles: userRoles,
  };
  next();
};
