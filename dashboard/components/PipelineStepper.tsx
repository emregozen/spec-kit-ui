import type { RunStage } from "@/lib/types";
import { StatusBadge } from "./StatusBadge";

export function PipelineStepper({
  stages,
  selectedIndex,
  onSelect,
}: {
  stages: RunStage[];
  selectedIndex: number;
  onSelect: (i: number) => void;
}) {
  return (
    <ol className="space-y-1">
      {stages.map((s, i) => (
        <li key={`${s.personaId}-${i}`}>
          <button
            onClick={() => onSelect(i)}
            className={`flex w-full items-start gap-3 rounded-lg border px-3 py-2.5 text-left transition-colors ${
              i === selectedIndex
                ? "border-zinc-600 bg-zinc-800/70"
                : "border-transparent hover:border-zinc-800 hover:bg-zinc-900"
            }`}
          >
            <span className="mt-0.5 text-lg leading-none">{s.icon}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-sm font-medium text-zinc-100">{s.name}</span>
              <span className="mt-1 flex items-center gap-2">
                <StatusBadge status={s.status} />
                {s.agentId && <span className="text-xs text-zinc-500">{s.agentId}</span>}
                {s.model && <span className="text-xs text-zinc-500">· {s.model}</span>}
              </span>
            </span>
          </button>
        </li>
      ))}
    </ol>
  );
}
