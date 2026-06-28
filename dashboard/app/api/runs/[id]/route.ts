import { NextRequest, NextResponse } from "next/server";
import { deleteRun, getRun } from "@/lib/store";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const run = getRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });
  return NextResponse.json(run);
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!getRun(id)) return NextResponse.json({ error: "run not found" }, { status: 404 });
  deleteRun(id);
  return new NextResponse(null, { status: 204 });
}
