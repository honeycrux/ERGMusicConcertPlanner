"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { savePerformanceDataController } from "@/actions/save-performance-data.controller";
import { PerformanceEditForm } from "@/models/views.model";
import { PerformanceControlKey } from "@/models/performance.model";
import { CellChange } from "handsontable/common";
import { getPerformanceEditFormController } from "@/actions/get-performance-edit-form.controller";
import { SystemMessage } from "./SystemMessage";
import { durationValidator, exportCsv, isUserInputSource } from "./grid-utils";
import { DateTime, Duration } from "luxon";
import { EDITOR_STATE } from "handsontable/editors/baseEditor";
import { ActionButton } from "../common/ActionButton";
import { BaseValidator } from "handsontable/validators";

export type PerformanceColumnGroupDefinition = {
  groupLabel: string;
  columns: { title: string; data: PerformanceControlKey; type: "text" | "numeric"; readOnly?: boolean; width?: number; validator?: BaseValidator }[];
};

export const performanceColumnGroups: PerformanceColumnGroupDefinition[] = [
  {
    groupLabel: "Performance",
    columns: [
      { title: "ID", data: "id", type: "text", readOnly: true, width: 200 },
      { title: "Genre", data: "genre", type: "text" },
      { title: "Piece", data: "piece", type: "text" },
      { title: "Performance Description", data: "description", type: "text" },
      { title: "Performer List", data: "performerList", type: "text" },
      { title: "Performer Description", data: "performerDescription", type: "text" },
      { title: "General Remarks", data: "remarks", type: "text" },
    ],
  },
  {
    groupLabel: "Applicant",
    columns: [
      { title: "Applicant Name", data: "applicant.name", type: "text" },
      { title: "Applicant Email", data: "applicant.email", type: "text" },
      { title: "Applicant Phone", data: "applicant.phone", type: "text" },
      { title: "Applicant Remarks", data: "applicant.applicantRemarks", type: "text" },
    ],
  },
  {
    groupLabel: "Preference",
    columns: [
      { title: "Perform Duration", data: "preference.performDuration", type: "text", validator: durationValidator },
      { title: "Concert Availability", data: "preference.concertAvailability", type: "text" },
      { title: "Rehearsal Availability", data: "preference.rehearsalAvailability", type: "text" },
      { title: "Preference Remarks", data: "preference.preferenceRemarks", type: "text" },
    ],
  },
  {
    groupLabel: "Stage Requirements",
    columns: [
      { title: "Chair Count", data: "stageRequirement.chairCount", type: "numeric" },
      { title: "Music Stand Count", data: "stageRequirement.musicStandCount", type: "numeric" },
      { title: "Microphone Count", data: "stageRequirement.microphoneCount", type: "numeric" },
      { title: "Provided Equipment", data: "stageRequirement.providedEquipment", type: "text" },
      { title: "Self Equipment", data: "stageRequirement.selfEquipment", type: "text" },
      { title: "Stage Remarks", data: "stageRequirement.stageRemarks", type: "text" },
    ],
  },
];

const newRowPrefix = "new-";
const idAtColumn = 0;
const updateInterval = Duration.fromObject({ seconds: 15 });

