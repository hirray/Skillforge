import { z } from 'zod';

export const proposeSkillSchema = z.object({
  name: z.string().min(2, 'Skill name must be at least 2 characters').max(100),
  category: z.string().min(2).default('Software Development'),
  reason: z.string().max(500).optional(),
});

export const addEvidenceSchema = z.object({
  url: z.string().url('Evidence URL must be a valid link'),
  title: z.string().min(1).max(200).optional(),
  type: z.enum(['github_repo', 'pr', 'certificate', 'project', 'live_demo', 'article']).default('project'),
});

export const mergeSkillSchema = z.object({
  fromSkillId: z.string().min(1, 'Source skill ID is required'),
  toSkillId: z.string().min(1, 'Target skill ID is required'),
  reason: z.string().optional(),
});

export const createSkillAdminSchema = z.object({
  name: z.string().min(2),
  category: z.string().min(2),
  description: z.string().optional(),
  aliases: z.array(z.string()).optional(),
});
