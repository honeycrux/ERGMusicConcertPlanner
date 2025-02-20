import { z } from "zod";

export const PerformanceRundownViewSchema = z.object({
  id: z.string(),
  genre: z.string(),
  piece: z.string(),
  applicant: z.object({
    name: z.string(),
  }),
});

export type PerformanceRundownView = z.infer<typeof PerformanceRundownViewSchema>;

export const RundownSlotDataSchema = z.object({
  id: z.string(),
  order: z.number().int().nonnegative(),
  name: z.string(),
  startTime: z.date().nullable(),
  eventDuration: z.number().nonnegative(),
  bufferDuration: z.number().nonnegative(),
  remarks: z.string(),

  updatedAt: z.date(),

  performance: PerformanceRundownViewSchema.nullable(),
});

export type RundownSlotData = z.infer<typeof RundownSlotDataSchema>;

export const EditRundownSlotDataSchema = RundownSlotDataSchema.omit({
  performance: true,
})
  .partial()
  .extend({
    order: z.number().int().nonnegative(),
    performanceId: z.string().nullable().optional(),
  });

export type EditRundownSlotData = z.infer<typeof EditRundownSlotDataSchema>;

export type EditRundownSlotDataWithId = EditRundownSlotData & { id: string };

export type RundownSlotLabelKey =
  | "id"
  | "order"
  | "name"
  | "startTime"
  | "eventDuration"
  | "bufferDuration"
  | "remarks"
  | "performance.id"
  | "performance.genre"
  | "performance.piece"
  | "performance.applicant.name";

export type RundownSlotLabelDefinition = {
  groupLabel: string;
  columns: { label: string; key: RundownSlotLabelKey; type: "text" | "numeric" | "time" | "dropdown"; readOnly?: boolean; default: unknown; width?: number }[];
};

export const rundownSlotColumns: RundownSlotLabelDefinition[] = [
  {
    groupLabel: "Time Slot",
    columns: [
      { label: "ID", key: "id", type: "text", readOnly: true, default: "", width: 200 },
      { label: "Order", key: "order", type: "numeric", readOnly: true, default: "" },
      { label: "Name", key: "name", type: "text", default: "" },
      { label: "Start Time", key: "startTime", type: "time", default: null },
      { label: "Event Duration", key: "eventDuration", type: "numeric", default: undefined },
      { label: "Buffer Duration", key: "bufferDuration", type: "numeric", default: undefined },
      { label: "Remarks", key: "remarks", type: "text", default: "" },
    ],
  },
  {
    groupLabel: "Performance",
    columns: [
      { label: "ID", key: "performance.id", type: "dropdown", default: undefined, width: 220 },
      { label: "Genre", key: "performance.genre", type: "text", readOnly: true, default: "" },
      { label: "Piece", key: "performance.piece", type: "text", readOnly: true, default: "" },
      { label: "Applicant Name", key: "performance.applicant.name", type: "text", readOnly: true, default: "" },
    ],
  },
];
