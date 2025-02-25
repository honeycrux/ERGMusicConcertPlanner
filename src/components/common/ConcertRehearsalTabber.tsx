"use client";

import { useState } from "react";

export function ConcertRehearsalTabber({ concert, rehearsal }: { concert: React.ReactNode; rehearsal: React.ReactNode }) {
  const [selectedTab, setSelectedTab] = useState(0);

  return (
    <>
      <div className="flex justify-center px-4 p-2">
        <button
          onClick={() => setSelectedTab(0)}
          className={`mx-2 px-4 py-2 rounded border hover:border-zinc-700 ${selectedTab === 0 ? "bg-sky-600 text-white" : "bg-zinc-300"}`}
        >
          Concert
        </button>
        <button
          onClick={() => setSelectedTab(1)}
          className={`mx-2 px-4 py-2 rounded border hover:border-zinc-700 ${selectedTab === 1 ? "bg-sky-600 text-white" : "bg-zinc-300"}`}
        >
          Rehearsal
        </button>
      </div>
      <div>{selectedTab === 0 ? concert : rehearsal}</div>
    </>
  );
}
