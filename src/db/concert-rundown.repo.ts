import { EditRundown, RundownData, RundownDataSchema } from "@/models/rundown.model";
import { DatabaseResponse } from "./db.interface";
import { prismaClient } from "./db";

export async function getAllConcertRundown(): Promise<DatabaseResponse<RundownData[]>> {
  let unparsedData;
  try {
    unparsedData = await prismaClient.concertSlot.findMany({
      include: {
        performance: {
          include: {
            stageRequirement: true,
            preference: true,
            applicant: true,
          },
        },
      },
      orderBy: {
        order: "asc",
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch concert rundown", error.stack);
      return {
        success: false,
        message: "Failed to fetch concert rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch concert rundown " + error,
    };
  }

  const { success, data, error } = RundownDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", error);
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

export async function createConcertRundown(data: EditRundown[]): Promise<DatabaseResponse<RundownData[]>> {
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
          include: {
            stageRequirement: true,
            preference: true,
            applicant: true,
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
      console.error("Failed to create concert rundown", error.stack);
      return {
        success: false,
        message: "Failed to create concert rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to create concert rundown " + error,
    };
  }

  const { success, data: parsedData, error } = RundownDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", error);
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

export async function updateConcertRundown(data: EditRundown[]): Promise<DatabaseResponse<RundownData[]>> {
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
          include: {
            stageRequirement: true,
            preference: true,
            applicant: true,
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
      console.error("Failed to update concert rundown", error.stack);
      return {
        success: false,
        message: "Failed to update concert rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to update concert rundown " + error,
    };
  }

  const { success, data: parsedData, error } = RundownDataSchema.array().safeParse(unparsedData);

  if (!success) {
    console.error("Failed to parse data", error);
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

export async function deleteConcertRundown(ids: string[]): Promise<DatabaseResponse<undefined>> {
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
      console.error("Failed to delete concert rundown", error.stack);
      return {
        success: false,
        message: "Failed to delete concert rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to delete concert rundown " + error,
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
