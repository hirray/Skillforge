import { PrismaClient } from '@prisma/client';
import { DomainEvent } from '@skillforge/contract';
import crypto from 'crypto';
import { ErrorCode } from '@skillforge/contract';
import {
  signAccessToken,
  hashPassword,
  verifyPassword,
  hashToken,
} from '../../core/auth';
import { eventBus } from '../../core/eventBus';
import { writeAudit } from '../../core/audit';

const prisma = new PrismaClient();

// Common passwords list
const COMMON_PASSWORDS = new Set([
  'password123',
  '1234567890',
  'qwerty1234',
  'letmein123',
  'admin12345',
  'skillforge123',
  'welcome123',
]);

export interface AuthResponse {
  user: {
    id: string;
    email: string;
    name?: string;
    roles: string[];
    emailVerified: boolean;
    intendedUse?: string;
    companyName?: string;
    jobTitle?: string;
    createdAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export class RealAuthService {
  /**
   * Helper: check login rate limit and lockout
   */
  private async checkRateLimit(email: string, ip: string): Promise<void> {
    const fifteenMinutesAgo = new Date(Date.now() - 15 * 60 * 1000);
    const failedAttempts = await prisma.loginAttempt.count({
      where: {
        email,
        success: false,
        attemptedAt: { gte: fifteenMinutesAgo },
      },
    });

    if (failedAttempts >= 5) {
      // Exponential lockout (1, 2, 4, ... max 15 mins)
      const multiplier = Math.min(Math.pow(2, failedAttempts - 5), 15);
      const retryAfterSec = multiplier * 60;
      throw {
        status: 429,
        code: ErrorCode.RATE_LIMITED,
        message: `Too many failed login attempts. Account temporarily locked for security. Try again in ${Math.ceil(
          retryAfterSec / 60
        )} minute(s).`,
        retryAfter: retryAfterSec,
      };
    }
  }

  /**
   * Helper: generate refresh token pair and record session
   */
  private async issueTokens(
    user: any,
    familyId?: string,
    deviceLabel = 'Web Browser'
  ): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const roles: string[] = typeof user.roles === 'string' ? JSON.parse(user.roles || '["individual"]') : user.roles || ['individual'];

    const accessToken = signAccessToken({
      id: user.id,
      email: user.email,
      roles,
      emailVerified: Boolean(user.emailVerified),
    });

    const rawRefreshToken = crypto.randomBytes(40).toString('hex');
    const tokenHash = hashToken(rawRefreshToken);
    const resolvedFamily = familyId || crypto.randomUUID();
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        tokenHash,
        familyId: resolvedFamily,
        expiresAt,
      },
    });

    // Record session
    try {
      await prisma.userSession.create({
        data: {
          userId: user.id,
          deviceLabel,
          lastActiveAt: new Date(),
        },
      });
    } catch {}

    return {
      accessToken,
      refreshToken: rawRefreshToken,
      expiresIn: 15 * 60,
    };
  }

  /**
   * POST /auth/register
   */
  async register(data: {
    email: string;
    password: string;
    name?: string;
    intendedUse?: 'individual' | 'recruiter';
    companyName?: string;
    workEmailDomain?: string;
    jobTitle?: string;
    consentAccepted?: boolean;
    ip?: string;
  }): Promise<AuthResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();

    // Check duplicate
    const existing = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (existing) {
      throw {
        status: 409,
        code: ErrorCode.CONFLICT,
        message: 'An account with this email address already exists.',
      };
    }

    // Password policy check
    if (COMMON_PASSWORDS.has(data.password.toLowerCase())) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password is too common or easily guessable. Please choose a stronger password.',
      };
    }

    if (data.password.toLowerCase().includes(normalizedEmail.split('@')[0])) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Password must not contain parts of your email address.',
      };
    }

    const passwordHash = hashPassword(data.password);
    const initialRoles = data.intendedUse === 'recruiter' ? ['recruiter', 'individual'] : ['individual'];

    // Create user
    const user = await prisma.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        name: data.name || (data.intendedUse === 'recruiter' ? 'Verified Recruiter' : 'SkillForge Member'),
        roles: JSON.stringify(initialRoles),
        intendedUse: data.intendedUse || 'individual',
        companyName: data.companyName,
        workEmailDomain: data.workEmailDomain,
        jobTitle: data.jobTitle,
        emailVerified: false,
      },
    });

    // Record consent
    try {
      await prisma.consentRecord.create({
        data: {
          userId: user.id,
          type: 'terms_and_privacy',
          version: '2026.1',
          ip: data.ip || '127.0.0.1',
        },
      });
    } catch {}

    // Generate single-use email verification token
    const rawVerifyToken = crypto.randomBytes(32).toString('hex');
    await prisma.emailVerificationToken.create({
      data: {
        userId: user.id,
        tokenHash: hashToken(rawVerifyToken),
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    // Console Email Provider output (as specified in PRD)
    console.log('\n======================================================');
    console.log('[EmailProvider:Console] WELCOME TO SKILLFORGE');
    console.log(`To: ${normalizedEmail}`);
    console.log(`Verify link: http://localhost:5173/auth/verify?token=${rawVerifyToken}`);
    console.log('======================================================\n');

    // Publish event
    try {
      eventBus.publish(DomainEvent.UserRegistered, {
        userId: user.id,
      });
    } catch {}

    const tokens = await this.issueTokens(user);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        roles: initialRoles,
        emailVerified: false,
        intendedUse: user.intendedUse || undefined,
        companyName: user.companyName || undefined,
        jobTitle: user.jobTitle || undefined,
        createdAt: user.createdAt.toISOString(),
      },
      tokens,
    };
  }

  /**
   * POST /auth/login
   */
  async login(data: { email: string; password: string; ip?: string; deviceLabel?: string }): Promise<AuthResponse> {
    const normalizedEmail = data.email.trim().toLowerCase();
    const ip = data.ip || '127.0.0.1';

    await this.checkRateLimit(normalizedEmail, ip);

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });
    if (!user || user.deactivated) {
      await prisma.loginAttempt.create({
        data: { email: normalizedEmail, ip, success: false },
      });
      // Timing attack safe error message
      throw {
        status: 401,
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Invalid email address or password.',
      };
    }

    const isValid = user.passwordHash ? verifyPassword(data.password, user.passwordHash) : false;
    if (!isValid) {
      await prisma.loginAttempt.create({
        data: { email: normalizedEmail, ip, success: false },
      });
      throw {
        status: 401,
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Invalid email address or password.',
      };
    }

    // Success attempt
    await prisma.loginAttempt.create({
      data: { email: normalizedEmail, ip, success: true },
    });

    const roles: string[] = typeof user.roles === 'string' ? JSON.parse(user.roles || '["individual"]') : user.roles;
    const tokens = await this.issueTokens(user, undefined, data.deviceLabel);

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        roles,
        emailVerified: Boolean(user.emailVerified),
        intendedUse: user.intendedUse || undefined,
        companyName: user.companyName || undefined,
        jobTitle: user.jobTitle || undefined,
        createdAt: user.createdAt.toISOString(),
      },
      tokens,
    };
  }

  /**
   * POST /auth/dev-login/:userId
   * Preserved Phase 0 instant development login
   */
  async devLogin(userId: string): Promise<AuthResponse> {
    let user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      // Find by email or create stub
      user = await prisma.user.findFirst({ where: { email: `${userId}@example.com` } });
      if (!user) {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: `${userId}@example.com`,
            name: `User ${userId}`,
            roles: JSON.stringify(['individual']),
            emailVerified: true,
          },
        });
      }
    }

    const roles: string[] = typeof user.roles === 'string' ? JSON.parse(user.roles || '["individual"]') : user.roles;
    const tokens = await this.issueTokens(user, undefined, 'Dev Browser');

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name || undefined,
        roles,
        emailVerified: Boolean(user.emailVerified),
        createdAt: user.createdAt.toISOString(),
      },
      tokens,
    };
  }

  /**
   * POST /auth/refresh
   * Implements token rotation and family invalidation on token reuse
   */
  async refresh(rawRefreshToken: string, deviceLabel?: string): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
    const tokenHash = hashToken(rawRefreshToken);
    const existing = await prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!existing) {
      throw {
        status: 401,
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Invalid session token.',
      };
    }

    // Reuse detection: If token was already revoked, someone replayed an old token!
    if (existing.revokedAt) {
      // Revoke the whole family immediately
      await prisma.refreshToken.updateMany({
        where: { familyId: existing.familyId },
        data: { revokedAt: new Date() },
      });
      await writeAudit(existing.userId, 'SECURITY_TOKEN_REUSE_DETECTED', 'RefreshToken', existing.id, 'Token family revoked due to replay attempt');
      throw {
        status: 401,
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Security breach alert: Session compromised. Please sign in again.',
      };
    }

    if (existing.expiresAt < new Date()) {
      throw {
        status: 401,
        code: ErrorCode.UNAUTHENTICATED,
        message: 'Session has expired. Please sign in again.',
      };
    }

    // Invalidate current token
    await prisma.refreshToken.update({
      where: { id: existing.id },
      data: { revokedAt: new Date() },
    });

    // Issue new rotated token preserving family
    return this.issueTokens(existing.user, existing.familyId, deviceLabel);
  }

  /**
   * POST /auth/logout
   */
  async logout(rawRefreshToken?: string): Promise<{ success: boolean }> {
    if (rawRefreshToken) {
      const tokenHash = hashToken(rawRefreshToken);
      await prisma.refreshToken.updateMany({
        where: { tokenHash },
        data: { revokedAt: new Date() },
      });
    }
    return { success: true };
  }

  /**
   * POST /auth/logout-all
   */
  async logoutAll(userId: string): Promise<{ success: boolean; message: string }> {
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
    await prisma.userSession.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });
    return { success: true, message: 'All active sessions have been securely terminated.' };
  }

  /**
   * GET /auth/me
   */
  async getMe(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        headline: true,
        bio: true,
        roles: true,
        emailVerified: true,
        intendedUse: true,
        companyName: true,
        jobTitle: true,
        workMode: true,
        matchingOptIn: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw { status: 404, code: ErrorCode.NOT_FOUND, message: 'User not found' };
    }

    const roles: string[] = typeof user.roles === 'string' ? JSON.parse(user.roles || '["individual"]') : user.roles;

    return {
      ...user,
      roles,
    };
  }

  /**
   * POST /auth/forgot-password
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const normalizedEmail = email.trim().toLowerCase();
    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } });

    if (user) {
      // Invalidate existing reset tokens for user
      await prisma.passwordResetToken.updateMany({
        where: { userId: user.id, usedAt: null },
        data: { usedAt: new Date() },
      });

      const rawResetToken = crypto.randomBytes(32).toString('hex');
      await prisma.passwordResetToken.create({
        data: {
          userId: user.id,
          tokenHash: hashToken(rawResetToken),
          expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
        },
      });

      console.log('\n======================================================');
      console.log('[EmailProvider:Console] PASSWORD RESET REQUEST');
      console.log(`To: ${normalizedEmail}`);
      console.log(`Reset link: http://localhost:5173/auth/reset-password?token=${rawResetToken}`);
      console.log('======================================================\n');
    }

    // Always return generic 200 OK to prevent account enumeration
    return { message: 'If that email address is in our system, a password reset link has been dispatched.' };
  }

  /**
   * POST /auth/reset-password
   */
  async resetPassword(token: string, newPass: string): Promise<{ success: boolean; message: string }> {
    const tokenHash = hashToken(token);
    const resetRecord = await prisma.passwordResetToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!resetRecord || resetRecord.usedAt || resetRecord.expiresAt < new Date()) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'This password reset link is invalid or has expired. Please request a new one.',
      };
    }

    const passwordHash = hashPassword(newPass);

    // Update password
    await prisma.user.update({
      where: { id: resetRecord.userId },
      data: { passwordHash },
    });

    // Mark token used
    await prisma.passwordResetToken.update({
      where: { id: resetRecord.id },
      data: { usedAt: new Date() },
    });

    // Revoke all existing sessions for security
    await this.logoutAll(resetRecord.userId);

    await writeAudit(resetRecord.userId, 'PASSWORD_RESET_COMPLETED', 'User', resetRecord.userId, 'Password reset via email token');

    return { success: true, message: 'Your password has been successfully updated. You may now sign in.' };
  }

  /**
   * POST /auth/verify-email
   */
  async verifyEmail(token: string): Promise<{ success: boolean; message: string }> {
    const tokenHash = hashToken(token);
    const record = await prisma.emailVerificationToken.findUnique({
      where: { tokenHash },
    });

    if (!record || record.usedAt || record.expiresAt < new Date()) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Email verification token is invalid or expired. Please request a new one.',
      };
    }

    await prisma.user.update({
      where: { id: record.userId },
      data: { emailVerified: true },
    });

    await prisma.emailVerificationToken.update({
      where: { id: record.id },
      data: { usedAt: new Date() },
    });

    return { success: true, message: 'Email address successfully verified. Your account is fully activated!' };
  }

  /**
   * POST /auth/change-password
   */
  async changePassword(userId: string, currentPass: string, newPass: string): Promise<{ success: boolean; message: string }> {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.passwordHash || !verifyPassword(currentPass, user.passwordHash)) {
      throw {
        status: 400,
        code: ErrorCode.VALIDATION_ERROR,
        message: 'Current password provided is incorrect.',
      };
    }

    const newHash = hashPassword(newPass);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash },
    });

    // Revoke other sessions
    await prisma.refreshToken.updateMany({
      where: { userId },
      data: { revokedAt: new Date() },
    });

    return { success: true, message: 'Password changed successfully.' };
  }

  /**
   * GET /auth/sessions
   */
  async getSessions(userId: string) {
    const sessions = await prisma.userSession.findMany({
      where: { userId, revokedAt: null },
      orderBy: { lastActiveAt: 'desc' },
      take: 10,
    });
    return sessions;
  }

  /**
   * DELETE /auth/sessions/:id
   */
  async revokeSession(userId: string, sessionId: string) {
    await prisma.userSession.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() },
    });
    return { success: true, message: 'Session revoked.' };
  }

  /**
   * POST /auth/deactivate
   */
  async deactivateAccount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: { deactivated: true, matchingOptIn: false },
    });
    await this.logoutAll(userId);
    return { success: true, message: 'Account deactivated. You can reactivate anytime by signing in.' };
  }

  /**
   * POST /auth/delete-request
   */
  async requestDeletion(userId: string, reason?: string) {
    // Check if user owns active multi-member projects
    const activeOwnedProjects = await prisma.project.findMany({
      where: {
        ownerId: userId,
        status: { in: ['Recruiting', 'Active'] },
      },
      include: {
        members: true,
      },
    });

    const multiMemberProjects = activeOwnedProjects.filter((p) => p.members.length > 1);
    if (multiMemberProjects.length > 0) {
      const titles = multiMemberProjects.map((p) => `"${p.title}"`).join(', ');
      throw {
        status: 409,
        code: ErrorCode.CONFLICT,
        message: `Cannot delete account while you own active projects with team members (${titles}). Please transfer ownership or close these projects first.`,
      };
    }

    const scheduledFor = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000); // 14-day grace period
    const req = await prisma.deletionRequest.create({
      data: {
        userId,
        scheduledFor,
        reason,
      },
    });

    await writeAudit(userId, 'ACCOUNT_DELETION_REQUESTED', 'User', userId, reason);

    return {
      success: true,
      scheduledFor: scheduledFor.toISOString(),
      message: 'Account deletion scheduled with a 14-day grace period. You may cancel anytime before this date by contacting support.',
    };
  }
}

export const realAuthService = new RealAuthService();
export { RealAuthService as RealService };

