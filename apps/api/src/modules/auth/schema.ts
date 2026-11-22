import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email('Invalid email address').max(255),
  password: z
    .string()
    .min(10, 'Password must be at least 10 characters')
    .max(128, 'Password must not exceed 128 characters'),
  name: z.string().min(1, 'Name is required').max(100).optional(),
  intendedUse: z.enum(['individual', 'recruiter']).default('individual'),
  companyName: z.string().max(100).optional(),
  workEmailDomain: z.string().max(100).optional(),
  jobTitle: z.string().max(100).optional(),
  consentAccepted: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(10, 'New password must be at least 10 characters'),
});

export const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Verification token is required'),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z.string().min(10, 'New password must be at least 10 characters'),
});

export const changeEmailSchema = z.object({
  newEmail: z.string().email('Invalid email address'),
  currentPassword: z.string().min(1, 'Password required to change email'),
});

export const deletionRequestSchema = z.object({
  reason: z.string().max(500).optional(),
});