export function PerformanceEditGrid() {
  const hotRef = useRef<HotTableRef>(null);
  const [performances, setPerformances] = useState<PerformanceEditForm[]>([]);
  const [systemMessage, setSystemMessage] = useState<ReactElement>(<div>No system message.</div>);
  const nextUpdate = useRef(DateTime.now().plus(updateInterval));

  const exportCsvCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Show error message
      return;
    }
    exportCsv(hot, "Performance");
  };

  const addRowCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      setSystemMessage(<SystemMessage message="Failed to add row: Hot instance not found." type="error" />);
      return;
    }
    hot.alter("insert_row_below", hot.countRows());
  };

  const fetchUpdatesCallback = useCallback(async () => {
    const newResults = await getPerformanceEditFormController();
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      setSystemMessage(<SystemMessage message="Failed to fetch updates: Hot instance not found." type="error" />);
      return;
    }
    if (newResults.success) {
      // We need to remove all rows and call setData because the data does not update correctly if we just call loadData or updateData
      // - loadData just follows the original data, not the new data
      // - updateData just follows the current state of the table, not the new data
      hot.alter("remove_row", 0, hot.countRows(), "updateData");
      setPerformances(newResults.data);
    } else {
      setSystemMessage(<SystemMessage message="Fetch failed." type="error" />);
    }
    console.log("Table updated");
    nextUpdate.current = DateTime.now().plus(updateInterval);
  }, []);

  const afterChangeCallback = async (changes: CellChange[]) => {
    const results = [];
    for (const change of changes) {
      const [row, column, oldValue, newValue] = change;
      const id = hotRef.current?.hotInstance?.getDataAtCell(row, idAtColumn);
      if (typeof column !== "string") {
        console.error("column", column);
        const message = `Unexpected column (key) type ${typeof column}, expected string`;
        setSystemMessage(<SystemMessage message={message} type="error" />);
        return;
      }
      if (typeof id !== "string") {
        console.error("id", id);
        const message = `Unexpected id type ${typeof id}, expected string`;
        setSystemMessage(<SystemMessage message={message} type="error" />);
        return;
      }
      setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
      if (id.startsWith(newRowPrefix)) {
        const result = await savePerformanceDataController([
          {
            type: "create",
            key: column,
            oldValue,
            newValue,
            id,
          },
        ]);
        results.push(result);
      } else {
        const result = await savePerformanceDataController([
          {
            type: "update",
            key: column,
            oldValue,
            newValue,
            id,
          },
        ]);
        results.push(result);
      }
    }
    if (results.every((result) => result.success)) {
      setSystemMessage(<SystemMessage message="Changes saved." type="success" />);
    } else {
      const messages = results.map((result) => result.message);
      console.error("Error: Failed to save changes", messages);
      setSystemMessage(<SystemMessage message="Failed to save changes." type="error" />);
    }
    fetchUpdatesCallback();
  };

  const afterCreateRowCallback = async (index: number, amount: number) => {
    // rows := [index, index + 1, ..., index + amount - 1]
    const rows = new Array(amount).fill(index).map((value, index) => value + index);
    for (const row of rows) {
      const timestamp = Date.now().toString();
      hotRef.current?.hotInstance?.setDataAtCell(row, idAtColumn, newRowPrefix + timestamp, "updateData");
    }
  };

  const beforeRemoveRowCallback = async (index: number, amount: number) => {
    // rows := [index, index + 1, ..., index + amount - 1]
    const rows: number[] = new Array(amount).fill(index).map((value, index) => value + index);
    const ids = rows.map((row) => hotRef.current?.hotInstance?.getDataAtCell(row, idAtColumn));
    const validIds = [];
    for (const id of ids) {
      if (typeof id !== "string") {
        console.error(`id: ${id}`);
        const message = `Unexpected id type ${typeof id}, expected string`;
        setSystemMessage(<SystemMessage message={message} type="error" />);
        return;
      }
      if (!id.startsWith(newRowPrefix)) {
        validIds.push(id);
      }
    }
    setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
    const result = await savePerformanceDataController(
      validIds.map((id) => ({
        type: "delete",
        id,
      }))
    );
    if (result.success) {
      setSystemMessage(<SystemMessage message="Changes saved." type="success" />);
    } else {
      setSystemMessage(<SystemMessage message={result.message} type="error" />);
    }
    fetchUpdatesCallback();
  };

  useEffect(() => {
    fetchUpdatesCallback();

    const timerID = setInterval(() => {
      const hot = hotRef.current?.hotInstance;
      if (!hot) {
        setSystemMessage(<SystemMessage message="Failed to fetch updates: Hot instance not found." type="error" />);
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
    performanceColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    performanceColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={performances}
          nestedHeaders={nestedHeaders}
          columns={performanceColumnGroups.flatMap((column) => {
            return column.columns.map((column) => {
              const baseConfig = {
                data: column.data,
                type: column.type,
                readOnly: column.readOnly,
                width: column.width,
                validator: column.validator,
              };
              return baseConfig;
            });
          })}
          allowInvalid={false}
          allowEmpty={true}
          // undo={true}
          undo={false}
          wordWrap={true}
          rowHeaders={true}
          colHeaders={true}
          colWidths={150}
          // contextMenu={["remove_row", "undo", "redo"]}
          contextMenu={["remove_row"]}
          height="auto"
          licenseKey="non-commercial-and-evaluation"
          afterChange={(changes, source) => {
            if (!isUserInputSource(source) || changes === null) {
              return;
            }
            afterChangeCallback(changes);
          }}
          afterCreateRow={(index, amount, source) => {
            if (!isUserInputSource(source)) {
              return;
            }
            afterCreateRowCallback(index, amount);
          }}
          beforeRemoveRow={(index, amount, physicalRows, source) => {
            if (!isUserInputSource(source)) {
              return;
            }
            beforeRemoveRowCallback(index, amount);
          }}
        />
      </div>
      <div className="flex justify-center px-4 p-2">
        <ActionButton onClick={exportCsvCallback}>Download CSV</ActionButton>
        <ActionButton onClick={addRowCallback}>Add Row</ActionButton>
      </div>
      <div className="flex justify-center p-2 text-gray-500">{systemMessage}</div>
    </>
  );
}
