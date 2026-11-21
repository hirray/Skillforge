import { z } from 'zod';

export const connectQuerySchema = z.object({
  redirect_uri: z.string().optional(),
  state: z.string().optional(),
});

export const callbackQuerySchema = z.object({
  code: z.string().min(1, 'Authorization code is required'),
  state: z.string().optional(),
});

export const linkRepoSchema = z.object({
  owner: z.string().min(1, 'Repository owner is required'),
  name: z.string().min(1, 'Repository name is required'),
  githubRepoId: z.string().optional(),
});

export const syncRepoSchema = z.object({
  force: z.boolean().optional(),
});

export type ConnectQueryInput = z.infer<typeof connectQuerySchema>;
export type CallbackQueryInput = z.infer<typeof callbackQuerySchema>;
export type LinkRepoInput = z.infer<typeof linkRepoSchema>;
