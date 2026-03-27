import { createCase } from "@/lib/case-lifecycle";
import { idempotencyStore, buildCaseKey } from "@/lib/idempotency";
import { mediationLog } from "@/lib/mediation-log";
import { NextResponse } from "next/server";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

// Rate limit: 10 submissions per hour per IP (in-memory)
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 10;
const WINDOW_MS = 60 * 60 * 1000; // 1h

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry || now - entry.windowStart > WINDOW_MS) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (entry.count >= RATE_LIMIT) return false;
  entry.count++;
  return true;
}

export async function POST(req: Request) {
  const ip =
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";

  if (!checkRateLimit(ip)) {
    return NextResponse.json(
      { error: "Rate limit exceeded. Max 10 submissions per hour." },
      { status: 429 }
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const {
    contract_text,
    evidence,
    party_a,
    party_b,
    dispute_description,
  } = body as Record<string, unknown>;

  // Validate required fields
  const missing: string[] = [];
  if (!contract_text) missing.push("contract_text");
  if (!party_a) missing.push("party_a");
  if (!party_b) missing.push("party_b");
  if (!dispute_description) missing.push("dispute_description");

  if (missing.length > 0) {
    return NextResponse.json(
      { error: "Missing required fields", fields: missing },
      { status: 400 }
    );
  }

  const partyAAddr = String((party_a as Record<string, unknown>)?.address ?? party_a ?? "").toLowerCase();
  const partyBAddr = String((party_b as Record<string, unknown>)?.address ?? party_b ?? "").toLowerCase();
  const partyAName = String((party_a as Record<string, unknown>)?.name ?? party_a ?? "");
  const partyBName = String((party_b as Record<string, unknown>)?.name ?? party_b ?? "");

  // Idempotency check — prevents re-opening the same dispute
  const dedupeKey = buildCaseKey({
    contractRef: String(contract_text).slice(0, 200),
    partyA: partyAAddr,
    partyB: partyBAddr,
    disputeType: String(dispute_description).slice(0, 100),
  });

  const cached = idempotencyStore.checkIdempotency(dedupeKey);
  if (cached.cached) {
    return NextResponse.json(
      { ...(cached.result as object), _idempotent: true },
      { status: 200 }
    );
  }

  // Create case
  const caseId = nanoid(12);
  createCase(caseId);

  // Log CASE_OPENED with intake payload
  mediationLog.append(caseId, "CASE_OPENED", {
    partyA: partyAAddr,
    partyAName,
    partyB: partyBAddr,
    partyBName,
    disputeDescription: String(dispute_description),
    hasEvidence: Array.isArray(evidence) ? evidence.length > 0 : !!evidence,
    evidenceCount: Array.isArray(evidence) ? evidence.length : evidence ? 1 : 0,
    source: "api/intake",
    createdAt: new Date().toISOString(),
  });

  const response = {
    caseId,
    status: "INTAKE",
    status_url: `/api/mediation-log/${caseId}`,
    verify_url: `/api/verify/${caseId}`,
    created_at: new Date().toISOString(),
  };

  idempotencyStore.saveResult(dedupeKey, response);

  return NextResponse.json(response, { status: 201 });
}
