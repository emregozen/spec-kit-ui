import { NextRequest, NextResponse } from "next/server";
import { getRun, updateRun } from "@/lib/store";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const comment = (body.comment ?? "").trim();
  if (!comment) return NextResponse.json({ error: "comment is required" }, { status: 400 });

  const run = getRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });
  const stage = run.stages[run.currentStageIndex];
  if (!stage || stage.status !== "awaiting_approval") {
    return NextResponse.json({ error: "current stage is not awaiting approval" }, { status: 409 });
  }

  const updated = updateRun(id, (r) => {
    const s = r.stages[r.currentStageIndex];
    s.status = "changes_requested";
    s.feedback = comment;
  });

  return NextResponse.json(updated);
}
