import { z } from 'zod';
import dotenv from 'dotenv';
dotenv.config({ path: '../../.env' });

const envSchema = z.object({
  PORT: z.string().default('4000'),
  AUTH_SOURCE: z.enum(['mock', 'real']).default('mock'),
  PROJECTS_SOURCE: z.enum(['mock', 'real']).default('real'),
  TEAM_SOURCE: z.enum(['mock', 'real']).default('real'),
  TASKS_SOURCE: z.enum(['mock', 'real']).default('real'),
  CHAT_SOURCE: z.enum(['mock', 'real']).default('real'),
  MILESTONES_SOURCE: z.enum(['mock', 'real']).default('real'),
  RESOURCES_SOURCE: z.enum(['mock', 'real']).default('real'),
  AI_SOURCE: z.enum(['mock', 'real']).default('mock'),
  GITHUB_SOURCE: z.enum(['mock', 'real']).default('mock'),
  STORAGE_PROVIDER: z.enum(['local']).default('local'),
  QUEUE_PROVIDER: z.enum(['memory']).default('memory'),
  EMAIL_PROVIDER: z.enum(['console']).default('console'),
  AI_SERVICE_URL: z.string().default('http://localhost:8000'),
  JWT_SECRET: z.string().default('supersecretdevkey'),
});

export const config = envSchema.parse(process.env);
