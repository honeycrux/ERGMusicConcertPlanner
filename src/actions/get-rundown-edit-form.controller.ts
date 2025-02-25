"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { RundownType } from "@/models/rundown.model";
import { PreferenceView, RundownEditForm } from "@/models/views.model";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";
import { getRundownEditFormUsecase } from "@/usecases/get-rundown-edit-form.usecase";

export async function getRundownEditFormController(
  rundownType: RundownType
): Promise<DatabaseResponse<{ rundown: RundownEditForm[]; performances: PreferenceView[] }>> {
  const rundownResult = await getRundownEditFormUsecase(rundownType);

  if (!rundownResult.success) {
    return rundownResult;
  }

  for (const slot of rundownResult.data) {
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
      rundown: rundownResult.data,
      performances: performanceResult.data,
    },
  };
}
