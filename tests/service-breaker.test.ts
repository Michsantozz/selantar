import { describe, it, expect, beforeEach } from "vitest";
import { ServiceBreaker, BreakerOpenError } from "@/lib/service-breaker";

describe("ServiceBreaker", () => {
  let breaker: ServiceBreaker;

  beforeEach(() => {
    breaker = new ServiceBreaker("test", {
      failureThreshold: 2,
      windowMs: 60_000,
      resetTimeout: 100, // 100ms for fast tests
    });
  });

  it("starts in CLOSED state", () => {
    expect(breaker.status.state).toBe("CLOSED");
    expect(breaker.isAvailable()).toBe(true);
  });

  it("passes through successful calls", async () => {
    const result = await breaker.call(async () => "ok");
    expect(result).toBe("ok");
    expect(breaker.status.state).toBe("CLOSED");
  });

  it("opens after reaching failure threshold", async () => {
    const fail = () => breaker.call(async () => { throw new Error("boom"); });
    await expect(fail()).rejects.toThrow("boom");
    await expect(fail()).rejects.toThrow("boom");
    expect(breaker.status.state).toBe("OPEN");
  });

  it("rejects calls immediately when OPEN", async () => {
    // Trip the breaker
    const fail = () => breaker.call(async () => { throw new Error("boom"); });
    await expect(fail()).rejects.toThrow();
    await expect(fail()).rejects.toThrow();

    // Next call should throw BreakerOpenError, not execute
    await expect(
      breaker.call(async () => "should not run")
    ).rejects.toBeInstanceOf(BreakerOpenError);
  });

  it("transitions to HALF_OPEN after resetTimeout", async () => {
    const fail = () => breaker.call(async () => { throw new Error("boom"); });
    await expect(fail()).rejects.toThrow();
    await expect(fail()).rejects.toThrow();
    expect(breaker.status.state).toBe("OPEN");

    // Wait for resetTimeout (100ms)
    await new Promise((r) => setTimeout(r, 150));

    // Should allow a probe call
    expect(breaker.isAvailable()).toBe(true);
  });

  it("returns to CLOSED on successful probe after HALF_OPEN", async () => {
    const fail = () => breaker.call(async () => { throw new Error("boom"); });
    await expect(fail()).rejects.toThrow();
    await expect(fail()).rejects.toThrow();

    await new Promise((r) => setTimeout(r, 150));

    const result = await breaker.call(async () => "recovered");
    expect(result).toBe("recovered");
    expect(breaker.status.state).toBe("CLOSED");
  });

  it("manual reset clears state", async () => {
    const fail = () => breaker.call(async () => { throw new Error("boom"); });
    await expect(fail()).rejects.toThrow();
    await expect(fail()).rejects.toThrow();
    expect(breaker.status.state).toBe("OPEN");

    breaker.reset();
    expect(breaker.status.state).toBe("CLOSED");
  });
});
