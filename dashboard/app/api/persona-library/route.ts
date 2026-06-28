import { NextResponse } from "next/server";
import { loadPersonaLibrary } from "@/lib/team";

export async function GET() {
  return NextResponse.json(loadPersonaLibrary());
}
