/**
 * Canonical JSON serialization with recursively sorted keys.
 *
 * Guarantees: same object → same string → same hash, regardless of
 * property insertion order. Critical for hash-chain integrity and
 * on-chain feedbackHash / requestHash verification.
 *
 * Technique from Sentinel8004 (docs/sentinel8004/src/utils.ts) —
 * they use this for deterministic IPFS CIDs and keccak256 hashes
 * across 3,300+ on-chain attestations.
 */
export function canonicalJSON(obj: unknown): string {
  return JSON.stringify(obj, (_key, value) => {
    if (value && typeof value === "object" && !Array.isArray(value)) {
      return Object.keys(value)
        .sort()
        .reduce((sorted: Record<string, unknown>, key) => {
          sorted[key] = (value as Record<string, unknown>)[key];
          return sorted;
        }, {});
    }
    return value;
  });
}
