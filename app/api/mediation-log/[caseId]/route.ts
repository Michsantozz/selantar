import { mediationLog } from "@/lib/mediation-log";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

  return NextResponse.json({
    caseId,
    totalEvents: mediationLog.getAll(caseId).length,
    chainIntegrity: mediationLog.verifyChain(caseId),
    events: mediationLog.getAll(caseId),
  });
}
