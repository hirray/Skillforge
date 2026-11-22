import { z } from 'zod';

export const updateProfileSchema = z.object({
  name: z.string().min(1).optional(),
  displayName: z.string().optional(),
  headline: z.string().max(200).optional(),
  bio: z.string().max(2000).optional(),
  pronouns: z.string().max(50).optional(),
  city: z.string().max(100).optional(),
  region: z.string().max(100).optional(),
  country: z.string().max(100).optional(),
  workMode: z.enum(['remote', 'hybrid', 'onsite', 'flexible']).optional(),
  avatarUrl: z.string().url().optional().or(z.literal('')),
  githubUsername: z.string().optional().or(z.literal('')),
  linkedinUrl: z.string().url().optional().or(z.literal('')),
  portfolioUrl: z.string().url().optional().or(z.literal('')),
  intendedUse: z.enum(['seeking_work', 'hiring', 'learning', 'networking', 'open_source']).optional(),
  companyName: z.string().optional(),
  workEmailDomain: z.string().optional(),
  jobTitle: z.string().optional(),
});

export const updateAvailabilitySchema = z.object({
  status: z.enum(['immediate', 'two_weeks', 'one_month', 'not_looking']),
  hoursPerWeek: z.number().int().min(0).max(80).optional(),
  desiredRoles: z.array(z.string()).optional(),
  minHourlyRate: z.number().min(0).optional(),
});

export const updateVisibilitySchema = z.object({
  profile: z.boolean().optional(),
  skills: z.boolean().optional(),
  proof: z.boolean().optional(),
  experience: z.boolean().optional(),
  education: z.boolean().optional(),
  contact: z.boolean().optional(),
  matchingOptIn: z.boolean().optional(),
});

export const addSkillSchema = z.object({
  skillId: z.string().min(1, 'Skill ID is required'),
  level: z.number().min(1).max(5).default(1),
  yearsOfExperience: z.number().min(0).max(50).default(1),
  evidenceLinks: z.array(z.string().url()).optional(),
});

export const addEducationSchema = z.object({
  institution: z.string().min(1, 'Institution is required'),
  degree: z.string().min(1, 'Degree is required'),
  fieldOfStudy: z.string().optional(),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
});

export const addExperienceSchema = z.object({
  company: z.string().min(1, 'Company is required'),
  title: z.string().min(1, 'Job title is required'),
  location: z.string().optional(),
  startDate: z.string().min(4, 'Start date is required'),
  endDate: z.string().optional(),
  current: z.boolean().default(false),
  description: z.string().max(3000).optional(),
});

export const addCertificationSchema = z.object({
  name: z.string().min(1, 'Certification name is required'),
  issuer: z.string().min(1, 'Issuer is required'),
  issueDate: z.string().min(4, 'Issue date is required'),
  expiryDate: z.string().optional(),
  credentialId: z.string().optional(),
  credentialUrl: z.string().url().optional().or(z.literal('')),
});

export const updateLearningGoalsSchema = z.object({
  goals: z.array(z.string().min(1)),
});
