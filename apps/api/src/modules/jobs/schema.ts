import { z } from 'zod';

export const jobRequirementInputSchema = z.object({
  skillName: z.string().min(1, 'Skill name is required'),
  skillId: z.string().optional().nullable(),
  importance: z.enum(['required', 'preferred']).default('required'),
  minProficiency: z.enum(['beginner', 'intermediate', 'advanced', 'expert']).default('intermediate'),
});

export const createJobSchema = z.object({
  companyId: z.string().min(1, 'Company ID is required'),
  title: z.string().min(2, 'Job title must be at least 2 characters').max(100),
  department: z.string().optional().nullable(),
  employmentType: z.enum(['Full-time', 'Internship', 'Contract', 'Freelance']).default('Full-time'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  responsibilities: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  workMode: z.enum(['remote', 'hybrid', 'on-site']).default('remote'),
  salaryMin: z.number().nonnegative().optional().nullable(),
  salaryMax: z.number().nonnegative().optional().nullable(),
  currency: z.string().default('USD'),
  benefits: z.string().optional().nullable(),
  applicationUrl: z.string().url('Invalid application URL').or(z.string().length(0)).optional().nullable(),
  status: z.enum(['Draft', 'Active', 'Paused', 'Closed', 'Archived']).default('Draft'),
  requirements: z.array(jobRequirementInputSchema).optional().default([]),
}).refine(
  (data) => {
    // PRD Business Rule: If publishing to Active, must have at least one required skill
    if (data.status === 'Active') {
      const hasRequiredSkill = data.requirements && data.requirements.some((r) => r.importance === 'required');
      return hasRequiredSkill;
    }
    return true;
  },
  {
    message: 'A job posting cannot be published without at least one required skill requirement.',
    path: ['requirements'],
  }
);

export const updateJobSchema = z.object({
  title: z.string().min(2).max(100).optional(),
  department: z.string().optional().nullable(),
  employmentType: z.enum(['Full-time', 'Internship', 'Contract', 'Freelance']).optional(),
  description: z.string().min(10).optional(),
  responsibilities: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  workMode: z.enum(['remote', 'hybrid', 'on-site']).optional(),
  salaryMin: z.number().nonnegative().optional().nullable(),
  salaryMax: z.number().nonnegative().optional().nullable(),
  currency: z.string().optional(),
  benefits: z.string().optional().nullable(),
  applicationUrl: z.string().url().or(z.string().length(0)).optional().nullable(),
  status: z.enum(['Draft', 'Active', 'Paused', 'Closed', 'Archived']).optional(),
  requirements: z.array(jobRequirementInputSchema).optional(),
});

export const applyJobSchema = z.object({
  coverLetter: z.string().optional().nullable(),
  resumeId: z.string().optional().nullable(),
});

export const listJobsQuerySchema = z.object({
  companyId: z.string().optional(),
  status: z.string().optional(),
  search: z.string().optional(),
  workMode: z.string().optional(),
  employmentType: z.string().optional(),
});

export type CreateJobInput = z.infer<typeof createJobSchema>;
export type UpdateJobInput = z.infer<typeof updateJobSchema>;
export type ApplyJobInput = z.infer<typeof applyJobSchema>;
export type ListJobsQueryInput = z.infer<typeof listJobsQuerySchema>;
