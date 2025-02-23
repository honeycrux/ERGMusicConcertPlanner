import { getApplicantDetailViewController, getPerformanceDetailViewController, getStageRequirementViewController } from "@/actions/get-views.controller";
import { ApplicantDetailViewGrid } from "../components/grid/ApplicantDetailViewGrid";
import { Suspense } from "react";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceDetailViewGrid } from "../components/grid/PerformanceDetailViewGrid";
import { StageRequirementViewGrid } from "../components/grid/StageRequirementViewGrid";

async function PerformanceDetailViewGridWrapper() {
  "use server";

  const result = await getPerformanceDetailViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PerformanceDetailViewGrid performances={result.data} />;
}

async function StageRequirementViewGridWrapper() {
  "use server";

  const result = await getStageRequirementViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <StageRequirementViewGrid performances={result.data} />;
}

async function ApplicantDetailViewGridWrapper() {
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
      <h1 className="flex text-xl font-bold p-4 pb-2">Performance Detail View</h1>
      <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <PerformanceDetailViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
      <h1 className="flex text-xl font-bold p-4 pb-2">Stage Requirement View</h1>
      <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <StageRequirementViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
      <h1 className="flex text-xl font-bold p-4 pb-2">Applicant Detail View</h1>
      <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <ApplicantDetailViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
    </>
  );
}
