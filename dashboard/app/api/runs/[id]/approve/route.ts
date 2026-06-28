import { NextRequest, NextResponse } from "next/server";
import { getRun, updateRun } from "@/lib/store";
import { runCurrentStage } from "@/lib/orchestrator";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });

  const stage = run.stages[run.currentStageIndex];
  if (!stage || stage.status !== "awaiting_approval") {
    return NextResponse.json({ error: "current stage is not awaiting approval" }, { status: 409 });
  }

  const updated = updateRun(id, (r) => {
    r.stages[r.currentStageIndex].status = "approved";
    r.currentStageIndex += 1;
    if (r.currentStageIndex >= r.stages.length) r.status = "completed";
  });

  if (updated.status === "active") {
    void runCurrentStage(id).catch((err) => console.error(`[run ${id}] stage failed:`, err));
  }

  return NextResponse.json(updated);
}
