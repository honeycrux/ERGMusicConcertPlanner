import { getPerformanceDataController } from "@/actions/performance.action";
import { PerformanceGrid } from "@/components/performance/PerformanceGrid";

export default async function EditPerformancePage() {
  const result = await getPerformanceDataController();

  if (!result.success) {
    return <div>Error loading data: {result.message}</div>;
  }

  return (
    <div className="">
      <PerformanceGrid data={result.data} />
    </div>
  );
}
