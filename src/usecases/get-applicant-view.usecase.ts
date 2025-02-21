import { getAllConcertRundown } from "@/db/concert-rundown.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { ApplicantDetailView, ApplicantDetailViewSchema } from "@/models/views.model";
import { computeRundownTimeUsecase } from "./compute-rundown-time.usecase";

export async function getApplicantViewUsecase(): Promise<DatabaseResponse<ApplicantDetailView[]>> {
  const rundown = await getAllConcertRundown();

  if (!rundown.success) {
    return {
      success: false,
      message: "Failed to get concert rundown",
    };
  }

  const timeInformation = computeRundownTimeUsecase(rundown.data);

  const augmentedData = rundown.data.map((data, idx) => {
    const timeData = timeInformation[idx];
    return {
      timeSlot: {
        order: data.order,
        name: data.name,
        startTime: timeData.startTimeString ?? "unbounded",
        duration: timeData.actualDurationString ?? "unbounded",
      },
      performance: data.performance,
    };
  });

  const { success, data: parsedData, error } = ApplicantDetailViewSchema.array().safeParse(augmentedData);

  if (!success) {
    console.error("Failed to parse data", error);
    return {
      success: false,
      message: "Failed to parse data " + error,
    };
  }

  return {
    success: true,
    data: parsedData,
  };
}
