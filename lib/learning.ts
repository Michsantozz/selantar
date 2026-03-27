import {
  ReputationWeights,
  getWeights,
  setWeights,
  persistWeightAdjustment,
} from "@/lib/scoring";

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

/**
 * Adjusts weights based on correlation between each factor and successful outcomes.
 * Factors that correlate more with success get +3%, others get -proportional.
 * Constraint: sum of weights = 1.0 always.
 */
export function adjustWeights(outcomes: MediationOutcome[]): ReputationWeights {
  if (outcomes.length === 0) return getWeights();

  const keys: (keyof Omit<ReputationWeights, never>)[] = [
    "compliance_rate",
    "resolution_rate",
    "response_speed",
    "evidence_quality",
    "cooperation_score",
  ];

  const successful = outcomes.filter((o) => o.successful);
  const failed     = outcomes.filter((o) => !o.successful);

  // Compute average of each factor for successful vs failed cases
  const avgSuccess: Record<string, number> = {};
  const avgFailed:  Record<string, number> = {};

  for (const key of keys) {
    avgSuccess[key] = successful.length > 0
      ? successful.reduce((sum, o) => sum + (o[key as keyof MediationOutcome] as number), 0) / successful.length
      : 0;
    avgFailed[key] = failed.length > 0
      ? failed.reduce((sum, o) => sum + (o[key as keyof MediationOutcome] as number), 0) / failed.length
      : 0;
  }

  // Factors where successful cases score higher → increase weight
  const current = getWeights();
  const adjusted: ReputationWeights = { ...current };

  for (const key of keys) {
    const delta = avgSuccess[key] - avgFailed[key];
    if (delta > 0) {
      // Positive correlation with success → increase
      adjusted[key as keyof ReputationWeights] = Math.min(
        MAX_WEIGHT,
        current[key as keyof ReputationWeights] + ADJUSTMENT_STEP
      );
    } else if (delta < 0) {
      // Negative correlation → decrease
      adjusted[key as keyof ReputationWeights] = Math.max(
        MIN_WEIGHT,
        current[key as keyof ReputationWeights] - ADJUSTMENT_STEP
      );
    }
    // delta === 0 → no change
  }

  // Normalize so weights sum to exactly 1.0
  const total = Object.values(adjusted).reduce((a, b) => a + b, 0);
  const normalized = adjusted as ReputationWeights;
  for (const key of keys) {
    normalized[key as keyof ReputationWeights] =
      Math.round((adjusted[key as keyof ReputationWeights] / total) * 1000) / 1000;
  }

  // Fix any floating point drift on last key
  const sumBeforeLast = keys.slice(0, -1).reduce(
    (sum, k) => sum + normalized[k as keyof ReputationWeights],
    0
  );
  normalized[keys[keys.length - 1] as keyof ReputationWeights] =
    Math.round((1 - sumBeforeLast) * 1000) / 1000;

  const old = getWeights();
  setWeights(normalized);

  // Persist to mediation log using the last caseId as reference
  if (outcomes.length > 0) {
    persistWeightAdjustment(outcomes[outcomes.length - 1].caseId, old, normalized);
  }

  return normalized;
}
