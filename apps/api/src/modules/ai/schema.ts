import { z } from 'zod';
export const requirementSchema = z.object({
  description: z.string().max(50000).optional(),
  projectId: z.string().optional(),
  teamSize: z.number().int().min(1).max(100).optional(),
  timeline: z.number().int().min(1).max(520).optional(),
});
export const savedRequirementsSchema = z.object({
  requirements: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(100),
        proficiency: z
          .enum(['beginner', 'intermediate', 'advanced', 'expert'])
          .default('intermediate'),
        type: z.enum(['required', 'preferred']).default('required'),
        source: z
          .enum(['manual', 'ai_accepted', 'ai_edited'])
          .default('manual'),
      })
    )
    .max(100),
});
export const matchSchema = z.object({
  projectId: z.string().min(1),
  filters: z
    .object({
      role: z.string().max(100).optional(),
      minimumAvailability: z.number().min(0).max(168).optional(),
      workMode: z.enum(['remote', 'hybrid', 'on-site', 'flexible']).optional(),
    })
    .optional(),
});
export const jobMatchSchema = z.object({
  jobId: z.string().min(1),
  constraints: z
    .object({
      location: z.enum(['hard', 'soft']).optional(),
      workMode: z.enum(['hard', 'soft']).optional(),
    })
    .optional(),
});
export const preferenceSchema = z
  .object({
    matchingOptIn: z.boolean().optional(),
    recruiterVisible: z.boolean().optional(),
    publicSkills: z.boolean().optional(),
  })
  .strict();
