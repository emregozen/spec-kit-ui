"use client";

import { useEffect, useRef, useState } from "react";
import { api } from "@/lib/api";
import type { PreviewState, PreviewStatus } from "@/lib/types";
import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { LogConsole } from "@/components/LogConsole";

const STATUS_CONFIG: Record<PreviewStatus, { label: string; tone: "neutral" | "blue" | "green" | "red" }> = {
  stopped: { label: "Stopped", tone: "neutral" },
  starting: { label: "Starting…", tone: "blue" },
  running: { label: "Running", tone: "green" },
  error: { label: "Error", tone: "red" },
};

export function PreviewPanel({ slug }: { slug: string }) {
  const [state, setState] = useState<PreviewState>({ status: "stopped" });
  const [lines, setLines] = useState<{ kind: string; text: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    api.getPreview(slug).then(setState).catch(() => {});
  }, [slug]);

  useEffect(() => {
    const es = new EventSource(`/api/projects/${slug}/preview/stream`);
    esRef.current = es;
    es.onmessage = (e) => {
      const event = JSON.parse(e.data);
      setLines((prev) => [...prev, { kind: event.kind, text: event.text }]);
      if (event.kind === "status") {
        api.getPreview(slug).then(setState).catch(() => {});
      }
    };
    return () => es.close();
  }, [slug]);

  async function handleStart() {
    setBusy(true);
    setOpen(true);
    try {
      setState(await api.startPreview(slug));
    } finally {
      setBusy(false);
    }
  }

  async function handleStop() {
    setBusy(true);
    try {
      setState(await api.stopPreview(slug));
    } finally {
      setBusy(false);
    }
  }

  const canStart = state.status === "stopped" || state.status === "error";

  return (
    <Card>
      <CardHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-zinc-100">Preview</span>
          <Badge tone={STATUS_CONFIG[state.status].tone}>{STATUS_CONFIG[state.status].label}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {state.url && (
            <a
              href={state.url}
              target="_blank"
              rel="noreferrer"
              className="text-sm text-emerald-400 hover:underline"
            >
              Open app ↗
            </a>
          )}
          <Button variant="ghost" onClick={() => setOpen((o) => !o)}>
            {open ? "Hide logs" : "Show logs"}
          </Button>
          {canStart ? (
            <Button variant="primary" disabled={busy} onClick={handleStart}>
              Start
            </Button>
          ) : (
            <Button variant="danger" disabled={busy} onClick={handleStop}>
              Stop
            </Button>
          )}
        </div>
      </CardHeader>
      {state.status === "error" && state.error && (
        <CardBody className="text-sm text-red-400">{state.error}</CardBody>
      )}
      {open && (
        <div className="h-64 border-t border-zinc-800">
          <LogConsole lines={lines} />
        </div>
      )}
    </Card>
  );
}
