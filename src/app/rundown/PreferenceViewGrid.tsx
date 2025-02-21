"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable } from "@handsontable/react-wrapper";
import { PreferenceView } from "@/models/views.model";

const preferenceViewColumns = [
  { title: "ID", data: "id", type: "text", readOnly: true, width: 220 },
  { title: "Genre", data: "genre", type: "text", readOnly: true },
  { title: "Applicant Name", data: "applicant.name", type: "text", readOnly: true },
  { title: "Concert Availability", data: "preference.concertAvailability", type: "text", readOnly: true },
  { title: "Rehearsal Availability", data: "preference.rehearsalAvailability", type: "text", readOnly: true },
  { title: "Preference Remarks", data: "preference.preferenceRemarks", type: "text", readOnly: true },
];

export function PreferenceViewGrid({ performances }: { performances: PreferenceView[] }) {
  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          data={performances}
          columns={preferenceViewColumns}
          allowInvalid={false}
          allowEmpty={true}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </>
  );
}
