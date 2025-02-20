import { createConcertSlots, deleteConcertSlots } from "@/db/concertslot.repo";
import { EditRundownSlotData } from "@/models/rundown.model";
import { getConcertSlotDataUsecase } from "./get-rundown-data.usecase";

export async function saveConcertSlotDataUsecase(data: EditRundownSlotData[]): Promise<{ success: boolean; message: string; needToRefresh?: boolean }> {
  const existingConcertSlots = await getConcertSlotDataUsecase();

  if (!existingConcertSlots.success) {
    return {
      success: false,
      message: "Failed to get existing concert slots",
    };
  }

  const deleteResults = await deleteConcertSlots(existingConcertSlots.data.map((concertSlot) => concertSlot.id));

  if (!deleteResults.success) {
    return {
      success: false,
      message: "Failed to delete existing concert slots",
    };
  }

  const createResults = await createConcertSlots(data);

  if (!createResults.success) {
    return {
      success: false,
      message: "Failed to create concert slots",
    };
  }

  return {
    success: true,
    message: `Successfully saved concert slots.`,
    needToRefresh: true,
  };
}
