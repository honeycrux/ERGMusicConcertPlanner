"use server";

import {
  EditPerformance,
  EditPerformanceSchema,
  performanceColumnGroups,
  PerformanceColumnGroupDefinition,
  PerformanceColumnKey,
} from "@/models/performance.model";
import { savePerformanceDataUsecase } from "@/usecases/save-performance-data.usecase";
import { revalidatePath } from "next/cache";

function isEmptyCell(cell: unknown): boolean {
  return cell === undefined || cell === null || cell === "";
}

function extractValueFromRow(row: unknown[], allColumns: PerformanceColumnGroupDefinition["columns"], key: PerformanceColumnKey): unknown {
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
  const allColumns = performanceColumnGroups.flatMap((column) => column.columns);

  const newData: EditPerformance[] = [];

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
