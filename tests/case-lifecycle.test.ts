import { describe, it, expect } from "vitest";
import { MediationCase, CaseState } from "@/lib/case-lifecycle";

describe("MediationCase", () => {
  it("starts in INTAKE state", () => {
    const c = new MediationCase("test-1");
    expect(c.getState()).toBe(CaseState.INTAKE);
  });

  it("allows valid transitions", () => {
    const c = new MediationCase("test-2");
    c.transition(CaseState.EVIDENCE_COLLECTION);
    expect(c.getState()).toBe(CaseState.EVIDENCE_COLLECTION);
    c.transition(CaseState.ANALYSIS);
    expect(c.getState()).toBe(CaseState.ANALYSIS);
  });

  it("rejects invalid transitions", () => {
    const c = new MediationCase("test-3");
    // INTAKE cannot go directly to SETTLEMENT_EXECUTED
    expect(() => c.transition(CaseState.SETTLEMENT_EXECUTED)).toThrow(
      "Invalid transition"
    );
  });

  it("records transition history", () => {
    const c = new MediationCase("test-4");
    c.transition(CaseState.EVIDENCE_COLLECTION);
    c.transition(CaseState.ANALYSIS);
    const history = c.getHistory();
    expect(history).toHaveLength(2);
    expect(history[0].from).toBe(CaseState.INTAKE);
    expect(history[0].to).toBe(CaseState.EVIDENCE_COLLECTION);
    expect(history[1].from).toBe(CaseState.EVIDENCE_COLLECTION);
    expect(history[1].to).toBe(CaseState.ANALYSIS);
  });

  it("allows ABANDONED from any active state", () => {
    const c = new MediationCase("test-5");
    expect(c.canTransitionTo(CaseState.ABANDONED)).toBe(true);
    c.transition(CaseState.ABANDONED);
    expect(c.getState()).toBe(CaseState.ABANDONED);
  });

  it("CLOSED is terminal — no further transitions", () => {
    const c = new MediationCase("test-6");
    c.transition(CaseState.EVIDENCE_COLLECTION);
    c.transition(CaseState.ANALYSIS);
    c.transition(CaseState.NEGOTIATION);
    c.transition(CaseState.PROPOSAL);
    c.transition(CaseState.AGREEMENT);
    c.transition(CaseState.SETTLEMENT_PENDING);
    c.transition(CaseState.SETTLEMENT_EXECUTED);
    c.transition(CaseState.CLOSED);
    expect(c.canTransitionTo(CaseState.INTAKE)).toBe(false);
    expect(c.canTransitionTo(CaseState.ABANDONED)).toBe(false);
  });

  it("full happy path: INTAKE → CLOSED", () => {
    const c = new MediationCase("test-7");
    const path = [
      CaseState.EVIDENCE_COLLECTION,
      CaseState.ANALYSIS,
      CaseState.NEGOTIATION,
      CaseState.PROPOSAL,
      CaseState.AGREEMENT,
      CaseState.SETTLEMENT_PENDING,
      CaseState.SETTLEMENT_EXECUTED,
      CaseState.CLOSED,
    ];
    for (const state of path) {
      c.transition(state);
    }
    expect(c.getState()).toBe(CaseState.CLOSED);
    expect(c.getHistory()).toHaveLength(8);
  });
});
