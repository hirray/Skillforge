import { z } from 'zod';

export const suspendUserSchema = z.object({
  reason: z.string().min(3, 'Reason for suspension is required (minimum 3 characters)'),
});

export const restoreUserSchema = z.object({
  reason: z.string().optional(),
});

export const createReportSchema = z.object({
  targetType: z.enum(['project', 'user', 'message', 'challenge', 'contribution_dispute', 'other']),
  targetId: z.string().min(1, 'Target ID is required'),
  reason: z.string().min(3, 'Reason is required (minimum 3 characters)'),
  notes: z.string().optional(),
});

export const patchReportSchema = z.object({
  status: z.enum(['pending', 'open', 'resolved', 'dismissed', 'escalated']),
  actionTaken: z.string().optional(),
  notes: z.string().optional(),
});

export const projectHoldSchema = z.object({
  reason: z.string().min(3, 'Reason for moderation hold is required'),
});

export const releaseHoldSchema = z.object({
  reason: z.string().min(3, 'Reason for releasing moderation hold is required'),
});

export const revokeCertificateSchema = z.object({
  reason: z.string().min(3, 'Reason for certificate revocation is required'),
});

export const verificationDecisionSchema = z.object({
  notes: z.string().optional(),
  reason: z.string().optional(),
});

export const adminUserQuerySchema = z.object({
  search: z.string().optional(),
  role: z.string().optional(),
  status: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

export const auditLogQuerySchema = z.object({
  actorId: z.string().optional(),
  action: z.string().optional(),
  targetType: z.string().optional(),
  targetId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).default(50),
});
