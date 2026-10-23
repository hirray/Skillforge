import { z } from 'zod';

export const createLinkSchema = z.object({
  title: z.string().trim().min(1, 'Resource title is required').max(150, 'Title cannot exceed 150 characters'),
  url: z.string().trim().url('Must be a valid URL starting with http:// or https://'),
  category: z.enum(['Repository', 'Design', 'Docs', 'Demo', 'Dataset', 'Other']).default('Other'),
});

export const createFileSchema = z.object({
  title: z.string().trim().min(1, 'Resource title is required').max(150, 'Title cannot exceed 150 characters'),
  category: z.enum(['Repository', 'Design', 'Docs', 'Demo', 'Dataset', 'Other']).default('Other'),
  fileName: z.string().min(1, 'File name is required'),
  fileKey: z.string().min(1, 'Storage fileKey is required'),
  fileSize: z.number().positive('File size must be positive').max(25 * 1024 * 1024, 'File size cannot exceed 25MB (26,214,400 bytes)'),
  mimeType: z.string().optional(),
});
