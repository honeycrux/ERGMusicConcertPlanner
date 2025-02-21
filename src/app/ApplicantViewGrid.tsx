"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable } from "@handsontable/react-wrapper";
import { ApplicantDetailView } from "@/models/views.model";

const applicantViewColumnGroups = [
  {
    groupLabel: "Time Slot",
    columns: [
      { title: "Order", data: "timeSlot.order", type: "text", editor: false, default: undefined },
      { title: "Name", data: "timeSlot.name", type: "text", editor: false, default: undefined },
      { title: "Start Time", data: "timeSlot.startTime", type: "text", editor: false, default: "" },
      { title: "Duration", data: "timeSlot.duration", type: "text", editor: false, default: "" },
    ],
  },
  {
    groupLabel: "Performance",
    columns: [
      { title: "Genre", data: "performance.genre", type: "text", editor: false, default: "" },
      { title: "Applicant Name", data: "performance.applicant.name", type: "text", editor: false, default: "" },
    ],
  },
  {
    groupLabel: "Applicant Details",
    columns: [
      { title: "Email", data: "performance.applicant.email", type: "text", editor: false, default: "" },
      { title: "Phone", data: "performance.applicant.phone", type: "text", editor: false, default: "" },
      { title: "Remarks", data: "performance.applicant.applicantRemarks", type: "text", editor: false, default: "" },
    ],
  },
];

export function ApplicantViewGrid({ performances }: { performances: ApplicantDetailView[] }) {
  const nestedHeaders = [
    applicantViewColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    applicantViewColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          data={performances}
          nestedHeaders={nestedHeaders}
          columns={applicantViewColumnGroups.flatMap((group) => group.columns)}
          allowInvalid={false}
          allowEmpty={true}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          persistentState={true}
          manualRowResize={true}
          manualColumnResize={true}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </>
  );
}
