import { getApplicantDetailViewController, getPerformanceDetailViewController, getStageRequirementViewController } from "@/actions/get-views.controller";
import { ApplicantDetailViewGrid } from "./ApplicantDetailViewGrid";
import { Suspense } from "react";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceDetailViewGrid } from "./PerformanceDetailViewGrid";
import { StageRequirementViewGrid } from "./StageRequirementViewGrid";

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
      <h1 className="flex text-xl font-bold p-4">Performance Detail View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <PerformanceDetailViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
      <h1 className="flex text-xl font-bold p-4">Stage Requirement View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <StageRequirementViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
      <h1 className="flex text-xl font-bold p-4">Applicant Detail View</h1>
      <h2 className="flex text-l font-bold px-4 pb-4">Concert</h2>
      <Suspense fallback={<LoadingText />}>
        <ApplicantDetailViewGridWrapper />
      </Suspense>
      <h2 className="flex text-l font-bold px-4 pb-4">Rehearsal</h2>
    </>
  );
}
