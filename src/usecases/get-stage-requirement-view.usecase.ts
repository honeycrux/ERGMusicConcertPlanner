import { getAllConcertRundown } from "@/db/concert-rundown.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { computeRundownTimeUsecase } from "./compute-rundown-time.usecase";
import { StageRequirementView, StageRequirementViewSchema } from "@/models/views.model";
import { RundownData } from "@/models/rundown.model";

function computeStageActions(rundown: RundownData[]): string[] {
  const actions: string[] = [];

  for (const i in rundown) {
    const rundownIdx = parseInt(i);
    const rundownItem = rundown[rundownIdx];

    const minusList: string[] = [];
    const plusList: string[] = [];

    const lastChairCount = rundownIdx > 0 ? rundown[rundownIdx - 1].performance?.stageRequirement.chairCount ?? 0 : 0;
    const lastMusicStandCount = rundownIdx > 0 ? rundown[rundownIdx - 1].performance?.stageRequirement.musicStandCount ?? 0 : 0;
    const lastMicrophoneCount = rundownIdx > 0 ? rundown[rundownIdx - 1].performance?.stageRequirement.microphoneCount ?? 0 : 0;
    const lastProvidedEquipment = rundownIdx > 0 ? rundown[rundownIdx - 1].performance?.stageRequirement.providedEquipment ?? "" : "";
    const lastProvidedEquipmentList = lastProvidedEquipment
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const lastSelfEquipment = rundownIdx > 0 ? rundown[rundownIdx - 1].performance?.stageRequirement.selfEquipment ?? "" : "";
    const lastSelfEquipmentList = lastSelfEquipment
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    const currentChairCount = rundownItem.performance?.stageRequirement.chairCount ?? 0;
    const currentMusicStandCount = rundownItem.performance?.stageRequirement.musicStandCount ?? 0;
    const currentMicrophoneCount = rundownItem.performance?.stageRequirement.microphoneCount ?? 0;
    const currentProvidedEquipment = rundownItem.performance?.stageRequirement.providedEquipment ?? "";
    const currentProvidedEquipmentList = currentProvidedEquipment
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);
    const currentSelfEquipment = rundownItem.performance?.stageRequirement.selfEquipment ?? "";
    const currentSelfEquipmentList = currentSelfEquipment
      .split("\n")
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (lastChairCount < currentChairCount) {
      plusList.push(`${currentChairCount - lastChairCount} chairs`);
    } else if (lastChairCount > currentChairCount) {
      minusList.push(`${lastChairCount - currentChairCount} chairs`);
    }

    if (lastMusicStandCount < currentMusicStandCount) {
      plusList.push(`${currentMusicStandCount - lastMusicStandCount} music stands`);
    } else if (lastMusicStandCount > currentMusicStandCount) {
      minusList.push(`${lastMusicStandCount - currentMusicStandCount} music stands`);
    }

    if (lastMicrophoneCount < currentMicrophoneCount) {
      plusList.push(`${currentMicrophoneCount - lastMicrophoneCount} microphones`);
    } else if (lastMicrophoneCount > currentMicrophoneCount) {
      minusList.push(`${lastMicrophoneCount - currentMicrophoneCount} microphones`);
    }

    const plusProvidedEquipment = currentProvidedEquipmentList.filter((item) => !lastProvidedEquipmentList.includes(item));
    const minusProvidedEquipment = lastProvidedEquipmentList.filter((item) => !currentProvidedEquipmentList.includes(item));
    const plusSelfEquipment = currentSelfEquipmentList.filter((item) => !lastSelfEquipmentList.includes(item));
    const minusSelfEquipment = lastSelfEquipmentList.filter((item) => !currentSelfEquipmentList.includes(item));

    plusList.push(...plusProvidedEquipment);
    minusList.push(...minusProvidedEquipment);
    plusList.push(...plusSelfEquipment);
    minusList.push(...minusSelfEquipment);

    const actionString = [...minusList.map((item) => `- ${item}`), ...plusList.map((item) => `+ ${item}`)].join("\n");
    actions.push(actionString);
  }

  return actions;
}

export async function getStageRequirementViewUsecase(): Promise<DatabaseResponse<StageRequirementView[]>> {
  const rundown = await getAllConcertRundown();

  if (!rundown.success) {
    return {
      success: false,
      message: "Failed to get concert rundown",
    };
  }

  const timeInformation = computeRundownTimeUsecase(rundown.data);

  const stageActions = computeStageActions(rundown.data);

  const augmentedData = rundown.data.map((data, idx) => {
    const timeData = timeInformation[idx];
    return {
      timeSlot: {
        order: data.order,
        name: data.name,
        startTime: timeData.startTimeString,
        duration: timeData.actualDurationString,
        stageActions: stageActions[idx],
      },
      performance: data.performance,
    };
  });

  const { success, data: parsedData, error } = StageRequirementViewSchema.array().safeParse(augmentedData);

  if (!success) {
    console.error("Failed to parse data", error);
    return {
      success: false,
      message: "Failed to parse data " + error,
    };
  }

  return {
    success: true,
    data: parsedData,
  };
}
