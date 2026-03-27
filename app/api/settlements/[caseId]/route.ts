import { getSettlementsByCaseId } from "@/lib/outbox-worker";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ caseId: string }> }
) {
  const { caseId } = await params;
  if (!caseId) {
    return NextResponse.json({ error: "Missing caseId" }, { status: 400 });
  }

  try {
    const rows = await getSettlementsByCaseId(caseId);
    return NextResponse.json({
      caseId,
      total: rows.length,
      settlements: rows.map((r) => ({
        id: r.id,
        status: r.status,
        txHash: r.txHash,
        error: r.error,
        createdAt: r.createdAt,
        completedAt: r.completedAt,
        intent: r.intent,
      })),
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Query failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
