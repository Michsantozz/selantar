import { mediationLog, MediationEvent } from "@/lib/mediation-log";
import { generateText } from "ai";
import { openai } from "@ai-sdk/openai";

export interface ReplayOverrides {
  model?: string;
  temperature?: number;
  systemPrompt?: string;
}

export interface ReplayOutcome {
  verdict: string;
  settlementTerms?: string;
  settlementAmount?: string;
  confidence?: number;
}

export interface ReplayResult {
  caseId: string;
  original_outcome: ReplayOutcome;
  replay_outcome: ReplayOutcome;
  score_diff: {
    confidence_delta: number;
    terms_changed: boolean;
    amount_changed: boolean;
  };
  reasoning_divergences: string[];
  dry_run: true;
  replayed_at: string;
}

function extractOutcomeFromEvents(events: MediationEvent[]): ReplayOutcome {
  const settlement = events.find((e) => e.eventType === "SETTLEMENT_PROPOSED");
  const executed = events.find((e) => e.eventType === "SETTLEMENT_EXECUTED");
  const verdict = events.find((e) => e.eventType === "VERDICT_REGISTERED");
  const closed = events.find((e) => e.eventType === "CASE_CLOSED");

  if (executed) {
    return {
      verdict: "SETTLEMENT_EXECUTED",
      settlementTerms: String(settlement?.payload?.terms ?? ""),
      settlementAmount: String(executed?.payload?.amount ?? settlement?.payload?.amount ?? ""),
      confidence: Number(settlement?.payload?.confidence ?? 0),
    };
  }
  if (settlement) {
    return {
      verdict: "SETTLEMENT_PROPOSED",
      settlementTerms: String(settlement.payload?.terms ?? ""),
      settlementAmount: String(settlement.payload?.amount ?? ""),
      confidence: Number(settlement.payload?.confidence ?? 0),
    };
  }
  if (verdict) {
    return {
      verdict: "VERDICT_REGISTERED",
      settlementTerms: String(verdict.payload?.terms ?? ""),
      confidence: Number(verdict.payload?.score ?? 0),
    };
  }
  if (closed) return { verdict: "CLOSED" };
  return { verdict: "UNKNOWN" };
}

function buildCaseSummary(events: MediationEvent[]): {
  contract: string;
  evidences: string[];
  parties: { partyA: string; partyB: string };
  disputeDescription: string;
} {
  const openEvent = events.find((e) => e.eventType === "CASE_OPENED");
  const analysisEvents = events.filter((e) => e.eventType === "ANALYSIS_COMPLETE");

  return {
    contract: String(openEvent?.payload?.contractText ?? openEvent?.payload?.contractRef ?? ""),
    evidences: analysisEvents.map((e) =>
      `[${e.payload.evidenceType ?? "evidence"}] score=${e.payload.credibilityScore ?? "?"}`
    ),
    parties: {
      partyA: String(openEvent?.payload?.partyA ?? openEvent?.payload?.partyAName ?? "Party A"),
      partyB: String(openEvent?.payload?.partyB ?? openEvent?.payload?.partyBName ?? "Party B"),
    },
    disputeDescription: String(openEvent?.payload?.disputeDescription ?? ""),
  };
}

export async function replayMediation(
  caseId: string,
  overrides: ReplayOverrides = {}
): Promise<ReplayResult> {
  const events = mediationLog.getAll(caseId);
  if (events.length === 0) {
    throw new Error(`Case ${caseId} not found or has no events`);
  }

  const original_outcome = extractOutcomeFromEvents(events);
  const { contract, evidences, parties, disputeDescription } = buildCaseSummary(events);

  const systemPrompt =
    overrides.systemPrompt ??
    "You are an impartial dispute mediator. Analyze the case and produce a settlement outcome. Do NOT execute any real transactions — this is a dry-run simulation.";

  const prompt = `CASE: ${caseId}
PARTIES: ${parties.partyA} vs ${parties.partyB}
DISPUTE: ${disputeDescription}
CONTRACT: ${contract || "(not available)"}
EVIDENCE SUMMARY:
${evidences.length > 0 ? evidences.join("\n") : "(no evidence recorded)"}

Based on the above, produce a mediation outcome with:
- verdict: one of SETTLEMENT_PROPOSED, VERDICT_REGISTERED, CLOSED, ABANDONED
- settlementTerms: brief description of proposed terms
- settlementAmount: numeric amount if applicable (e.g. "5000 USDC")
- confidence: 0-100 confidence in this outcome
- reasoning: 2-3 sentences explaining your decision

IMPORTANT: This is a dry-run. Do not execute any transactions.`;

  let replay_outcome: ReplayOutcome;
  const reasoning_divergences: string[] = [];

  try {
    const result = await generateText({
      model: openai("gpt-5.4-2026-03-05"),
      system: systemPrompt,
      prompt,
      temperature: overrides.temperature ?? 0.3,
    });

    const text = result.text;

    // Parse key fields from text response
    const verdictMatch = text.match(/verdict[:\s]+([A-Z_]+)/i);
    const termsMatch = text.match(/settlementTerms[:\s]+(.+?)(?:\n|$)/i);
    const amountMatch = text.match(/settlementAmount[:\s]+(.+?)(?:\n|$)/i);
    const confidenceMatch = text.match(/confidence[:\s]+(\d+)/i);

    replay_outcome = {
      verdict: verdictMatch?.[1] ?? "SETTLEMENT_PROPOSED",
      settlementTerms: termsMatch?.[1]?.trim() ?? "",
      settlementAmount: amountMatch?.[1]?.trim() ?? "",
      confidence: confidenceMatch ? Number(confidenceMatch[1]) : undefined,
    };

    // Detect reasoning divergences
    if (replay_outcome.verdict !== original_outcome.verdict) {
      reasoning_divergences.push(
        `Verdict changed: ${original_outcome.verdict} → ${replay_outcome.verdict}`
      );
    }
    if (
      replay_outcome.settlementAmount &&
      original_outcome.settlementAmount &&
      replay_outcome.settlementAmount !== original_outcome.settlementAmount
    ) {
      reasoning_divergences.push(
        `Amount changed: ${original_outcome.settlementAmount} → ${replay_outcome.settlementAmount}`
      );
    }
  } catch {
    replay_outcome = {
      verdict: "UNKNOWN",
      settlementTerms: "LLM unavailable during replay",
      confidence: 0,
    };
    reasoning_divergences.push("LLM unavailable — replay could not run");
  }

  const originalConfidence = original_outcome.confidence ?? 0;
  const replayConfidence = replay_outcome.confidence ?? 0;

  return {
    caseId,
    original_outcome,
    replay_outcome,
    score_diff: {
      confidence_delta: replayConfidence - originalConfidence,
      terms_changed:
        (replay_outcome.settlementTerms ?? "") !== (original_outcome.settlementTerms ?? ""),
      amount_changed:
        (replay_outcome.settlementAmount ?? "") !== (original_outcome.settlementAmount ?? ""),
    },
    reasoning_divergences,
    dry_run: true,
    replayed_at: new Date().toISOString(),
  };
}
