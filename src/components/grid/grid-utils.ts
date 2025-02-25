import Handsontable from "handsontable";
import { ChangeSource } from "handsontable/common";
import { DateTime, Duration } from "luxon";

export function isUserInputSource(source: ChangeSource | undefined) {
  return !(source === "loadData" || source === "updateData");
}

export const exportCsv = (hot: Handsontable, name: string) => {
  "use client";

  const exportPlugin = hot.getPlugin("exportFile");

  exportPlugin.downloadFile("csv", {
    bom: false,
    columnDelimiter: ",",
    columnHeaders: true,
    exportHiddenColumns: true,
    exportHiddenRows: true,
    fileExtension: "csv",
    filename: `${name}_[YYYY]-[MM]-[DD]`,
    mimeType: "text/csv",
    rowDelimiter: "\r\n",
    rowHeaders: true,
  });
};

export const datetimeValidator = (value: unknown, callback: (valid: boolean) => void) => {
  if (typeof value === "string" && DateTime.fromISO(value).isValid) {
    callback(true);
  } else if (value === null || value === undefined || value === "") {
    callback(true);
  } else {
    callback(false);
  }
};

export const durationValidator = (value: unknown, callback: (valid: boolean) => void) => {
  if (typeof value === "string" && Duration.fromISO(value).isValid) {
    callback(true);
  } else if (value === null || value === undefined || value === "") {
    callback(true);
  } else {
    callback(false);
  }
};
