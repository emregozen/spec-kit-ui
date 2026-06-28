import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { NextRequest, NextResponse } from "next/server";
import { getProject, getRun } from "@/lib/store";

function listDirRecursive(dir: string, base = ""): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const rel = path.join(base, entry.name);
    if (entry.isDirectory()) out.push(...listDirRecursive(path.join(dir, entry.name), rel));
    else out.push(rel);
  }
  return out;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stageIndex = Number(req.nextUrl.searchParams.get("stageIndex") ?? "0");

  const run = getRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });
  const project = getProject(run.projectSlug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const stage = run.stages[stageIndex];
  const featureDirAbs = run.featureDir ? path.join(project.workspacePath, run.featureDir) : null;

  const artifacts: { name: string; content: string | null }[] = [];
  if (featureDirAbs && fs.existsSync(featureDirAbs) && stage) {
    for (const name of stage.artifacts) {
      const full = path.join(featureDirAbs, name);
      if (!fs.existsSync(full)) {
        artifacts.push({ name, content: null });
        continue;
      }
      if (fs.statSync(full).isDirectory()) {
        const files = listDirRecursive(full).slice(0, 50);
        artifacts.push({ name, content: files.map((f) => `- ${f}`).join("\n") || null });
      } else {
        artifacts.push({ name, content: fs.readFileSync(full, "utf-8") });
      }
    }
  }

  let changedFiles: { status: string; path: string }[] = [];
  try {
    const out = execFileSync("git", ["status", "--porcelain"], {
      cwd: project.workspacePath,
      encoding: "utf-8",
    });
    changedFiles = out
      .split("\n")
      .filter(Boolean)
      .map((line) => ({ status: line.slice(0, 2).trim(), path: line.slice(3) }));
  } catch {
    // not a git repo or git unavailable; ignore
  }

  return NextResponse.json({ featureDir: run.featureDir ?? null, artifacts, changedFiles });
}
