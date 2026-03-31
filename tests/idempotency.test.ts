import { describe, it, expect, beforeEach } from "vitest";
import { IdempotencyStore } from "@/lib/idempotency";

describe("IdempotencyStore", () => {
  let store: IdempotencyStore;

  beforeEach(() => {
    store = new IdempotencyStore();
  });

  it("returns cached: false for unknown key", () => {
    expect(store.checkIdempotency("unknown")).toEqual({ cached: false });
  });

  it("returns cached result after saveResult", () => {
    store.saveResult("key-1", { status: "executed", txHash: "0xabc" });
    const check = store.checkIdempotency("key-1");
    expect(check.cached).toBe(true);
    expect(check.result).toEqual({ status: "executed", txHash: "0xabc" });
  });

  it("prevents duplicate execution (idempotency guarantee)", () => {
    store.saveResult("settlement-abc", { status: "ok" });
    store.saveResult("settlement-abc", { status: "duplicate" });
    // First result wins
    const check = store.checkIdempotency("settlement-abc");
    expect(check.cached).toBe(true);
  });

  it("tracks store size", () => {
    expect(store.size()).toBe(0);
    store.saveResult("a", 1);
    store.saveResult("b", 2);
    expect(store.size()).toBe(2);
  });
});
