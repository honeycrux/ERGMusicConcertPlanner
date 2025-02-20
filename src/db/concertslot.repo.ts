import { EditRundownSlotData, RundownSlotData, RundownSlotDataSchema } from "@/models/rundown.model";
import { DatabaseResponse } from "./db.interface";
import { prismaClient } from "./db";

export async function getAllConcertSlots(): Promise<DatabaseResponse<RundownSlotData[]>> {
  let unparsedData;
  try {
    unparsedData = await prismaClient.concertSlot.findMany({
      include: {
        performance: {
          select: {
            id: true,
            genre: true,
            piece: true,
            applicant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch concert slots", error.stack);
      return {
        success: false,
        message: "Failed to fetch concert slots " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch concert slots " + error,
    };
  }

  const { success, data } = RundownSlotDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", data);
    return {
      success: false,
      message: "Failed to parse data",
    };
  }

  for (const slot of data) {
    if (slot.performance === null) {
      slot.performance = {
        id: "",
        genre: "",
        piece: "",
        applicant: {
          name: "",
        },
      };
    }
  }

  return {
    success: true,
    data: data,
  };
}

export async function createConcertSlots(data: EditRundownSlotData[]): Promise<DatabaseResponse<RundownSlotData[]>> {
  const operations = data.map((slot) => {
    console.log("slot.performanceId", slot.performanceId);
    return prismaClient.concertSlot.create({
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
      include: {
        performance: {
          select: {
            id: true,
            genre: true,
            piece: true,
            applicant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  });

  let unparsedData;
  try {
    unparsedData = await prismaClient.$transaction(operations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create concert slots", error.stack);
      return {
        success: false,
        message: "Failed to create concert slots " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to create concert slots " + error,
    };
  }

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

export async function updateConcertSlots(data: EditRundownSlotData[]): Promise<DatabaseResponse<RundownSlotData[]>> {
  if (data.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const operations = data.map((slot) => {
    const slotWithoutId = { ...slot, id: undefined };

    return prismaClient.concertSlot.update({
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
      include: {
        performance: {
          select: {
            id: true,
            genre: true,
            piece: true,
            applicant: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });
  });

  let unparsedData;
  try {
    unparsedData = await prismaClient.$transaction(operations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to update concert slots", error.stack);
      return {
        success: false,
        message: "Failed to update concert slots " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to update concert slots " + error,
    };
  }

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

export async function deleteConcertSlots(ids: string[]): Promise<DatabaseResponse<undefined>> {
  if (ids.length === 0) {
    return {
      success: true,
      data: undefined,
    };
  }

  let result;
  try {
    result = await prismaClient.concertSlot.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to delete concert slots", error.stack);
      return {
        success: false,
        message: "Failed to delete concert slots " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to delete concert slots " + error,
    };
  }

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
