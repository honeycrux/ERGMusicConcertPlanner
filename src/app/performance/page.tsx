import { getPerformanceEditFormController } from "@/actions/get-performance-edit-form.controller";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceEditGrid } from "@/app/performance/PerformanceEditGrid";
import { Suspense } from "react";

async function PerformanceGridWrapper() {
  "use server";

  const result = await getPerformanceEditFormController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PerformanceEditGrid data={result.data} />;
}

export default function EditPerformancePage() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4 pb-2">Performance Edit Area</h1>
      <Suspense fallback={<LoadingText />}>
        <PerformanceGridWrapper />
      </Suspense>
    </>
  );
}
