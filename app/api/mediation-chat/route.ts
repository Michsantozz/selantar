import { createAgentUIStreamResponse } from "ai";
import { createMediatorAgent } from "@/lib/agents/mediator-agent";
import { empathReading, strategyAdvice } from "@/lib/chains/advisory";
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

  // Build conversation string for advisory chains
  const conversationText = uiMessages
    .map((m: { role: string; parts: { type: string; text?: string }[] }) => {
      const text = m.parts?.find((p) => p.type === "text")?.text ?? "";
      return `[${m.role}]: ${text}`;
    })
    .join("\n");
  const lastUserMsg =
    [...uiMessages].reverse().find((m: { role: string }) => m.role === "user");
  const latestText =
    lastUserMsg?.parts?.find((p: { type: string }) => p.type === "text")?.text ?? "";

  // Advisory chains only activate after the first exchange — the Empath needs
  // at least one prior turn to read dynamics, not fabricate nuance from thin air
  const userMessages = uiMessages.filter((m: { role: string }) => m.role === "user");
  let advisory: { empath: string; strategy: string } | undefined;
  if (userMessages.length > 1) {
    try {
      const empath = await empathReading(conversationText, latestText);
      const strategy = await strategyAdvice(
        empath,
        conversationText,
        `Contract: ${contractRef ?? "unknown"}, Dispute: ${disputeType ?? "unknown"}, Parties: ${partyA ?? "A"} vs ${partyB ?? "B"}`
      );
      advisory = { empath, strategy };
    } catch {
      // Graceful degradation — Clara proceeds without advisory
    }
  }

  return createAgentUIStreamResponse({
    agent: createMediatorAgent(advisory),
    uiMessages,
  });
}
