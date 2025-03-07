import { getApplicantDetailViewController, getPerformanceDetailViewController, getStageRequirementViewController } from "@/actions/get-views.controller";
import { ApplicantDetailViewGrid } from "../components/grid/ApplicantDetailViewGrid";
import { Suspense } from "react";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceDetailViewGrid } from "../components/grid/PerformanceDetailViewGrid";
import { StageRequirementViewGrid } from "../components/grid/StageRequirementViewGrid";
import { RundownType } from "@/models/rundown.model";
import { ConcertRehearsalTabber } from "@/components/common/ConcertRehearsalTabber";

type WrapperProps = {
  rundownType: RundownType;
};

async function PerformanceDetailViewGridWrapper({ rundownType }: WrapperProps) {
  "use server";

  const result = await getPerformanceDetailViewController(rundownType);

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PerformanceDetailViewGrid performances={result.data} rundownType={rundownType} />;
}

async function StageRequirementViewGridWrapper({ rundownType }: WrapperProps) {
  "use server";

  const result = await getStageRequirementViewController(rundownType);

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <StageRequirementViewGrid performances={result.data} rundownType={rundownType} />;
}

async function ApplicantDetailViewGridWrapper({ rundownType }: WrapperProps) {
  "use server";

  const result = await getApplicantDetailViewController(rundownType);

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <ApplicantDetailViewGrid performances={result.data} rundownType={rundownType} />;
}

export default function Home() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4 pb-2">Performance Detail View</h1>
      <ConcertRehearsalTabber
        concert={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
            <Suspense fallback={<LoadingText />}>
              <PerformanceDetailViewGridWrapper rundownType="concert" />
            </Suspense>
          </>
        }
        rehearsal={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
            <Suspense fallback={<LoadingText />}>
              <PerformanceDetailViewGridWrapper rundownType="rehearsal" />
            </Suspense>
          </>
        }
      />
      <h1 className="flex text-xl font-bold p-4 pb-2">Stage Requirement View</h1>
      <ConcertRehearsalTabber
        concert={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
            <Suspense fallback={<LoadingText />}>
              <StageRequirementViewGridWrapper rundownType="concert" />
            </Suspense>
          </>
        }
        rehearsal={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
            <Suspense fallback={<LoadingText />}>
              <StageRequirementViewGridWrapper rundownType="rehearsal" />
            </Suspense>
          </>
        }
      />
      <h1 className="flex text-xl font-bold p-4 pb-2">Applicant Detail & Preference View</h1>
      <ConcertRehearsalTabber
        concert={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
            <Suspense fallback={<LoadingText />}>
              <ApplicantDetailViewGridWrapper rundownType="concert" />
            </Suspense>
          </>
        }
        rehearsal={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
            <Suspense fallback={<LoadingText />}>
              <ApplicantDetailViewGridWrapper rundownType="rehearsal" />
            </Suspense>
          </>
        }
      />
    </>
  );
}
