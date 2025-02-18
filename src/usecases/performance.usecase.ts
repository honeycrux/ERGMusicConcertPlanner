import { DatabaseChanges, DatabaseResponse } from "@/db/db.interface";
import { createPerformances, updatePerformances, getAllPerformances, deletePerformances } from "@/db/performance.repo";
import { EditPerformanceData, PerformanceData, performanceEquals } from "@/models/performance.model";

export async function getPerformanceDataUsecase(): Promise<DatabaseResponse<PerformanceData[]>> {
  const result = await getAllPerformances();
  return result;
}

async function getChanges(newData: EditPerformanceData[]): Promise<DatabaseResponse<DatabaseChanges<EditPerformanceData>>> {
  const existingData = await getAllPerformances();
  if (!existingData.success) {
    return {
      success: false,
      message: "Failed to get original data",
    };
  }

  const existingDataMap = new Map<string, PerformanceData>(existingData.data.map((p) => [p.id, p]));
  const existingIds = new Set(existingDataMap.keys());
  const newIds = new Set(newData.filter((p) => "id" in p).map((p) => p.id));

  const addList: EditPerformanceData[] = [];
  const updateList: {
    id: string;
    data: EditPerformanceData;
  }[] = [];
  const deleteIds: string[] = [...existingIds.difference(newIds)];

  for (const performance of newData) {
    if (performance.id) {
      const existingPerformance = existingDataMap.get(performance.id);

      if (!existingPerformance) {
        return {
          success: false,
          message: `Exception: Performance with ID "${performance.id}" not found`,
        };
      }

      if (!performanceEquals(performance, existingPerformance)) {
        updateList.push({
          id: performance.id,
          data: performance,
        });
      }
    } else {
      addList.push(performance);
    }
  }

  return {
    success: true,
    data: {
      add: addList,
      update: updateList,
      delete: deleteIds,
    },
  };
}

export async function savePerformanceDataUsecase(
  data: EditPerformanceData[]
): Promise<{ success: boolean; message: string; totalCreated?: number; totalUpdated?: number; totalDeleted?: number }> {
  console.log("usecase", data);

  const changes = await getChanges(data);
  if (!changes.success) {
    return changes;
  }

  if (changes.data.add.length === 0 && changes.data.update.length === 0 && changes.data.delete.length === 0) {
    return {
      success: true,
      message: "No changes.",
      totalCreated: 0,
      totalUpdated: 0,
      totalDeleted: 0,
    };
  }

  let createResult, updateResult, deleteResult;

  try {
    console.log("create", changes.data.add);
    createResult = await createPerformances(changes.data.add);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to create performances: ${error.message}`,
      };
    }
    // This should never happen
    throw error;
  }

  try {
    console.log("update", changes.data.update);
    updateResult = await updatePerformances(changes.data.update);
    console.log("updateResult", updateResult);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to update performances: ${error.message}`,
      };
    }
    // This should never happen
    throw error;
  }

  try {
    console.log("delete", changes.data.delete);
    deleteResult = await deletePerformances(changes.data.delete);
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        message: `Failed to delete performances: ${error.message}`,
      };
    }
    // This should never happen
    throw error;
  }

  const totalCreated = createResult.success ? createResult.data.length : 0;
  const totalUpdated = updateResult.success ? updateResult.data.length : 0;
  const totalDeleted = deleteResult.success ? changes.data.delete.length : 0;
  const performanceSummary = `Created (${totalCreated}) Updated (${totalUpdated}) Deleted (${totalDeleted}).`;

  if (!createResult.success || !updateResult.success || !deleteResult.success) {
    const failureList = [createResult, updateResult, deleteResult].filter((r) => !r.success);

    return {
      success: false,
      message: `Failed to save performances. ${performanceSummary}
      Failure messages: ${failureList.map((r) => r.message).join(", ")}`,
      totalCreated,
      totalUpdated,
      totalDeleted,
    };
  }

  return {
    success: true,
    message: `Successfully saved performances. ${performanceSummary}`,
    totalCreated,
    totalUpdated,
    totalDeleted,
  };
}
