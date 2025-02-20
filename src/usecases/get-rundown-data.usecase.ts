import { getAllConcertSlots } from "@/db/concertslot.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { RundownSlotData } from "@/models/rundown.model";

export async function getConcertSlotDataUsecase(): Promise<DatabaseResponse<RundownSlotData[]>> {
  const result = await getAllConcertSlots();

  return result;
}
