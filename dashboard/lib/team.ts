import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import type { Persona, Team } from "./types";

const REPO_ROOT = path.join(process.cwd(), "..");
const PERSONA_LIBRARY_DIR = path.join(REPO_ROOT, "templates", "persona-library");

interface LibraryPersona {
  libraryId: string;
  name: string;
  icon: string;
  kind: "library";
  description: string;
  artifacts: string[];
  steps: { command: string; argsTemplate: string }[];
  agentId?: string;
}

export function loadPersonaLibrary(): LibraryPersona[] {
  const files = fs.readdirSync(PERSONA_LIBRARY_DIR).filter((f) => f.endsWith(".json"));
  return files.map((f) => JSON.parse(fs.readFileSync(path.join(PERSONA_LIBRARY_DIR, f), "utf-8")));
}

export function instantiateLibraryPersona(libraryId: string): Persona {
  const lib = loadPersonaLibrary().find((p) => p.libraryId === libraryId);
  if (!lib) throw new Error(`Unknown library persona: ${libraryId}`);
  return {
    id: `${libraryId}-${randomUUID().slice(0, 8)}`,
    libraryId: lib.libraryId,
    name: lib.name,
    icon: lib.icon,
    kind: "library",
    description: lib.description,
    artifacts: lib.artifacts,
    steps: lib.steps.map((s) => ({ command: s.command, argsTemplate: s.argsTemplate })),
    agentId: lib.agentId,
  };
}

export function createCustomPersona(input: {
  name: string;
  icon: string;
  description: string;
  promptTemplate: string;
  artifacts: string[];
  agentId?: string;
}): Persona {
  return {
    id: `custom-${randomUUID().slice(0, 8)}`,
    name: input.name,
    icon: input.icon || "🧩",
    kind: "custom",
    description: input.description,
    artifacts: input.artifacts,
    steps: [{ argsTemplate: input.promptTemplate }],
    agentId: input.agentId,
  };
}

const DEFAULT_TEAM_ORDER = ["ux-designer", "architect", "developer", "tester"];

export function defaultTeam(): Team {
  const lib = loadPersonaLibrary();
  const ordered = DEFAULT_TEAM_ORDER.map((id) => lib.find((p) => p.libraryId === id)).filter(
    (p): p is LibraryPersona => Boolean(p)
  );
  return { personas: ordered.map((p) => instantiateLibraryPersona(p.libraryId)) };
}

function teamFile(workspacePath: string): string {
  return path.join(workspacePath, ".speckit-team", "team.json");
}

export function readTeam(workspacePath: string): Team {
  const file = teamFile(workspacePath);
  if (!fs.existsSync(file)) {
    const team = defaultTeam();
    writeTeam(workspacePath, team);
    return team;
  }
  return JSON.parse(fs.readFileSync(file, "utf-8"));
}

export function writeTeam(workspacePath: string, team: Team): void {
  const file = teamFile(workspacePath);
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, JSON.stringify(team, null, 2));
}
