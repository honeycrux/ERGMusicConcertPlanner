"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useRef, useState } from "react";
import { RundownColumnKey, saveConcertSlotDataController } from "@/actions/save-rundown-data.controller";
import { PreferenceView, RundownEditForm } from "@/models/views.model";
import { SystemMessage } from "./grid-utils";

type RundownColumnGroupDefinition = {
  groupLabel: string;
  columns: { title: string; data: RundownColumnKey; type: string; readOnly?: boolean; width?: number }[];
};

const rundownColumnGroups: RundownColumnGroupDefinition[] = [
  {
    groupLabel: "Time Slot",
    columns: [
      { title: "ID", data: "id", type: "text", readOnly: true, width: 200 },
      { title: "Order", data: "order", type: "numeric", readOnly: true },
      { title: "Name", data: "name", type: "text" },
      { title: "Start Time", data: "startTime", type: "text" },
      { title: "Event Duration", data: "eventDuration", type: "text" },
      { title: "Buffer Duration", data: "bufferDuration", type: "text" },
      { title: "Remarks", data: "remarks", type: "text" },
    ],
  },
  {
    groupLabel: "Performance",
    columns: [
      { title: "ID", data: "performance.id", type: "dropdown", width: 240 },
      { title: "Genre", data: "performance.genre", type: "text", readOnly: true },
      { title: "Applicant Name", data: "performance.applicant.name", type: "text", readOnly: true },
    ],
  },
  {
    groupLabel: "Preference",
    columns: [
      { title: "Concert Availability", data: "preference.concertAvailability", type: "text", readOnly: true },
      { title: "Rehearsal Availability", data: "preference.rehearsalAvailability", type: "text", readOnly: true },
      { title: "Remarks", data: "preference.preferenceRemarks", type: "text", readOnly: true },
    ],
  },
];

const rundownKeyOrder = rundownColumnGroups.flatMap((column) => column.columns.map((column) => column.data));

export function RundownEditGrid({ rundown, performances }: { rundown: RundownEditForm[]; performances: PreferenceView[] }) {
  const hotRef = useRef<HotTableRef>(null);
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

  const saveChangesCallback = async () => {
    setSystemMessage(<div>Saving changes...</div>);
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      setSystemMessage(<SystemMessage message="Failed to save changes: Hot instance not found." type="error" />);
      return;
    }
    const data = hot.getData();
    const result = await saveConcertSlotDataController(data, rundownKeyOrder);
    if (!result.success) {
      setSystemMessage(<SystemMessage message={result.message} type="error" />);
      return;
    }
    setSystemMessage(<SystemMessage message={result.message} type="success" />);
  };

  const nestedHeaders = [
    rundownColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    rundownColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={rundown}
          nestedHeaders={nestedHeaders}
          columns={rundownColumnGroups.flatMap((column) => {
            return column.columns.map((column) => {
              const baseConfig = column;
              if (column.data === "performance.id") {
                return {
                  ...baseConfig,
                  source: ["", ...performances.map((performance) => performance.id)],
                  type: "dropdown",
                };
              }
              return baseConfig;
            });
          })}
          allowInvalid={false}
          allowEmpty={true}
          undo={true}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          contextMenu={["remove_row", "undo", "redo"]}
          // height="auto"
          manualRowMove={true}
          licenseKey="non-commercial-and-evaluation"
          afterChange={(changes, source) => {
            if (source === "loadData") {
              return;
            }
            console.log("change:", changes);
            console.log("source:", source);
          }}
          afterCreateRow={(index, amount, source) => {
            if (source === "loadData") {
              return;
            }
            console.log("index:", index);
            console.log("amount:", amount);
            console.log("source:", source);
          }}
          beforeRemoveRow={(index, amount, physicalRows, source) => {
            if (source === "loadData") {
              return;
            }
            console.log("index:", index);
            console.log("amount:", amount);
            console.log("physicalRows:", physicalRows);
            console.log("source:", source);
            console.log(hotRef.current?.hotInstance?.getDataAtCell(index, 0));
          }}
          afterRowMove={(movedRows, finalIndex, dropIndex, movePossible, orderChanged) => {
            console.log("movedRows:", movedRows);
            console.log("finalIndex:", finalIndex);
            console.log("dropIndex:", dropIndex);
            console.log("movePossible:", movePossible);
            console.log("orderChanged:", orderChanged);
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
        <button onClick={() => saveChangesCallback()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
          Save Changes
        </button>
      </div>
      <div className="flex justify-center p-2 text-gray-500">{systemMessage}</div>
    </>
  );
}
