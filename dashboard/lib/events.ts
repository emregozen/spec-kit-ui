import { EventEmitter } from "node:events";
import type { LogEvent, PreviewEvent } from "./types";

// Module-level singleton: Next.js dev/prod server keeps one Node process per
// instance, so a plain module-scoped emitter is enough to fan log/status
// events out to any number of SSE subscribers for a given run.
const bus = new EventEmitter();
bus.setMaxListeners(0);

export function emitLog(event: LogEvent): void {
  bus.emit(event.runId, event);
}

export function subscribe(runId: string, onEvent: (event: LogEvent) => void): () => void {
  bus.on(runId, onEvent);
  return () => bus.off(runId, onEvent);
}

// Separate emitter (and key space) from the run-log bus above so a project
// slug can never collide with a run id.
const previewBus = new EventEmitter();
previewBus.setMaxListeners(0);

export function emitPreviewLog(projectSlug: string, event: PreviewEvent): void {
  previewBus.emit(projectSlug, event);
}

export function subscribePreview(
  projectSlug: string,
  onEvent: (event: PreviewEvent) => void
): () => void {
  previewBus.on(projectSlug, onEvent);
  return () => previewBus.off(projectSlug, onEvent);
}
