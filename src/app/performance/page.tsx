import { getPerformanceDataController } from "@/actions/performance.action";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceGrid } from "@/app/performance/PerformanceGrid";
import { Suspense } from "react";

async function PerformanceGridWrapper() {
  "use server";

  const result = await getPerformanceDataController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return <PerformanceGrid data={result.data} />;
}

export default function EditPerformancePage() {
  return (
    <Suspense fallback={<LoadingText />}>
      <PerformanceGridWrapper />
    </Suspense>
  );
}
