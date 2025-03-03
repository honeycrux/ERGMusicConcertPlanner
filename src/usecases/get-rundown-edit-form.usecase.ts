import { getAllRundown } from "@/db/rundown.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { RundownEditForm, RundownEditFormSchema } from "@/models/views.model";
import { RundownType } from "@/models/rundown.model";
import { computeRundownTimeUsecase } from "./compute-rundown-time.usecase";

export async function getRundownEditFormUsecase(rundownType: RundownType): Promise<DatabaseResponse<RundownEditForm[]>> {
  const rundown = await getAllRundown(rundownType);

  if (!rundown.success) {
    return rundown;
  }

  const timeInformation = computeRundownTimeUsecase(rundown.data);

  const augmentedData = rundown.data.map((data, idx) => {
    const timeData = timeInformation[idx];
    return {
      timeSlot: {
        startTime: timeData.startTimeString,
        duration: timeData.actualDurationString,
      },
      ...data,
    };
  });

  const { data: parsedData, error, success } = RundownEditFormSchema.array().safeParse(augmentedData);

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
