import { claudeCodeAgent } from "./claude-code";
import { copilotAgent } from "./copilot";
import { opencodeAgent } from "./opencode";
import { qwenCodeAgent } from "./qwen-code";
import type { AgentDefinition } from "./types";

export const DEFAULT_AGENT_ID = "claude-code";

/** All available agent backends. To add a new one: implement AgentDefinition in its
 *  own file under lib/agents/, then list it here — no other code needs to change. */
export const AGENTS: AgentDefinition[] = [claudeCodeAgent, copilotAgent, opencodeAgent, qwenCodeAgent];

const AGENT_MAP = new Map(AGENTS.map((a) => [a.id, a]));

export function getAgent(id?: string): AgentDefinition {
  return AGENT_MAP.get(id ?? DEFAULT_AGENT_ID) ?? (AGENT_MAP.get(DEFAULT_AGENT_ID) as AgentDefinition);
}
