"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { ApplicantDetailView, PreferenceView } from "@/models/views.model";
import { getApplicantViewUsecase } from "@/usecases/get-applicant-view.usecase";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";

export async function getPreferenceViewController(): Promise<DatabaseResponse<PreferenceView[]>> {
  const result = await getPreferenceViewUsecase();

  return result;
}

export async function getApplicantViewController(): Promise<DatabaseResponse<ApplicantDetailView[]>> {
  const result = await getApplicantViewUsecase();

  if (result.success) {
    for (const view of result.data) {
      if (view.performance === null) {
        view.performance = {
          genre: "",
          applicant: {
            email: "",
            name: "",
            phone: "",
            applicantRemarks: "",
          },
        };
      }
    }
  }

  return result;
}
