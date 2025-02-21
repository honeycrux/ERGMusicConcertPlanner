import { getAllConcertRundown } from "@/db/concert-rundown.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { RundownEditForm, RundownEditFormSchema } from "@/models/views.model";

export async function getConcertRundownEditFormUsecase(): Promise<DatabaseResponse<RundownEditForm[]>> {
  const result = await getAllConcertRundown();

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
