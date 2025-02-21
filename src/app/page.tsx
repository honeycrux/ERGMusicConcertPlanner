import { getApplicantDetailViewController, getPerformanceDetailViewController } from "@/actions/get-views.controller";
import { ApplicantDetailViewGrid } from "./ApplicantDetailViewGrid";
import { Suspense } from "react";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceDetailViewGrid } from "./PerformanceDetailViewGrid";

async function PerformanceDetailViewGridWrapper() {
  "use server";

  const result = await getPerformanceDetailViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PerformanceDetailViewGrid performances={result.data} />;
}

async function ApplicantViewGridWrapper() {
  "use server";

  const result = await getApplicantDetailViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <ApplicantDetailViewGrid performances={result.data} />;
}

export default function Home() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4">Performance View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <PerformanceDetailViewGridWrapper />
      </Suspense>
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
