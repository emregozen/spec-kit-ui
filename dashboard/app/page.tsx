"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import type { Project } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function HomePage() {
  const router = useRouter();
  const [projects, setProjects] = useState<Project[] | null>(null);
  const [name, setName] = useState("");
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [deletingSlug, setDeletingSlug] = useState<string | null>(null);

  useEffect(() => {
    api.listProjects().then(setProjects).catch((e) => setError(String(e)));
  }, []);

  async function createProject(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    setCreating(true);
    setError(null);
    try {
      const project = await api.createProject(name.trim());
      router.push(`/projects/${project.slug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setCreating(false);
    }
  }

  async function handleDelete(e: React.MouseEvent, slug: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm(`Delete project "${slug}" and all of its runs? This can't be undone.`)) return;
    setDeletingSlug(slug);
    setError(null);
    try {
      await api.deleteProject(slug);
      setProjects((prev) => prev?.filter((p) => p.slug !== slug) ?? prev);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setDeletingSlug(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Each project is a spec-kit workspace with its own configurable AI team.
      </p>

      <form onSubmit={createProject} className="mt-6 flex gap-2">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="New project name…"
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        <Button type="submit" variant="primary" disabled={creating || !name.trim()}>
          {creating ? "Creating…" : "New project"}
        </Button>
      </form>
      {error && <p className="mt-2 text-sm text-red-400">{error}</p>}

      <div className="mt-8 space-y-2">
        {projects === null && <p className="text-sm text-zinc-500">Loading…</p>}
        {projects?.length === 0 && (
          <p className="text-sm text-zinc-500">No projects yet — create one above to get started.</p>
        )}
        {projects?.map((p) => (
          <a key={p.slug} href={`/projects/${p.slug}`} className="block">
            <Card className="transition-colors hover:border-zinc-600">
              <CardBody className="flex items-center justify-between">
                <div>
                  <div className="font-medium text-zinc-100">{p.name}</div>
                  <div className="text-xs text-zinc-500">{p.slug}</div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-xs text-zinc-500">
                    {new Date(p.createdAt).toLocaleDateString()}
                  </div>
                  <Button
                    variant="danger"
                    disabled={deletingSlug === p.slug}
                    onClick={(e) => handleDelete(e, p.slug)}
                  >
                    {deletingSlug === p.slug ? "Deleting…" : "Delete"}
                  </Button>
                </div>
              </CardBody>
            </Card>
          </a>
        ))}
      </div>
    </main>
  );
}
