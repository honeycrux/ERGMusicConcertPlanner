"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { PerformanceEditForm } from "@/models/views.model";
import { getPerformanceEditFormUsecase } from "@/usecases/get-performance-edit-form.usecase";

export async function getPerformanceEditFormController(): Promise<DatabaseResponse<PerformanceEditForm[]>> {
  const result = await getPerformanceEditFormUsecase();

  if (!result.success) {
    return {
      success: false,
      message: "Failed to get performance data",
    };
  }

  return {
    success: true,
    data: result.data,
  };
}
