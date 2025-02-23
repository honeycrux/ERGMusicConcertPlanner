"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable } from "@handsontable/react-wrapper";
import { PreferenceView } from "@/models/views.model";

const preferenceViewColumnGroups = [
  {
    groupLabel: "Performance",
    columns: [
      { title: "ID", data: "id", type: "text", readOnly: true, width: 220 },
      { title: "Genre", data: "genre", type: "text", readOnly: true },
      { title: "Applicant Name", data: "applicant.name", type: "text", readOnly: true },
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

export function PreferenceViewGrid({ performances }: { performances: PreferenceView[] }) {
  const nestedHeaders = [
    preferenceViewColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    preferenceViewColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          data={performances}
          nestedHeaders={nestedHeaders}
          columns={preferenceViewColumnGroups.flatMap((group) => group.columns)}
          allowInvalid={false}
          allowEmpty={true}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          fillHandle={false}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </>
  );
}
