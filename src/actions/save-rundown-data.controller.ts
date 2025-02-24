"use server";

import { DataActionResponse } from "@/usecases/data-action.interface";
import {
  createConcertRundownDataUsecase,
  updateConcertRundownDataUsecase,
  deleteConcertRundownDataUsecase,
  reorderConcertRundownUsecase,
} from "@/usecases/save-rundown-data.usecase";

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

export async function saveRundownDataController(actions: RundownCellAction[]) {
  const results: DataActionResponse[] = [];

  for (const action of actions) {
    if (action.type === "create") {
      const result = await createConcertRundownDataUsecase(
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
      const result = await updateConcertRundownDataUsecase(
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
      const result = await deleteConcertRundownDataUsecase(action.id);
      results.push(result);
    } else if (action.type === "reorder") {
      const result = await reorderConcertRundownUsecase({
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

  return { success: true, message: "Successfully saved concert rundown data." };
}
