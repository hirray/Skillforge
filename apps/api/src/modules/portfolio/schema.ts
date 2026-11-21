import { z } from 'zod';

export const updatePortfolioSchema = z.object({
  headline: z.string().optional(),
  bioOverride: z.string().optional(),
  visibility: z.enum(['public', 'platform', 'recruiters', 'private']).optional(),
  sectionOrder: z.array(z.string()).optional(),
  sectionVisibility: z.record(z.boolean()).optional(),
  pinnedProjectIds: z.array(z.string()).optional(),
});

export const createCorrectionRequestSchema = z.object({
  field: z.string().min(1, 'Field name is required'),
  newValue: z.string().min(1, 'New value is required'),
  reason: z.string().min(5, 'Reason must be at least 5 characters long'),
});

export const decideCorrectionRequestSchema = z.object({
  status: z.enum(['approved', 'rejected']),
  reason: z.string().optional(),
});
