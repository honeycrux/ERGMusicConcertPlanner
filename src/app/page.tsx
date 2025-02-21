import { getApplicantViewController } from "@/actions/get-views.controller";
import { ApplicantViewGrid } from "./ApplicantViewGrid";
import { Suspense } from "react";
import { LoadingText } from "@/components/common/LoadingText";

async function ApplicantViewGridWrapper() {
  "use server";

  const result = await getApplicantViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <ApplicantViewGrid performances={result.data} />;
}

export default function Home() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4">Performance View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
      <h1 className="flex text-xl font-bold p-4">Stage View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
      <h1 className="flex text-xl font-bold p-4">Applicant View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <ApplicantViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
    </>
  );
}
