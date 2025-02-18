import { getPerformanceDataController } from "@/actions/performance.action";
import { LoadingText } from "@/components/common/LoadingText";
import { PerformanceGrid } from "@/components/performance/PerformanceGrid";
import { Suspense } from "react";

async function PerformanceGridWrapper({ delay }: { delay?: number }) {
  "use server";

  if (delay) {
    await new Promise((resolve) => setTimeout(resolve, delay));
  }

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
