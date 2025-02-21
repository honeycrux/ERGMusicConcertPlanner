"use server";

import { EditRundown, EditRundownSchema, rundownColumnGroups, RundownColumnGroupDefinition, RundownColumnKey } from "@/models/rundown.model";
import { saveConcertSlotDataUsecase } from "@/usecases/save-rundown-data.usecase";
import { revalidatePath } from "next/cache";

function isEmptyCell(cell: unknown): boolean {
  return cell === undefined || cell === null || cell === "";
}

function extractValueFromRow(row: unknown[], allColumns: RundownColumnGroupDefinition["columns"], key: RundownColumnKey): unknown {
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
  const allColumns = rundownColumnGroups.flatMap((column) => column.columns);

  const newData: EditRundown[] = [];

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

    const { data: parsedData, error, success } = EditRundownSchema.safeParse(concertSlot);

    if (!success) {
      console.error("Failed to parse data", error);
      return {
        success: false,
        message: "Failed to parse data ",
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
