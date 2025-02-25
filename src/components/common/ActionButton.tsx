import Handsontable from "handsontable";

export function ActionButton({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button onClick={() => onClick()} className="bg-zinc-300 border hover:border-zinc-700 text-black py-1 px-5 rounded">
      {children}
    </button>
  );
}

export const exportCsv = (hot: Handsontable, name: string) => {
  "use client";

  const exportPlugin = hot.getPlugin("exportFile");

  exportPlugin.downloadFile("csv", {
    bom: false,
    columnDelimiter: ",",
    columnHeaders: true,
    exportHiddenColumns: true,
    exportHiddenRows: true,
    fileExtension: "csv",
    filename: `${name}_[YYYY]-[MM]-[DD]`,
    mimeType: "text/csv",
    rowDelimiter: "\r\n",
    rowHeaders: true,
  });
};
