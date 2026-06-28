import fs from "node:fs";
import { NextRequest, NextResponse } from "next/server";
import { getProject, getRun } from "@/lib/store";
import { logFileFor } from "@/lib/orchestrator";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const stageIndex = Number(req.nextUrl.searchParams.get("stageIndex") ?? "0");

  const run = getRun(id);
  if (!run) return NextResponse.json({ error: "run not found" }, { status: 404 });
  const project = getProject(run.projectSlug);
  if (!project) return NextResponse.json({ error: "project not found" }, { status: 404 });

  const file = logFileFor(project.workspacePath, id, stageIndex);
  if (!fs.existsSync(file)) return NextResponse.json({ lines: [] });

  const raw = fs.readFileSync(file, "utf-8");
  const events = raw
    .split("\n")
    .filter(Boolean)
    .map((line) => {
      try {
        const parsed = JSON.parse(line);
        if (parsed.type === "assistant" && parsed.message?.content) {
          type ContentBlock = { type: string; text?: string; name?: string; input?: unknown };
          return (parsed.message.content as ContentBlock[])
            .filter((b) => b.type === "text" || b.type === "tool_use")
            .map((b) =>
              b.type === "text"
                ? { kind: "text", text: b.text }
                : { kind: "tool", text: `${b.name}(${JSON.stringify(b.input ?? {}).slice(0, 200)})` }
            );
        }
        if (parsed.type === "result") {
          return [{ kind: "result", text: parsed.is_error ? `Error: ${parsed.result}` : parsed.result }];
        }
        return [];
      } catch {
        return [{ kind: "text", text: line }];
      }
    })
    .flat();

  return NextResponse.json({ events });
}
