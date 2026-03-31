import { describe, it, expect } from "vitest";
import {
  ReputationScorer,
  DEFAULT_WEIGHTS,
  type ReputationWeights,
} from "@/lib/scoring";

describe("ReputationScorer", () => {
  const scorer = new ReputationScorer();

  it("computes score between 0 and 100", () => {
    const result = scorer.compute({
      compliance_rate: 0.8,
      resolution_rate: 1.0,
      response_speed: 0.7,
      evidence_quality: 0.6,
      cooperation_score: 0.9,
    });
    expect(result.score).toBeGreaterThanOrEqual(0);
    expect(result.score).toBeLessThanOrEqual(100);
  });

  it("perfect input produces score near 100", () => {
    const result = scorer.compute({
      compliance_rate: 1.0,
      resolution_rate: 1.0,
      response_speed: 1.0,
      evidence_quality: 1.0,
      cooperation_score: 1.0,
    });
    expect(result.score).toBe(100);
  });

  it("zero input produces score of 0", () => {
    const result = scorer.compute({
      compliance_rate: 0,
      resolution_rate: 0,
      response_speed: 0,
      evidence_quality: 0,
      cooperation_score: 0,
    });
    expect(result.score).toBe(0);
  });

  it("default weights sum to 1.0", () => {
    const sum = Object.values(DEFAULT_WEIGHTS).reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0);
  });

  it("accepts custom weights", () => {
    const custom: ReputationWeights = {
      compliance_rate: 0.5,
      resolution_rate: 0.2,
      response_speed: 0.1,
      evidence_quality: 0.1,
      cooperation_score: 0.1,
    };
    const result = scorer.compute(
      { compliance_rate: 1.0, resolution_rate: 0, response_speed: 0, evidence_quality: 0, cooperation_score: 0 },
      custom
    );
    // Only compliance_rate contributes: 0.5 * 1.0 = 0.5 → score = 50
    expect(result.score).toBe(50);
  });

  it("returns breakdown per factor", () => {
    const result = scorer.compute({
      compliance_rate: 0.8,
      resolution_rate: 0.6,
      response_speed: 0.4,
      evidence_quality: 0.2,
      cooperation_score: 1.0,
    });
    expect(result.breakdown).toHaveProperty("compliance_rate");
    expect(result.breakdown).toHaveProperty("cooperation_score");
    expect(result.breakdown.compliance_rate).toBeCloseTo(0.3 * 0.8);
  });
});
