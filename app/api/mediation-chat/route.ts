import { createAgentUIStreamResponse } from "ai";
import { mediatorAgent } from "@/lib/agents/mediator-agent";
import { randomUUID } from "crypto";
import { idempotencyStore, buildCaseKey } from "@/lib/idempotency";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const body = await req.json();
  const { messages, contractRef, partyA, partyB, disputeType } = body;

  // Idempotency check — if case fields present, check for duplicate submission
  if (contractRef && partyA && partyB && disputeType) {
    const key = buildCaseKey({ contractRef, partyA, partyB, disputeType });
    const check = idempotencyStore.checkIdempotency(key);

    if (check.cached) {
      return new Response(JSON.stringify(check.result), {
        headers: { "Content-Type": "application/json", "X-Idempotent-Replay": "true" },
      });
    }

    // Save a record after starting — streaming response can't be fully cached,
    // so we save metadata indicating this case was already processed
    idempotencyStore.saveResult(key, {
      cached: true,
      contractRef,
      partyA,
      partyB,
      disputeType,
      note: "This mediation case has already been submitted. Duplicate submission blocked.",
      timestamp: new Date().toISOString(),
    });
  }

  // Ensure every message has an id (useChat sends it, but external callers may not)
  const uiMessages = messages.map(
    (msg: { id?: string; role: string; parts: unknown[] }) => ({
      ...msg,
      id: msg.id ?? randomUUID(),
    })
  );

  return createAgentUIStreamResponse({
    agent: mediatorAgent,
    uiMessages,
  });
}
