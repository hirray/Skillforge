import { z } from 'zod';

export const attachmentSchema = z.object({
  fileId: z.string(),
  name: z.string(),
  url: z.string().optional(),
  size: z.number().optional(),
  mimeType: z.string().optional(),
});

export const sendMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(5000, 'Message is too long'),
  attachments: z.array(attachmentSchema).optional(),
  replyToId: z.string().uuid().optional().nullable(),
  mentions: z.array(z.string()).optional(),
});

export const editMessageSchema = z.object({
  content: z.string().min(1, 'Message content cannot be empty').max(5000, 'Message is too long'),
});

export const reportMessageSchema = z.object({
  reason: z.string().min(3, 'Please provide a valid report reason').max(500),
});

export const createDirectChatSchema = z.object({
  projectId: z.string().uuid(),
  recipientId: z.string(),
});

export const paginationQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(50),
  before: z.string().optional(),
});
