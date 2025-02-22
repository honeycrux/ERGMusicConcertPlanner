"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable } from "@handsontable/react-wrapper";
import { PerformanceDetailView } from "@/models/views.model";

const performanceDetailViewColumnGroups = [
  {
    groupLabel: "Time Slot",
    columns: [
      { title: "Order", data: "timeSlot.order", type: "text", editor: false },
      { title: "Name", data: "timeSlot.name", type: "text", editor: false },
      { title: "Start Time", data: "timeSlot.startTime", type: "text", editor: false },
      { title: "Duration", data: "timeSlot.duration", type: "text", editor: false },
    ],
  },
  {
    groupLabel: "Performance",
    columns: [
      { title: "Genre", data: "performance.genre", type: "text", editor: false },
      { title: "Applicant Name", data: "performance.applicant.name", type: "text", editor: false },
    ],
  },
  {
    groupLabel: "Performance Detail",
    columns: [
      { title: "Piece", data: "performance.piece", type: "text", editor: false },
      { title: "Performance Description", data: "performance.performanceDescription", type: "text", editor: false },
      { title: "Performer List", data: "performance.performerList", type: "text", editor: false },
      { title: "Performer Description", data: "performance.performerDescription", type: "text", editor: false },
      { title: "General Remarks", data: "performance.generalRemarks", type: "text", editor: false },
    ],
  },
];

export function PerformanceDetailViewGrid({ performances }: { performances: PerformanceDetailView[] }) {
  const nestedHeaders = [
    performanceDetailViewColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    performanceDetailViewColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          data={performances}
          nestedHeaders={nestedHeaders}
          columns={performanceDetailViewColumnGroups.flatMap((group) => group.columns)}
          allowInvalid={false}
          allowEmpty={true}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          persistentState={true}
          manualRowResize={true}
          manualColumnResize={true}
          fillHandle={false}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </>
  );
}
