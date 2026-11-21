import { z } from 'zod';

export const createCompanySchema = z.object({
  name: z.string().min(1, 'Company name is required').max(100),
  logo: z.string().optional().nullable(),
  overview: z.string().optional().nullable(),
  industry: z.string().optional().nullable(),
  sizeBand: z.enum(['1-10', '11-50', '51-200', '201-500', '500+']).optional().nullable(),
  website: z.string().url('Invalid website URL').or(z.string().length(0)).optional().nullable(),
  locations: z.string().optional().nullable(),
  hiringFocus: z.string().optional().nullable(),
});

export const updateCompanySchema = createCompanySchema.partial().extend({
  verificationStatus: z.enum(['unverified', 'pending', 'verified', 'rejected']).optional(),
  verificationReason: z.string().optional().nullable(),
});

export const addRecruiterSchema = z.object({
  email: z.string().email('Invalid email address'),
  role: z.enum(['recruiter_admin', 'recruiter_member']).default('recruiter_member'),
  userId: z.string().optional(),
});

export const requestVerificationSchema = z.object({
  workEmail: z.string().email('Work email is required'),
  domainNote: z.string().optional(),
});

export type CreateCompanyInput = z.infer<typeof createCompanySchema>;
export type UpdateCompanyInput = z.infer<typeof updateCompanySchema>;
export type AddRecruiterInput = z.infer<typeof addRecruiterSchema>;
