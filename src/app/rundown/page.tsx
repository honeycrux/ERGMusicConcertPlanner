import { LoadingText } from "@/components/common/LoadingText";
import { Suspense } from "react";
import { MessageBox } from "@/components/common/MessageBox";
import { getPreferenceViewController } from "@/actions/get-views.controller";
import { PreferenceViewGrid } from "@/components/grid/PreferenceViewGrid";
import { RundownEditGrid } from "@/components/grid/RundownEditGrid";
import { ConcertRehearsalTabber } from "@/components/common/ConcertRehearsalTabber";
import { CollapsibleSection } from "@/components/common/CollapsibleSection";

async function PreferenceViewGridWrapper() {
  "use server";

  const result = await getPreferenceViewController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PreferenceViewGrid performances={result.data} />;
}

export default function EditRundownPage() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4 pb-2">Preference View</h1>
      <CollapsibleSection>
        <Suspense fallback={<LoadingText />}>
          <PreferenceViewGridWrapper />
        </Suspense>
      </CollapsibleSection>
      <h1 className="flex text-xl font-bold p-4 pb-2">Edit Rundown</h1>
      <MessageBox>Changes are saved automatically. Undo/redo is not supported. The grid does not refresh during editing.</MessageBox>
      <MessageBox>
        <div>Start Time should be submitted in ISO 8601 datetime format (2025-01-01T12:00:00+08:00 means 1/1/2025 12:00:00 UTC+8)</div>
        <div>Duration Override and Buffer Duration should be submitted in ISO 8601 duration format (PT3M3S means 3 minutes and 3 seconds)</div>
      </MessageBox>
      <ConcertRehearsalTabber
        concert={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Concert</h2>
            <Suspense fallback={<LoadingText />}>
              <RundownEditGrid rundownType="concert" />
            </Suspense>
          </>
        }
        rehearsal={
          <>
            <h2 className="flex text-l font-bold p-4 pb-2">Rehearsal</h2>
            <Suspense fallback={<LoadingText />}>
              <RundownEditGrid rundownType="rehearsal" />
            </Suspense>
          </>
        }
      />
    </>
  );
}
