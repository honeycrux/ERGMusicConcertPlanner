"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useCallback, useEffect, useRef, useState } from "react";
import { PreferenceView, RundownEditForm } from "@/models/views.model";
import { SystemMessage } from "./SystemMessage";
import { RundownControlKey, RundownType } from "@/models/rundown.model";
import { datetimeValidator, durationValidator, exportCsv, isUserInputSource } from "./grid-utils";
import { getRundownEditFormController } from "@/actions/get-rundown-edit-form.controller";
import { CellChange } from "handsontable/common";
import { saveRundownDataController } from "@/actions/save-rundown-data.controller";
import { z } from "zod";
import { EDITOR_STATE } from "handsontable/editors/baseEditor";
import { Duration, DateTime } from "luxon";
import { ActionButton } from "../common/ActionButton";
import { BaseValidator } from "handsontable/validators";

type RundownColumnGroupDefinition = {
  groupLabel: string;
  columns: { title: string; data: RundownControlKey; type: string; readOnly?: boolean; width?: number; validator?: BaseValidator }[];
};

const rundownColumnGroups: RundownColumnGroupDefinition[] = [
  {
    groupLabel: "Time Slot",
    columns: [
      { title: "ID", data: "id", type: "text", readOnly: true, width: 200 },
      { title: "Order", data: "order", type: "numeric", readOnly: true },
      { title: "Name", data: "name", type: "text" },
      { title: "Start Time", data: "startTime", type: "text", validator: datetimeValidator },
      { title: "Event Duration", data: "eventDuration", type: "text", validator: durationValidator },
      { title: "Buffer Duration", data: "bufferDuration", type: "text", validator: durationValidator },
      { title: "Remarks", data: "remarks", type: "text" },
    ],
  },
  {
    groupLabel: "Performance",
    columns: [
      { title: "ID", data: "performance.id", type: "dropdown", width: 240 },
      { title: "Genre", data: "performance.genre", type: "text", readOnly: true },
      { title: "Applicant Name", data: "performance.applicant.name", type: "text", readOnly: true },
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

const newRowPrefix = "new-";
const idAtColumn = 0;
const updateInterval = Duration.fromObject({ seconds: 15 });

function arrayEquals<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function RundownEditGrid({ rundownType }: { rundownType: RundownType }) {
  const hotRef = useRef<HotTableRef>(null);
  const [rundown, setRundown] = useState<RundownEditForm[]>([]);
  const [performances, setPerformances] = useState<PreferenceView[]>([]);
  const prevOrdering = useRef<string[]>([]);
  const [systemMessage, setSystemMessage] = useState<ReactElement>(<div>No system message.</div>);
  const nextUpdate = useRef(DateTime.now().plus(updateInterval));

  const exportCsvCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Show error message
      return;
    }
    exportCsv(hot, "Rundown");
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
    const newResults = await getRundownEditFormController(rundownType);
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
      setRundown(newResults.data.rundown);
      setPerformances(newResults.data.performances);
      prevOrdering.current = newResults.data.rundown.map((row) => row.id);
    } else {
      setSystemMessage(<SystemMessage message="Fetch failed." type="error" />);
    }
    console.log(`Table updated (${rundownType}).`);
    nextUpdate.current = DateTime.now().plus(updateInterval);
  }, [rundownType]);

  const afterChangeCallback = async (changes: CellChange[]) => {
    const results = [];
    const idColumn = hotRef.current?.hotInstance?.getDataAtCol(idAtColumn);
    const { data: ordering, error: idColumnParseError } = z.string().array().safeParse(idColumn);
    if (idColumnParseError) {
      throw new TypeError(`Unexpected ID column type ${typeof idColumn}, expected array of string`);
    }
    for (const change of changes) {
      const [row, column, oldValue, newValue] = change;
      const id = hotRef.current?.hotInstance?.getDataAtCell(row, idAtColumn);
      if (typeof column !== "string") {
        throw new TypeError(`Unexpected column (key) type ${typeof column}, expected string`);
      }
      if (typeof id !== "string") {
        console.error(id);
        throw new TypeError(`Unexpected ID type ${typeof id}, expected string`);
      }
      setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
      if (id.startsWith(newRowPrefix)) {
        const result = await saveRundownDataController(rundownType, [
          {
            type: "create",
            key: column,
            oldValue,
            newValue,
            id,
            oldOrdering: prevOrdering.current,
            newOrdering: ordering,
          },
        ]);
        results.push(result);
      } else {
        const result = await saveRundownDataController(rundownType, [
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
      prevOrdering.current = ordering;
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
    const validIds = ids
      .map((id) => {
        if (typeof id !== "string") {
          console.log(`id: ${id}`);
          throw new TypeError(`Unexpected id type ${typeof id}, expected string`);
        }
        return id;
      })
      .filter((id) => !id.startsWith(newRowPrefix));
    setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
    const result = await saveRundownDataController(
      rundownType,
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

  const afterRowMoveCallback = async () => {
    // rows := [index, index + 1, ..., index + amount - 1]
    const idColumn = hotRef.current?.hotInstance?.getDataAtCol(idAtColumn);
    const { data: ordering, error: idColumnParseError } = z.string().array().safeParse(idColumn);
    if (idColumnParseError) {
      throw new TypeError(`Unexpected ID column type ${typeof idColumn}, expected array of string`);
    }
    if (arrayEquals(ordering, prevOrdering.current)) {
      return;
    }
    setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
    const result = await saveRundownDataController(rundownType, [
      {
        type: "reorder",
        oldOrdering: prevOrdering.current,
        newOrdering: ordering,
      },
    ]);
    if (result.success) {
      prevOrdering.current = ordering;
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
    rundownColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    rundownColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <DuplicateWarning rundown={rundown} />
      <MissingWarning rundown={rundown} performances={performances} />
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={rundown}
          nestedHeaders={nestedHeaders}
          columns={rundownColumnGroups.flatMap((column) => {
            return column.columns.map((column) => {
              const baseConfig = column;
              if (column.data === "performance.id") {
                return {
                  ...baseConfig,
                  source: ["", ...performances.map((performance) => performance.id)],
                  type: "dropdown",
                };
              }
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
          // height="auto"
          manualRowMove={true}
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
          afterRowMove={(movedRows, finalIndex, dropIndex, movePossible, orderChanged) => {
            if (!orderChanged) {
              return;
            }
            afterRowMoveCallback();
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

function DuplicateWarning({ rundown }: { rundown: RundownEditForm[] }) {
  const rundownPerformanceIds = rundown
    .map((row) => row.performance?.id)
    .filter((id) => id !== undefined)
    .filter((id) => id !== "");

  const duplicates = rundownPerformanceIds
    .filter((id, index, self) => {
      console.log(id, index, self.indexOf(id) !== index);
      return self.indexOf(id) !== index;
    })
    .filter((id, index, self) => self.indexOf(id) === index);

  return (
    duplicates.length > 0 && (
      <div className="px-4 py-2 text-sm text-yellow-600">
        <span className="font-bold">Warning:</span> These performances appear more than once: {duplicates.join(", ")}
      </div>
    )
  );
}

function MissingWarning({ rundown, performances }: { rundown: RundownEditForm[]; performances: PreferenceView[] }) {
  const performanceIds = performances.map((performance) => performance.id);

  const rundownPerformanceIds = rundown
    .map((row) => row.performance?.id)
    .filter((id) => id !== undefined)
    .filter((id) => id !== "");

  const missing = performanceIds.filter((id) => !rundownPerformanceIds.includes(id));

  return (
    missing.length > 0 && (
      <div className="px-4 py-2 text-sm text-yellow-600">
        <span className="font-bold">Warning:</span> These performances are missing: {missing.join(", ")}
      </div>
    )
  );
}
