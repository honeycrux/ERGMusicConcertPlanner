import { getConcertSlotDataController } from "@/actions/get-rundown-data.controller";
import { LoadingText } from "@/components/common/LoadingText";
import { Suspense } from "react";
import { ConcertRundownGrid } from "./ConcertRundownGrid";
import { getPreferenceViewController } from "@/actions/get-views.controller";
import { PreferenceViewGrid } from "./PreferenceViewGrid";

async function PreferenceViewGridWrapper() {
  "use server";

  const result = await getPreferenceViewController();

  console.log(result);

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PreferenceViewGrid performances={result.data} />;
}

async function ConcertRundownGridWrapper() {
  "use server";

  const result = await getConcertSlotDataController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <ConcertRundownGrid rundownSlots={result.data.rundownSlots} performances={result.data.performances} />;
}

export default function EditRundownPage() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4">Preference View</h1>
      <Suspense fallback={<LoadingText />}>
        <PreferenceViewGridWrapper />
      </Suspense>
      <h1 className="flex text-xl font-bold p-4">Rundown</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <ConcertRundownGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
      <Suspense fallback={<LoadingText />}></Suspense>
    </>
  );
}
