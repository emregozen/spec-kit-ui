export type PersonaKind = "library" | "custom";

export interface PersonaStep {
  /** Slash command to invoke, e.g. "/speckit-specify" (library steps only). */
  command?: string;
  /** Template for the command's $ARGUMENTS, or the full freeform prompt for custom steps.
   *  Supports {{request}} and {{feedback}} tokens. */
  argsTemplate: string;
}

export interface Persona {
  /** Stable id within a team (e.g. "ux-designer" or a generated id for custom personas). */
  id: string;
  /** Which persona-library definition this came from, if kind === "library". */
  libraryId?: string;
  name: string;
  icon: string;
  kind: PersonaKind;
  description: string;
  steps: PersonaStep[];
  /** Artifact file/dir names relative to the feature directory. */
  artifacts: string[];
  /** Which agent backend runs this persona's steps (e.g. "claude-code", "qwen-code").
   *  Unset means the default agent (see lib/agents/registry.ts). */
  agentId?: string;
  /** Model identifier passed to the agent's CLI, in whatever form that agent expects
   *  (e.g. "sonnet", "gpt-5", "qwen3-coder-plus"). Unset means the agent's own default. */
  model?: string;
}

export interface AgentSummary {
  id: string;
  name: string;
  icon: string;
  description: string;
  models: { value: string; label: string }[];
}

export interface Team {
  personas: Persona[];
}

export interface Project {
  slug: string;
  name: string;
  createdAt: string;
  /** Absolute path to the spec-kit-initialized workspace directory. */
  workspacePath: string;
}

export type StageStatus =
  | "pending"
  | "running"
  | "awaiting_approval"
  | "changes_requested"
  | "approved"
  | "failed";

export interface RunStage {
  personaId: string;
  name: string;
  icon: string;
  kind: PersonaKind;
  artifacts: string[];
  steps: PersonaStep[];
  agentId?: string;
  model?: string;
  status: StageStatus;
  stepIndex: number;
  startedAt?: string;
  completedAt?: string;
  feedback?: string;
  resultSummary?: string;
  costUsd?: number;
  durationMs?: number;
  error?: string;
}

export interface Run {
  id: string;
  projectSlug: string;
  featureRequest: string;
  platform?: string;
  createdAt: string;
  currentStageIndex: number;
  stages: RunStage[];
  status: "active" | "completed" | "cancelled";
  featureDir?: string;
}

export interface LogEvent {
  runId: string;
  stageIndex: number;
  ts: string;
  kind: "text" | "tool" | "system" | "result" | "error" | "status";
  text: string;
}

export type PreviewStatus = "stopped" | "starting" | "running" | "error";

export interface PreviewState {
  status: PreviewStatus;
  /** The package.json script that was run, e.g. "dev". */
  script?: string;
  /** Detected local URL once the dev server prints one, e.g. http://localhost:5173/. */
  url?: string;
  startedAt?: string;
  error?: string;
}

export interface PreviewEvent {
  ts: string;
  kind: "text" | "error" | "status";
  text: string;
}
