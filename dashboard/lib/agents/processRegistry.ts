import type { ChildProcess } from "node:child_process";

/** Tracks the in-flight CLI process for each run, regardless of which agent
 *  backend started it, so cancellation works uniformly across agents. */
const activeProcesses = new Map<string, ChildProcess>();

export function registerProcess(runId: string, proc: ChildProcess): void {
  activeProcesses.set(runId, proc);
}

export function unregisterProcess(runId: string): void {
  activeProcesses.delete(runId);
}

export function cancelRun(runId: string): boolean {
  const proc = activeProcesses.get(runId);
  if (!proc) return false;
  proc.kill("SIGTERM");
  return true;
}
