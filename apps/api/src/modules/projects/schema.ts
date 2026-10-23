import { z } from 'zod';

const optionalString = z.string().optional().nullable().or(z.literal(''));
const dateSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}$/)).optional().nullable().or(z.literal(''));

export const baseProjectSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: optionalString,
  problemStatement: optionalString,
  category: z.enum(['Web App', 'ML', 'Mobile', 'Hardware', 'Research', 'Other']).optional().nullable().or(z.literal('')),
  type: optionalString,
  outcome: optionalString,
  coverImage: optionalString,
  visibility: z.enum(['Public', 'Platform-only', 'Invite-only', 'Private']).default('Public'),
  
  duration: optionalString,
  targetDate: dateSchema,
  stage: z.enum(['idea', 'planning', 'in progress', 'near completion']).default('idea'),
  minTeamSize: z.number().min(1).default(1),
  maxTeamSize: z.number().min(1).default(5),
  budget: z.number().optional().nullable(),
  paid: z.boolean().default(false),
  
  joinMode: z.enum(['open', 'invite', 'both']).default('both'),
  memberApprovalMode: z.enum(['owner', 'auto']).default('owner'),
  
  requirements: z.array(z.object({
    skill: z.string(),
    type: z.enum(['required', 'preferred']).default('required'),
    proficiency: z.enum(['beginner', 'intermediate', 'expert']).default('intermediate')
  })).optional().nullable(),
  
  roles: z.array(z.object({
    title: z.string(),
    openings: z.number().min(1).default(1)
  })).optional().nullable()
});

export const createProjectSchema = baseProjectSchema.refine(
  data => (data.minTeamSize === undefined || data.maxTeamSize === undefined) || (data.minTeamSize <= data.maxTeamSize),
  {
    message: 'minTeamSize cannot be greater than maxTeamSize',
    path: ['maxTeamSize']
  }
);

export const updateProjectSchema = baseProjectSchema.partial().refine(
  data => (data.minTeamSize === undefined || data.maxTeamSize === undefined) || (data.minTeamSize <= data.maxTeamSize),
  {
    message: 'minTeamSize cannot be greater than maxTeamSize',
    path: ['maxTeamSize']
  }
);

export const transitionProjectSchema = z.object({
  status: z.enum(['Draft', 'Recruiting', 'Active', 'Paused', 'Completed', 'Verified', 'Archived'])
});
