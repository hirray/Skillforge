import { z } from 'zod';

export const createShortlistSchema = z.object({
  candidateId: z.string().min(1, 'Candidate ID is required'),
  companyId: z.string().optional(),
  jobId: z.string().optional(),
  stage: z.string().optional(),
});

export const updatePipelineStageSchema = z.object({
  stage: z.enum(['New', 'Reviewed', 'Shortlisted', 'Contacted', 'Interview', 'Selected', 'Rejected', 'Closed']).optional(),
  recruiterNote: z.string().optional(),
  contacted: z.boolean().optional(),
});

export const compareCandidatesSchema = z.object({
  candidateIds: z.array(z.string()).min(2, 'At least 2 candidates required for comparison').max(4, 'Maximum 4 candidates can be compared'),
  jobId: z.string().optional(),
  companyId: z.string().optional(),
});

export const addNoteSchema = z.object({
  text: z.string().min(1, 'Note content cannot be empty'),
});

export const outreachMessageSchema = z.object({
  text: z.string().min(1, 'Outreach message text cannot be empty'),
});

export const opportunityResponseSchema = z.object({
  status: z.enum(['accepted', 'declined']),
});

export const contactConsentSchema = z.object({
  consent: z.boolean(),
});
