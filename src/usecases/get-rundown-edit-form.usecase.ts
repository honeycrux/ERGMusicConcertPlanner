import { getAllRundown } from "@/db/rundown.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { RundownEditForm, RundownEditFormSchema } from "@/models/views.model";
import { RundownType } from "@/models/rundown.model";

export async function getRundownEditFormUsecase(rundownType: RundownType): Promise<DatabaseResponse<RundownEditForm[]>> {
  const result = await getAllRundown(rundownType);

  if (!result.success) {
    return result;
  }

  const { data: parsedData, error, success } = RundownEditFormSchema.array().safeParse(result.data);

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
