import { PerformanceGrid } from "@/components/performance/PerformanceGrid";
import { data } from "./data";

export default function EditPerformancePage() {
  return (
    <div className="">
      <PerformanceGrid data={data} />
    </div>
  );
}
