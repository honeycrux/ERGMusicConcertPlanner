import {
  createConcertRundown,
  deleteConcertRundown,
  getConcertRundownById,
  getNormalizedRundownOrdering,
  updateConcertRundown,
} from "@/db/concert-rundown.repo";
import { EditRundown, EditRundownWithId, RundownControlKey, rundownDataColumns } from "@/models/rundown.model";
import { DataAction, DataActionResponse, OrderingAction } from "./data-action.interface";

function arrayEquals<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export async function reorderConcertRundownUsecase(ordering: OrderingAction): Promise<DataActionResponse> {
  // Three-way check on the ordering

  const result = await getNormalizedRundownOrdering();
  if (!result.success) {
    return { processed: false, success: false, message: result.message };
  }

  // We only care about the ids that are still in the database
  const oldOrdering = ordering.oldOrdering.filter((id) => result.data.includes(id));
  const newOrdering = ordering.newOrdering.filter((id) => result.data.includes(id));

  if (arrayEquals(oldOrdering, newOrdering)) {
    return { processed: true, success: true, message: "No changes." };
  }

  const databaseOrdering = result.data;
  if (arrayEquals(newOrdering, databaseOrdering)) {
    return { processed: true, success: true, message: "No changes." };
  }
  if (!arrayEquals(oldOrdering, databaseOrdering)) {
    return { processed: true, success: false, message: "Ordering has changed since last fetch." };
  }

  const editRundownOrdering: EditRundownWithId[] = [];
  for (let i = 0; i < newOrdering.length; i++) {
    const id = newOrdering[i];
    editRundownOrdering.push({ id, order: i + 1 });
  }

  const updateResult = await updateConcertRundown(editRundownOrdering);

  if (!updateResult.success) {
    return { processed: true, success: false, message: updateResult.message };
  }
  return { processed: true, success: true, message: "Successfully reordered concert rundown." };
}

export async function createConcertRundownDataUsecase(actions: DataAction[], ordering: OrderingAction, newItemOrderIndex: number): Promise<DataActionResponse> {
  const editRundown: EditRundown = {};

  for (const action of actions) {
    const key = action.key;
    if (!(key in rundownDataColumns)) {
      return { processed: false, success: false, message: `Exception: Unexpected key: ${key}` };
    }
    const column = rundownDataColumns[key as RundownControlKey];
    try {
      column.applyOnCreate({
        oldValue: action.oldValue,
        newValue: action.newValue,
        editData: editRundown,
      });
    } catch (error) {
      console.error("Failed to apply update", error);
      return { processed: false, success: false, message: `Failed to apply update: ${error}` };
    }
  }

  const databaseOrdering = await getNormalizedRundownOrdering();
  if (!databaseOrdering.success) {
    return { processed: false, success: false, message: databaseOrdering.message };
  }
  const nextOrderNumber = databaseOrdering.data.length + 1;
  const editRundownWithOrder = { ...editRundown, order: nextOrderNumber };

  const result = await createConcertRundown([editRundownWithOrder]);
  if (!result.success) {
    return { processed: true, success: false, message: "Create rundown failed: " + result.message };
  }

  const newlyInsertedId = result.data[0].id;
  ordering.oldOrdering.push(newlyInsertedId);
  ordering.newOrdering[newItemOrderIndex] = newlyInsertedId;

  const reorderResult = await reorderConcertRundownUsecase({
    oldOrdering: ordering.oldOrdering,
    newOrdering: ordering.newOrdering,
  });

  if (!reorderResult.success) {
    return { processed: true, success: false, message: "Reorder rundown on create failed: " + reorderResult.message };
  }
  return { processed: true, success: true, message: "Successfully created concert rundown data." };
}

export async function updateConcertRundownDataUsecase(actions: DataAction[], id: string) {
  const editRundown: EditRundownWithId = { id };
  const databaseResult = await getConcertRundownById(id);

  if (!databaseResult.success) {
    return { processed: false, success: false, message: databaseResult.message };
  }

  const databaseRecord = databaseResult.data;

  for (const action of actions) {
    const key = action.key;
    if (!(key in rundownDataColumns)) {
      return { processed: false, success: false, message: `Exception: Unexpected key: ${key}` };
    }
    const column = rundownDataColumns[key as RundownControlKey];
    try {
      column.applyOnUpdate({
        oldValue: action.oldValue,
        newValue: action.newValue,
        databaseRecord,
        editData: editRundown,
      });
    } catch (error) {
      console.error("Failed to apply update", error);
      return { processed: false, success: false, message: `Failed to apply update: ${error}` };
    }
  }

  const result = await updateConcertRundown([editRundown]);

  if (!result.success) {
    return { processed: true, success: false, message: result.message };
  }
  return { processed: true, success: true, message: "Successfully updated concert rundown data." };
}

export async function deleteConcertRundownDataUsecase(id: string) {
  const result = await deleteConcertRundown([id]);

  if (!result.success) {
    return { processed: true, success: false, message: result.message };
  }
  return { processed: true, success: true, message: "Successfully deleted concert rundown data." };
}
