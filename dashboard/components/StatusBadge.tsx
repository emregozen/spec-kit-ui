import { Badge } from "./ui/Badge";
import type { StageStatus } from "@/lib/types";

const CONFIG: Record<StageStatus, { label: string; tone: "neutral" | "blue" | "amber" | "green" | "red" | "violet" }> = {
  pending: { label: "Pending", tone: "neutral" },
  running: { label: "Running", tone: "blue" },
  awaiting_approval: { label: "Awaiting approval", tone: "amber" },
  changes_requested: { label: "Changes requested", tone: "violet" },
  approved: { label: "Approved", tone: "green" },
  failed: { label: "Failed", tone: "red" },
};

export function StatusBadge({ status }: { status: StageStatus }) {
  const { label, tone } = CONFIG[status];
  return <Badge tone={tone}>{label}</Badge>;
}
