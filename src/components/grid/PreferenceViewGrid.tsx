"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { PreferenceView } from "@/models/views.model";
import { DateTime, Duration } from "luxon";
import { useCallback, useEffect, useRef, useState } from "react";
import { getPreferenceViewController } from "@/actions/get-views.controller";
import { EDITOR_STATE } from "handsontable/editors/baseEditor";

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

const updateInterval = Duration.fromObject({ seconds: 15 });

export function PreferenceViewGrid({ performances }: { performances: PreferenceView[] }) {
  const hotRef = useRef<HotTableRef>(null);
  const [data, setData] = useState<PreferenceView[]>(performances);
  const nextUpdate = useRef(DateTime.now().plus(updateInterval));

  const fetchUpdatesCallback = useCallback(async () => {
    const newResults = await getPreferenceViewController();
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Handle this error
      return;
    }
    if (newResults.success) {
      // We need to remove all rows and call setData because the data does not update correctly if we just call loadData or updateData
      // - loadData just follows the original data, not the new data
      // - updateData just follows the current state of the table, not the new data
      hot.alter("remove_row", 0, hot.countRows(), "updateData");
      setData(newResults.data);
    } else {
      // TODO: Handle this error
    }
    console.log("Table updated (preference view).");
    nextUpdate.current = DateTime.now().plus(updateInterval);
  }, []);

  useEffect(() => {
    const timerID = setInterval(() => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) {
        // TODO: Handle this error
        return;
      }
      if (hot.getActiveEditor()?.state === EDITOR_STATE.EDITING) {
        return;
      }
      if (DateTime.now() > nextUpdate.current) {
        fetchUpdatesCallback();
      }
    }, 3000);

    return () => {
      clearInterval(timerID);
    };
  }, [fetchUpdatesCallback]);

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
          ref={hotRef}
          data={data}
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
