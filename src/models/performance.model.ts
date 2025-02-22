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

export type PerformanceColumnKey =
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

export type PerformanceColumnGroupDefinition = {
  groupLabel: string;
  columns: { label: string; key: PerformanceColumnKey; type: "text" | "numeric"; readOnly?: boolean; default: unknown; width?: number }[];
};

export const performanceColumnGroups: PerformanceColumnGroupDefinition[] = [
  {
    groupLabel: "Performance",
    columns: [
      { label: "ID", key: "id", type: "text", readOnly: true, default: "", width: 200 },
      { label: "Genre", key: "genre", type: "text", default: "" },
      { label: "Piece", key: "piece", type: "text", default: "" },
      { label: "Performance Description", key: "description", type: "text", default: "" },
      { label: "Performer List", key: "performerList", type: "text", default: "" },
      { label: "Performer Description", key: "performerDescription", type: "text", default: "" },
      { label: "General Remarks", key: "remarks", type: "text", default: "" },
    ],
  },
  {
    groupLabel: "Applicant",
    columns: [
      { label: "Applicant Name", key: "applicant.name", type: "text", default: "" },
      { label: "Applicant Email", key: "applicant.email", type: "text", default: "" },
      { label: "Applicant Phone", key: "applicant.phone", type: "text", default: "" },
      { label: "Applicant Remarks", key: "applicant.applicantRemarks", type: "text", default: "" },
    ],
  },
  {
    groupLabel: "Preference",
    columns: [
      { label: "Concert Availability", key: "preference.concertAvailability", type: "text", default: "" },
      { label: "Rehearsal Availability", key: "preference.rehearsalAvailability", type: "text", default: "" },
      { label: "Preference Remarks", key: "preference.preferenceRemarks", type: "text", default: "" },
    ],
  },
  {
    groupLabel: "Stage Requirements",
    columns: [
      { label: "Chair Count", key: "stageRequirement.chairCount", type: "numeric", default: null },
      { label: "Music Stand Count", key: "stageRequirement.musicStandCount", type: "numeric", default: null },
      { label: "Microphone Count", key: "stageRequirement.microphoneCount", type: "numeric", default: null },
      { label: "Provided Equipment", key: "stageRequirement.providedEquipment", type: "text", default: "" },
      { label: "Self Equipment", key: "stageRequirement.selfEquipment", type: "text", default: "" },
      { label: "Stage Remarks", key: "stageRequirement.stageRemarks", type: "text", default: "" },
    ],
  },
];
