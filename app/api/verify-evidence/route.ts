import { NextResponse } from "next/server";
import { z } from "zod";
import { verifyFilecoinStorage } from "@/lib/filecoin";
import { mediationLog } from "@/lib/mediation-log";
import { breakers } from "@/lib/breakers";

export const runtime = "nodejs";
export const maxDuration = 120;

const querySchema = z
  .object({
    pieceCid: z.string().min(1).optional(),
    caseId: z.string().min(1).optional(),
  })
  .refine((d) => d.pieceCid || d.caseId, {
    message: "Provide pieceCid or caseId query parameter",
  });

async function verifyOne(pieceCid: string) {
  const result = await breakers.filecoin.call(() =>
    verifyFilecoinStorage(pieceCid)
  );
  return {
    pieceCid,
    status: result.status,
    providers: result.providers,
    pdpExplorerUrl: "https://pdp.vxb.ai/calibration",
    verifiedAt: new Date().toISOString(),
  };
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const parsed = querySchema.safeParse({
      pieceCid: url.searchParams.get("pieceCid") ?? undefined,
      caseId: url.searchParams.get("caseId") ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0].message },
        { status: 400 }
      );
    }

    const { pieceCid, caseId } = parsed.data;

    if (pieceCid) {
      const verification = await verifyOne(pieceCid);
      return NextResponse.json(verification);
    }

    // caseId mode — find all FILECOIN_STORED events and verify each
    const events = mediationLog.getAll(caseId!);
    const filecoinEvents = events.filter(
      (e) => e.eventType === "FILECOIN_STORED"
    );

    if (filecoinEvents.length === 0) {
      return NextResponse.json({
        caseId,
        records: [],
        message: "No Filecoin storage records found",
      });
    }

    const records = await Promise.all(
      filecoinEvents.map(async (evt) => {
        const pid = evt.payload.pieceCid as string | undefined;
        if (!pid) return null;
        return verifyOne(pid);
      })
    );

    return NextResponse.json({
      caseId,
      records: records.filter(Boolean),
    });
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Internal server error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
