import { createConcertRundown, deleteConcertRundown } from "@/db/concert-rundown.repo";
import { EditRundown } from "@/models/rundown.model";
import { getConcertRundownEditFormUsecase } from "./get-rundown-edit-form.usecase";

export async function saveConcertSlotDataUsecase(data: EditRundown[]): Promise<{ success: boolean; message: string; needToRefresh?: boolean }> {
  const existingConcertRundown = await getConcertRundownEditFormUsecase();

  if (!existingConcertRundown.success) {
    return {
      success: false,
      message: "Failed to get existing concert rundown",
    };
  }

  const deleteResults = await deleteConcertRundown(existingConcertRundown.data.map((concertSlot) => concertSlot.id));

  if (!deleteResults.success) {
    return {
      success: false,
      message: "Failed to delete existing concert rundown",
    };
  }

  const createResults = await createConcertRundown(data);

  if (!createResults.success) {
    return {
      success: false,
      message: "Failed to create concert rundown",
    };
  }

  return {
    success: true,
    message: `Successfully saved concert rundown.`,
    needToRefresh: true,
  };
}
