"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable } from "@handsontable/react-wrapper";
import { PreferenceView } from "@/models/views.model";

const preferenceViewColumns = [
  { label: "ID", key: "id", type: "text", readOnly: true, default: undefined, width: 220 },
  { label: "Genre", key: "genre", type: "text", readOnly: true, default: "" },
  { label: "Applicant Name", key: "applicant.name", type: "text", readOnly: true, default: "" },
  { label: "Concert Availability", key: "preference.concertAvailability", type: "text", readOnly: true, default: "" },
  { label: "Rehearsal Availability", key: "preference.rehearsalAvailability", type: "text", readOnly: true, default: "" },
  { label: "Preference Remarks", key: "preference.preferenceRemarks", type: "text", readOnly: true, default: "" },
];

export function PreferenceViewGrid({ performances }: { performances: PreferenceView[] }) {
  console.log(performances);
  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          data={performances}
          columns={preferenceViewColumns.map((column) => {
            return {
              data: column.key,
              title: column.label,
              type: column.type,
              readOnly: column.readOnly,
              width: column.width,
            };
          })}
          allowInvalid={false}
          allowEmpty={true}
          undo={true}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          contextMenu={["remove_row", "undo", "redo"]}
          height="auto"
          manualRowMove={true}
          licenseKey="non-commercial-and-evaluation"
        />
      </div>
    </>
  );
}
