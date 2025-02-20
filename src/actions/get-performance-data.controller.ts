"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { PerformanceData } from "@/models/performance.model";
import { getPerformanceDataUsecase } from "@/usecases/get-performance-data.usecase";

export async function getPerformanceDataController(): Promise<DatabaseResponse<PerformanceData[]>> {
  const result = await getPerformanceDataUsecase();

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
