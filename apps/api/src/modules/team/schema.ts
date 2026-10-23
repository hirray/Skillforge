import { z } from 'zod';

export const inviteSchema = z.object({
  userId: z.string().min(1, 'Target user ID is required'),
  role: z.string().min(1, 'Role title is required'),
  note: z.string().max(500, 'Note must not exceed 500 characters').optional().nullable(),
  expiresDays: z.number().int().min(1).max(30).default(7)
});

export const respondInvitationSchema = z.object({
  response: z.enum(['accept', 'decline'])
});

export const createJoinRequestSchema = z.object({
  role: z.string().min(1, 'Role title is required'),
  message: z.string().max(500, 'Message must not exceed 500 characters').optional().nullable()
});

export const respondJoinRequestSchema = z.object({
  action: z.enum(['accept', 'reject']),
  reason: z.string().max(500).optional().nullable(),
  version: z.number().int().optional()
});

export const updateMemberRoleSchema = z.object({
  role: z.string().min(1, 'Role is required'),
  responsibilities: z.string().max(1000).optional().nullable()
});

export const removeMemberSchema = z.object({
  reason: z.string().min(1, 'Removal reason is required').max(500)
});

export const leaveProjectSchema = z.object({
  reason: z.string().max(500).optional().nullable()
});

export const transferOwnershipSchema = z.object({
  newOwnerId: z.string().min(1, 'New owner ID is required')
});

export const respondTransferSchema = z.object({
  action: z.enum(['accept', 'decline'])
});
