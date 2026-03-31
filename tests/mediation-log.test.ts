import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { MediationEventLog } from "@/lib/mediation-log";
import { mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";

const TEST_DIR = join(process.cwd(), ".mediation-logs");

describe("MediationEventLog", () => {
  let log: MediationEventLog;

  beforeEach(() => {
    log = new MediationEventLog();
  });

  afterEach(() => {
    // Clean up test case files
    const testFile = join(TEST_DIR, "test-chain.json");
    if (existsSync(testFile)) rmSync(testFile);
    const tamperedFile = join(TEST_DIR, "test-tamper.json");
    if (existsSync(tamperedFile)) rmSync(tamperedFile);
  });

  it("appends events with sequential seq numbers", () => {
    log.append("test-chain", "CASE_OPENED", { note: "first" });
    log.append("test-chain", "EVIDENCE_SUBMITTED", { note: "second" });
    const events = log.getAll("test-chain");
    expect(events).toHaveLength(2);
    expect(events[0].seq).toBe(0);
    expect(events[1].seq).toBe(1);
  });

  it("links events via prevHash (hash-chain)", () => {
    log.append("test-chain", "CASE_OPENED", { note: "first" });
    log.append("test-chain", "SETTLEMENT_EXECUTED", { note: "second" });
    const events = log.getAll("test-chain");
    expect(events[0].prevHash).toBe("0".repeat(64));
    expect(events[1].prevHash).toBe(events[0].hash);
  });

  it("verifyChain passes for untampered chain", () => {
    log.append("test-chain", "CASE_OPENED", { a: 1 });
    log.append("test-chain", "SETTLEMENT_EXECUTED", { b: 2 });
    expect(log.verifyChain("test-chain")).toEqual({ valid: true });
  });

  it("verifyChain detects tampered payload", () => {
    log.append("test-tamper", "CASE_OPENED", { amount: 1000 });
    log.append("test-tamper", "SETTLEMENT_EXECUTED", { amount: 2000 });

    // Tamper with the first event's payload
    const events = log.getAll("test-tamper");
    events[0].payload = { amount: 9999 };
    const { writeFileSync } = require("fs");
    writeFileSync(
      join(TEST_DIR, "test-tamper.json"),
      JSON.stringify(events, null, 2)
    );

    const result = log.verifyChain("test-tamper");
    expect(result.valid).toBe(false);
    expect(result.brokenAt).toBe(0);
  });

  it("returns empty array for non-existent case", () => {
    expect(log.getAll("does-not-exist")).toEqual([]);
  });
});
