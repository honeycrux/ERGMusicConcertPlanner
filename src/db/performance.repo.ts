import { EditPerformance, EditPerformanceWithId, PerformanceData, PerformanceDataSchema } from "@/models/performance.model";
import { prismaClient } from "./db";
import { DatabaseResponse } from "./db.interface";

export async function getAllPerformances(): Promise<DatabaseResponse<PerformanceData[]>> {
  let unparsedData;
  try {
    unparsedData = await prismaClient.performance.findMany({
      include: {
        applicant: true,
        preference: true,
        stageRequirement: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch performances", error.stack);
      return {
        success: false,
        message: "Failed to fetch performances " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch performances " + error,
    };
  }

  const { success, data, error } = PerformanceDataSchema.array().safeParse(unparsedData);

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

export async function getPerformanceById(id: string): Promise<DatabaseResponse<PerformanceData | null>> {
  let unparsedData;
  try {
    unparsedData = await prismaClient.performance.findUnique({
      where: {
        id: id,
      },
      include: {
        applicant: true,
        preference: true,
        stageRequirement: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch performance", error.stack);
      return {
        success: false,
        message: "Failed to fetch performance " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch performance " + error,
    };
  }

  if (!unparsedData) {
    return {
      success: true,
      data: null,
    };
  }

  const { success, data, error } = PerformanceDataSchema.safeParse(unparsedData);

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

export async function createPerformances(data: EditPerformance[]): Promise<DatabaseResponse<PerformanceData[]>> {
  const operations = data.map((performance) => {
    return prismaClient.performance.create({
      data: {
        ...performance,
        applicant: {
          create: performance.applicant ?? {},
        },
        preference: {
          create: performance.preference ?? {},
        },
        stageRequirement: {
          create: performance.stageRequirement ?? {},
        },
        id: undefined,
      },
      include: {
        applicant: true,
        preference: true,
        stageRequirement: true,
      },
    });
  });

  let unparsedData;
  try {
    unparsedData = await prismaClient.$transaction(operations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to create performances", error.stack);
      return {
        success: false,
        message: "Failed to create performances " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to create performances " + error,
    };
  }

  const { success, data: parsedData, error } = PerformanceDataSchema.array().safeParse(unparsedData);

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

export async function updatePerformances(data: EditPerformanceWithId[]): Promise<DatabaseResponse<PerformanceData[]>> {
  if (data.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const operations = data.map((performance) => {
    const performanceWithoutId = { ...performance, id: undefined };

    return prismaClient.performance.update({
      where: { id: performance.id },
      data: {
        ...performanceWithoutId,
        applicant: {
          update: performance.applicant,
        },
        preference: {
          update: performance.preference,
        },
        stageRequirement: {
          update: performance.stageRequirement,
        },
      },
      include: {
        applicant: true,
        preference: true,
        stageRequirement: true,
      },
    });
  });

  let unparsedNewData;
  try {
    unparsedNewData = await prismaClient.$transaction(operations);
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to update performances", error.stack);
      return {
        success: false,
        message: "Failed to update performances " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to update performances " + error,
    };
  }

  if (!unparsedNewData) {
    console.error("Failed to update data", unparsedNewData);
    return {
      success: false,
      message: "Failed to update data",
    };
  }

  const { success: newDataIsValid, data: newData, error } = PerformanceDataSchema.array().safeParse(unparsedNewData);

  if (!newDataIsValid) {
    console.error("Failed to parse new data", unparsedNewData);
    return {
      success: false,
      message: "Data was updated, but parsing failed: " + error,
    };
  }

  return {
    success: true,
    data: newData,
  };
}

export async function deletePerformances(ids: string[]): Promise<DatabaseResponse<undefined>> {
  if (ids.length === 0) {
    return {
      success: true,
      data: undefined,
    };
  }

  let result;
  try {
    result = await prismaClient.performance.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to delete performances", error.stack);
      return {
        success: false,
        message: "Failed to delete performances " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to delete performances " + error,
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

export async function getAllPerformancesWithRundownDetail() {
  let unparsedData;
  try {
    unparsedData = await prismaClient.performance.findMany({
      include: {
        applicant: true,
        preference: true,
        stageRequirement: true,
      },
    });
  } catch (error) {
    if (error instanceof Error) {
      console.error("Failed to fetch performances", error.stack);
      return {
        success: false,
        message: "Failed to fetch performances " + error.stack,
      };
    }
    return {
      success: false,
      message: "Failed to fetch performances " + error,
    };
  }

  const { success, data, error } = PerformanceDataSchema.array().safeParse(unparsedData);

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
