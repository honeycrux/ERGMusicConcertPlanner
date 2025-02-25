import { getConcertRundownEditFormController } from "@/actions/get-rundown-edit-form.controller";
import { LoadingText } from "@/components/common/LoadingText";
import { Suspense } from "react";
import { RundownEditGrid } from "../../components/grid/RundownEditGrid";
import { getPreferenceViewController } from "@/actions/get-views.controller";
import { PreferenceViewGrid } from "../../components/grid/PreferenceViewGrid";
import { MessageBox } from "@/components/common/MessageBox";

async function PreferenceViewGridWrapper() {
  "use server";

  const result = await getPreferenceViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PreferenceViewGrid performances={result.data} />;
}

async function ConcertRundownGridWrapper() {
  "use server";

  const result = await getConcertRundownEditFormController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <RundownEditGrid rundown={result.data.rundown} performances={result.data.performances} />;
}

export default function EditRundownPage() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4 pb-2">Preference View</h1>
      <Suspense fallback={<LoadingText />}>
        <PreferenceViewGridWrapper />
      </Suspense>
      <h1 className="flex text-xl font-bold p-4 pb-2">Edit Rundown</h1>
      <MessageBox>Changes are saved automatically. Undo/redo is not supported.</MessageBox>
      <MessageBox>
        <div>Start Time should be submitted in ISO 8601 datetime format (2025-01-01T12:00:00+08:00 means 1/1/2025 12:00:00 UTC+8)</div>
        <div>Event Duration and Buffer Duration should be submitted in ISO 8601 duration format (PT3M3S means 3 minutes and 3 seconds)</div>
      </MessageBox>
      <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <ConcertRundownGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
      <Suspense fallback={<LoadingText />}></Suspense>
    </>
  );
}
