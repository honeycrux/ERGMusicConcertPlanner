import { z } from "zod";
import { DataColumn } from "./DataColumn";

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

export type PerformanceControlKey =
  | "id"
  | "genre"
  | "piece"
  | "description"
  | "performerList"
  | "performerDescription"
  | "remarks"
  | "applicant.name"
  | "applicant.email"
  | "applicant.phone"
  | "applicant.applicantRemarks"
  | "preference.concertAvailability"
  | "preference.rehearsalAvailability"
  | "preference.preferenceRemarks"
  | "stageRequirement.chairCount"
  | "stageRequirement.musicStandCount"
  | "stageRequirement.microphoneCount"
  | "stageRequirement.providedEquipment"
  | "stageRequirement.selfEquipment"
  | "stageRequirement.stageRemarks";

export const performanceDataColumns: Record<PerformanceControlKey, DataColumn<PerformanceData, EditPerformance>> = {
  id: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue() {},
    setEditModelValue() {},
  }),
  genre: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.genre;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.genre.parse(sanitizedValue);
      data.genre = value;
    },
  }),
  piece: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.piece;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.piece.parse(sanitizedValue);
      data.piece = value;
    },
  }),
  description: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.description;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.description.parse(sanitizedValue);
      data.description = value;
    },
  }),
  performerList: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.performerList;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.performerList.parse(sanitizedValue);
      data.performerList = value;
    },
  }),
  performerDescription: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.performerDescription;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.performerDescription.parse(sanitizedValue);
      data.performerDescription = value;
    },
  }),
  remarks: new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.remarks;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.remarks.parse(sanitizedValue);
      data.remarks = value;
    },
  }),
  "applicant.name": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.applicant.name;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.applicant.unwrap().shape.name.parse(sanitizedValue);
      data.applicant ??= {};
      data.applicant.name = value;
    },
  }),
  "applicant.email": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.applicant.email;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.applicant.unwrap().shape.email.parse(sanitizedValue);
      data.applicant ??= {};
      data.applicant.email = value;
    },
  }),
  "applicant.phone": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.applicant.phone;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.applicant.unwrap().shape.phone.parse(sanitizedValue);
      data.applicant ??= {};
      data.applicant.phone = value;
    },
  }),
  "applicant.applicantRemarks": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.applicant.applicantRemarks;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.applicant.unwrap().shape.applicantRemarks.parse(sanitizedValue);
      data.applicant ??= {};
      data.applicant.applicantRemarks = value;
    },
  }),
  "preference.concertAvailability": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.preference.concertAvailability;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.preference.unwrap().shape.concertAvailability.parse(sanitizedValue);
      data.preference ??= {};
      data.preference.concertAvailability = value;
    },
  }),
  "preference.rehearsalAvailability": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.preference.rehearsalAvailability;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.preference.unwrap().shape.rehearsalAvailability.parse(sanitizedValue);
      data.preference ??= {};
      data.preference.rehearsalAvailability = value;
    },
  }),
  "preference.preferenceRemarks": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.preference.preferenceRemarks;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.preference.unwrap().shape.preferenceRemarks.parse(sanitizedValue);
      data.preference ??= {};
      data.preference.preferenceRemarks = value;
    },
  }),
  "stageRequirement.chairCount": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.stageRequirement.chairCount;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.stageRequirement.unwrap().shape.chairCount.parse(sanitizedValue);
      data.stageRequirement ??= {};
      data.stageRequirement.chairCount = value;
    },
  }),
  "stageRequirement.musicStandCount": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.stageRequirement.musicStandCount;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.stageRequirement.unwrap().shape.musicStandCount.parse(sanitizedValue);
      data.stageRequirement ??= {};
      data.stageRequirement.musicStandCount = value;
    },
  }),
  "stageRequirement.microphoneCount": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: null,
    getDbModelValue(data) {
      return data.stageRequirement.microphoneCount;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.stageRequirement.unwrap().shape.microphoneCount.parse(sanitizedValue);
      data.stageRequirement ??= {};
      data.stageRequirement.microphoneCount = value;
    },
  }),
  "stageRequirement.providedEquipment": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.stageRequirement.providedEquipment;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.stageRequirement.unwrap().shape.providedEquipment.parse(sanitizedValue);
      data.stageRequirement ??= {};
      data.stageRequirement.providedEquipment = value;
    },
  }),
  "stageRequirement.selfEquipment": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.stageRequirement.selfEquipment;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.stageRequirement.unwrap().shape.selfEquipment.parse(sanitizedValue);
      data.stageRequirement ??= {};
      data.stageRequirement.selfEquipment = value;
    },
  }),
  "stageRequirement.stageRemarks": new DataColumn<PerformanceData, EditPerformance>({
    defaultValue: "",
    getDbModelValue(data) {
      return data.stageRequirement.stageRemarks;
    },
    setEditModelValue(data, sanitizedValue) {
      const value = EditPerformanceSchema.shape.stageRequirement.unwrap().shape.stageRemarks.parse(sanitizedValue);
      data.stageRequirement ??= {};
      data.stageRequirement.stageRemarks = value;
    },
  }),
};
