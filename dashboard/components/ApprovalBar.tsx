"use client";

import { useState } from "react";
import type { RunStage } from "@/lib/types";
import { Button } from "./ui/Button";

export function ApprovalBar({
  stage,
  busy,
  onApprove,
  onReject,
  onRerun,
  onCancel,
}: {
  stage: RunStage;
  busy: boolean;
  onApprove: () => void;
  onReject: (comment: string) => void;
  onRerun: () => void;
  onCancel: () => void;
}) {
  const [comment, setComment] = useState("");
  const [showReject, setShowReject] = useState(false);

  if (stage.status === "running") {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <span className="text-sm text-zinc-400">{stage.name} is running…</span>
        <Button variant="danger" disabled={busy} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    );
  }

  if (stage.status === "awaiting_approval") {
    return (
      <div className="border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        {!showReject ? (
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-zinc-400">
              {stage.name} is done — review the artifacts, then approve or request changes.
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" disabled={busy} onClick={() => setShowReject(true)}>
                Request changes
              </Button>
              <Button variant="primary" disabled={busy} onClick={onApprove}>
                Approve
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-2">
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              autoFocus
              placeholder="What should change?"
              className="w-full rounded-md border border-zinc-700 bg-zinc-900 px-3 py-2 text-sm placeholder:text-zinc-500"
            />
            <div className="flex justify-end gap-2">
              <Button variant="ghost" onClick={() => setShowReject(false)}>
                Cancel
              </Button>
              <Button
                variant="danger"
                disabled={busy || !comment.trim()}
                onClick={() => {
                  onReject(comment.trim());
                  setShowReject(false);
                  setComment("");
                }}
              >
                Send back
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  }

  if (stage.status === "changes_requested" || stage.status === "failed") {
    return (
      <div className="flex items-center justify-between gap-3 border-t border-zinc-800 bg-zinc-950 px-4 py-3">
        <span className="text-sm text-zinc-400">
          {stage.status === "failed" ? `${stage.name} failed: ${stage.error ?? ""}` : `Changes requested: ${stage.feedback}`}
        </span>
        <Button variant="primary" disabled={busy} onClick={onRerun}>
          Re-run
        </Button>
      </div>
    );
  }

  return null;
}
