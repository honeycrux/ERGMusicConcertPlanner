import { EditRundownWithId, EditRundownWithOrder, RundownData, RundownDataSchema, RundownType } from "@/models/rundown.model";
import { DatabaseResponse } from "./db.interface";
import { prismaClient } from "./db";
import { Prisma } from "@prisma/client";

export async function getAllRundown(rundownType: RundownType): Promise<DatabaseResponse<RundownData[]>> {
  let unparsedData;

  const getAllRundownArgs = {
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
  } satisfies Prisma.ConcertSlotFindManyArgs & Prisma.RehearsalSlotFindManyArgs;

  try {
    if (rundownType === "concert") {
      unparsedData = await prismaClient.concertSlot.findMany(getAllRundownArgs);
    } else if (rundownType === "rehearsal") {
      unparsedData = await prismaClient.rehearsalSlot.findMany(getAllRundownArgs);
    } else {
      return {
        success: false,
        message: "Invalid rundown type",
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch rundown", error.stack);
      return {
        success: false,
        message: "Failed to fetch rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch rundown " + error,
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

export async function getRundownById(rundownType: RundownType, id: string): Promise<DatabaseResponse<RundownData | null>> {
  let unparsedData;

  const getRundownByIdArgs = {
    where: {
      id: id,
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
  } satisfies Prisma.ConcertSlotFindUniqueArgs & Prisma.RehearsalSlotFindUniqueArgs;

  try {
    if (rundownType === "concert") {
      unparsedData = await prismaClient.concertSlot.findUnique(getRundownByIdArgs);
    } else if (rundownType === "rehearsal") {
      unparsedData = await prismaClient.rehearsalSlot.findUnique(getRundownByIdArgs);
    } else {
      return {
        success: false,
        message: "Invalid rundown type",
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch rundown", error.stack);
      return {
        success: false,
        message: "Failed to fetch rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch rundown " + error,
    };
  }

  if (!unparsedData) {
    return {
      success: true,
      data: null,
    };
  }

  const { success, data, error } = RundownDataSchema.safeParse(unparsedData);

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

export async function createRundown(rundownType: RundownType, data: EditRundownWithOrder[]): Promise<DatabaseResponse<RundownData[]>> {
  const operations = data.map((slot) => {
    const createRundownArgs = {
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
    } satisfies Prisma.ConcertSlotCreateArgs & Prisma.RehearsalSlotCreateArgs;

    let result;
    if (rundownType === "concert") {
      result = prismaClient.concertSlot.create(createRundownArgs);
    } else if (rundownType === "rehearsal") {
      result = prismaClient.rehearsalSlot.create(createRundownArgs);
    } else {
      return undefined;
    }

    return result;
  });

  if (operations.includes(undefined)) {
    return {
      success: false,
      message: "Invalid rundown type",
    };
  }
  const realOperations = operations.filter((op) => op !== undefined);

  let unparsedData;
  try {
    unparsedData = await prismaClient.$transaction(realOperations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create rundown", error.stack);
      return {
        success: false,
        message: "Failed to create rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to create rundown " + error,
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

export async function updateRundown(rundownType: RundownType, data: EditRundownWithId[]): Promise<DatabaseResponse<RundownData[]>> {
  if (data.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const operations = data.map((slot) => {
    const slotWithoutId = { ...slot, id: undefined };

    const updateRundownArgs = {
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
    } satisfies Prisma.ConcertSlotUpdateArgs & Prisma.RehearsalSlotUpdateArgs;

    let result;
    if (rundownType === "concert") {
      result = prismaClient.concertSlot.update(updateRundownArgs);
    } else if (rundownType === "rehearsal") {
      result = prismaClient.rehearsalSlot.update(updateRundownArgs);
    } else {
      return undefined;
    }

    return result;
  });

  if (operations.includes(undefined)) {
    return {
      success: false,
      message: "Invalid rundown type",
    };
  }
  const realOperations = operations.filter((op) => op !== undefined);

  let unparsedData;
  try {
    unparsedData = await prismaClient.$transaction(realOperations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to update rundown", error.stack);
      return {
        success: false,
        message: "Failed to update rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to update rundown " + error,
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

export async function deleteRundown(rundownType: RundownType, ids: string[]): Promise<DatabaseResponse<undefined>> {
  if (ids.length === 0) {
    return {
      success: true,
      data: undefined,
    };
  }

  let result;
  try {
    const deleteRundownArgs = {
      where: {
        id: {
          in: ids,
        },
      },
    } satisfies Prisma.ConcertSlotDeleteManyArgs & Prisma.RehearsalSlotDeleteManyArgs;

    if (rundownType === "concert") {
      result = await prismaClient.concertSlot.deleteMany(deleteRundownArgs);
    } else if (rundownType === "rehearsal") {
      result = await prismaClient.rehearsalSlot.deleteMany(deleteRundownArgs);
    } else {
      return {
        success: false,
        message: "Invalid rundown type",
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to delete rundown", error.stack);
      return {
        success: false,
        message: "Failed to delete rundown " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to delete rundown " + error,
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

export async function getNormalizedRundownOrdering(rundownType: RundownType): Promise<DatabaseResponse<string[]>> {
  let result;
  try {
    const getRundownOrderingArgs = {
      select: {
        id: true,
        order: true,
      },
      orderBy: {
        order: "asc",
      },
    } satisfies Prisma.ConcertSlotFindManyArgs & Prisma.RehearsalSlotFindManyArgs;

    if (rundownType === "concert") {
      result = await prismaClient.concertSlot.findMany(getRundownOrderingArgs);
    } else if (rundownType === "rehearsal") {
      result = await prismaClient.rehearsalSlot.findMany(getRundownOrderingArgs);
    } else {
      return {
        success: false,
        message: "Invalid rundown type",
      };
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch rundown order", error.stack);
      return {
        success: false,
        message: "Failed to fetch rundown order " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch rundown order " + error,
    };
  }

  let valid = true;
  for (let i = 0; i < result.length; i++) {
    if (result[i].order !== i + 1) {
      valid = false;
      break;
    }
  }

  if (!valid) {
    const updateResult = await updateRundown(
      rundownType,
      result.map((slot) => {
        return {
          id: slot.id,
          order: slot.order,
        };
      })
    );

    if (!updateResult.success) {
      return {
        success: false,
        message: "Failed to normalize order",
      };
    }
  }

  return {
    success: true,
    data: result.map((slot) => slot.id),
  };
}
