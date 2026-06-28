import { spawn, type ChildProcess } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { emitPreviewLog } from "./events";
import type { PreviewState } from "./types";

interface PreviewProcess {
  state: PreviewState;
  proc: ChildProcess;
}

// In-memory only: a dev server is a long-running process tied to this Node
// instance, so there's nothing meaningful to persist across a server restart.
const previews = new Map<string, PreviewProcess>();

const URL_RE = /https?:\/\/(?:localhost|127\.0\.0\.1)(?::\d+)?\/?\S*/;

const SCRIPT_PRIORITY = ["dev", "start", "preview"];

function pickScript(workspacePath: string): string | undefined {
  const pkgPath = path.join(workspacePath, "package.json");
  if (!fs.existsSync(pkgPath)) return undefined;
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, "utf-8"));
    const scripts = pkg.scripts ?? {};
    return SCRIPT_PRIORITY.find((s) => scripts[s]);
  } catch {
    return undefined;
  }
}

export function getPreviewState(projectSlug: string): PreviewState {
  return previews.get(projectSlug)?.state ?? { status: "stopped" };
}

export function startPreview(projectSlug: string, workspacePath: string): PreviewState {
  const existing = previews.get(projectSlug);
  if (existing && existing.state.status !== "stopped" && existing.state.status !== "error") {
    return existing.state;
  }

  const script = pickScript(workspacePath);
  if (!script) {
    const state: PreviewState = {
      status: "error",
      error: "No dev/start/preview script found in package.json",
    };
    previews.set(projectSlug, { state, proc: undefined as unknown as ChildProcess });
    return state;
  }

  const state: PreviewState = { status: "starting", script, startedAt: new Date().toISOString() };
  const proc = spawn("npm", ["run", script], { cwd: workspacePath, stdio: ["ignore", "pipe", "pipe"] });
  previews.set(projectSlug, { state, proc });

  emitPreviewLog(projectSlug, {
    ts: new Date().toISOString(),
    kind: "status",
    text: `$ npm run ${script}`,
  });

  const handleChunk = (chunk: Buffer) => {
    const text = chunk.toString("utf-8");
    emitPreviewLog(projectSlug, { ts: new Date().toISOString(), kind: "text", text });

    if (state.status === "starting") {
      const match = text.match(URL_RE);
      if (match) {
        state.status = "running";
        state.url = match[0];
        emitPreviewLog(projectSlug, {
          ts: new Date().toISOString(),
          kind: "status",
          text: `running at ${state.url}`,
        });
      }
    }
  };

  proc.stdout?.on("data", handleChunk);
  proc.stderr?.on("data", handleChunk);

  proc.on("exit", (code) => {
    const entry = previews.get(projectSlug);
    if (!entry || entry.proc !== proc) return; // superseded by a later start
    if (entry.state.status !== "stopped") {
      entry.state.status = code === 0 ? "stopped" : "error";
      if (code !== 0) entry.state.error = `process exited with code ${code}`;
      emitPreviewLog(projectSlug, {
        ts: new Date().toISOString(),
        kind: "status",
        text: entry.state.status === "stopped" ? "stopped" : `exited with code ${code}`,
      });
    }
  });

  proc.on("error", (err) => {
    const entry = previews.get(projectSlug);
    if (!entry || entry.proc !== proc) return;
    entry.state.status = "error";
    entry.state.error = err.message;
    emitPreviewLog(projectSlug, { ts: new Date().toISOString(), kind: "error", text: err.message });
  });

  return state;
}

export function stopPreview(projectSlug: string): PreviewState {
  const entry = previews.get(projectSlug);
  if (!entry || entry.state.status === "stopped") {
    return { status: "stopped" };
  }
  entry.state.status = "stopped";
  entry.state.url = undefined;
  entry.proc.kill("SIGTERM");
  return entry.state;
}
