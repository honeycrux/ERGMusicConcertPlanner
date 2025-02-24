import { ChangeSource } from "handsontable/common";

export function isUserInputSource(source: ChangeSource | undefined) {
  return !(source === "loadData" || source === "updateData");
}
