import { z } from 'zod';

export const revokeCertificateSchema = z.object({
  reason: z.string().min(5, 'Revocation reason must be at least 5 characters long'),
});

export const updateShareSettingsSchema = z.object({
  showTechnologies: z.boolean().optional(),
  showDuration: z.boolean().optional(),
});

export const issueCertificateSchema = z.object({
  projectId: z.string().min(1),
  userId: z.string().min(1),
  roles: z.array(z.string()).optional(),
});
