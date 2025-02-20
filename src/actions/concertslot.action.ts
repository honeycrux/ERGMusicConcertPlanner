"use server";

import { DatabaseResponse } from "@/db/db.interface";
import {
  EditRundownSlotData,
  EditRundownSlotDataSchema,
  PerformanceRundownView,
  rundownSlotColumns,
  RundownSlotData,
  RundownSlotLabelDefinition,
  RundownSlotLabelKey,
} from "@/models/rundown.model";
import { getAvailablePerformancesUsecase, getConcertSlotDataUsecase, saveConcertSlotDataUsecase } from "@/usecases/concertslot.usecase";
import { revalidatePath } from "next/cache";

export async function getConcertSlotDataController(): Promise<DatabaseResponse<{ rundownSlots: RundownSlotData[]; performances: PerformanceRundownView[] }>> {
  const consertSlotResult = await getConcertSlotDataUsecase();

  if (!consertSlotResult.success) {
    return {
      success: false,
      message: "Failed to get concert slot data",
    };
  }

  const performanceResult = await getAvailablePerformancesUsecase();

  if (!performanceResult.success) {
    return {
      success: false,
      message: "Failed to get performance data",
    };
  }

  return {
    success: true,
    data: {
      rundownSlots: consertSlotResult.data,
      performances: performanceResult.data,
    },
  };
}

function isEmptyCell(cell: unknown): boolean {
  return cell === undefined || cell === null || cell === "";
}

function extractValueFromRow(row: unknown[], allColumns: RundownSlotLabelDefinition["columns"], key: RundownSlotLabelKey): unknown {
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

export async function saveConcertSlotDataController(data: unknown[][]) {
  console.log(data);
  const allColumns = rundownSlotColumns.flatMap((column) => column.columns);

  const newData: EditRundownSlotData[] = [];

  for (const rowIndex in data) {
    const row = data[rowIndex];

    if (row.every((entry) => isEmptyCell(entry))) {
      // Skip
      continue;
    }

    const concertSlot = {
      id: extractValueFromRow(row, allColumns, "id"),
      order: Number(rowIndex) + 1,
      name: extractValueFromRow(row, allColumns, "name"),
      startTime: extractValueFromRow(row, allColumns, "startTime"),
      eventDuration: extractValueFromRow(row, allColumns, "eventDuration"),
      bufferDuration: extractValueFromRow(row, allColumns, "bufferDuration"),
      remarks: extractValueFromRow(row, allColumns, "remarks"),
      performanceId: extractValueFromRow(row, allColumns, "performance.id"),
    };

    const { data: parsedData, error, success } = EditRundownSlotDataSchema.safeParse(concertSlot);

    if (!success) {
      console.error("Failed to parse data", error);
      return {
        success: false,
        message: "Failed to parse data",
      };
    }

    newData.push(parsedData);
  }
  console.log(newData);

  const result = await saveConcertSlotDataUsecase(newData);

  if (result.needToRefresh) {
    revalidatePath("/rundown");
  }

  return result;
}
