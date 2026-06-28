import { NextRequest, NextResponse } from "next/server";
import { cancelStage } from "@/lib/orchestrator";
import { updateRun } from "@/lib/store";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const killed = cancelStage(id);
  const updated = updateRun(id, (r) => {
    const s = r.stages[r.currentStageIndex];
    if (s && s.status === "running") {
      s.status = "failed";
      s.error = "Cancelled by user";
    }
  });
  return NextResponse.json({ killed, run: updated });
}
