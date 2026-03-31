import { ServiceBreaker, BreakerTimeoutError, type StateChangeEvent } from "@/lib/service-breaker";

/**
 * Observability hook — logs every state transition.
 * In production, replace with your metrics/alerting pipeline.
 */
function logStateChange(event: StateChangeEvent): void {
  const label = event.to === "OPEN" ? "OPEN" : event.to === "HALF_OPEN" ? "HALF_OPEN" : "CLOSED";
  console.warn(
    `[circuit-breaker] ${event.breaker}: ${event.from} -> ${label} (${event.failures} failures)`
  );
}

/**
 * Only trip on server/network errors — not on client errors (4xx).
 * Checks for: timeouts, network failures, 5xx status, and non-HTTP errors.
 * A 400/401/403/404 means the server is alive — don't penalize it.
 */
function isServiceError(err: unknown): boolean {
  if (err instanceof BreakerTimeoutError) return true;

  if (err instanceof Error) {
    // Network-level failures (fetch throws TypeError on DNS/connection failure)
    if (err.name === "TypeError" || err.message.includes("fetch failed")) return true;

    // HTTP errors embedded in Error messages — only 5xx count
    const statusMatch = err.message.match(/\b(status|code)\s*:?\s*(\d{3})\b/i);
    if (statusMatch) {
      const status = parseInt(statusMatch[2], 10);
      return status >= 500;
    }

    // Viem/onchain errors — always service errors (gas, revert, RPC down)
    if (err.name === "TransactionExecutionError" || err.name === "ContractFunctionExecutionError") {
      return true;
    }
  }

  // Unknown error type — trip by default (safe fallback)
  return true;
}

/**
 * Singleton registry of circuit breakers for each external service category.
 *
 * Usage:
 *   import { breakers } from "@/lib/breakers";
 *
 *   // Wrap any external call:
 *   const result = await breakers.llm.call(() => generateText(...));
 *
 *   // Pre-flight check (non-throwing):
 *   if (!breakers.onchain.isAvailable()) { /* skip or use fallback *\/ }
 */
export const breakers = {
  /** LLM providers — OpenRouter, Gemini, etc. */
  llm: new ServiceBreaker("llm", {
    failureThreshold: 3,
    windowMs: 60_000,
    resetTimeout: 30_000,
    callTimeout: 30_000,
    onStateChange: logStateChange,
    shouldTrip: isServiceError,
  }),

  /** On-chain calls — viem writeContract / sendTransaction */
  onchain: new ServiceBreaker("onchain", {
    failureThreshold: 2,
    windowMs: 120_000,
    resetTimeout: 60_000,
    callTimeout: 45_000,
    onStateChange: logStateChange,
    shouldTrip: isServiceError,
  }),

  /** Locus USDC wallet API */
  locus: new ServiceBreaker("locus", {
    failureThreshold: 3,
    windowMs: 60_000,
    resetTimeout: 45_000,
    callTimeout: 15_000,
    onStateChange: logStateChange,
    shouldTrip: isServiceError,
  }),

  /** Delegation SDK / ERC-7715 */
  delegation: new ServiceBreaker("delegation", {
    failureThreshold: 2,
    windowMs: 120_000,
    resetTimeout: 60_000,
    callTimeout: 30_000,
    onStateChange: logStateChange,
    shouldTrip: isServiceError,
  }),

  /** Filecoin / Synapse PDP verification */
  filecoin: new ServiceBreaker("filecoin", {
    failureThreshold: 3,
    windowMs: 120_000,
    resetTimeout: 90_000,
    callTimeout: 120_000,
    onStateChange: logStateChange,
    shouldTrip: isServiceError,
  }),
} as const;
