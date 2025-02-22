"use server";

import { EditRundown, EditRundownSchema } from "@/models/rundown.model";
import { saveConcertSlotDataUsecase } from "@/usecases/save-rundown-data.usecase";
import { revalidatePath } from "next/cache";

export type RundownColumnKey =
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

const rundownKeyDefaults: Record<RundownColumnKey, unknown> = {
  id: "",
  order: "",
  name: "",
  startTime: null,
  eventDuration: null,
  bufferDuration: null,
  remarks: "",
  "performance.id": undefined,
  "performance.genre": "",
  "performance.applicant.name": "",
  "preference.concertAvailability": "",
  "preference.rehearsalAvailability": "",
  "preference.preferenceRemarks": "",
};

function isEmptyCell(cell: unknown): boolean {
  return cell === undefined || cell === null || cell === "";
}

export async function saveConcertSlotDataController(data: unknown[][], keyOrder: RundownColumnKey[]) {
  console.log(data);

  const newData: EditRundown[] = [];

  for (const rowIndex in data) {
    const row = data[rowIndex];

    if (row.every((entry) => isEmptyCell(entry))) {
      // Skip
      continue;
    }

    for (const colIndex in row) {
      if (isEmptyCell(row[colIndex])) {
        row[colIndex] = rundownKeyDefaults[keyOrder[colIndex]];
      }
    }

    const concertSlot = {
      id: row[keyOrder.indexOf("id")],
      order: Number(rowIndex) + 1,
      name: row[keyOrder.indexOf("name")],
      startTime: row[keyOrder.indexOf("startTime")],
      eventDuration: row[keyOrder.indexOf("eventDuration")],
      bufferDuration: row[keyOrder.indexOf("bufferDuration")],
      remarks: row[keyOrder.indexOf("remarks")],
      performanceId: row[keyOrder.indexOf("performance.id")],
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
