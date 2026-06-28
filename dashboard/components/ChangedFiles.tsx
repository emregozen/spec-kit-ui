import { Badge } from "./ui/Badge";

const STATUS_LABEL: Record<string, string> = {
  M: "modified",
  A: "added",
  D: "deleted",
  "??": "untracked",
  R: "renamed",
};

export function ChangedFiles({ files }: { files: { status: string; path: string }[] }) {
  if (files.length === 0) {
    return <p className="p-4 text-sm text-zinc-500">No changed files in the workspace yet.</p>;
  }

  return (
    <ul className="divide-y divide-zinc-800">
      {files.map((f) => (
        <li key={f.path} className="flex items-center gap-3 px-4 py-2">
          <Badge tone="neutral">{STATUS_LABEL[f.status] ?? f.status}</Badge>
          <span className="truncate font-mono text-xs text-zinc-300">{f.path}</span>
        </li>
      ))}
    </ul>
  );
}
