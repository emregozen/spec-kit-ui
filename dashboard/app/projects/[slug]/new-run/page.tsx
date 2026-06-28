"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/Button";

export default function NewRunPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const [request, setRequest] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!request.trim()) return;
    setSubmitting(true);
    setError(null);
    try {
      const run = await api.createRun(slug, request.trim());
      router.push(`/runs/${run.id}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
      setSubmitting(false);
    }
  }

  return (
    <main className="mx-auto max-w-2xl px-6 py-10">
      <a href={`/projects/${slug}`} className="text-xs text-zinc-500 hover:text-zinc-300">
        ← {slug}
      </a>
      <h1 className="mt-1 text-2xl font-semibold tracking-tight">New run</h1>
      <p className="mt-1 text-sm text-zinc-400">
        Describe what you want built. The first persona in this project&apos;s team will pick it up.
      </p>

      <form onSubmit={submit} className="mt-6 space-y-3">
        <textarea
          value={request}
          onChange={(e) => setRequest(e.target.value)}
          rows={6}
          placeholder="e.g. A single-page todo list app with add, complete, and delete."
          className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
        />
        <Button type="submit" variant="primary" disabled={submitting || !request.trim()}>
          {submitting ? "Starting…" : "Start run"}
        </Button>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
