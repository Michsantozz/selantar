import { mediationLog } from "@/lib/mediation-log";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  if (!caseId) return NextResponse.json({ error: "Missing caseId" }, { status: 400 });

  const events = mediationLog.getAll(caseId);
  const verification = mediationLog.verifyChain(caseId);
  const lastHash = events.length > 0 ? events[events.length - 1].hash : null;

  return NextResponse.json({
    caseId,
    chain_length: events.length,
    is_valid: verification.valid,
    verification_timestamp: new Date().toISOString(),
    last_hash: lastHash,
    ...(verification.brokenAt !== undefined && { broken_at: verification.brokenAt }),
    ...(verification.details && { details: verification.details }),
  });
}
