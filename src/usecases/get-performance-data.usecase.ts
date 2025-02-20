import { DatabaseResponse } from "@/db/db.interface";
import { getAllPerformances } from "@/db/performance.repo";
import { PerformanceData } from "@/models/performance.model";

export async function getPerformanceDataUsecase(): Promise<DatabaseResponse<PerformanceData[]>> {
  const result = await getAllPerformances();
  return result;
}
