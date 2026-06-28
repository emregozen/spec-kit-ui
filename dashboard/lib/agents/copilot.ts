import { runTextAgentProcess } from "./process";
import type { AgentDefinition } from "./types";

export const copilotAgent: AgentDefinition = {
  id: "copilot",
  name: "GitHub Copilot CLI",
  icon: "🐙",
  description: "GitHub's `copilot` CLI, run headlessly via `-p`.",
  cliCommand: "copilot",
  models: [
    { value: "", label: "Default" },
    { value: "claude-sonnet-4.5", label: "Claude Sonnet 4.5" },
    { value: "gpt-5", label: "GPT-5" },
  ],
  run(runId, opts) {
    const args = ["-p", opts.prompt, "--allow-all-tools"];
    if (opts.model) args.push("--model", opts.model);
    return runTextAgentProcess(runId, "copilot", args, opts);
  },
};
