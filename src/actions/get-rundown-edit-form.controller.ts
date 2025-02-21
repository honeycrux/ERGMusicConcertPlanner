"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { PreferenceView, RundownEditForm } from "@/models/views.model";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";
import { getConcertRundownEditFormUsecase } from "@/usecases/get-rundown-edit-form.usecase";

export async function getConcertRundownEditFormController(): Promise<DatabaseResponse<{ rundown: RundownEditForm[]; performances: PreferenceView[] }>> {
  const concertRundownResult = await getConcertRundownEditFormUsecase();

  if (!concertRundownResult.success) {
    return concertRundownResult;
  }

  for (const slot of concertRundownResult.data) {
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
    return performanceResult;
  }

  return {
    success: true,
    data: {
      rundown: concertRundownResult.data,
      performances: performanceResult.data,
    },
  };
}
