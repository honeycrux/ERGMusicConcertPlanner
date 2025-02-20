"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { RundownSlotData } from "@/models/rundown.model";
import { PreferenceView } from "@/models/views.model";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";
import { getConcertSlotDataUsecase } from "@/usecases/get-rundown-data.usecase";

export async function getConcertSlotDataController(): Promise<DatabaseResponse<{ rundownSlots: RundownSlotData[]; performances: PreferenceView[] }>> {
  const concertSlotResult = await getConcertSlotDataUsecase();

  if (!concertSlotResult.success) {
    return {
      success: false,
      message: "Failed to get concert slot data",
    };
  }

  for (const slot of concertSlotResult.data) {
    if (!slot.performance) {
      slot.performance = {
        id: "",
        genre: "",
        applicant: {
          name: "",
        },
        preference: {
          concertAvailability: "",
          rehearsalAvailability: "",
          preferenceRemarks: "",
        },
      };
    }
  }

  const performanceResult = await getPreferenceViewUsecase();

  if (!performanceResult.success) {
    return {
      success: false,
      message: "Failed to get performance data",
    };
  }

  return {
    success: true,
    data: {
      rundownSlots: concertSlotResult.data,
      performances: performanceResult.data,
    },
  };
}
