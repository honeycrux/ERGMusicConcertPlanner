import { createPerformances, deletePerformances, getPerformanceById, updatePerformances } from "@/db/performance.repo";
import { EditPerformance, EditPerformanceWithId, PerformanceControlKey, performanceDataColumns } from "@/models/performance.model";
import { DataAction, DataActionResponse } from "./data-action.interface";

export async function createPerformanceDataUsecase(actions: DataAction[]): Promise<DataActionResponse> {
  const editPerformance: EditPerformance = {};

  for (const action of actions) {
    const key = action.key;
    if (!(key in performanceDataColumns)) {
      return { processed: false, success: false, message: `Exception: Unexpected key: ${key}` };
    }
    const column = performanceDataColumns[key as PerformanceControlKey];
    try {
      column.applyOnCreate({
        oldValue: action.oldValue,
        newValue: action.newValue,
        editData: editPerformance,
      });
    } catch (error) {
      console.error("Failed to apply update", error);
      return { processed: false, success: false, message: `Failed to apply update: ${error}` };
    }
  }

  const result = await createPerformances([editPerformance]);

  if (!result.success) {
    return { processed: true, success: false, message: result.message };
  }
  return { processed: true, success: true, message: "Successfully created performance data." };
}

export async function updatePerformanceDataUsecase(actions: DataAction[], id: string) {
  const editPerformance: EditPerformanceWithId = { id };
  const databaseResult = await getPerformanceById(id);

  if (!databaseResult.success) {
    return { processed: false, success: false, message: databaseResult.message };
  }

  const databaseRecord = databaseResult.data;

  for (const action of actions) {
    const key = action.key;
    if (!(key in performanceDataColumns)) {
      return { processed: false, success: false, message: `Exception: Unexpected key: ${key}` };
    }
    const column = performanceDataColumns[key as PerformanceControlKey];
    try {
      column.applyOnUpdate({
        oldValue: action.oldValue,
        newValue: action.newValue,
        databaseRecord,
        editData: editPerformance,
      });
    } catch (error) {
      console.error("Failed to apply update", error);
      return { processed: false, success: false, message: `Failed to apply update: ${error}` };
    }
  }

  const result = await updatePerformances([editPerformance]);

  if (!result.success) {
    return { processed: true, success: false, message: result.message };
  }
  return { processed: true, success: true, message: "Successfully updated performance data." };
}

export async function deletePerformanceDataUsecase(id: string) {
  const result = await deletePerformances([id]);

  if (!result.success) {
    return { processed: false, success: false, message: result.message };
  }
  return { processed: true, success: true, message: "Successfully deleted performance data." };
}
