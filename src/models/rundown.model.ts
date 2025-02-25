import { z } from "zod";
import { PerformanceDataSchema } from "./performance.model";
import { DataColumn } from "./DataColumn";
import { DateTime, Duration } from "luxon";

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
    performanceId: z.string().nullable().optional(),
  });

export type EditRundown = z.infer<typeof EditRundownSchema>;

export type EditRundownWithOrder = EditRundown & { order: number };

export type EditRundownWithId = EditRundown & { id: string };

export type RundownType = "concert" | "rehearsal";

export type RundownControlKey =
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

export const rundownDataColumns: Record<RundownControlKey, DataColumn<RundownData, EditRundown>> = {
  id: new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  order: new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  name: new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.name;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditRundownSchema.shape.name.parse(sanitizedValue);
      data.name = value;
    },
  }),
  startTime: new DataColumn<RundownData, EditRundown>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.startTime;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditRundownSchema.shape.startTime.parse(sanitizedValue);
      if (value && !DateTime.fromISO(value).isValid) {
        throw new Error(`Invalid ISO datetime ${value}`);
      }
      data.startTime = value;
    },
  }),
  eventDuration: new DataColumn<RundownData, EditRundown>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.eventDuration;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditRundownSchema.shape.eventDuration.parse(sanitizedValue);
      if (value && !Duration.fromISO(value).isValid) {
        throw new Error(`Invalid ISO duration ${value}`);
      }
      data.eventDuration = value;
    },
  }),
  bufferDuration: new DataColumn<RundownData, EditRundown>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.bufferDuration;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditRundownSchema.shape.bufferDuration.parse(sanitizedValue);
      if (value && !Duration.fromISO(value).isValid) {
        throw new Error(`Invalid ISO duration ${value}`);
      }
      data.bufferDuration = value;
    },
  }),
  remarks: new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.remarks;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditRundownSchema.shape.remarks.parse(sanitizedValue);
      data.remarks = value;
    },
  }),
  "performance.id": new DataColumn<RundownData, EditRundown>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.performance?.id;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditRundownSchema.shape.performanceId.parse(sanitizedValue);
      data.performanceId = value;
    },
  }),
  "performance.genre": new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  "performance.applicant.name": new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  "preference.concertAvailability": new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  "preference.rehearsalAvailability": new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  "preference.preferenceRemarks": new DataColumn<RundownData, EditRundown>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
};
