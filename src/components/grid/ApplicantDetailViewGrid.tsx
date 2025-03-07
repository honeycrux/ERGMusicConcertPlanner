"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ApplicantDetailView } from "@/models/views.model";
import React from "react";
import { ActionButton } from "../common/ActionButton";
import { exportCsv } from "./grid-utils";
import { RundownType } from "@/models/rundown.model";

const applicantDetailViewColumnGroups = [
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
    groupLabel: "Applicant Detail",
    columns: [
      { title: "Email", data: "performance.applicant.email", type: "text", editor: false },
      { title: "Phone", data: "performance.applicant.phone", type: "text", editor: false },
      { title: "Remarks", data: "performance.applicant.applicantRemarks", type: "text", editor: false },
    ],
  },
  {
    groupLabel: "Preference",
    columns: [
      { title: "Perform Duration", data: "performance.preference.performDuration", type: "text", editor: false },
      { title: "Concert Availability", data: "performance.preference.concertAvailability", type: "text", editor: false },
      { title: "Rehearsal Availability", data: "performance.preference.rehearsalAvailability", type: "text", editor: false },
      { title: "Remarks", data: "performance.preference.preferenceRemarks", type: "text", editor: false },
    ],
  },
];

export function ApplicantDetailViewGrid({ performances, rundownType }: { performances: ApplicantDetailView[]; rundownType: RundownType }) {
  const hotRef = React.useRef<HotTableRef>(null);

  const exportCsvCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Show error message
      return;
    }
    exportCsv(hot, `Applicant-Detail_${rundownType}`);
  };

  const nestedHeaders = [
    applicantDetailViewColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    applicantDetailViewColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={performances}
          nestedHeaders={nestedHeaders}
          columns={applicantDetailViewColumnGroups.flatMap((group) => group.columns)}
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
      <div className="px-4 py-2">
        <ActionButton onClick={exportCsvCallback}>Download CSV</ActionButton>
      </div>
    </>
  );
}
