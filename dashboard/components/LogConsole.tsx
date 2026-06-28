"use client";

import { useEffect, useRef } from "react";

type LogLine = { kind: string; text: string };

const KIND_CLASSES: Record<string, string> = {
  text: "text-zinc-300",
  tool: "text-blue-400",
  system: "text-zinc-500",
  result: "text-emerald-400",
  error: "text-red-400",
  status: "text-amber-400",
};

export function LogConsole({ lines }: { lines: LogLine[] }) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [lines.length]);

  return (
    <div className="h-full overflow-auto bg-black/60 p-3 font-mono text-xs leading-relaxed">
      {lines.length === 0 && <p className="text-zinc-600">No output yet.</p>}
      {lines.map((l, i) => (
        <pre key={i} className={`whitespace-pre-wrap break-words ${KIND_CLASSES[l.kind] ?? "text-zinc-300"}`}>
          {l.text}
        </pre>
      ))}
      <div ref={bottomRef} />
    </div>
  );
}
