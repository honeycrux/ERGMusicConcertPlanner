"use client";

import "handsontable/styles/handsontable.min.css";
import "handsontable/styles/ht-theme-main.min.css";
import { registerAllModules } from "handsontable/registry";

registerAllModules();

import { HotTable, HotTableRef } from "@handsontable/react-wrapper";
import { ReactElement, useEffect, useRef, useState } from "react";
import { PreferenceView, RundownEditForm } from "@/models/views.model";
import { SystemMessage } from "./SystemMessage";
import { RundownControlKey } from "@/models/rundown.model";
import { isUserInputSource } from "./grid-utils";
import { getConcertRundownEditFormController } from "@/actions/get-rundown-edit-form.controller";
import { CellChange } from "handsontable/common";
import { saveRundownDataController } from "@/actions/save-rundown-data.controller";
import { z } from "zod";
import { EDITOR_STATE } from "handsontable/editors/baseEditor";
import { Duration, DateTime } from "luxon";

type RundownColumnGroupDefinition = {
  groupLabel: string;
  columns: { title: string; data: RundownControlKey; type: string; readOnly?: boolean; width?: number }[];
};

const rundownColumnGroups: RundownColumnGroupDefinition[] = [
  {
    groupLabel: "Time Slot",
    columns: [
      { title: "ID", data: "id", type: "text", readOnly: true, width: 200 },
      { title: "Order", data: "order", type: "numeric", readOnly: true },
      { title: "Name", data: "name", type: "text" },
      { title: "Start Time", data: "startTime", type: "text" },
      { title: "Event Duration", data: "eventDuration", type: "text" },
      { title: "Buffer Duration", data: "bufferDuration", type: "text" },
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

function arrayEquals<T>(a: T[], b: T[]): boolean {
  return a.length === b.length && a.every((value, index) => value === b[index]);
}

export function RundownEditGrid({ rundown, performances }: { rundown: RundownEditForm[]; performances: PreferenceView[] }) {
  const hotRef = useRef<HotTableRef>(null);
  const [data, setData] = useState(rundown);
  const [prevOrdering, setPrevOrdering] = useState<string[]>(rundown.map((row) => row.id));
  const [systemMessage, setSystemMessage] = useState<ReactElement>(<div>No system message.</div>);
  const updateInterval = Duration.fromObject({ seconds: 15 });
  const nextUpdate = useRef(DateTime.now().plus(updateInterval));

  useEffect(() => {
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
        nextUpdate.current = DateTime.now().plus(updateInterval);
      }
    }, 3000);

    return () => {
      clearInterval(timerID);
    };
  }, [updateInterval]);

  const exportCsvCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      // TODO: Show error message
      return;
    }
    const exportPlugin = hot.getPlugin("exportFile");

    exportPlugin.downloadFile("csv", {
      bom: false,
      columnDelimiter: ",",
      columnHeaders: true,
      exportHiddenColumns: true,
      exportHiddenRows: true,
      fileExtension: "csv",
      filename: "Handsontable-CSV-file_[YYYY]-[MM]-[DD]",
      mimeType: "text/csv",
      rowDelimiter: "\r\n",
      rowHeaders: true,
    });
  };

  const addRowCallback = () => {
    const hot = hotRef.current?.hotInstance;
    if (!hot) {
      setSystemMessage(<SystemMessage message="Failed to add row: Hot instance not found." type="error" />);
      return;
    }
    hot.alter("insert_row_below", hot.countRows());
  };

  const fetchUpdatesCallback = async () => {
    const newResults = await getConcertRundownEditFormController();
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
      setData(newResults.data.rundown);
      setPrevOrdering(newResults.data.rundown.map((row) => row.id));
    } else {
      setSystemMessage(<SystemMessage message="Fetch failed." type="error" />);
    }
    console.log("Table updated.");
  };

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
        const result = await saveRundownDataController([
          {
            type: "create",
            key: column,
            oldValue,
            newValue,
            id,
            oldOrdering: prevOrdering,
            newOrdering: ordering,
          },
        ]);
        results.push(result);
      } else {
        const result = await saveRundownDataController([
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
      setPrevOrdering(ordering);
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
    for (const row of rows) {
      const id = hotRef.current?.hotInstance?.getDataAtCell(row, idAtColumn);
      if (typeof id !== "string") {
        throw new TypeError(`Unexpected ID type ${typeof id}, expected string`);
      }
      if (id.startsWith(newRowPrefix)) {
        continue;
      }
      setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
      const result = await saveRundownDataController([
        {
          type: "delete",
          id,
        },
      ]);
      if (result.success) {
        setSystemMessage(<SystemMessage message="Changes saved." type="success" />);
      } else {
        setSystemMessage(<SystemMessage message={result.message} type="error" />);
      }
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
    if (arrayEquals(ordering, prevOrdering)) {
      return;
    }
    setSystemMessage(<SystemMessage message="Saving changes..." type="info" />);
    const result = await saveRundownDataController([
      {
        type: "reorder",
        oldOrdering: prevOrdering,
        newOrdering: ordering,
      },
    ]);
    if (result.success) {
      setPrevOrdering(ordering);
      setSystemMessage(<SystemMessage message="Changes saved." type="success" />);
    } else {
      setSystemMessage(<SystemMessage message={result.message} type="error" />);
    }
    fetchUpdatesCallback();
  };

  const nestedHeaders = [
    rundownColumnGroups.map((column) => ({
      label: column.groupLabel,
      colspan: column.columns.length,
    })),
    rundownColumnGroups.flatMap((column) => column.columns.map((column) => column.title)),
  ];

  return (
    <>
      <div className="ht-theme-main pb-2">
        <HotTable
          ref={hotRef}
          data={data}
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
      <div className="flex justify-center">
        <button onClick={() => exportCsvCallback()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
          Download CSV
        </button>
        <button onClick={() => addRowCallback()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
          Add Row
        </button>
      </div>
      <div className="flex justify-center p-2 text-gray-500">{systemMessage}</div>
    </>
  );
}
