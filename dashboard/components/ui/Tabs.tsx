"use client";

import { useState } from "react";

export function Tabs({
  tabs,
  initial,
}: {
  tabs: { key: string; label: string; content: React.ReactNode }[];
  initial?: string;
}) {
  const [active, setActive] = useState(initial ?? tabs[0]?.key);
  const activeTab = tabs.find((t) => t.key === active) ?? tabs[0];

  return (
    <div className="flex h-full flex-col">
      <div className="flex gap-1 border-b border-zinc-800 px-2">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setActive(t.key)}
            className={`rounded-t-md px-3 py-2 text-sm font-medium transition-colors ${
              t.key === activeTab?.key
                ? "bg-zinc-900 text-zinc-100"
                : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div className="min-h-0 flex-1 overflow-auto">{activeTab?.content}</div>
    </div>
  );
}
