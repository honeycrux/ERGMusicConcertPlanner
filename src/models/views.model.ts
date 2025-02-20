import { z } from "zod";

export const PreferenceViewSchema = z.object({
  id: z.string(),
  genre: z.string(),
  applicant: z.object({
    name: z.string(),
  }),
  preference: z.object({
    concertAvailability: z.string(),
    rehearsalAvailability: z.string(),
    preferenceRemarks: z.string(),
  }),
});

export type PreferenceView = z.infer<typeof PreferenceViewSchema>;
