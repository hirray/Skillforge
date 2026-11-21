import { z } from 'zod';

export const createProfileSchema = z.object({
  expertiseSkillIds: z.array(z.string()).min(1, 'At least one skill is required'),
  domains: z.array(z.string()).min(1, 'At least one domain is required'),
  availability: z.string().min(1, 'Availability is required'),
  formats: z.array(z.string()).min(1, 'At least one format is required'),
  bio: z.string().max(1000).optional().nullable(),
  active: z.boolean().optional().default(true),
});

export const updateProfileSchema = createProfileSchema.partial();

export const requestMentorshipSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  mentorId: z.string().min(1, 'Mentor ID is required'),
  scope: z.enum(['general', 'milestone']).default('general'),
  milestoneId: z.string().optional().nullable(),
  message: z.string().min(5, 'Message must be at least 5 characters').max(1000),
  proposedTime: z.string().optional().nullable(),
});

export const respondRequestSchema = z.object({
  response: z.enum(['accept', 'decline']),
  note: z.string().optional().nullable(),
});

export const createFeedbackSchema = z.object({
  milestoneId: z.string().optional().nullable(),
  text: z.string().min(5, 'Feedback text must be at least 5 characters').max(2000),
});
