"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/lib/api";
import type { Run } from "@/lib/types";
import { PipelineStepper } from "@/components/PipelineStepper";
import { LogConsole } from "@/components/LogConsole";
import { ArtifactViewer } from "@/components/ArtifactViewer";
import { ChangedFiles } from "@/components/ChangedFiles";
import { ApprovalBar } from "@/components/ApprovalBar";
import { Tabs } from "@/components/ui/Tabs";

type LogLine = { kind: string; text: string };

export default function RunPage() {
  const { id } = useParams<{ id: string }>();
  const [run, setRun] = useState<Run | null>(null);
  const [selectedStage, setSelectedStage] = useState(0);
  const [logsByStage, setLogsByStage] = useState<Record<number, LogLine[]>>({});
  const [artifacts, setArtifacts] = useState<{ name: string; content: string | null }[]>([]);
  const [changedFiles, setChangedFiles] = useState<{ status: string; path: string }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const followCurrent = useRef(true);

  const refreshRun = useCallback(() => {
    api.getRun(id).then((r) => {
      setRun(r);
      if (followCurrent.current) setSelectedStage(r.currentStageIndex);
    });
  }, [id]);

  useEffect(() => {
    refreshRun();
  }, [refreshRun]);

  // Live log stream for the whole run; buffer per stage index.
  useEffect(() => {
    const es = new EventSource(`/api/runs/${id}/stream`);
    es.onmessage = (ev) => {
      const data = JSON.parse(ev.data) as { kind: string; text: string; stageIndex: number };
      if (data.stageIndex >= 0) {
        setLogsByStage((prev) => ({
          ...prev,
          [data.stageIndex]: [...(prev[data.stageIndex] ?? []), { kind: data.kind, text: data.text }],
        }));
      }
      if (data.kind === "status") {
        refreshRun();
      }
    };
    return () => es.close();
  }, [id, refreshRun]);

  // Backfill persisted log for the selected stage (once) so reconnects/page loads show history.
  useEffect(() => {
    api.getLog(id, selectedStage).then(({ events }) => {
      setLogsByStage((prev) => (prev[selectedStage] ? prev : { ...prev, [selectedStage]: events as LogLine[] }));
    });
  }, [id, selectedStage]);

  const stageStatus = run?.stages[selectedStage]?.status;
  useEffect(() => {
    api
      .getArtifacts(id, selectedStage)
      .then(({ artifacts, changedFiles }) => {
        setArtifacts(artifacts);
        setChangedFiles(changedFiles);
      })
      .catch(() => {
        setArtifacts([]);
        setChangedFiles([]);
      });
  }, [id, selectedStage, stageStatus]);

  if (!run) {
    return (
      <main className="px-6 py-10">
        <p className="text-sm text-zinc-500">Loading…</p>
      </main>
    );
  }

  const stage = run.stages[selectedStage];
  const isCurrentStage = selectedStage === run.currentStageIndex;

  async function withBusy(fn: () => Promise<unknown>) {
    setBusy(true);
    setError(null);
    try {
      await fn();
      followCurrent.current = true;
      refreshRun();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex h-[calc(100vh-49px)] flex-col">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-3">
        <div>
          <a href={`/projects/${run.projectSlug}`} className="text-xs text-zinc-500 hover:text-zinc-300">
            ← {run.projectSlug}
          </a>
          <h1 className="truncate text-sm font-medium text-zinc-100">{run.featureRequest}</h1>
        </div>
        {error && <p className="text-sm text-red-400">{error}</p>}
      </div>

      <div className="flex min-h-0 flex-1">
        <aside className="w-64 shrink-0 overflow-auto border-r border-zinc-800 p-3">
          <PipelineStepper
            stages={run.stages}
            selectedIndex={selectedStage}
            onSelect={(i) => {
              followCurrent.current = i === run.currentStageIndex;
              setSelectedStage(i);
            }}
          />
        </aside>

        <section className="flex min-h-0 flex-1 flex-col">
          <div className="min-h-0 flex-1 overflow-hidden border-b border-zinc-800">
            <Tabs
              tabs={[
                {
                  key: "artifacts",
                  label: "Artifacts",
                  content: (
                    <div className="divide-y divide-zinc-800">
                      {artifacts.length === 0 && (
                        <p className="p-4 text-sm text-zinc-500">No artifacts defined for this persona.</p>
                      )}
                      {artifacts.map((a) => (
                        <div key={a.name}>
                          <div className="bg-zinc-900/60 px-4 py-1.5 text-xs font-mono text-zinc-500">
                            {a.name}
                          </div>
                          <ArtifactViewer name={a.name} content={a.content} />
                        </div>
                      ))}
                    </div>
                  ),
                },
                {
                  key: "changes",
                  label: "Changed files",
                  content: <ChangedFiles files={changedFiles} />,
                },
              ]}
            />
          </div>

          <div className="h-64 shrink-0">
            <LogConsole lines={logsByStage[selectedStage] ?? []} />
          </div>
        </section>
      </div>

      {stage && isCurrentStage && (
        <ApprovalBar
          stage={stage}
          busy={busy}
          onApprove={() => withBusy(() => api.approve(id))}
          onReject={(comment) => withBusy(() => api.reject(id, comment))}
          onRerun={() => withBusy(() => api.rerun(id))}
          onCancel={() => withBusy(() => api.cancel(id))}
        />
      )}
    </main>
  );
}
