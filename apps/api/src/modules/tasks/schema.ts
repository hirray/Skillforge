import { z } from 'zod';

const optionalString = z.string().optional().nullable().or(z.literal(''));
const dateSchema = z.string().datetime().or(z.string().regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/)).optional().nullable().or(z.literal(''));

export const priorityEnum = z.enum(['Low', 'Medium', 'High', 'Critical']);
export const taskStatusEnum = z.enum(['To Do', 'In Progress', 'In Review', 'Done']);

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: optionalString,
  priority: priorityEnum.default('Medium'),
  status: taskStatusEnum.default('To Do'),
  assigneeId: optionalString,
  dueDate: dateSchema,
  labels: z.array(z.string()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  milestoneId: optionalString,
  dependsOnTaskIds: z.array(z.string()).optional().nullable()
});

export const updateTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  description: optionalString,
  priority: priorityEnum.optional(),
  status: taskStatusEnum.optional(),
  assigneeId: optionalString,
  needsReassignment: z.boolean().optional(),
  dueDate: dateSchema,
  labels: z.array(z.string()).optional().nullable(),
  attachments: z.array(z.string()).optional().nullable(),
  milestoneId: optionalString,
  dependsOnTaskIds: z.array(z.string()).optional().nullable()
});

export const createCommentSchema = z.object({
  content: z.string().min(1, 'Comment content is required')
});
