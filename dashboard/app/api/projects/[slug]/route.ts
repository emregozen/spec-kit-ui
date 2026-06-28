import { NextRequest, NextResponse } from "next/server";
import { deleteProject, getProject } from "@/lib/store";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  if (!getProject(slug)) return NextResponse.json({ error: "project not found" }, { status: 404 });
  deleteProject(slug);
  return new NextResponse(null, { status: 204 });
}
