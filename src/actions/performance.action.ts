"use server";

import { DatabaseResponse } from "@/db/db.interface";
import {
  EditPerformanceData,
  EditPerformanceDataSchema,
  performanceColumns,
  PerformanceData,
  PerformanceLabelDefinition,
  PerformanceLabelKey,
} from "@/models/performance.model";
import { getPerformanceDataUsecase, savePerformanceDataUsecase } from "@/usecases/performance.usecase";
import { revalidatePath } from "next/cache";

export type PerformanceDataEditView = Pick<PerformanceData, "id" | "genre" | "piece" | "description" | "performerList" | "performerDescription" | "remarks"> & {
  applicant: Pick<PerformanceData["applicant"], "name" | "email" | "phone" | "applicantRemarks">;
  preference: Pick<PerformanceData["preference"], "concertAvailability" | "rehearsalAvailability" | "preferenceRemarks">;
  stageRequirement: Pick<PerformanceData["stageRequirement"], "chairCount" | "musicStandCount" | "microphoneCount" | "otherEquipment" | "stageRemarks">;
};

function performanceDataPresenter(data: PerformanceData[]): PerformanceDataEditView[] {
  return data.map((performance) => {
    return {
      id: performance.id,
      genre: performance.genre,
      piece: performance.piece,
      description: performance.description,
      performerList: performance.performerList,
      performerDescription: performance.performerDescription,
      remarks: performance.remarks,
      applicant: {
        name: performance.applicant.name,
        email: performance.applicant.email,
        phone: performance.applicant.phone,
        applicantRemarks: performance.applicant.applicantRemarks,
      },
      preference: {
        concertAvailability: performance.preference.concertAvailability,
        rehearsalAvailability: performance.preference.rehearsalAvailability,
        preferenceRemarks: performance.preference.preferenceRemarks,
      },
      stageRequirement: {
        chairCount: performance.stageRequirement.chairCount,
        musicStandCount: performance.stageRequirement.musicStandCount,
        microphoneCount: performance.stageRequirement.microphoneCount,
        otherEquipment: performance.stageRequirement.otherEquipment,
        stageRemarks: performance.stageRequirement.stageRemarks,
      },
    };
  });
}

export async function getPerformanceDataController(): Promise<DatabaseResponse<ReturnType<typeof performanceDataPresenter>>> {
  const result = await getPerformanceDataUsecase();

  if (!result.success) {
    return {
      success: false,
      message: "Failed to get performance data",
    };
  }

  return {
    success: true,
    data: performanceDataPresenter(result.data),
  };
}

function isEmptyCell(cell: unknown): boolean {
  return cell === undefined || cell === null || cell === "";
}

function extractValueFromRow(row: unknown[], allColumns: PerformanceLabelDefinition["columns"], key: PerformanceLabelKey): unknown {
  const columnIndex = allColumns.findIndex((column) => column.key === key);

  if (columnIndex === -1) {
    // This should never happen
    throw new Error(`Column with key ${key} not found`);
  }

  const columnValue = row[columnIndex];
  const columnDefinition = allColumns[columnIndex];
  const { default: defaultValue } = columnDefinition;

  if (isEmptyCell(columnValue)) {
    return defaultValue;
  }

  return columnValue;
}

export async function savePerformanceDataController(data: unknown[][]) {
  console.log(data);
  const allColumns = performanceColumns.flatMap((column) => column.columns);

  const newData: EditPerformanceData[] = [];

  for (const rowIndex in data) {
    const row = data[rowIndex];

    if (row.every((entry) => isEmptyCell(entry))) {
      // Skip
      continue;
    }

    const performance = {
      id: extractValueFromRow(row, allColumns, "id"),
      genre: extractValueFromRow(row, allColumns, "genre"),
      piece: extractValueFromRow(row, allColumns, "piece"),
      description: extractValueFromRow(row, allColumns, "description"),
      performerList: extractValueFromRow(row, allColumns, "performerList"),
      performerDescription: extractValueFromRow(row, allColumns, "performerDescription"),
      remarks: extractValueFromRow(row, allColumns, "remarks"),
      applicant: {
        name: extractValueFromRow(row, allColumns, "applicant.name"),
        email: extractValueFromRow(row, allColumns, "applicant.email"),
        phone: extractValueFromRow(row, allColumns, "applicant.phone"),
        applicantRemarks: extractValueFromRow(row, allColumns, "applicant.applicantRemarks"),
      },
      preference: {
        concertAvailability: extractValueFromRow(row, allColumns, "preference.concertAvailability"),
        rehearsalAvailability: extractValueFromRow(row, allColumns, "preference.rehearsalAvailability"),
        preferenceRemarks: extractValueFromRow(row, allColumns, "preference.preferenceRemarks"),
      },
      stageRequirement: {
        chairCount: extractValueFromRow(row, allColumns, "stageRequirement.chairCount"),
        musicStandCount: extractValueFromRow(row, allColumns, "stageRequirement.musicStandCount"),
        microphoneCount: extractValueFromRow(row, allColumns, "stageRequirement.microphoneCount"),
        otherEquipment: extractValueFromRow(row, allColumns, "stageRequirement.otherEquipment"),
        stageRemarks: extractValueFromRow(row, allColumns, "stageRequirement.stageRemarks"),
      },
    };

    const { data: parsedData, error, success } = EditPerformanceDataSchema.safeParse(performance);

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
