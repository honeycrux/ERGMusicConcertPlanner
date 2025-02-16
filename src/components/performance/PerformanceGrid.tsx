"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { PerformanceData } from "@/models/performanceData";
import { useRef } from "react";

export function PerformanceGrid({ data }: { data: PerformanceData[] }) {
  const hotRef = useRef<HotTableRef>(null);

  const buttonClickCallback = () => {
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

  const nestedHeaders = [
    [
      { label: "Performance", colspan: 6 },
      { label: "Applicant", colspan: 4 },
      { label: "Preference", colspan: 3 },
      { label: "Stage Requirements", colspan: 5 },
    ],
    [
      "Genre",
      "Piece",
      "Description",
      "Performer List",
      "Performer Description",
      "Remarks",
      "Applicant Name",
      "Applicant Email",
      "Applicant Phone",
      "Applicant Remarks",
      "Concert Availability",
      "Rehearsal Availability",
      "Preference Remarks",
      "Chair Count",
      "Music Stand Count",
      "Microphone Count",
      "Other Equipment",
      "Stage Remarks",
    ],
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={data}
          nestedHeaders={nestedHeaders}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          height="auto"
          autoWrapRow={true}
          autoWrapCol={true}
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
      <div className="flex justify-center">
        <button id="export-file" onClick={() => buttonClickCallback()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
          Download CSV
        </button>
      </div>
    </>
  );
}
