import { z } from 'zod';

export const createManualNoteSchema = z.object({
  targetUserId: z.string().optional(),
  detail: z.string().min(3, 'Detail description is required'),
  justification: z.string().min(5, 'Justification text is required for manual entries'),
  referenceUrl: z.string().url().optional().or(z.literal('')),
});

export const createDisputeSchema = z.object({
  reason: z.string().min(5, 'Reason must be at least 5 characters'),
});

export const resolveDisputeSchema = z.object({
  action: z.enum(['owner_resolved', 'escalated', 'closed']),
  note: z.string().optional(),
  adjustmentDetail: z.string().optional(),
});
