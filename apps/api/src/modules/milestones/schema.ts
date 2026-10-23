import { z } from 'zod';

export const createMilestoneSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(100, 'Title cannot exceed 100 characters'),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  linkedTaskIds: z.array(z.string()).optional().default([]),
});

export const updateMilestoneSchema = z.object({
  title: z.string().trim().min(1, 'Title cannot be empty').max(100, 'Title cannot exceed 100 characters').optional(),
  description: z.string().optional().nullable(),
  dueDate: z.string().optional().nullable(),
  status: z.enum(['To Do', 'In Progress', 'Done']).optional(),
  linkedTaskIds: z.array(z.string()).optional(),
});

export const linkTaskSchema = z.object({
  taskId: z.string().min(1, 'Task ID is required'),
});

export const manualCompleteSchema = z.object({
  rationale: z.string().trim().min(1, 'Manual completion rationale is required'),
});
