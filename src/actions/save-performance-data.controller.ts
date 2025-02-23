"use server";

import {
  createPerformanceDataUsecase,
  DataActionResponse,
  deletePerformanceDataUsecase,
  updatePerformanceDataUsecase,
} from "@/usecases/save-performance-data.usecase";
import { getPerformanceEditFormUsecase } from "@/usecases/get-performance-edit-form.usecase";

type CellAction =
  | {
      type: "create" | "update";
      key: string;
      oldValue: unknown;
      newValue: unknown;
      id: string;
    }
  | {
      type: "delete";
      id: string;
    };

export async function savePerformanceDataController(actions: CellAction[]) {
  const results: DataActionResponse[] = [];

  for (const action of actions) {
    if (action.type === "create") {
      const result = await createPerformanceDataUsecase([
        {
          key: action.key,
          oldValue: action.oldValue,
          newValue: action.newValue,
        },
      ]);
      results.push(result);
    } else if (action.type === "update") {
      const result = await updatePerformanceDataUsecase(
        [
          {
            key: action.key,
            oldValue: action.oldValue,
            newValue: action.newValue,
          },
        ],
        action.id
      );
      results.push(result);
    } else if (action.type === "delete") {
      const result = await deletePerformanceDataUsecase(action.id);
      results.push(result);
    } else {
      throw new Error("Unexpected action type");
    }
  }

  if (!results.every((result) => result.processed)) {
    const messages = results.map((result) => result.message);
    console.error("Error: Failed to process update action", messages);
    return { success: false, message: messages.join(", ") };
  }

  return { success: true, message: "Successfully saved performance data." };
}
