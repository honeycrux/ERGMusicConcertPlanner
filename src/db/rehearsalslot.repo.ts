import { EditRundownSlotData, RundownSlotData, RundownSlotDataSchema } from "@/models/rundown.model";
import { DatabaseResponse } from "./db.interface";
import { prismaClient } from "./db";

export async function getAllRehearsalSlots(): Promise<DatabaseResponse<RundownSlotData[]>> {
  const unparsedData = await prismaClient.rehearsalSlot.findMany({});

  const { success, data } = RundownSlotDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", data);
    return {
      success: false,
      message: "Failed to parse data",
    };
  }

  return {
    success: true,
    data: data,
  };
}

export async function createRehearsalSlots(data: EditRundownSlotData[]): Promise<DatabaseResponse<RundownSlotData[]>> {
  const operations = data.map((slot) => {
    return prismaClient.rehearsalSlot.create({
      data: {
        ...slot,
        performance: slot.performanceId
          ? {
              connect: {
                id: slot.performanceId,
              },
            }
          : undefined,
        id: undefined,
        performanceId: undefined,
      },
    });
  });

  const unparsedData = await prismaClient.$transaction(operations);

  const { success, data: parsedData } = RundownSlotDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", parsedData);
    return {
      success: false,
      message: "Failed to parse data",
    };
  }

  return {
    success: true,
    data: parsedData,
  };
}

export async function updateRehearsalSlots(data: EditRundownSlotData[]): Promise<DatabaseResponse<RundownSlotData[]>> {
  if (data.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const operations = data.map((slot) => {
    const slotWithoutId = { ...slot, id: undefined };

    return prismaClient.rehearsalSlot.update({
      where: {
        id: slot.id,
      },
      data: {
        ...slotWithoutId,
        performance:
          slot.performanceId === undefined
            ? undefined
            : {
                connect:
                  slot.performanceId === null
                    ? undefined
                    : {
                        id: slot.performanceId,
                      },
                disconnect: slot.performanceId === null ? true : undefined,
              },
        performanceId: undefined,
      },
    });
  });

  const unparsedData = await prismaClient.$transaction(operations);

  const { success, data: parsedData } = RundownSlotDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", parsedData);
    return {
      success: false,
      message: "Failed to parse data",
    };
  }

  return {
    success: true,
    data: parsedData,
  };
}

export async function deleteRehearsalSlots(ids: string[]): Promise<DatabaseResponse<undefined>> {
  if (ids.length === 0) {
    return {
      success: true,
      data: undefined,
    };
  }

  const result = await prismaClient.rehearsalSlot.deleteMany({
    where: {
      id: {
        in: ids,
      },
    },
  });

  if (!result || result.count === 0) {
    console.error("Failed to delete data", result);
    return {
      success: false,
      message: "Failed to delete data",
    };
  }

  return {
    success: true,
    data: undefined,
  };
}
