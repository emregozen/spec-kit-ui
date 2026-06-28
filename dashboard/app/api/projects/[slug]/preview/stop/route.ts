import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { stopPreview } from "@/lib/previewRunner";

export async function POST(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  return NextResponse.json(stopPreview(slug));
}
