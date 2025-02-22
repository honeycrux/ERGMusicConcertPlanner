"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useRef, useState } from "react";
import { RundownColumnKey, saveConcertSlotDataController } from "@/actions/save-rundown-data.controller";
import { PreferenceView, RundownEditForm } from "@/models/views.model";

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
      { title: "ID", data: "performance.id", type: "dropdown", width: 220 },
      { title: "Genre", data: "performance.genre", type: "text", readOnly: true },
      { title: "Applicant Name", data: "performance.applicant.name", type: "text", readOnly: true },
      { title: "Concert Availability", data: "preference.concertAvailability", type: "text", readOnly: true },
      { title: "Rehearsal Availability", data: "preference.rehearsalAvailability", type: "text", readOnly: true },
      { title: "Preference Remarks", data: "preference.preferenceRemarks", type: "text", readOnly: true },
    ],
  },
];

const rundownKeyOrder = rundownColumnGroups.flatMap((column) => column.columns.map((column) => column.data));

export function RundownEditGrid({ rundown, performances }: { rundown: RundownEditForm[]; performances: PreferenceView[] }) {
  const hotRef = useRef<HotTableRef>(null);
  const [systemMessage, setSystemMessage] = useState<ReactElement>(<div>No system message.</div>);

  const displaySystemMessage = (message: string, type: "success" | "error" | "default") => {
    let className: string;
    switch (type) {
      case "success":
        className = "text-green-500";
        break;
      case "error":
        className = "text-red-500";
        break;
      default:
        className = "";
        break;
    }
    const currentDate = new Date();
    const currentHour = currentDate.getHours().toString().padStart(2, "0");
    const currentMinute = currentDate.getMinutes().toString().padStart(2, "0");
    const currentSecond = currentDate.getSeconds().toString().padStart(2, "0");
    const currentTime = `${currentHour}:${currentMinute}:${currentSecond}`;
    setSystemMessage(
      <div className={className}>
        {currentTime} -- {message}
      </div>
    );
  };

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
      displaySystemMessage("Failed to add row: Hot instance not found.", "error");
      return;
    }
    hot.alter("insert_row_below", hot.countRows());
  };

  const saveChangesCallback = async () => {
    setSystemMessage(<div>Saving changes...</div>);
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      displaySystemMessage("Failed to save changes: Hot instance not found.", "error");
      return;
    }
    const data = hot.getData();
    console.log(data);
    const result = await saveConcertSlotDataController(data, rundownKeyOrder);
    if (!result.success) {
      displaySystemMessage(result.message, "error");
      return;
    }
    displaySystemMessage(result.message, "success");
  };

  const nestedHeaders = [
    rundownColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    rundownColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  console.log(rundown);

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
