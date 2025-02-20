"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useRef, useState } from "react";
import { rundownSlotColumnGroups, RundownSlotData } from "@/models/rundown.model";
import { saveConcertSlotDataController } from "@/actions/save-rundown-data.controller";
import { PreferenceView } from "@/models/views.model";

export function ConcertRundownGrid({ rundownSlots, performances }: { rundownSlots: RundownSlotData[]; performances: PreferenceView[] }) {
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
    const result = await saveConcertSlotDataController(data);
    if (!result.success) {
      displaySystemMessage(result.message, "error");
      return;
    }
    displaySystemMessage(result.message, "success");
  };

  const nestedHeaders = [
    rundownSlotColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    rundownSlotColumnGroups.flatMap((column) => column.columns.map((column) => column.label)),
  ];

  console.log(rundownSlots);

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={rundownSlots}
          nestedHeaders={nestedHeaders}
          columns={rundownSlotColumnGroups.flatMap((column) => {
            return column.columns.map((column) => {
              const baseConfig = {
                data: column.key,
                type: column.type,
                readOnly: column.readOnly,
                width: column.width,
              };
              if (column.key === "performance.id") {
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
