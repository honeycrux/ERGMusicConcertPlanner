"use server";

import { DatabaseResponse } from "@/db/db.interface";
import { PreferenceView } from "@/models/views.model";
import { getPreferenceViewUsecase } from "@/usecases/get-preference-view.usecase";

export async function getPreferenceViewController(): Promise<DatabaseResponse<PreferenceView[]>> {
  const result = await getPreferenceViewUsecase();

  return result;
}
