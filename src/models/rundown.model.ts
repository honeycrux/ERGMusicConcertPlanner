import { z } from "zod";
import { PerformanceDataSchema } from "./performance.model";

export const RundownDataSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  name: z.string(),
  startTime: z.string().nullable(),
  eventDuration: z.string().nullable(),
  bufferDuration: z.string().nullable(),
  remarks: z.string(),

  updatedAt: z.date(),

  performance: PerformanceDataSchema.nullable(),
});

export type RundownData = z.infer<typeof RundownDataSchema>;

export const EditRundownSchema = RundownDataSchema.omit({
  performance: true,
})
  .partial()
  .extend({
    order: z.number().int().nonnegative(),
    performanceId: z.string().nullable().optional(),
  });

export type EditRundown = z.infer<typeof EditRundownSchema>;

export type EditRundownWithId = EditRundown & { id: string };
