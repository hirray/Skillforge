import { z } from 'zod';

export const bookmarkSchema = z.object({
  targetType: z.enum(['project', 'job', 'user', 'company', 'challenge']),
  targetId: z.string().min(1, 'Target ID is required'),
});

export const searchFiltersSchema = z.object({
  q: z.string().optional(),
  type: z.enum(['all', 'projects', 'people', 'jobs', 'companies', 'challenges']).default('all'),
  limit: z.coerce.number().int().min(1).max(100).default(30),
  page: z.coerce.number().int().min(1).default(1),
});
