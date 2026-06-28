type Tone = "neutral" | "blue" | "amber" | "green" | "red" | "violet";

const TONE_CLASSES: Record<Tone, string> = {
  neutral: "bg-zinc-800 text-zinc-300 ring-zinc-700",
  blue: "bg-blue-950 text-blue-300 ring-blue-800",
  amber: "bg-amber-950 text-amber-300 ring-amber-800",
  green: "bg-emerald-950 text-emerald-300 ring-emerald-800",
  red: "bg-red-950 text-red-300 ring-red-800",
  violet: "bg-violet-950 text-violet-300 ring-violet-800",
};

export function Badge({ tone = "neutral", children }: { tone?: Tone; children: React.ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${TONE_CLASSES[tone]}`}
    >
      {children}
    </span>
  );
}
