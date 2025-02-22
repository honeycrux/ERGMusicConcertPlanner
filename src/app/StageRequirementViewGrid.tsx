"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable } from "@handsontable/react-wrapper";
import { StageRequirementView } from "@/models/views.model";

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
      { title: "#Stands", data: "performance.stageRequirement.standCount", type: "numeric", editor: false },
      { title: "#Mics", data: "performance.stageRequirement.micCount", type: "numeric", editor: false },
      { title: "Provided", data: "performance.stageRequirement.providedEquipment", type: "text", editor: false },
      { title: "Self", data: "performance.stageRequirement.selfEquipment", type: "text", editor: false },
      { title: "Remarks", data: "performance.stageRequirement.remarks", type: "text", editor: false },
      { title: "Stage Actions", data: "performance.timeSlot.stageActions", type: "text", editor: false },
    ],
  },
];

export function StageRequirementViewGrid({ performances }: { performances: StageRequirementView[] }) {
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
    </>
  );
}
