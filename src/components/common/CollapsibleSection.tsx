"use client";

import { useState } from "react";
import { ActionButton } from "./ActionButton";

export function CollapsibleSection({ children }: { children: React.ReactNode }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div>
      <div className="px-4 py-2">
        <ActionButton onClick={() => setExpanded(!expanded)}>{expanded ? "Collapse" : "Expand"}</ActionButton>
      </div>
      {expanded && <div>{children}</div>}
    </div>
  );
}
