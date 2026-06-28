import { NextRequest, NextResponse } from "next/server";
import { getProject } from "@/lib/store";
import { readTeam, writeTeam } from "@/lib/team";

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  return NextResponse.json(readTeam(project.workspacePath));
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = getProject(slug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  const team = await req.json();
  writeTeam(project.workspacePath, team);
  return NextResponse.json(team);
}
