import { z } from "zod";
import { PerformanceDataSchema } from "./performance.model";

export const RundownDataSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  name: z.string(),
  startTime: z.string().nullable(),
  eventDuration: z.string(),
  bufferDuration: z.string(),
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

export type RundownColumnKey =
  | "id"
  | "order"
  | "name"
  | "startTime"
  | "eventDuration"
  | "bufferDuration"
  | "remarks"
  | "performance.id"
  | "performance.genre"
  | "performance.applicant.name"
  | "preference.concertAvailability"
  | "preference.rehearsalAvailability"
  | "preference.preferenceRemarks";

export type RundownColumnGroupDefinition = {
  groupLabel: string;
  columns: { label: string; key: RundownColumnKey; type: "text" | "numeric" | "time" | "dropdown"; readOnly?: boolean; default: unknown; width?: number }[];
};

export const rundownColumnGroups: RundownColumnGroupDefinition[] = [
  {
    groupLabel: "Time Slot",
    columns: [
      { label: "ID", key: "id", type: "text", readOnly: true, default: "", width: 200 },
      { label: "Order", key: "order", type: "numeric", readOnly: true, default: "" },
      { label: "Name", key: "name", type: "text", default: "" },
      { label: "Start Time", key: "startTime", type: "numeric", default: null },
      { label: "Event Duration", key: "eventDuration", type: "numeric", default: undefined },
      { label: "Buffer Duration", key: "bufferDuration", type: "numeric", default: undefined },
      { label: "Remarks", key: "remarks", type: "text", default: "" },
    ],
  },
  {
    groupLabel: "Performance",
    columns: [
      { label: "ID", key: "performance.id", type: "dropdown", readOnly: true, default: undefined, width: 220 },
      { label: "Genre", key: "performance.genre", type: "text", readOnly: true, default: "" },
      { label: "Applicant Name", key: "performance.applicant.name", type: "text", readOnly: true, default: "" },
      { label: "Concert Availability", key: "preference.concertAvailability", type: "text", readOnly: true, default: "" },
      { label: "Rehearsal Availability", key: "preference.rehearsalAvailability", type: "text", readOnly: true, default: "" },
      { label: "Preference Remarks", key: "preference.preferenceRemarks", type: "text", readOnly: true, default: "" },
    ],
  },
];
