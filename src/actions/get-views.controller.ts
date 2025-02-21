"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { ApplicantDetailView, PerformanceDetailView, PreferenceView } from "@/models/views.model";
import { getApplicantDetailViewUsecase as getApplicantDetailViewUsecase } from "@/usecases/get-applicant-detail-view.usecase";
import { getPerformanceDetailViewUsecase } from "@/usecases/get-performance-detail-view.usecase";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";

export async function getPreferenceViewController(): Promise<DatabaseResponse<PreferenceView[]>> {
  const result = await getPreferenceViewUsecase();

  return result;
}

export async function getPerformanceDetailViewController(): Promise<DatabaseResponse<PerformanceDetailView[]>> {
  const result = await getPerformanceDetailViewUsecase();

  if (result.success) {
    for (const view of result.data) {
      if (view.performance === null) {
        view.performance = {
          genre: "",
          applicant: {
            name: "",
          },
          piece: "",
          description: "",
          performerList: "",
          performerDescription: "",
          remarks: "",
        };
      }
    }
  }

  return result;
}

export async function getApplicantDetailViewController(): Promise<DatabaseResponse<ApplicantDetailView[]>> {
  const result = await getApplicantDetailViewUsecase();

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
