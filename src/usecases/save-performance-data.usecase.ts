import { createPerformances, deletePerformances } from "@/db/performance.repo";
import { EditPerformance } from "@/models/performance.model";
import { getPerformanceEditFormUsecase } from "./get-performance-edit-form.usecase";

export async function savePerformanceDataUsecase(data: EditPerformance[]): Promise<{ success: boolean; message: string; needToRefresh?: boolean }> {
  const existingPerformances = await getPerformanceEditFormUsecase();

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
