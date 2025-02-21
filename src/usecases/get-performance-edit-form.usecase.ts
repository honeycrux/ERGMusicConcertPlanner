import { DatabaseResponse } from "@/db/db.interface";
import { getAllPerformances } from "@/db/performance.repo";
import { PerformanceEditForm, PerformanceEditFormSchema } from "@/models/views.model";

export async function getPerformanceEditFormUsecase(): Promise<DatabaseResponse<PerformanceEditForm[]>> {
  const result = await getAllPerformances();

  if (!result.success) {
    return result;
  }

  const { data: parsedData, error, success } = PerformanceEditFormSchema.array().safeParse(result.data);

  if (!success) {
    console.error(`Failed to parse data: ${error}`);
    return {
      success: false,
      message: `Failed to parse data: ${error.message}`,
    };
  }

  return {
    success: true,
    data: parsedData,
  };
}
