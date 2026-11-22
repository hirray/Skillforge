import { z } from 'zod';

export const createChallengeSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  title: z.string().min(2, 'Challenge title is required'),
  problem: z.string().min(5, 'Problem statement is required'),
  deliverables: z.string().min(2, 'Deliverables description is required'),
  skillIds: z.array(z.string()).default([]),
  startsAt: z.string().optional(),
  endsAt: z.string().min(1, 'Challenge deadline is required'),
  rules: z.string().optional(),
  visibility: z.enum(['public', 'private']).default('public'),
  status: z.enum(['draft', 'open', 'closed', 'archived']).default('open'),
});

export const updateChallengeSchema = z.object({
  title: z.string().optional(),
  problem: z.string().optional(),
  deliverables: z.string().optional(),
  skillIds: z.array(z.string()).optional(),
  endsAt: z.string().optional(),
  rules: z.string().optional(),
  visibility: z.string().optional(),
  status: z.enum(['draft', 'open', 'closed', 'archived']).optional(),
});

export const submitChallengeEntrySchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  summary: z.string().min(5, 'Summary must be at least 5 characters'),
  demoUrl: z.string().optional(),
  repoUrl: z.string().optional(),
});

export const reviewChallengeEntrySchema = z.object({
  status: z.enum(['submitted', 'under_review', 'shortlisted', 'declined']),
  companyNote: z.string().optional(),
});
