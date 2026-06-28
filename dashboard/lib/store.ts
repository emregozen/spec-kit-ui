import fs from "node:fs";
import path from "node:path";
import type { Project, Run } from "./types";

const DATA_DIR = path.join(process.cwd(), "data");
const PROJECTS_FILE = path.join(DATA_DIR, "projects.json");
const RUNS_FILE = path.join(DATA_DIR, "runs.json");

function ensureFile(file: string, initial: unknown) {
  if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
  if (!fs.existsSync(file)) fs.writeFileSync(file, JSON.stringify(initial, null, 2));
}

// All read-modify-write operations below are synchronous on purpose: Node's
// single-threaded event loop can't interleave another request's handler
// in the middle of a synchronous block, so this is safe without a lock.

function readJson<T>(file: string, initial: T): T {
  ensureFile(file, initial);
  return JSON.parse(fs.readFileSync(file, "utf-8")) as T;
}

function writeJson(file: string, data: unknown) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

export function listProjects(): Project[] {
  return readJson<Project[]>(PROJECTS_FILE, []);
}

export function getProject(slug: string): Project | undefined {
  return listProjects().find((p) => p.slug === slug);
}

export function saveProject(project: Project): void {
  const projects = listProjects();
  const idx = projects.findIndex((p) => p.slug === project.slug);
  if (idx >= 0) projects[idx] = project;
  else projects.push(project);
  writeJson(PROJECTS_FILE, projects);
}

export function deleteProject(slug: string): void {
  writeJson(PROJECTS_FILE, listProjects().filter((p) => p.slug !== slug));
  writeJson(RUNS_FILE, listRuns().filter((r) => r.projectSlug !== slug));
}

export function listRuns(): Run[] {
  return readJson<Run[]>(RUNS_FILE, []);
}

export function listRunsForProject(slug: string): Run[] {
  return listRuns().filter((r) => r.projectSlug === slug);
}

export function getRun(id: string): Run | undefined {
  return listRuns().find((r) => r.id === id);
}

export function saveRun(run: Run): void {
  const runs = listRuns();
  const idx = runs.findIndex((r) => r.id === run.id);
  if (idx >= 0) runs[idx] = run;
  else runs.push(run);
  writeJson(RUNS_FILE, runs);
}

export function updateRun(id: string, mutate: (run: Run) => void): Run {
  const runs = listRuns();
  const run = runs.find((r) => r.id === id);
  if (!run) throw new Error(`Run not found: ${id}`);
  mutate(run);
  writeJson(RUNS_FILE, runs);
  return run;
}

export function deleteRun(id: string): void {
  writeJson(RUNS_FILE, listRuns().filter((r) => r.id !== id));
}
