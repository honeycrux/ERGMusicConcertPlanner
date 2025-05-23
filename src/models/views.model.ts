import { z } from "zod";
import { RundownDataSchema } from "./rundown.model";
import { PerformanceDataSchema } from "./performance.model";

/* Views for browsing */

export const PreferenceViewSchema = z.object({
  id: z.string(),
  genre: z.string(),
  applicant: z.object({
    name: z.string(),
  }),
  preference: z.object({
    performDuration: z.string().nullable(),
    concertAvailability: z.string(),
    rehearsalAvailability: z.string(),
    preferenceRemarks: z.string(),
  }),
});

export type PreferenceView = z.infer<typeof PreferenceViewSchema>;

export const PerformanceDetailViewSchema = z.object({
  timeSlot: z.object({
    order: z.number(),
    name: z.string(),
    startTime: z.string(),
    duration: z.string(),
  }),
  performance: z
    .object({
      genre: z.string(),
      applicant: z.object({
        name: z.string(),
      }),
      piece: z.string(),
      description: z.string(),
      performerList: z.string(),
      performerDescription: z.string(),
      remarks: z.string(),
    })
    .nullable(),
});

export type PerformanceDetailView = z.infer<typeof PerformanceDetailViewSchema>;

export const StageRequirementViewSchema = z.object({
  timeSlot: z.object({
    order: z.number(),
    name: z.string(),
    startTime: z.string(),
    duration: z.string(),
    stageActions: z.string(),
  }),
  performance: z
    .object({
      genre: z.string(),
      applicant: z.object({
        name: z.string(),
      }),
      stageRequirement: z.object({
        chairCount: z.number().int().nonnegative().nullable(),
        musicStandCount: z.number().int().nonnegative().nullable(),
        microphoneCount: z.number().int().nonnegative().nullable(),
        providedEquipment: z.string(),
        selfEquipment: z.string(),
        stageRemarks: z.string(),
      }),
    })
    .nullable(),
});

export type StageRequirementView = z.infer<typeof StageRequirementViewSchema>;

export const ApplicantDetailViewSchema = z.object({
  timeSlot: z.object({
    order: z.number(),
    name: z.string(),
    startTime: z.string(),
    duration: z.string(),
  }),
  performance: z
    .object({
      genre: z.string(),
      applicant: z.object({
        name: z.string(),
        email: z.string(),
        phone: z.string(),
        applicantRemarks: z.string(),
      }),
      preference: z.object({
        performDuration: z.string().nullable(),
        concertAvailability: z.string(),
        rehearsalAvailability: z.string(),
        preferenceRemarks: z.string(),
      }),
    })
    .nullable(),
});

export type ApplicantDetailView = z.infer<typeof ApplicantDetailViewSchema>;

/* Views for editing */

export const PerformanceEditFormSchema = PerformanceDataSchema;

export type PerformanceEditForm = z.infer<typeof PerformanceEditFormSchema>;

export const RundownEditFormSchema = RundownDataSchema.omit({
  performance: true,
}).extend({
  timeSlot: z.object({
    startTime: z.string(),
    duration: z.string(),
  }),
  performance: PreferenceViewSchema.nullable(),
});

export type RundownEditForm = z.infer<typeof RundownEditFormSchema>;
