import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getProject, saveRun, listRunsForProject } from "@/lib/store";
import { readTeam } from "@/lib/team";
import { runCurrentStage } from "@/lib/orchestrator";
import type { Run, RunStage } from "@/lib/types";

export async function GET(req: NextRequest) {
  const projectSlug = req.nextUrl.searchParams.get("project");
  if (!projectSlug) return NextResponse.json({ error: "project query param required" }, { status: 400 });
  return NextResponse.json(listRunsForProject(projectSlug));
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const projectSlug = body.projectSlug as string;
  const featureRequest = (body.featureRequest ?? "").trim();
  const platform = body.platform as string | undefined;

  const project = getProject(projectSlug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });
  if (!featureRequest) return NextResponse.json({ error: "featureRequest is required" }, { status: 400 });

  const team = readTeam(project.workspacePath);
  if (team.personas.length === 0) {
    return NextResponse.json({ error: "project's team has no personas configured" }, { status: 400 });
  }

  const stages: RunStage[] = team.personas.map((p) => ({
    personaId: p.id,
    name: p.name,
    icon: p.icon,
    kind: p.kind,
    artifacts: p.artifacts,
    steps: p.steps,
    agentId: p.agentId,
    model: p.model,
    status: "pending",
    stepIndex: 0,
  }));

  const run: Run = {
    id: randomUUID(),
    projectSlug,
    featureRequest: platform ? `${featureRequest} (platform: ${platform})` : featureRequest,
    platform,
    createdAt: new Date().toISOString(),
    currentStageIndex: 0,
    stages,
    status: "active",
  };
  saveRun(run);

  void runCurrentStage(run.id).catch((err) => {
    console.error(`[run ${run.id}] stage 0 failed:`, err);
  });

  return NextResponse.json(run, { status: 201 });
}
