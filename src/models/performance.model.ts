import { z } from "zod";

export const PerformanceDataSchema = z.object({
  id: z.string(),
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
    updatedAt: z.date(),
  }),
  preference: z.object({
    concertAvailability: z.string(),
    rehearsalAvailability: z.string(),
    preferenceRemarks: z.string(),
    updatedAt: z.date(),
  }),
  stageRequirement: z.object({
    chairCount: z.number().nullable(),
    musicStandCount: z.number().nullable(),
    microphoneCount: z.number().nullable(),
    otherEquipment: z.string(),
    stageRemarks: z.string(),
    updatedAt: z.date(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PerformanceData = z.infer<typeof PerformanceDataSchema>;

export const EditPerformanceDataSchema = PerformanceDataSchema.extend({
  applicant: PerformanceDataSchema.shape.applicant.partial(),
  preference: PerformanceDataSchema.shape.preference.partial(),
  stageRequirement: PerformanceDataSchema.shape.stageRequirement.partial(),
}).partial();

export type EditPerformanceData = z.infer<typeof EditPerformanceDataSchema>;

export type PerformanceLabelKey =
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
  | "stageRequirement.otherEquipment"
  | "stageRequirement.stageRemarks";

export type PerformanceLabelDefinition = {
  groupLabel: string;
  columns: { label: string; key: PerformanceLabelKey; type: "text" | "numeric"; readOnly?: boolean; default: unknown }[];
};

export const performanceColumns: PerformanceLabelDefinition[] = [
  {
    groupLabel: "Performance",
    columns: [
      { label: "ID", key: "id", type: "text", readOnly: true, default: "" },
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
      { label: "Other Equipment", key: "stageRequirement.otherEquipment", type: "text", default: "" },
      { label: "Stage Remarks", key: "stageRequirement.stageRemarks", type: "text", default: "" },
    ],
  },
];

export function performanceEquals(a: EditPerformanceData, b: EditPerformanceData) {
  return (
    a.genre === b.genre &&
    a.piece === b.piece &&
    a.description === b.description &&
    a.performerList === b.performerList &&
    a.performerDescription === b.performerDescription &&
    a.remarks === b.remarks &&
    a.applicant?.name === b.applicant?.name &&
    a.applicant?.email === b.applicant?.email &&
    a.applicant?.phone === b.applicant?.phone &&
    a.applicant?.applicantRemarks === b.applicant?.applicantRemarks &&
    a.preference?.concertAvailability === b.preference?.concertAvailability &&
    a.preference?.rehearsalAvailability === b.preference?.rehearsalAvailability &&
    a.preference?.preferenceRemarks === b.preference?.preferenceRemarks &&
    a.stageRequirement?.chairCount === b.stageRequirement?.chairCount &&
    a.stageRequirement?.musicStandCount === b.stageRequirement?.musicStandCount &&
    a.stageRequirement?.microphoneCount === b.stageRequirement?.microphoneCount &&
    a.stageRequirement?.otherEquipment === b.stageRequirement?.otherEquipment &&
    a.stageRequirement?.stageRemarks === b.stageRequirement?.stageRemarks
  );
}
