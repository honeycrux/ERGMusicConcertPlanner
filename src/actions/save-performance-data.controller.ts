"use server";

import { EditPerformance, EditPerformanceSchema } from "@/models/performance.model";
import { savePerformanceDataUsecase } from "@/usecases/save-performance-data.usecase";
import { revalidatePath } from "next/cache";

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

const performanceKeyDefaults: Record<PerformanceColumnKey, unknown> = {
  id: "",
  genre: "",
  piece: "",
  description: "",
  performerList: "",
  performerDescription: "",
  remarks: "",
  "applicant.name": "",
  "applicant.email": "",
  "applicant.phone": "",
  "applicant.applicantRemarks": "",
  "preference.concertAvailability": "",
  "preference.rehearsalAvailability": "",
  "preference.preferenceRemarks": "",
  "stageRequirement.chairCount": null,
  "stageRequirement.musicStandCount": null,
  "stageRequirement.microphoneCount": null,
  "stageRequirement.providedEquipment": "",
  "stageRequirement.selfEquipment": "",
  "stageRequirement.stageRemarks": "",
};

function isEmptyCell(cell: unknown): boolean {
  return cell === undefined || cell === null || cell === "";
}

export async function savePerformanceDataController(data: unknown[][], keyOrder: PerformanceColumnKey[]) {
  console.log(data);

  const newData: EditPerformance[] = [];

  for (const rowIndex in data) {
    const row = data[rowIndex];

    if (row.every((entry) => isEmptyCell(entry))) {
      // Skip
      continue;
    }

    for (const colIndex in row) {
      if (isEmptyCell(row[colIndex])) {
        row[colIndex] = performanceKeyDefaults[keyOrder[colIndex]];
      }
    }

    const performance = {
      id: row[keyOrder.indexOf("id")],
      genre: row[keyOrder.indexOf("genre")],
      piece: row[keyOrder.indexOf("piece")],
      description: row[keyOrder.indexOf("description")],
      performerList: row[keyOrder.indexOf("performerList")],
      performerDescription: row[keyOrder.indexOf("performerDescription")],
      remarks: row[keyOrder.indexOf("remarks")],
      applicant: {
        name: row[keyOrder.indexOf("applicant.name")],
        email: row[keyOrder.indexOf("applicant.email")],
        phone: row[keyOrder.indexOf("applicant.phone")],
        applicantRemarks: row[keyOrder.indexOf("applicant.applicantRemarks")],
      },
      preference: {
        concertAvailability: row[keyOrder.indexOf("preference.concertAvailability")],
        rehearsalAvailability: row[keyOrder.indexOf("preference.rehearsalAvailability")],
        preferenceRemarks: row[keyOrder.indexOf("preference.preferenceRemarks")],
      },
      stageRequirement: {
        chairCount: row[keyOrder.indexOf("stageRequirement.chairCount")],
        musicStandCount: row[keyOrder.indexOf("stageRequirement.musicStandCount")],
        microphoneCount: row[keyOrder.indexOf("stageRequirement.microphoneCount")],
        providedEquipment: row[keyOrder.indexOf("stageRequirement.providedEquipment")],
        selfEquipment: row[keyOrder.indexOf("stageRequirement.selfEquipment")],
        stageRemarks: row[keyOrder.indexOf("stageRequirement.stageRemarks")],
      },
    };

    const { data: parsedData, error, success } = EditPerformanceSchema.safeParse(performance);

    if (!success) {
      return {
        success: false,
        message: `Failed to parse row ${rowIndex}: ${error.message}`,
      };
    }

    newData.push(parsedData);
  }

  const result = await savePerformanceDataUsecase(newData);

  if (result.needToRefresh) {
    revalidatePath("/performance");
  }

  return result;
}
