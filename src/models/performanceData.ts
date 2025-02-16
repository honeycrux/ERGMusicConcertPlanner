import { z } from "zod";

export const PerformanceDataSchema = z.object({
  id: z.number(),
  genre: z.string(),
  piece: z.string(),
  description: z.string(),
  performerList: z.string(),
  performerDescription: z.string(),
  remarks: z.string(),
  applicant: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    applicantRemarks: z.string(),
  }),
  preference: z.object({
    concertAvailability: z.string(),
    rehearsalAvailability: z.string(),
    preferenceRemarks: z.string(),
  }),
  stageRequirements: z.object({
    chairCount: z.number().optional(),
    musicStandCount: z.number().optional(),
    microphoneCount: z.number().optional(),
    otherEquipment: z.string(),
    stageRemarks: z.string(),
  }),
});

export type PerformanceData = z.infer<typeof PerformanceDataSchema>;
