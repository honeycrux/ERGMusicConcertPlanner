import { EditPerformanceData, EditPerformanceDataWithId, PerformanceData, PerformanceDataSchema } from "@/models/performance.model";
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

export async function updatePerformances(data: EditPerformanceDataWithId[]): Promise<DatabaseResponse<PerformanceData[]>> {
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

export async function deletePerformances(ids: string[]): Promise<DatabaseResponse<undefined>> {
  if (ids.length === 0) {
    return {
      success: true,
      data: undefined,
    };
  }

  const result = await prismaClient.performance.deleteMany({
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
