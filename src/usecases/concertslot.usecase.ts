import { createConcertSlots, deleteConcertSlots, getAllConcertSlots } from "@/db/concertslot.repo";
import { DatabaseResponse } from "@/db/db.interface";
import { getAllPerformances } from "@/db/performance.repo";
import { getAllRehearsalSlots, deleteRehearsalSlots, createRehearsalSlots } from "@/db/rehearsalslot.repo";
import { EditRundownSlotData, PerformanceRundownView, PerformanceRundownViewSchema, RundownSlotData } from "@/models/rundown.model";

export async function getAvailablePerformancesUsecase(): Promise<DatabaseResponse<PerformanceRundownView[]>> {
  const performances = await getAllPerformances();

  if (!performances.success) {
    return {
      success: false,
      message: "Failed to get performances",
    };
  }

  const { success, data, error } = PerformanceRundownViewSchema.array().safeParse(performances.data);

  if (!success) {
    console.error("Failed to parse data", error);
    return {
      success: false,
      message: "Failed to parse data " + error,
    };
  }

  return {
    success: true,
    data: data,
  };
}

export async function getConcertSlotDataUsecase(): Promise<DatabaseResponse<RundownSlotData[]>> {
  const result = await getAllConcertSlots();
  return result;
}

export async function saveConcertSlotDataUsecase(data: EditRundownSlotData[]): Promise<{ success: boolean; message: string; needToRefresh?: boolean }> {
  const existingConcertSlots = await getConcertSlotDataUsecase();

  if (!existingConcertSlots.success) {
    return {
      success: false,
      message: "Failed to get existing concert slots",
    };
  }

  const deleteResults = await deleteConcertSlots(existingConcertSlots.data.map((concertSlot) => concertSlot.id));

  if (!deleteResults.success) {
    return {
      success: false,
      message: "Failed to delete existing concert slots",
    };
  }

  const createResults = await createConcertSlots(data);

  if (!createResults.success) {
    return {
      success: false,
      message: "Failed to create concert slots",
    };
  }

  return {
    success: true,
    message: `Successfully saved concert slots.`,
    needToRefresh: true,
  };
}

export async function getRehearsalSlotDataUsecase(): Promise<DatabaseResponse<RundownSlotData[]>> {
  const result = await getAllRehearsalSlots();
  return result;
}

export async function saveRehearsalSlotDataUsecase(data: EditRundownSlotData[]): Promise<{ success: boolean; message: string; needToRefresh?: boolean }> {
  const existingRehearsalSlots = await getRehearsalSlotDataUsecase();

  if (!existingRehearsalSlots.success) {
    return {
      success: false,
      message: "Failed to get existing rehearsal slots",
    };
  }

  const deleteResults = await deleteRehearsalSlots(existingRehearsalSlots.data.map((rehearsalSlot) => rehearsalSlot.id));

  if (!deleteResults.success) {
    return {
      success: false,
      message: "Failed to delete existing rehearsal slots",
    };
  }

  const createResults = await createRehearsalSlots(data);

  if (!createResults.success) {
    return {
      success: false,
      message: "Failed to create rehearsal slots",
    };
  }

  return {
    success: true,
    message: `Successfully saved rehearsal slots.`,
    needToRefresh: true,
  };
}
