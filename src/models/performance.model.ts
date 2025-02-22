import { z } from "zod";

export const PerformanceDataSchema = z.object({
  id: z.string(),
  genre: z.string(),
  piece: z.string(),
  description: z.string(),
  performerList: z.string(),
  performerDescription: z.string(),
  remarks: z.string(),

  updatedAt: z.date(),

  applicant: z.object({
    name: z.string(),
    email: z.string(),
    phone: z.string(),
    applicantRemarks: z.string(),

    updatedAt: z.date(),
  }),

  preference: z.object({
    concertAvailability: z.string(),
    rehearsalAvailability: z.string(),
    preferenceRemarks: z.string(),

    updatedAt: z.date(),
  }),

  stageRequirement: z.object({
    chairCount: z.number().int().nonnegative().nullable(),
    musicStandCount: z.number().int().nonnegative().nullable(),
    microphoneCount: z.number().int().nonnegative().nullable(),
    providedEquipment: z.string(),
    selfEquipment: z.string(),
    stageRemarks: z.string(),

    updatedAt: z.date(),
  }),
});

export type PerformanceData = z.infer<typeof PerformanceDataSchema>;

export const EditPerformanceSchema = PerformanceDataSchema.extend({
  applicant: PerformanceDataSchema.shape.applicant.partial(),
  preference: PerformanceDataSchema.shape.preference.partial(),
  stageRequirement: PerformanceDataSchema.shape.stageRequirement.partial(),
}).partial();

export type EditPerformance = z.infer<typeof EditPerformanceSchema>;

export type EditPerformanceWithId = EditPerformance & { id: string };
