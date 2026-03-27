import { replayMediation } from "@/lib/replay";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(
  req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  if (!caseId) {
    return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
  }

  let overrides: { model?: string; temperature?: number; systemPrompt?: string } = {};
  try {
    const body = await req.json();
    overrides = body ?? {};
  } catch {
    // no body — use defaults
  }

  try {
    const result = await replayMediation(caseId, overrides);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Replay failed";
    return NextResponse.json({ error: message }, { status: 404 });
  }
}
