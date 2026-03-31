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

  const filecoinEvents = events.filter((e) => e.eventType === "FILECOIN_STORED");
  const filecoinRecords = filecoinEvents.map((e) => ({
    context: e.payload.context as string | undefined,
    pieceCid: e.payload.pieceCid as string | undefined,
    complete: e.payload.complete as boolean | undefined,
  }));

  return NextResponse.json({
    caseId,
    chain_length: events.length,
    is_valid: verification.valid,
    verification_timestamp: new Date().toISOString(),
    last_hash: lastHash,
    ...(verification.brokenAt !== undefined && { broken_at: verification.brokenAt }),
    ...(verification.details && { details: verification.details }),
    filecoin: {
      recordCount: filecoinRecords.length,
      records: filecoinRecords,
    },
  });
}
