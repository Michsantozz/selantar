import { mediationLog } from "@/lib/mediation-log";

export interface ReputationWeights {
  compliance_rate: number;
  resolution_rate: number;
  response_speed: number;
  evidence_quality: number;
  cooperation_score: number;
}

export interface ReputationInput {
  compliance_rate: number;   // 0-1
  resolution_rate: number;   // 0-1
  response_speed: number;    // 0-1 (1 = fast, 0 = slow)
  evidence_quality: number;  // 0-1
  cooperation_score: number; // 0-1
}

export interface ReputationResult {
  score: number; // 0-100
  weights: ReputationWeights;
  breakdown: Record<keyof ReputationWeights, number>;
}

// Default weights — sum must equal 1.0
export const DEFAULT_WEIGHTS: ReputationWeights = {
  compliance_rate:   0.30,
  resolution_rate:   0.25,
  response_speed:    0.20,
  evidence_quality:  0.15,
  cooperation_score: 0.10,
};

// Current weights singleton — starts from defaults, adjusted by learning
let currentWeights: ReputationWeights = { ...DEFAULT_WEIGHTS };

export function getWeights(): ReputationWeights {
  return { ...currentWeights };
}

export function setWeights(weights: ReputationWeights): void {
  currentWeights = { ...weights };
}

export class ReputationScorer {
  compute(input: ReputationInput, weights?: ReputationWeights): ReputationResult {
    const w = weights ?? currentWeights;

    const breakdown: Record<keyof ReputationWeights, number> = {
      compliance_rate:   w.compliance_rate   * input.compliance_rate,
      resolution_rate:   w.resolution_rate   * input.resolution_rate,
      response_speed:    w.response_speed    * input.response_speed,
      evidence_quality:  w.evidence_quality  * input.evidence_quality,
      cooperation_score: w.cooperation_score * input.cooperation_score,
    };

    const raw = Object.values(breakdown).reduce((a, b) => a + b, 0);
    const score = Math.round(Math.min(100, Math.max(0, raw * 100)));

    return { score, weights: w, breakdown };
  }
}

export const reputationScorer = new ReputationScorer();

// Persist weight update as event in the mediation log
export function persistWeightAdjustment(
  caseId: string,
  oldWeights: ReputationWeights,
  newWeights: ReputationWeights,
  analysis?: string,
  reasoningPerFactor?: Record<string, string>,
  confidence?: number
): void {
  mediationLog.append(caseId, "WEIGHT_ADJUSTMENT", {
    old_weights: oldWeights,
    new_weights: newWeights,
    adjusted_at: new Date().toISOString(),
    ...(analysis != null && { analysis }),
    ...(reasoningPerFactor != null && { reasoning_per_factor: reasoningPerFactor }),
    ...(confidence != null && { confidence }),
  });
}
