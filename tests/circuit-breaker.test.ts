import { describe, it, expect, beforeEach } from "vitest";
import { CircuitBreaker } from "@/lib/circuit-breaker";

describe("CircuitBreaker", () => {
  let breaker: CircuitBreaker;

  beforeEach(() => {
    breaker = new CircuitBreaker();
  });

  it("starts at NORMAL", () => {
    expect(breaker.getStatus().level).toBe("NORMAL");
  });

  it("allows execution at NORMAL", () => {
    const result = breaker.canExecute();
    expect(result.allowed).toBe(true);
    expect(result.level).toBe("NORMAL");
  });

  it("transitions to CAUTION after 3 settlements in 10 minutes", () => {
    breaker.recordSettlement("case-1");
    breaker.recordSettlement("case-2");
    breaker.recordSettlement("case-3");
    expect(breaker.getStatus().level).toBe("CAUTION");
  });

  it("transitions to LOCKDOWN after 5 settlements in 1 hour", () => {
    for (let i = 0; i < 5; i++) {
      breaker.recordSettlement(`case-${i}`);
    }
    expect(breaker.getStatus().level).toBe("LOCKDOWN");
    expect(breaker.canExecute().allowed).toBe(false);
  });

  it("transitions to LOCKDOWN on high-value settlement ($3000+)", () => {
    breaker.recordSettlement("case-whale", "5000");
    expect(breaker.getStatus().level).toBe("LOCKDOWN");
  });

  it("transitions to EMERGENCY on on-chain failure", () => {
    breaker.recordOnChainFailure("case-fail", "tx reverted");
    expect(breaker.getStatus().level).toBe("EMERGENCY");
    expect(breaker.canExecute().allowed).toBe(false);
  });

  it("EMERGENCY only clears via manual reset", () => {
    breaker.recordOnChainFailure("case-fail", "tx reverted");
    breaker.recordSettlement("case-new"); // should NOT clear EMERGENCY
    expect(breaker.getStatus().level).toBe("EMERGENCY");
    breaker.reset();
    expect(breaker.getStatus().level).toBe("NORMAL");
  });
});
