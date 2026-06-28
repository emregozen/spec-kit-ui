import type { LogEvent } from "../types";

export interface AgentRunOptions {
  cwd: string;
  prompt: string;
  /** Agent-specific model identifier (e.g. "sonnet", "gpt-5", "qwen3-coder-plus"). */
  model?: string;
  logFile: string;
  signal?: AbortSignal;
  onEvent: (event: Omit<LogEvent, "runId" | "stageIndex">) => void;
}

export interface AgentRunResult {
  success: boolean;
  resultSummary: string;
  costUsd: number;
  durationMs: number;
}

export interface AgentModelOption {
  value: string;
  label: string;
}

/** A pluggable coding agent backend. Add a new one by implementing this interface
 *  in its own file under lib/agents/ and listing it in lib/agents/registry.ts. */
export interface AgentDefinition {
  /** Stable id stored on personas/stages (e.g. "claude-code", "qwen-code"). */
  id: string;
  name: string;
  icon: string;
  description: string;
  /** Underlying CLI binary, surfaced for display/diagnostics only. */
  cliCommand: string;
  /** Suggested model values for this agent's picker; the field stays freeform text. */
  models: AgentModelOption[];
  run: (runId: string, opts: AgentRunOptions) => Promise<AgentRunResult>;
}
