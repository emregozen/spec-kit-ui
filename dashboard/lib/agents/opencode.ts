import { runTextAgentProcess } from "./process";
import type { AgentDefinition } from "./types";

export const opencodeAgent: AgentDefinition = {
  id: "opencode",
  name: "opencode",
  icon: "🧱",
  description: "The `opencode` CLI's non-interactive `run` command, supports many model providers.",
  cliCommand: "opencode",
  models: [
    { value: "", label: "Default" },
    { value: "anthropic/claude-sonnet-4.6", label: "Claude Sonnet 4.6" },
    { value: "openai/gpt-5", label: "GPT-5" },
    { value: "qwen/qwen3-coder-plus", label: "Qwen3 Coder Plus" },
  ],
  run(runId, opts) {
    const args = ["run"];
    if (opts.model) args.push("--model", opts.model);
    args.push(opts.prompt);
    return runTextAgentProcess(runId, "opencode", args, opts);
  },
};
