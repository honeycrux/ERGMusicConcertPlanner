"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useRef, useState } from "react";
import { savePerformanceDataController } from "@/actions/save-performance-data.controller";
import { PerformanceEditForm } from "@/models/views.model";
import { PerformanceControlKey } from "@/models/performance.model";
import { CellChange } from "handsontable/common";
import { getPerformanceEditFormController } from "@/actions/get-performance-edit-form.controller";
import { SystemMessage } from "./SystemMessage";
import { isUserInputSource } from "./grid-utils";

export type PerformanceColumnGroupDefinition = {
  groupLabel: string;
  columns: { label: string; key: PerformanceControlKey; type: "text" | "numeric"; readOnly?: boolean; width?: number }[];
};

export const performanceColumnGroups: PerformanceColumnGroupDefinition[] = [
  {
    groupLabel: "Performance",
    columns: [
      { label: "ID", key: "id", type: "text", readOnly: true, width: 200 },
      { label: "Genre", key: "genre", type: "text" },
      { label: "Piece", key: "piece", type: "text" },
      { label: "Performance Description", key: "description", type: "text" },
      { label: "Performer List", key: "performerList", type: "text" },
      { label: "Performer Description", key: "performerDescription", type: "text" },
      { label: "General Remarks", key: "remarks", type: "text" },
    ],
  },
  {
    groupLabel: "Applicant",
    columns: [
      { label: "Applicant Name", key: "applicant.name", type: "text" },
      { label: "Applicant Email", key: "applicant.email", type: "text" },
      { label: "Applicant Phone", key: "applicant.phone", type: "text" },
      { label: "Applicant Remarks", key: "applicant.applicantRemarks", type: "text" },
    ],
  },
  {
    groupLabel: "Preference",
    columns: [
      { label: "Concert Availability", key: "preference.concertAvailability", type: "text" },
      { label: "Rehearsal Availability", key: "preference.rehearsalAvailability", type: "text" },
      { label: "Preference Remarks", key: "preference.preferenceRemarks", type: "text" },
    ],
  },
  {
    groupLabel: "Stage Requirements",
    columns: [
      { label: "Chair Count", key: "stageRequirement.chairCount", type: "numeric" },
      { label: "Music Stand Count", key: "stageRequirement.musicStandCount", type: "numeric" },
      { label: "Microphone Count", key: "stageRequirement.microphoneCount", type: "numeric" },
      { label: "Provided Equipment", key: "stageRequirement.providedEquipment", type: "text" },
      { label: "Self Equipment", key: "stageRequirement.selfEquipment", type: "text" },
      { label: "Stage Remarks", key: "stageRequirement.stageRemarks", type: "text" },
    ],
  },
];

const newRowPrefix = "new-";
const idAtColumn = 0;

