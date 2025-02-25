"use server";

import { RundownType } from "@/models/rundown.model";
import { DataActionResponse } from "@/usecases/data-action.interface";
import { createRundownDataUsecase, updateRundownDataUsecase, deleteRundownDataUsecase, reorderRundownUsecase } from "@/usecases/save-rundown-data.usecase";

type RundownCellAction =
  | {
      type: "create";
      key: string;
      oldValue: unknown;
      newValue: unknown;
      id: string;
      oldOrdering: string[];
      newOrdering: string[];
    }
  | {
      type: "update";
      key: string;
      oldValue: unknown;
      newValue: unknown;
      id: string;
    }
  | {
      type: "reorder";
      oldOrdering: string[];
      newOrdering: string[];
    }
  | {
      type: "delete";
      id: string;
    };

export async function saveRundownDataController(rundownType: RundownType, actions: RundownCellAction[]) {
  const results: DataActionResponse[] = [];

  for (const action of actions) {
    if (action.type === "create") {
      const result = await createRundownDataUsecase(
        rundownType,
        [
          {
            key: action.key,
            oldValue: action.oldValue,
            newValue: action.newValue,
          },
        ],
        {
          oldOrdering: action.oldOrdering,
          newOrdering: action.newOrdering,
        },
        action.newOrdering.indexOf(action.id)
      );
      results.push(result);
    } else if (action.type === "update") {
      const result = await updateRundownDataUsecase(
        rundownType,
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
      const result = await deleteRundownDataUsecase(rundownType, action.id);
      results.push(result);
    } else if (action.type === "reorder") {
      const result = await reorderRundownUsecase(rundownType, {
        oldOrdering: action.oldOrdering,
        newOrdering: action.newOrdering,
      });
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

  return { success: true, message: "Successfully saved rundown data." };
}
