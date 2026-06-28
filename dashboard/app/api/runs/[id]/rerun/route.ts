import { NextRequest, NextResponse } from "next/server";
import { getRun } from "@/lib/store";
import { runCurrentStage } from "@/lib/orchestrator";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });

  const stage = run.stages[run.currentStageIndex];
  if (!stage || !["changes_requested", "failed", "pending"].includes(stage.status)) {
    return NextResponse.json({ error: `cannot re-run a stage with status ${stage?.status}` }, { status: 409 });
  }

  void runCurrentStage(id).catch((err) => console.error(`[run ${id}] rerun failed:`, err));
  return NextResponse.json({ ok: true });
}
