import { runClaudeStep } from "../claudeRunner";
import type { AgentDefinition } from "./types";

export const claudeCodeAgent: AgentDefinition = {
  id: "claude-code",
  name: "Claude Code",
  icon: "✳️",
  description: "Anthropic's `claude` CLI, run headlessly with structured stream-json output.",
  cliCommand: "claude",
  models: [
    { value: "", label: "Default" },
    { value: "opus", label: "Opus" },
    { value: "sonnet", label: "Sonnet" },
    { value: "haiku", label: "Haiku" },
  ],
  run(runId, opts) {
    return runClaudeStep(runId, opts);
  },
};
