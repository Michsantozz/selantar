import { describe, it, expect } from "vitest";
import { canonicalJSON } from "@/lib/canonical-json";

describe("canonicalJSON", () => {
  it("produces identical output regardless of key insertion order", () => {
    const a = canonicalJSON({ b: 1, a: 2 });
    const b = canonicalJSON({ a: 2, b: 1 });
    expect(a).toBe(b);
  });

  it("sorts nested object keys recursively", () => {
    const result = canonicalJSON({ z: { b: 1, a: 2 }, a: 0 });
    expect(result).toBe('{"a":0,"z":{"a":2,"b":1}}');
  });

  it("preserves array order (arrays are not sorted)", () => {
    const result = canonicalJSON({ items: [3, 1, 2] });
    expect(result).toBe('{"items":[3,1,2]}');
  });

  it("handles null and primitives", () => {
    expect(canonicalJSON(null)).toBe("null");
    expect(canonicalJSON(42)).toBe("42");
    expect(canonicalJSON("hello")).toBe('"hello"');
  });
});
