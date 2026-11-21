import { z } from 'zod';

export const talentSearchSchema = z.object({
  query: z.string().optional(),
  skills: z.array(z.string()).optional(),
  evidenceTypes: z.array(z.string()).optional(), // 'github_commits' | 'tasks' | 'verified_projects' | 'certificates'
  minExperienceYears: z.number().optional(),
  location: z.string().optional(),
  workMode: z.string().optional(), // 'remote' | 'hybrid' | 'on-site' | 'flexible'
  availability: z.string().optional(), // 'immediate' | '2_weeks' | '1_month' | 'flexible'
  limit: z.number().min(1).max(100).default(20),
  offset: z.number().min(0).default(0),
});

export const createSavedSearchSchema = z.object({
  name: z.string().min(2, 'Search name must be at least 2 characters'),
  companyId: z.string().optional(),
  filters: z.record(z.any()),
});
