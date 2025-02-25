import { getPerformanceEditFormController } from "@/actions/get-performance-edit-form.controller";
import { LoadingText } from "@/components/common/LoadingText";
import { MessageBox } from "@/components/common/MessageBox";
import { PerformanceEditGrid } from "@/components/grid/PerformanceEditGrid";
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
      <h1 className="flex text-xl font-bold p-4 pb-2">Edit Performance</h1>
      <MessageBox>Changes are saved automatically. Undo/redo is not supported.</MessageBox>
      <Suspense fallback={<LoadingText />}>
        <PerformanceGridWrapper />
      </Suspense>
    </>
  );
}
