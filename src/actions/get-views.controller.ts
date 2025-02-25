"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { ApplicantDetailView, PerformanceDetailView, PreferenceView, StageRequirementView } from "@/models/views.model";
import { getApplicantDetailViewUsecase as getApplicantDetailViewUsecase } from "@/usecases/get-applicant-detail-view.usecase";
import { getPerformanceDetailViewUsecase } from "@/usecases/get-performance-detail-view.usecase";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";
import { getStageRequirementViewUsecase } from "@/usecases/get-stage-requirement-view.usecase";

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

export async function getStageRequirementViewController(): Promise<DatabaseResponse<StageRequirementView[]>> {
  const result = await getStageRequirementViewUsecase();

  if (result.success) {
    for (const view of result.data) {
      if (view.performance === null) {
        view.performance = {
          genre: "",
          applicant: {
            name: "",
          },
          stageRequirement: {
            chairCount: null,
            musicStandCount: null,
            microphoneCount: null,
            providedEquipment: "",
            selfEquipment: "",
            stageRemarks: "",
          },
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
          preference: {
            concertAvailability: "",
            rehearsalAvailability: "",
            preferenceRemarks: "",
          },
        };
      }
    }
  }

  return result;
}
