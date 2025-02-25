import { LoadingText } from "@/components/common/LoadingText";
import { MessageBox } from "@/components/common/MessageBox";
import { PerformanceEditGrid } from "@/components/grid/PerformanceEditGrid";
import { Suspense } from "react";

export default function EditPerformancePage() {
  return (
    <>
      <h1 className="flex text-xl font-bold p-4 pb-2">Edit Performance</h1>
      <MessageBox>Changes are saved automatically. Undo/redo is not supported.</MessageBox>
      <Suspense fallback={<LoadingText />}>
        <PerformanceEditGrid />
      </Suspense>
    </>
  );
}
