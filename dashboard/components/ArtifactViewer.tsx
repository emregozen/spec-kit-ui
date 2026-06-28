"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function ArtifactViewer({ name, content }: { name: string; content: string | null }) {
  if (content === null) {
    return <p className="p-4 text-sm text-zinc-500">{name} has not been created yet.</p>;
  }

  const isMarkdown = name.endsWith(".md");

  return (
    <div className="p-4">
      {isMarkdown ? (
        <article className="prose prose-invert prose-sm max-w-none prose-headings:font-semibold prose-pre:bg-zinc-900">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
        </article>
      ) : (
        <pre className="whitespace-pre-wrap break-words font-mono text-xs text-zinc-300">{content}</pre>
      )}
    </div>
  );
}
