import { getAllRundown } from "@/db/rundown.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { ApplicantDetailView, ApplicantDetailViewSchema } from "@/models/views.model";
import { computeRundownTimeUsecase } from "./compute-rundown-time.usecase";
import { RundownType } from "@/models/rundown.model";

export async function getApplicantDetailViewUsecase(rundownType: RundownType): Promise<DatabaseResponse<ApplicantDetailView[]>> {
  const rundown = await getAllRundown(rundownType);

  if (!rundown.success) {
    return {
      success: false,
      message: "Failed to get rundown",
    };
  }

  const timeInformation = computeRundownTimeUsecase(rundown.data);

  const augmentedData = rundown.data.map((data, idx) => {
    const timeData = timeInformation[idx];
    return {
      timeSlot: {
        order: data.order,
        name: data.name,
        startTime: timeData.startTimeString,
        duration: timeData.actualDurationString,
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
