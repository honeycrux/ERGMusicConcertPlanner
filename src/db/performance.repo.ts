import { EditPerformanceData, PerformanceData, PerformanceDataSchema, performanceEquals } from "@/models/performance.model";
import { prismaClient } from "./db";
import { DatabaseResponse } from "./db.interface";

export async function getAllPerformances(): Promise<DatabaseResponse<PerformanceData[]>> {
  const unparsedData = await prismaClient.performance.findMany({
    include: {
      applicant: true,
      preference: true,
      stageRequirement: true,
    },
  });

  const { success, data } = PerformanceDataSchema.array().safeParse(unparsedData);

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

export async function createPerformances(data: EditPerformanceData[]): Promise<DatabaseResponse<PerformanceData[]>> {
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

  const unparsedData = await prismaClient.$transaction(operations);

  const { success, data: parsedData } = PerformanceDataSchema.array().safeParse(unparsedData);

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

export async function updatePerformances(data: { id: string; data: EditPerformanceData }[]): Promise<DatabaseResponse<PerformanceData[]>> {
  const unparsedOriginalData = await prismaClient.performance.findMany({
    where: { id: { in: data.map((performance) => performance.id) } },
    include: {
      applicant: true,
      preference: true,
      stageRequirement: true,
    },
  });

  const { success: originalDataIsValid, data: originalData } = PerformanceDataSchema.array().safeParse(unparsedOriginalData);

  if (!originalDataIsValid) {
    console.error("Failed to parse original data", unparsedOriginalData);
    return {
      success: false,
      message: "Update failed because original data could not be parsed",
    };
  }

  const updatedPerformances = data.filter((performance) => {
    const originalPerformance = originalData.find((p) => p.id === performance.id);

    if (!originalPerformance) {
      console.error("Failed to find original performance", performance);
      return {
        success: false,
        message: `Failed to find original performance with ID "${performance.id}"`,
      };
    }

    const equals = performanceEquals(performance.data, originalPerformance);
    return !equals;
  });

  if (updatedPerformances.length === 0) {
    return {
      success: true,
      data: [],
    };
  }

  const operations = data.map((performance) => {
    const performanceWithoutId = { ...performance.data, id: undefined };

    return prismaClient.performance.update({
      where: { id: performance.id },
      data: {
        ...performanceWithoutId,
        applicant: {
          update: performance.data.applicant,
        },
        preference: {
          update: performance.data.preference,
        },
        stageRequirement: {
          update: performance.data.stageRequirement,
        },
      },
      include: {
        applicant: true,
        preference: true,
        stageRequirement: true,
      },
    });
  });

  const unparsedNewData = await prismaClient.$transaction(operations);

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

export async function deletePerformances(id: string[]): Promise<DatabaseResponse<undefined>> {
  if (id.length === 0) {
    return {
      success: true,
      data: undefined,
    };
  }

  const result = await prismaClient.performance.deleteMany({
    where: {
      id: {
        in: id,
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
