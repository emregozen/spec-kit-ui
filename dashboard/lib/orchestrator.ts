import path from "node:path";
import fs from "node:fs";
import { getAgent } from "./agents/registry";
import { cancelRun as cancelProcess } from "./agents/processRegistry";
import { emitLog } from "./events";
import { getProject, getRun, updateRun } from "./store";
import type { Run } from "./types";

function renderTemplate(template: string, vars: { request: string; feedback: string }): string {
  return template.replaceAll("{{request}}", vars.request).replaceAll("{{feedback}}", vars.feedback);
}

function feedbackBlock(feedback: string | undefined): string {
  if (!feedback) return "";
  return `\n\nRevision requested by reviewer: ${feedback}\nUpdate the existing artifacts accordingly rather than starting over.`;
}

export function logFileFor(workspacePath: string, runId: string, stageIndex: number): string {
  return path.join(workspacePath, ".run-logs", runId, `stage-${stageIndex}.log`);
}

/** Reads .specify/feature.json (written by /speckit-specify) to find the active feature dir, if any. */
export function detectFeatureDir(workspacePath: string): string | undefined {
  const featureJson = path.join(workspacePath, ".specify", "feature.json");
  if (!fs.existsSync(featureJson)) return undefined;
  try {
    const data = JSON.parse(fs.readFileSync(featureJson, "utf-8"));
    return data.feature_directory as string | undefined;
  } catch {
    return undefined;
  }
}

/** Runs every step of the run's current stage sequentially. Mutates and persists
 *  run/stage status as it goes, and emits live log/status events for the SSE route. */
export async function runCurrentStage(runId: string): Promise<void> {
  const run = getRun(runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  const project = getProject(run.projectSlug);
  if (!project) throw new Error(`Project not found: ${run.projectSlug}`);

  const stageIndex = run.currentStageIndex;
  const stage = run.stages[stageIndex];
  if (!stage) {
    updateRun(runId, (r) => {
      r.status = "completed";
    });
    emitLog({ runId, stageIndex, ts: new Date().toISOString(), kind: "status", text: "completed" });
    return;
  }

  updateRun(runId, (r) => {
    r.stages[stageIndex].status = "running";
    r.stages[stageIndex].startedAt = new Date().toISOString();
    r.stages[stageIndex].error = undefined;
  });
  emitLog({ runId, stageIndex, ts: new Date().toISOString(), kind: "status", text: "running" });

  const feedback = feedbackBlock(stage.feedback);
  let overallSuccess = true;
  let lastSummary = "";
  let totalCost = 0;
  let totalDuration = 0;

  const agent = getAgent(stage.agentId);

  for (const step of stage.steps) {
    const rendered = renderTemplate(step.argsTemplate, { request: run.featureRequest, feedback });
    const prompt = step.command ? `${step.command} ${rendered}`.trim() : rendered.trim();

    emitLog({
      runId,
      stageIndex,
      ts: new Date().toISOString(),
      kind: "system",
      text: `$ ${agent.cliCommand} -p "${prompt.slice(0, 120)}${prompt.length > 120 ? "…" : ""}"`,
    });

    let result;
    try {
      result = await agent.run(runId, {
        cwd: project.workspacePath,
        prompt,
        model: stage.model,
        logFile: logFileFor(project.workspacePath, runId, stageIndex),
        onEvent: (event) => emitLog({ runId, stageIndex, ...event }),
      });
    } catch (err) {
      overallSuccess = false;
      lastSummary = err instanceof Error ? err.message : String(err);
      emitLog({ runId, stageIndex, ts: new Date().toISOString(), kind: "error", text: lastSummary });
      break;
    }

    totalCost += result.costUsd;
    totalDuration += result.durationMs;
    lastSummary = result.resultSummary || lastSummary;

    if (!result.success) {
      overallSuccess = false;
      break;
    }
  }

  const featureDir = detectFeatureDir(project.workspacePath);

  updateRun(runId, (r) => {
    const s = r.stages[stageIndex];
    s.status = overallSuccess ? "awaiting_approval" : "failed";
    s.completedAt = new Date().toISOString();
    s.resultSummary = lastSummary;
    s.costUsd = (s.costUsd ?? 0) + totalCost;
    s.durationMs = (s.durationMs ?? 0) + totalDuration;
    if (!overallSuccess) s.error = lastSummary;
    if (featureDir) r.featureDir = featureDir;
  });

  emitLog({
    runId,
    stageIndex,
    ts: new Date().toISOString(),
    kind: "status",
    text: overallSuccess ? "awaiting_approval" : "failed",
  });
}

export function cancelStage(runId: string): boolean {
  return cancelProcess(runId);
}

export function findRunOrThrow(runId: string): Run {
  const run = getRun(runId);
  if (!run) throw new Error(`Run not found: ${runId}`);
  return run;
}
