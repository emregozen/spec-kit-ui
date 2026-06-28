import { NextRequest, NextResponse } from "next/server";
import { listProjects, saveProject } from "@/lib/store";
import { bootstrapWorkspace, slugify } from "@/lib/workspace";

export async function GET() {
  return NextResponse.json(listProjects());
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const name = (body.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const baseSlug = slugify(name);
  let slug = baseSlug;
  let n = 2;
  while (listProjects().some((p) => p.slug === slug)) {
    slug = `${baseSlug}-${n++}`;
  }

  let workspacePath: string;
  try {
    workspacePath = bootstrapWorkspace(slug);
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }

  const project = { slug, name, createdAt: new Date().toISOString(), workspacePath };
  saveProject(project);
  return NextResponse.json(project, { status: 201 });
}
