"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Run } from "@/lib/types";
import { Card, CardBody } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { StatusBadge } from "@/components/StatusBadge";
import { PreviewPanel } from "@/components/PreviewPanel";

export default function ProjectPage() {
  const { slug } = useParams<{ slug: string }>();
  const [runs, setRuns] = useState<Run[] | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    api.listRuns(slug).then(setRuns).catch(() => setRuns([]));
  }, [slug]);

  async function handleDelete(e: React.MouseEvent, id: string) {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm("Delete this run? This can't be undone.")) return;
    setDeletingId(id);
    try {
      await api.deleteRun(id);
      setRuns((prev) => prev?.filter((r) => r.id !== id) ?? prev);
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <main className="mx-auto max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-300">
            ← Projects
          </Link>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight">{slug}</h1>
        </div>
        <div className="flex gap-2">
          <Link href={`/projects/${slug}/team`}>
            <Button variant="secondary">Edit team</Button>
          </Link>
          <Link href={`/projects/${slug}/new-run`}>
            <Button variant="primary">New run</Button>
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <PreviewPanel slug={slug} />
      </div>

      <div className="mt-8 space-y-2">
        {runs === null && <p className="text-sm text-zinc-500">Loading…</p>}
        {runs?.length === 0 && (
          <p className="text-sm text-zinc-500">No runs yet — start one to send a feature request through the team.</p>
        )}
        {runs?.map((r) => {
          const stage = r.stages[r.currentStageIndex];
          return (
            <Link key={r.id} href={`/runs/${r.id}`} className="block">
              <Card className="transition-colors hover:border-zinc-600">
                <CardBody className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate font-medium text-zinc-100">{r.featureRequest}</div>
                    <div className="text-xs text-zinc-500">
                      {new Date(r.createdAt).toLocaleString()}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {stage ? <StatusBadge status={stage.status} /> : <StatusBadge status="approved" />}
                    <Button
                      variant="danger"
                      disabled={deletingId === r.id}
                      onClick={(e) => handleDelete(e, r.id)}
                    >
                      {deletingId === r.id ? "Deleting…" : "Delete"}
                    </Button>
                  </div>
                </CardBody>
              </Card>
            </Link>
          );
        })}
      </div>
    </main>
  );
}
