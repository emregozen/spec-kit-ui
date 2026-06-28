import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { defaultTeam, writeTeam } from "./team";

const REPO_ROOT = path.join(process.cwd(), "..");
const WORKSPACES_DIR = path.join(REPO_ROOT, "workspaces");
const PERSONA_COMMANDS_DIR = path.join(REPO_ROOT, "templates", "persona-commands");
const CONSTITUTION_ADDENDUM = path.join(REPO_ROOT, "templates", "constitution-addendum.md");

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60) || "project";
}

export function workspacePathFor(slug: string): string {
  return path.join(WORKSPACES_DIR, slug);
}

/** Runs `specify init`, installs our custom skills, appends persona principles to the
 *  constitution, seeds the default team, and git-inits the workspace. Idempotent-ish:
 *  throws if the workspace directory already exists. */
export function bootstrapWorkspace(slug: string): string {
  const workspacePath = workspacePathFor(slug);
  if (fs.existsSync(workspacePath)) {
    throw new Error(`Workspace already exists: ${slug}`);
  }
  fs.mkdirSync(WORKSPACES_DIR, { recursive: true });

  execFileSync(
    "specify",
    ["init", slug, "--integration", "claude", "--script", "sh", "--ignore-agent-tools"],
    { cwd: WORKSPACES_DIR, stdio: "pipe" }
  );

  const skillsDir = path.join(workspacePath, ".claude", "skills");
  fs.mkdirSync(skillsDir, { recursive: true });
  for (const skill of fs.readdirSync(PERSONA_COMMANDS_DIR)) {
    fs.cpSync(path.join(PERSONA_COMMANDS_DIR, skill), path.join(skillsDir, skill), { recursive: true });
  }

  const constitutionPath = path.join(workspacePath, ".specify", "memory", "constitution.md");
  const addendum = fs.readFileSync(CONSTITUTION_ADDENDUM, "utf-8");
  fs.appendFileSync(constitutionPath, `\n${addendum}`);

  writeTeam(workspacePath, defaultTeam());

  execFileSync("git", ["init", "-q"], { cwd: workspacePath });
  execFileSync("git", ["add", "-A"], { cwd: workspacePath });
  execFileSync(
    "git",
    ["-c", "user.email=speckit-team@local", "-c", "user.name=speckit-team", "commit", "-q", "-m", "Bootstrap spec-kit workspace"],
    { cwd: workspacePath }
  );

  return workspacePath;
}
