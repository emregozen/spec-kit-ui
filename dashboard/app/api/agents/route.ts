import { NextResponse } from "next/server";
import { AGENTS } from "@/lib/agents/registry";
import type { AgentSummary } from "@/lib/types";

export async function GET() {
  const summaries: AgentSummary[] = AGENTS.map((a) => ({
    id: a.id,
    name: a.name,
    icon: a.icon,
    description: a.description,
    models: a.models,
  }));
  return NextResponse.json(summaries);
}
