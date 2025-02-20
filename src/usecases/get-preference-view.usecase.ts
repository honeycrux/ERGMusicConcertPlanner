import { DatabaseResponse } from "@/db/db.interface";
import { getAllPerformances } from "@/db/performance.repo";
import { PreferenceView, PreferenceViewSchema } from "@/models/views.model";

export async function getPreferenceViewUsecase(): Promise<DatabaseResponse<PreferenceView[]>> {
  const performances = await getAllPerformances();

  if (!performances.success) {
    return {
      success: false,
      message: "Failed to get performances",
    };
  }

  const { success, data, error } = PreferenceViewSchema.array().safeParse(performances.data);

  if (!success) {
    console.error("Failed to parse data", error);
    return {
      success: false,
      message: "Failed to parse data " + error,
    };
  }

  return {
    success: true,
    data: data,
  };
}
