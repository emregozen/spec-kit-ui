import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { getPreviewState } from "@/lib/previewRunner";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  return NextResponse.json(getPreviewState(slug));
}
