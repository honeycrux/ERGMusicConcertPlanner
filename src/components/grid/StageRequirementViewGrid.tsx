"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { StageRequirementView } from "@/models/views.model";
import React from "react";
import { ActionButton } from "../common/ActionButton";
import { exportCsv } from "./grid-utils";
import { RundownType } from "@/models/rundown.model";

const stageRequirementViewColumnGroups = [
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
    groupLabel: "Stage Requirement",
    columns: [
      { title: "#Chairs", data: "performance.stageRequirement.chairCount", type: "numeric", editor: false },
      { title: "#Stands", data: "performance.stageRequirement.musicStandCount", type: "numeric", editor: false },
      { title: "#Mics", data: "performance.stageRequirement.microphoneCount", type: "numeric", editor: false },
      { title: "Provided", data: "performance.stageRequirement.providedEquipment", type: "text", editor: false },
      { title: "Self", data: "performance.stageRequirement.selfEquipment", type: "text", editor: false },
      { title: "Remarks", data: "performance.stageRequirement.stageRemarks", type: "text", editor: false },
      { title: "Stage Actions", data: "timeSlot.stageActions", type: "text", editor: false },
    ],
  },
];

export function StageRequirementViewGrid({ performances, rundownType }: { performances: StageRequirementView[]; rundownType: RundownType }) {
  const hotRef = React.useRef<HotTableRef>(null);

  const exportCsvCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Show error message
      return;
    }
    exportCsv(hot, `Stage-Requirement_${rundownType}`);
  };

  const nestedHeaders = [
    stageRequirementViewColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    stageRequirementViewColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={performances}
          nestedHeaders={nestedHeaders}
          columns={stageRequirementViewColumnGroups.flatMap((group) => group.columns)}
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
