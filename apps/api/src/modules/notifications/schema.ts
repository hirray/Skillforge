import { z } from 'zod';

export const updatePreferencesSchema = z.object({
  inAppOutreach: z.boolean().optional(),
  emailOutreach: z.boolean().optional(),
  inAppChallenges: z.boolean().optional(),
  emailChallenges: z.boolean().optional(),
  inAppPipeline: z.boolean().optional(),
  emailPipeline: z.boolean().optional(),
  inAppMentorship: z.boolean().optional(),
  emailMentorship: z.boolean().optional(),
  inAppSystem: z.boolean().optional(),
  emailSystem: z.boolean().optional(),
});
