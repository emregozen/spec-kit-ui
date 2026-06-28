import { runTextAgentProcess } from "./process";
import type { AgentDefinition } from "./types";

export const qwenCodeAgent: AgentDefinition = {
  id: "qwen-code",
  name: "Qwen Code",
  icon: "🟣",
  description: "Alibaba's `qwen` CLI (Qwen Code), run headlessly with `-p --yolo`.",
  cliCommand: "qwen",
  models: [
    { value: "", label: "Default" },
    { value: "qwen3-coder-plus", label: "Qwen3 Coder Plus" },
    { value: "qwen3-coder-flash", label: "Qwen3 Coder Flash" },
    { value: "qwen2.5-coder:32b", label: "Qwen2.5 Coder 32B (local)" },
  ],
  run(runId, opts) {
    const args = ["-p", opts.prompt, "--yolo"];
    if (opts.model) args.push("--model", opts.model);
    return runTextAgentProcess(runId, "qwen", args, opts);
  },
};
