import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { registerProcess, unregisterProcess } from "./processRegistry";
import type { AgentRunOptions, AgentRunResult } from "./types";

/** Spawns a CLI agent that just prints plain text to stdout (no structured event
 *  stream), forwarding output as "text" log events and resolving on exit. Use this
 *  for agent backends that don't have a machine-readable output format. */
export function runTextAgentProcess(
  runId: string,
  command: string,
  args: string[],
  opts: AgentRunOptions
): Promise<AgentRunResult> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(opts.logFile), { recursive: true });
    const logStream = fs.createWriteStream(opts.logFile, { flags: "a" });
    const startedAt = Date.now();

    const proc = spawn(command, args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    registerProcess(runId, proc);

    let stdoutBuf = "";
    let stderrBuf = "";

    proc.stdout?.on("data", (chunk: Buffer) => {
      const text = chunk.toString("utf-8");
      stdoutBuf += text;
      logStream.write(chunk);
      opts.onEvent({ ts: new Date().toISOString(), kind: "text", text });
    });

    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString("utf-8");
      logStream.write(chunk);
    });

    const onAbort = () => proc.kill("SIGTERM");
    opts.signal?.addEventListener("abort", onAbort);

    proc.on("close", (code) => {
      unregisterProcess(runId);
      opts.signal?.removeEventListener("abort", onAbort);
      logStream.end();

      const success = code === 0;
      const resultSummary = (success ? stdoutBuf : stderrBuf || stdoutBuf).trim().slice(-2000);
      if (!success) {
        opts.onEvent({
          ts: new Date().toISOString(),
          kind: "error",
          text: `${command} exited with code ${code}${stderrBuf ? `: ${stderrBuf.slice(0, 500)}` : ""}`,
        });
      } else {
        opts.onEvent({ ts: new Date().toISOString(), kind: "result", text: resultSummary });
      }
      resolve({ success, resultSummary, costUsd: 0, durationMs: Date.now() - startedAt });
    });

    proc.on("error", (err) => {
      unregisterProcess(runId);
      logStream.end();
      reject(err);
    });
  });
}
