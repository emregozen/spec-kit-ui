import { spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import type { LogEvent } from "./types";
import { registerProcess, unregisterProcess } from "./agents/processRegistry";

export interface RunStepOptions {
  cwd: string;
  prompt: string;
  onEvent: (event: Omit<LogEvent, "runId" | "stageIndex">) => void;
  logFile: string;
  signal?: AbortSignal;
  /** Passed through as `--model <model>`; omit to use Claude Code's own default. */
  model?: string;
}

export interface RunStepResult {
  success: boolean;
  resultSummary: string;
  costUsd: number;
  durationMs: number;
}

interface StreamJsonEvent {
  type: string;
  subtype?: string;
  message?: { content?: { type: string; text?: string; name?: string; input?: unknown }[] };
  result?: string;
  total_cost_usd?: number;
  duration_ms?: number;
  is_error?: boolean;
}

/** Spawns `claude -p <prompt>` headlessly in `cwd`, streaming stream-json events
 *  to onEvent and appending raw lines to logFile. Resolves once the process exits. */
export function runClaudeStep(runId: string, opts: RunStepOptions): Promise<RunStepResult> {
  return new Promise((resolve, reject) => {
    fs.mkdirSync(path.dirname(opts.logFile), { recursive: true });
    const logStream = fs.createWriteStream(opts.logFile, { flags: "a" });

    const args = [
      "-p",
      opts.prompt,
      "--output-format",
      "stream-json",
      "--permission-mode",
      "acceptEdits",
      "--verbose",
    ];
    if (opts.model) args.push("--model", opts.model);

    const proc = spawn("claude", args, { cwd: opts.cwd, stdio: ["ignore", "pipe", "pipe"] });
    registerProcess(runId, proc);

    let buffer = "";
    let resultSummary = "";
    let costUsd = 0;
    let durationMs = 0;
    let sawResult = false;

    const handleLine = (line: string) => {
      if (!line.trim()) return;
      logStream.write(line + "\n");
      let parsed: StreamJsonEvent;
      try {
        parsed = JSON.parse(line);
      } catch {
        opts.onEvent({ ts: new Date().toISOString(), kind: "text", text: line });
        return;
      }

      if (parsed.type === "assistant" && parsed.message?.content) {
        for (const block of parsed.message.content) {
          if (block.type === "text" && block.text) {
            opts.onEvent({ ts: new Date().toISOString(), kind: "text", text: block.text });
          } else if (block.type === "tool_use") {
            const inputPreview = JSON.stringify(block.input ?? {}).slice(0, 200);
            opts.onEvent({
              ts: new Date().toISOString(),
              kind: "tool",
              text: `${block.name}(${inputPreview})`,
            });
          }
        }
      } else if (parsed.type === "result") {
        sawResult = true;
        resultSummary = typeof parsed.result === "string" ? parsed.result : "";
        costUsd = parsed.total_cost_usd ?? 0;
        durationMs = parsed.duration_ms ?? 0;
        opts.onEvent({
          ts: new Date().toISOString(),
          kind: "result",
          text: parsed.is_error ? `Error: ${resultSummary}` : resultSummary,
        });
      } else if (parsed.type === "system" && parsed.subtype) {
        opts.onEvent({ ts: new Date().toISOString(), kind: "system", text: `[${parsed.subtype}]` });
      }
    };

    proc.stdout?.on("data", (chunk: Buffer) => {
      buffer += chunk.toString("utf-8");
      const lines = buffer.split("\n");
      buffer = lines.pop() ?? "";
      for (const line of lines) handleLine(line);
    });

    let stderrBuf = "";
    proc.stderr?.on("data", (chunk: Buffer) => {
      stderrBuf += chunk.toString("utf-8");
      logStream.write(chunk);
    });

    const onAbort = () => proc.kill("SIGTERM");
    opts.signal?.addEventListener("abort", onAbort);

    proc.on("close", (code) => {
      unregisterProcess(runId);
      opts.signal?.removeEventListener("abort", onAbort);
      if (buffer.trim()) handleLine(buffer);
      logStream.end();
      if (code !== 0 && !sawResult) {
        opts.onEvent({
          ts: new Date().toISOString(),
          kind: "error",
          text: `claude exited with code ${code}${stderrBuf ? `: ${stderrBuf.slice(0, 500)}` : ""}`,
        });
      }
      resolve({ success: code === 0, resultSummary, costUsd, durationMs });
    });

    proc.on("error", (err) => {
      unregisterProcess(runId);
      logStream.end();
      reject(err);
    });
  });
}
