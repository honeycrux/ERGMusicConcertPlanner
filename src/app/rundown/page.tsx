import { getConcertSlotDataController } from "@/actions/concertslot.action";
import { LoadingText } from "@/components/common/LoadingText";
import { Suspense } from "react";
import { ConcertRundownGrid } from "./ConcertRundownGrid";

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
      <div className="flex text-xl font-bold p-4">Concert Rundown</div>
      <Suspense fallback={<LoadingText />}>
        <ConcertRundownGridWrapper />
      </Suspense>
      <div className="flex text-xl font-bold p-4">Rehearsal Rundown</div>
      <Suspense fallback={<LoadingText />}></Suspense>
    </>
  );
}
