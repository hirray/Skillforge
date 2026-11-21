import { z } from 'zod';

export const createHackathonSchema = z.object({
  name: z.string().min(3, 'Event name must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(2000),
  theme: z.string().min(2, 'Theme is required').max(100),
  startsAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid startsAt ISO date string'),
  endsAt: z.string().refine((val) => !isNaN(Date.parse(val)), 'Invalid endsAt ISO date string'),
  rules: z.string().max(3000).optional().nullable(),
  suggestedSkillIds: z.array(z.string()).optional().default([]),
});

export const updateStatusSchema = z.object({
  status: z.enum(['draft', 'open', 'running', 'ended', 'archived']),
});

export const joinEventSchema = z.object({
  lookingForTeam: z.boolean().optional().default(true),
  skillsSnapshot: z.array(z.string()).optional().default([]),
});

export const registerProjectSchema = z.object({
  title: z.string().min(3, 'Project title must be at least 3 characters').max(100),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1500),
  category: z.string().optional().default('Hackathon Sprint'),
  skills: z.array(z.string()).optional().default([]),
  lookingForMembers: z.boolean().optional().default(true),
  roles: z.array(z.string()).optional().default([]),
});
