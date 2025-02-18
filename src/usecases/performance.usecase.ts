import { DatabaseResponse } from "@/db/db.interface";
import { createPerformances, deletePerformances, getAllPerformances } from "@/db/performance.repo";
import { EditPerformanceData, PerformanceData } from "@/models/performance.model";

export async function getPerformanceDataUsecase(): Promise<DatabaseResponse<PerformanceData[]>> {
  const result = await getAllPerformances();
  return result;
}

export async function savePerformanceDataUsecase(data: EditPerformanceData[]): Promise<{ success: boolean; message: string; needToRefresh?: boolean }> {
  const existingPerformances = await getPerformanceDataUsecase();

  if (!existingPerformances.success) {
    return {
      success: false,
      message: "Failed to get existing performances",
    };
  }

  const deleteResults = await deletePerformances(existingPerformances.data.map((performance) => performance.id));

  if (!deleteResults.success) {
    return {
      success: false,
      message: "Failed to delete existing performances",
    };
  }

  const createResults = await createPerformances(data);

  if (!createResults.success) {
    return {
      success: false,
      message: "Failed to create performances",
    };
  }

  return {
    success: true,
    message: `Successfully saved performances.`,
    needToRefresh: true,
  };
}
