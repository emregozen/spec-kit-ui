import type { AgentSummary, Persona, PreviewState, Project, Run, Team } from "./types";

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
    cache: "no-store",
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error || `Request failed: ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json();
}

export const api = {
  listProjects: () => request<Project[]>("/api/projects"),
  createProject: (name: string) =>
    request<Project>("/api/projects", { method: "POST", body: JSON.stringify({ name }) }),
  deleteProject: (slug: string) => request<void>(`/api/projects/${slug}`, { method: "DELETE" }),

  getTeam: (slug: string) => request<Team>(`/api/projects/${slug}/team`),
  saveTeam: (slug: string, team: Team) =>
    request<Team>(`/api/projects/${slug}/team`, { method: "PUT", body: JSON.stringify(team) }),

  getPersonaLibrary: () => request<Persona[]>("/api/persona-library"),
  getAgents: () => request<AgentSummary[]>("/api/agents"),

  listRuns: (projectSlug: string) => request<Run[]>(`/api/runs?project=${projectSlug}`),
  getRun: (id: string) => request<Run>(`/api/runs/${id}`),
  createRun: (projectSlug: string, featureRequest: string) =>
    request<Run>("/api/runs", {
      method: "POST",
      body: JSON.stringify({ projectSlug, featureRequest }),
    }),

  approve: (id: string) => request<Run>(`/api/runs/${id}/approve`, { method: "POST" }),
  reject: (id: string, comment: string) =>
    request<Run>(`/api/runs/${id}/reject`, { method: "POST", body: JSON.stringify({ comment }) }),
  rerun: (id: string) => request<Run>(`/api/runs/${id}/rerun`, { method: "POST" }),
  cancel: (id: string) => request<Run>(`/api/runs/${id}/cancel`, { method: "POST" }),
  deleteRun: (id: string) => request<void>(`/api/runs/${id}`, { method: "DELETE" }),

  getLog: (id: string, stageIndex: number) =>
    request<{ events: { kind: string; text: string }[] }>(
      `/api/runs/${id}/log?stageIndex=${stageIndex}`
    ),
  getArtifacts: (id: string, stageIndex: number) =>
    request<{
      featureDir: string | null;
      artifacts: { name: string; content: string | null }[];
      changedFiles: { status: string; path: string }[];
    }>(`/api/runs/${id}/artifacts?stageIndex=${stageIndex}`),

  getPreview: (slug: string) => request<PreviewState>(`/api/projects/${slug}/preview`),
  startPreview: (slug: string) =>
    request<PreviewState>(`/api/projects/${slug}/preview/start`, { method: "POST" }),
  stopPreview: (slug: string) =>
    request<PreviewState>(`/api/projects/${slug}/preview/stop`, { method: "POST" }),
};
