"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { AgentSummary, Persona, Team } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const DEFAULT_AGENT_ID = "claude-code";

function emptyCustomDraft() {
  return {
    name: "",
    icon: "🧩",
    description: "",
    promptTemplate: "",
    artifacts: "",
    agentId: DEFAULT_AGENT_ID,
    model: "",
  };
}

export default function TeamEditorPage() {
  const { slug } = useParams<{ slug: string }>();
  const [team, setTeam] = useState<Team | null>(null);
  const [library, setLibrary] = useState<Persona[]>([]);
  const [agents, setAgents] = useState<AgentSummary[]>([]);
  const [adding, setAdding] = useState(false);
  const [customDraft, setCustomDraft] = useState(emptyCustomDraft());
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([api.getTeam(slug), api.getPersonaLibrary(), api.getAgents()]).then(
      ([t, lib, ag]) => {
        setTeam(t);
        setLibrary(lib);
        setAgents(ag);
      }
    );
  }, [slug]);

  function agentFor(id: string | undefined): AgentSummary | undefined {
    return agents.find((a) => a.id === (id ?? DEFAULT_AGENT_ID)) ?? agents[0];
  }

  async function persist(next: Team) {
    setTeam(next);
    setSaving(true);
    setError(null);
    try {
      await api.saveTeam(slug, next);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  }

  function addLibraryPersona(def: Persona) {
    if (!team) return;
    const persona: Persona = { ...def, id: `${def.libraryId}-${crypto.randomUUID().slice(0, 8)}` };
    persist({ personas: [...team.personas, persona] });
    setAdding(false);
  }

  function addCustomPersona() {
    if (!team || !customDraft.name.trim() || !customDraft.promptTemplate.trim()) return;
    const persona: Persona = {
      id: `custom-${crypto.randomUUID().slice(0, 8)}`,
      name: customDraft.name.trim(),
      icon: customDraft.icon.trim() || "🧩",
      kind: "custom",
      description: customDraft.description.trim(),
      steps: [{ argsTemplate: customDraft.promptTemplate.trim() }],
      artifacts: customDraft.artifacts
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean),
      agentId: customDraft.agentId || undefined,
      model: customDraft.model || undefined,
    };
    persist({ personas: [...team.personas, persona] });
    setCustomDraft(emptyCustomDraft());
    setAdding(false);
  }

  function removePersona(id: string) {
    if (!team) return;
    persist({ personas: team.personas.filter((p) => p.id !== id) });
  }

  function setModel(id: string, model: string) {
    if (!team) return;
    persist({
      personas: team.personas.map((p) => (p.id === id ? { ...p, model: model || undefined } : p)),
    });
  }

  function setAgent(id: string, agentId: string) {
    if (!team) return;
    persist({
      personas: team.personas.map((p) =>
        p.id === id ? { ...p, agentId: agentId || undefined, model: undefined } : p
      ),
    });
  }

  function move(id: string, dir: -1 | 1) {
    if (!team) return;
    const idx = team.personas.findIndex((p) => p.id === id);
    const newIdx = idx + dir;
    if (idx < 0 || newIdx < 0 || newIdx >= team.personas.length) return;
    const personas = [...team.personas];
    [personas[idx], personas[newIdx]] = [personas[newIdx], personas[idx]];
    persist({ personas });
  }

  if (!team) {
    return (
      <main className="mx-auto max-w-2xl px-6 py-10">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <a href={`/projects/${slug}`} className="text-xs text-zinc-500 hover:text-zinc-300">
        ← {slug}
      </a>
      <div className="mt-1 flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">Edit team</h1>
        {saving && <span className="text-xs text-zinc-500">Saving…</span>}
      </div>
      <p className="mt-1 text-sm text-zinc-400">
        Add, remove, and reorder personas. Each runs sequentially when a run reaches its stage.
      </p>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-6 space-y-2">
        {team.personas.map((p, i) => (
          <Card key={p.id}>
            <CardBody className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="text-2xl">{p.icon}</div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-zinc-100">{p.name}</span>
                    <Badge tone={p.kind === "library" ? "blue" : "violet"}>{p.kind}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-zinc-400">{p.description}</p>
                  <p className="mt-1 text-xs text-zinc-500">
                    artifacts: {p.artifacts.join(", ") || "—"}
                  </p>
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-1">
                <select
                  value={p.agentId ?? DEFAULT_AGENT_ID}
                  onChange={(e) => setAgent(p.id, e.target.value)}
                  title="Coding agent that runs this persona's steps"
                  className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300"
                >
                  {agents.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.icon} {a.name}
                    </option>
                  ))}
                </select>
                <input
                  value={p.model ?? ""}
                  onChange={(e) => setModel(p.id, e.target.value)}
                  list={`models-${p.id}`}
                  placeholder="Default model"
                  title="Model passed to the agent's CLI; pick a suggestion or type a custom value"
                  className="w-36 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300 placeholder:text-zinc-500"
                />
                <datalist id={`models-${p.id}`}>
                  {agentFor(p.agentId)?.models.map((m) => (
                    <option key={m.value} value={m.value}>
                      {m.label}
                    </option>
                  ))}
                </datalist>
                <Button variant="ghost" disabled={i === 0} onClick={() => move(p.id, -1)}>
                  ↑
                </Button>
                <Button variant="ghost" disabled={i === team.personas.length - 1} onClick={() => move(p.id, 1)}>
                  ↓
                </Button>
                <Button variant="danger" onClick={() => removePersona(p.id)}>
                  Remove
                </Button>
              </div>
            </CardBody>
          </Card>
        ))}
        {team.personas.length === 0 && (
          <p className="text-sm text-zinc-500">No personas yet — add one below.</p>
        )}
      </div>

      <div className="mt-6">
        {!adding ? (
          <Button variant="secondary" onClick={() => setAdding(true)}>
            + Add persona
          </Button>
        ) : (
          <Card>
            <CardBody className="space-y-4">
              <div>
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  From library
                </p>
                <div className="flex flex-wrap gap-2">
                  {library.map((def) => (
                    <button
                      key={def.libraryId}
                      onClick={() => addLibraryPersona(def)}
                      className="flex items-center gap-2 rounded-md border border-zinc-700 px-3 py-1.5 text-sm hover:border-zinc-500"
                    >
                      <span>{def.icon}</span>
                      <span>{def.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-4">
                <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-500">
                  Custom persona
                </p>
                <div className="grid grid-cols-[3rem_1fr] gap-2">
                  <input
                    value={customDraft.icon}
                    onChange={(e) => setCustomDraft({ ...customDraft, icon: e.target.value })}
                    placeholder="🧩"
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-2 text-center text-sm"
                  />
                  <input
                    value={customDraft.name}
                    onChange={(e) => setCustomDraft({ ...customDraft, name: e.target.value })}
                    placeholder="Name (e.g. Security Reviewer)"
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500"
                  />
                </div>
                <input
                  value={customDraft.description}
                  onChange={(e) => setCustomDraft({ ...customDraft, description: e.target.value })}
                  placeholder="One-line description"
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500"
                />
                <textarea
                  value={customDraft.promptTemplate}
                  onChange={(e) => setCustomDraft({ ...customDraft, promptTemplate: e.target.value })}
                  rows={4}
                  placeholder="Prompt template. Use {{request}} and {{feedback}} tokens."
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500"
                />
                <input
                  value={customDraft.artifacts}
                  onChange={(e) => setCustomDraft({ ...customDraft, artifacts: e.target.value })}
                  placeholder="Artifact filenames, comma-separated (optional)"
                  className="mt-2 w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500"
                />
                <div className="mt-2 flex items-center gap-2">
                  <label className="text-xs text-zinc-500">Agent:</label>
                  <select
                    value={customDraft.agentId}
                    onChange={(e) =>
                      setCustomDraft({ ...customDraft, agentId: e.target.value, model: "" })
                    }
                    className="rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300"
                  >
                    {agents.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.icon} {a.name}
                      </option>
                    ))}
                  </select>
                  <label className="text-xs text-zinc-500">Model:</label>
                  <input
                    value={customDraft.model}
                    onChange={(e) => setCustomDraft({ ...customDraft, model: e.target.value })}
                    list="custom-draft-models"
                    placeholder="Default model"
                    className="w-36 rounded-md border border-zinc-700 bg-zinc-900 px-2 py-1.5 text-sm text-zinc-300 placeholder:text-zinc-500"
                  />
                  <datalist id="custom-draft-models">
                    {agentFor(customDraft.agentId)?.models.map((m) => (
                      <option key={m.value} value={m.value}>
                        {m.label}
                      </option>
                    ))}
                  </datalist>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="primary"
                    onClick={addCustomPersona}
                    disabled={!customDraft.name.trim() || !customDraft.promptTemplate.trim()}
                  >
                    Add custom persona
                  </Button>
                  <Button variant="ghost" onClick={() => setAdding(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
      </div>
    </main>
  );
}