export function PerformanceEditGrid({ data: performances }: { data: PerformanceEditForm[] }) {
  const hotRef = useRef<HotTableRef>(null);
  const [data, setData] = useState<PerformanceEditForm[]>(performances);
  const [systemMessage, setSystemMessage] = useState<ReactElement>(<div>No system message.</div>);

  const exportCsvCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Show error message
      return;
    }
    const exportPlugin = hot.getPlugin("exportFile");

    exportPlugin.downloadFile("csv", {
      bom: false,
      columnDelimiter: ",",
      columnHeaders: true,
      exportHiddenColumns: true,
      exportHiddenRows: true,
      fileExtension: "csv",
      filename: "Handsontable-CSV-file_[YYYY]-[MM]-[DD]",
      mimeType: "text/csv",
      rowDelimiter: "\r\n",
      rowHeaders: true,
    });
  };

  const addRowCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      setSystemMessage(<SystemMessage message="Failed to add row: Hot instance not found." type="error" />);
      return;
    }
    hot.alter("insert_row_below", hot.countRows());
  };

  const fetchUpdatesCallback = async () => {
    const newResults = await getPerformanceEditFormController();
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      setSystemMessage(<SystemMessage message="Failed to fetch updates: Hot instance not found." type="error" />);
      return;
    }
    if (newResults.success) {
      // We need to remove all rows and call setData because the data does not update correctly if we just call loadData or updateData
      // - loadData just follows the original data, not the new data
      // - updateData just follows the current state of the table, not the new data
      hot.alter("remove_row", 0, hot.countRows(), "updateData");
      setData(newResults.data);
    } else {
      setSystemMessage(<SystemMessage message="Fetch failed." type="error" />);
    }
    console.log("Table updated");
  };

  const afterChangeCallback = async (changes: CellChange[]) => {
    const results = [];
    for (const change of changes) {
      const [row, column, oldValue, newValue] = change;
      const id = hotRef.current?.hotInstance?.getDataAtCell(row, idAtColumn);
      if (typeof column !== "string") {
        throw new TypeError(`Unexpected column (key) type ${typeof column}, expected string`);
      }
      if (typeof id !== "string") {
        console.error(id);
        throw new TypeError(`Unexpected id type "${typeof id}", expected string`);
      }
      setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
      if (id.startsWith(newRowPrefix)) {
        const result = await savePerformanceDataController([
          {
            type: "create",
            key: column,
            oldValue,
            newValue,
            id,
          },
        ]);
        results.push(result);
      } else {
        const result = await savePerformanceDataController([
          {
            type: "update",
            key: column,
            oldValue,
            newValue,
            id,
          },
        ]);
        results.push(result);
      }
    }
    if (results.every((result) => result.success)) {
      setSystemMessage(<SystemMessage message="Changes saved." type="success" />);
    } else {
      const messages = results.map((result) => result.message);
      console.error("Error: Failed to save changes", messages);
      setSystemMessage(<SystemMessage message="Failed to save changes." type="error" />);
    }
    fetchUpdatesCallback();
  };

  const afterCreateRowCallback = async (index: number, amount: number) => {
    // rows := [index, index + 1, ..., index + amount - 1]
    const rows = new Array(amount).fill(index).map((value, index) => value + index);
    for (const row of rows) {
      const timestamp = Date.now().toString();
      hotRef.current?.hotInstance?.setDataAtCell(row, idAtColumn, newRowPrefix + timestamp, "updateData");
    }
  };

  const beforeRemoveRowCallback = async (index: number, amount: number) => {
    // rows := [index, index + 1, ..., index + amount - 1]
    const rows: number[] = new Array(amount).fill(index).map((value, index) => value + index);
    for (const row of rows) {
      const id = hotRef.current?.hotInstance?.getDataAtCell(row, idAtColumn);
      if (typeof id !== "string") {
        throw new TypeError(`Unexpected id type ${typeof id}, expected string`);
      }
      if (id.startsWith(newRowPrefix)) {
        continue;
      }
      setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
      const result = await savePerformanceDataController([
        {
          type: "delete",
          id,
        },
      ]);
      if (result.success) {
        setSystemMessage(<SystemMessage message="Changes saved." type="success" />);
      } else {
        setSystemMessage(<SystemMessage message={result.message} type="error" />);
      }
    }
    fetchUpdatesCallback();
  };

  const nestedHeaders = [
    performanceColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    performanceColumnGroups.flatMap((column) => column.columns.map((column) => column.label)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={data}
          nestedHeaders={nestedHeaders}
          columns={performanceColumnGroups.flatMap((column) => {
            return column.columns.map((column) => {
              const baseConfig = {
                data: column.key,
                type: column.type,
                readOnly: column.readOnly,
                width: column.width,
              };
              return baseConfig;
            });
          })}
          allowInvalid={false}
          allowEmpty={true}
          // undo={true}
          undo={false}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          // contextMenu={["remove_row", "undo", "redo"]}
          contextMenu={["remove_row"]}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
          afterChange={(changes, source) => {
            if (!isUserInputSource(source) || changes === null) {
              return;
            }
            afterChangeCallback(changes);
          }}
          afterCreateRow={(index, amount, source) => {
            if (!isUserInputSource(source)) {
              return;
            }
            afterCreateRowCallback(index, amount);
          }}
          beforeRemoveRow={(index, amount, physicalRows, source) => {
            if (!isUserInputSource(source)) {
              return;
            }
            beforeRemoveRowCallback(index, amount);
          }}
        />
      </div>
      <div className="flex justify-center">
        <button onClick={() => exportCsvCallback()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
          Download CSV
        </button>
        <button onClick={() => addRowCallback()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
          Add Row
        </button>
      </div>
      <div className="flex justify-center p-2 text-gray-500">{systemMessage}</div>
    </>
  );
}
