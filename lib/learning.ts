import {
  ReputationWeights,
  getWeights,
  setWeights,
  persistWeightAdjustment,
} from "@/lib/scoring";
import { generateText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { z } from "zod";

export interface MediationOutcome {
  caseId: string;
  compliance_rate: number;
  resolution_rate: number;
  response_speed: number;
  evidence_quality: number;
  cooperation_score: number;
  successful: boolean; // true = CLOSED, false = ABANDONED or failed
}

const ADJUSTMENT_STEP = 0.03;  // ±3% per cycle
const MIN_WEIGHT = 0.05;
const MAX_WEIGHT = 0.45;
const MAX_DELTA_PER_CYCLE = 0.05;

const FACTOR_KEYS: (keyof ReputationWeights)[] = [
  "compliance_rate",
  "resolution_rate",
  "response_speed",
  "evidence_quality",
  "cooperation_score",
];

const LearningOutputSchema = z.object({
  analysis: z.string(),
  adjustments: z.record(
    z.enum(["compliance_rate", "resolution_rate", "response_speed", "evidence_quality", "cooperation_score"]),
    z.object({ new_weight: z.number(), reason: z.string() })
  ),
  confidence: z.number().min(0).max(100),
});

type LearningOutput = z.infer<typeof LearningOutputSchema>;

function normalizeWeights(raw: ReputationWeights): ReputationWeights {
  const clamped = { ...raw };
  for (const key of FACTOR_KEYS) {
    clamped[key] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, clamped[key]));
  }
  const total = Object.values(clamped).reduce((a, b) => a + b, 0);
  const normalized = { ...clamped };
  for (const key of FACTOR_KEYS) {
    normalized[key] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT,
      Math.round((clamped[key] / total) * 1000) / 1000
    ));
  }
  const sumBeforeLast = FACTOR_KEYS.slice(0, -1).reduce((sum, k) => sum + normalized[k], 0);
  normalized[FACTOR_KEYS[FACTOR_KEYS.length - 1]] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT,
    Math.round((1 - sumBeforeLast) * 1000) / 1000
  ));
  return normalized;
}

function validateAndClamp(proposed: LearningOutput, current: ReputationWeights): ReputationWeights {
  const result = { ...current };
  for (const key of FACTOR_KEYS) {
    const adj = proposed.adjustments[key];
    if (!adj) continue;
    let w = adj.new_weight;
    const delta = w - current[key];
    if (Math.abs(delta) > MAX_DELTA_PER_CYCLE) {
      w = current[key] + Math.sign(delta) * MAX_DELTA_PER_CYCLE;
    }
    result[key] = Math.max(MIN_WEIGHT, Math.min(MAX_WEIGHT, w));
  }
  return normalizeWeights(result);
}

function mathFallback(outcomes: MediationOutcome[]): ReputationWeights {
  const successful = outcomes.filter((o) => o.successful);
  const failed     = outcomes.filter((o) => !o.successful);
  const avgSuccess: Record<string, number> = {};
  const avgFailed:  Record<string, number> = {};

  for (const key of FACTOR_KEYS) {
    avgSuccess[key] = successful.length > 0
      ? successful.reduce((sum, o) => sum + (o[key as keyof MediationOutcome] as number), 0) / successful.length
      : 0;
    avgFailed[key] = failed.length > 0
      ? failed.reduce((sum, o) => sum + (o[key as keyof MediationOutcome] as number), 0) / failed.length
      : 0;
  }

  const current = getWeights();
  const adjusted = { ...current };

  for (const key of FACTOR_KEYS) {
    const delta = avgSuccess[key] - avgFailed[key];
    if (delta > 0) {
      adjusted[key] = Math.min(MAX_WEIGHT, current[key] + ADJUSTMENT_STEP);
    } else if (delta < 0) {
      adjusted[key] = Math.max(MIN_WEIGHT, current[key] - ADJUSTMENT_STEP);
    }
  }

  return normalizeWeights(adjusted);
}

export async function adjustWeights(outcomes: MediationOutcome[]): Promise<ReputationWeights> {
  if (outcomes.length === 0) return getWeights();

  const old = getWeights();
  let normalized: ReputationWeights;
  let analysis: string | undefined;
  let reasoningPerFactor: Record<string, string> | undefined;
  let confidence: number | undefined;

  try {
    const { text } = await generateText({
      model: anthropic("claude-sonnet-4-6"),
      temperature: 0.2,
      maxOutputTokens: 500,
      system: `You are a Learning Analyst for an autonomous mediation system. You analyze resolved case outcomes and propose reputation scoring weight adjustments. Current weights: ${JSON.stringify(old)}. Factors: compliance_rate, resolution_rate, response_speed, evidence_quality, cooperation_score. Constraints: each weight min 0.05, max 0.45, all must sum to 1.0, no single factor may change more than ±0.05 per cycle. Respond with ONLY valid JSON matching this schema: { "analysis": "2-3 sentences on patterns found", "adjustments": { "factor_name": { "new_weight": number, "reason": "why" } }, "confidence": 0-100 }`,
      prompt: `Analyze these ${outcomes.length} resolved mediation outcomes and propose weight adjustments:\n${JSON.stringify(outcomes)}`,
    });

    const parsed = LearningOutputSchema.parse(JSON.parse(text));
    normalized = validateAndClamp(parsed, old);
    analysis = parsed.analysis;
    reasoningPerFactor = Object.fromEntries(
      Object.entries(parsed.adjustments).map(([k, v]) => [k, v.reason])
    );
    confidence = parsed.confidence;
  } catch {
    console.log("[learning] LLM call failed, falling back to math-based adjustment");
    normalized = mathFallback(outcomes);
  }

  setWeights(normalized);

  if (outcomes.length > 0) {
    persistWeightAdjustment(
      outcomes[outcomes.length - 1].caseId,
      old,
      normalized,
      analysis,
      reasoningPerFactor,
      confidence
    );
  }

  return normalized;
}
