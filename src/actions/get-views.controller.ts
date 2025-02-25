"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { RundownType } from "@/models/rundown.model";
import { ApplicantDetailView, PerformanceDetailView, PreferenceView, StageRequirementView } from "@/models/views.model";
import { getApplicantDetailViewUsecase as getApplicantDetailViewUsecase } from "@/usecases/get-applicant-detail-view.usecase";
import { getPerformanceDetailViewUsecase } from "@/usecases/get-performance-detail-view.usecase";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";
import { getStageRequirementViewUsecase } from "@/usecases/get-stage-requirement-view.usecase";

export async function getPreferenceViewController(): Promise<DatabaseResponse<PreferenceView[]>> {
  const result = await getPreferenceViewUsecase();

  return result;
}

export async function getPerformanceDetailViewController(rundownType: RundownType): Promise<DatabaseResponse<PerformanceDetailView[]>> {
  const result = await getPerformanceDetailViewUsecase(rundownType);

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

export async function getStageRequirementViewController(rundownType: RundownType): Promise<DatabaseResponse<StageRequirementView[]>> {
  const result = await getStageRequirementViewUsecase(rundownType);

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

export async function getApplicantDetailViewController(rundownType: RundownType): Promise<DatabaseResponse<ApplicantDetailView[]>> {
  const result = await getApplicantDetailViewUsecase(rundownType);

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
