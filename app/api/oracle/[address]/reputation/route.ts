import { mediationLog } from "@/lib/mediation-log";
import { caseStore } from "@/lib/case-lifecycle";
import { createHash } from "crypto";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

function computeReputation(address: string): {
  total_mediations: number;
  resolution_rate: number;
  compliance_rate: number;
  avg_response_time_hours: number;
  reputation_score: number;
  cases_as_party: string[];
} {
  const addr = address.toLowerCase();
  const casesAsParty: string[] = [];

  for (const [caseId] of caseStore.entries()) {
    const events = mediationLog.getAll(caseId);
    const openEvent = events.find((e) => e.eventType === "CASE_OPENED");
    if (!openEvent) continue;

    const partyA = String(openEvent.payload.partyA ?? "").toLowerCase();
    const partyB = String(openEvent.payload.partyB ?? "").toLowerCase();
    if (partyA === addr || partyB === addr) {
      casesAsParty.push(caseId);
    }
  }

  const total = casesAsParty.length;
  if (total === 0) {
    return {
      total_mediations: 0,
      resolution_rate: 0,
      compliance_rate: 0,
      avg_response_time_hours: 0,
      reputation_score: 0,
      cases_as_party: [],
    };
  }

  let resolved = 0;
  let compliant = 0;
  let totalResponseMs = 0;
  let responseCount = 0;

  for (const caseId of casesAsParty) {
    const events = mediationLog.getAll(caseId);
    const state = caseStore.get(caseId)?.getState();

    if (state === "CLOSED" || state === "SETTLEMENT_EXECUTED") resolved++;
    if (state === "CLOSED") compliant++;

    // avg response time: gap between CASE_OPENED and first EVIDENCE_SUBMITTED
    const openTs = events.find((e) => e.eventType === "CASE_OPENED")?.timestamp;
    const evidenceTs = events.find((e) => e.eventType === "EVIDENCE_SUBMITTED")?.timestamp;
    if (openTs && evidenceTs) {
      totalResponseMs += new Date(evidenceTs).getTime() - new Date(openTs).getTime();
      responseCount++;
    }
  }

  const resolution_rate = total > 0 ? resolved / total : 0;
  const compliance_rate = total > 0 ? compliant / total : 0;
  const avg_response_time_hours =
    responseCount > 0 ? totalResponseMs / responseCount / 3_600_000 : 0;

  // Score: 0.30*compliance + 0.25*resolution + 0.20*speed(inverse) + 0.25*base
  const speedScore = avg_response_time_hours === 0 ? 1 : Math.max(0, 1 - avg_response_time_hours / 48);
  const reputation_score = Math.round(
    (0.30 * compliance_rate + 0.25 * resolution_rate + 0.20 * speedScore + 0.25) * 100
  );

  return {
    total_mediations: total,
    resolution_rate: Math.round(resolution_rate * 100) / 100,
    compliance_rate: Math.round(compliance_rate * 100) / 100,
    avg_response_time_hours: Math.round(avg_response_time_hours * 10) / 10,
    reputation_score: Math.min(100, reputation_score),
    cases_as_party: casesAsParty,
  };
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ address: string }> }
) {
  const { address } = await params;
  if (!address) {
    return NextResponse.json({ error: "Missing address" }, { status: 400 });
  }

  const data = computeReputation(address);

  const payload = JSON.stringify({
    address: address.toLowerCase(),
    ...data,
    queried_at: new Date().toISOString(),
  });

  // Sign payload with AGENT_PRIVATE_KEY (simple HMAC-SHA256 for portability)
  const privateKey = process.env.AGENT_PRIVATE_KEY ?? "";
  const signature = createHash("sha256")
    .update(privateKey + payload)
    .digest("hex");

  return NextResponse.json(
    { ...JSON.parse(payload), agent_signature: signature },
    {
      headers: {
        "X-Selantar-Notice":
          "This score is not a recommendation. It reflects on-chain mediation history only.",
        "Cache-Control": "no-store",
      },
    }
  );
}
