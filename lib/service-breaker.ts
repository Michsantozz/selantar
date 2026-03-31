/**
 * Generic Circuit Breaker for external service calls.
 *
 * States:
 *   CLOSED    — normal operation, calls pass through
 *   OPEN      — service is down, calls rejected immediately
 *   HALF_OPEN — cooldown expired, allow one probe call
 *
 * Features:
 *   - Sliding window failure counting (time-based, not just consecutive)
 *   - Per-call timeout enforcement
 *   - State change callbacks for observability
 *   - Pre-flight availability check
 */

export type BreakerState = "CLOSED" | "OPEN" | "HALF_OPEN";

export interface BreakerOptions {
  /** Failures within `windowMs` to trip the breaker (default: 3) */
  failureThreshold?: number;
  /** Sliding window duration in ms (default: 60_000) */
  windowMs?: number;
  /** Time in OPEN state before probing (default: 30_000) */
  resetTimeout?: number;
  /** Max concurrent probe calls in HALF_OPEN (default: 1) */
  halfOpenMax?: number;
  /** Per-call timeout in ms — rejects with BreakerTimeoutError if exceeded (default: none) */
  callTimeout?: number;
  /** Called on every state transition for observability */
  onStateChange?: (event: StateChangeEvent) => void;
  /**
   * Predicate to decide if an error should count as a service failure.
   * Return `true` to trip the breaker, `false` to ignore (e.g. 4xx client errors).
   * Default: all errors trip the breaker (backward-compatible).
   */
  shouldTrip?: (error: unknown) => boolean;
}

export interface StateChangeEvent {
  breaker: string;
  from: BreakerState;
  to: BreakerState;
  failures: number;
  timestamp: number;
}

export class BreakerOpenError extends Error {
  constructor(public readonly service: string, public readonly nextRetry: number) {
    const secsLeft = Math.max(0, Math.ceil((nextRetry - Date.now()) / 1000));
    super(`ServiceBreaker [${service}] is OPEN — retry in ${secsLeft}s`);
    this.name = "BreakerOpenError";
  }
}

export class BreakerTimeoutError extends Error {
  constructor(public readonly service: string, public readonly timeoutMs: number) {
    super(`ServiceBreaker [${service}] call timed out after ${timeoutMs}ms`);
    this.name = "BreakerTimeoutError";
  }
}

export class ServiceBreaker {
  readonly name: string;
  private state: BreakerState = "CLOSED";
  private failureTimestamps: number[] = [];
  private lastFailureAt = 0;
  private halfOpenInFlight = 0;

  private readonly failureThreshold: number;
  private readonly windowMs: number;
  private readonly resetTimeout: number;
  private readonly halfOpenMax: number;
  private readonly callTimeout: number | undefined;
  private readonly onStateChange: ((event: StateChangeEvent) => void) | undefined;
  private readonly shouldTrip: (error: unknown) => boolean;

  constructor(name: string, opts: BreakerOptions = {}) {
    this.name = name;
    this.failureThreshold = opts.failureThreshold ?? 3;
    this.windowMs = opts.windowMs ?? 60_000;
    this.resetTimeout = opts.resetTimeout ?? 30_000;
    this.halfOpenMax = opts.halfOpenMax ?? 1;
    this.callTimeout = opts.callTimeout;
    this.onStateChange = opts.onStateChange;
    this.shouldTrip = opts.shouldTrip ?? (() => true);
  }

  /** Check if the breaker would allow a call right now (non-throwing). */
  isAvailable(): boolean {
    if (this.state === "CLOSED") return true;
    if (this.state === "HALF_OPEN") return this.halfOpenInFlight < this.halfOpenMax;
    // OPEN — check if cooldown expired
    if (Date.now() >= this.lastFailureAt + this.resetTimeout) return true;
    return false;
  }

  /** Execute `fn` through the breaker. Throws BreakerOpenError if circuit is open. */
  async call<T>(fn: () => Promise<T>): Promise<T> {
    this.tryTransitionFromOpen();

    if (this.state === "OPEN") {
      throw new BreakerOpenError(this.name, this.lastFailureAt + this.resetTimeout);
    }

    // HALF_OPEN: limit concurrent probes
    if (this.state === "HALF_OPEN") {
      if (this.halfOpenInFlight >= this.halfOpenMax) {
        throw new BreakerOpenError(this.name, this.lastFailureAt + this.resetTimeout);
      }
      this.halfOpenInFlight++;
    }

    try {
      const result = this.callTimeout
        ? await this.withTimeout(fn(), this.callTimeout)
        : await fn();
      this.onCallSuccess();
      return result;
    } catch (err) {
      if (this.shouldTrip(err)) {
        this.onCallFailure();
      } else if (this.state === "HALF_OPEN") {
        // Non-trippable error in HALF_OPEN = service responded, treat as success probe
        this.onCallSuccess();
      }
      throw err;
    }
  }

  get status() {
    return {
      state: this.state,
      failures: this.recentFailureCount(),
      lastFailureAt: this.lastFailureAt || null,
      nextRetry: this.state === "OPEN" ? this.lastFailureAt + this.resetTimeout : null,
    };
  }

  /** Manually reset the breaker (e.g. after a config change). */
  reset(): void {
    this.transition("CLOSED");
    this.failureTimestamps = [];
    this.halfOpenInFlight = 0;
  }

  // --- internals ---

  private tryTransitionFromOpen(): void {
    if (this.state === "OPEN" && Date.now() >= this.lastFailureAt + this.resetTimeout) {
      this.transition("HALF_OPEN");
      this.halfOpenInFlight = 0;
    }
  }

  private onCallSuccess(): void {
    this.halfOpenInFlight = 0;
    if (this.state !== "CLOSED") {
      this.transition("CLOSED");
    }
    this.failureTimestamps = [];
  }

  private onCallFailure(): void {
    const now = Date.now();
    this.failureTimestamps.push(now);
    this.lastFailureAt = now;
    this.pruneOldFailures(now);

    if (this.state === "HALF_OPEN" || this.recentFailureCount() >= this.failureThreshold) {
      this.transition("OPEN");
    }
  }

  private recentFailureCount(): number {
    this.pruneOldFailures(Date.now());
    return this.failureTimestamps.length;
  }

  private pruneOldFailures(now: number): void {
    const cutoff = now - this.windowMs;
    while (this.failureTimestamps.length > 0 && this.failureTimestamps[0] < cutoff) {
      this.failureTimestamps.shift();
    }
  }

  private transition(to: BreakerState): void {
    if (this.state === to) return;
    const from = this.state;
    this.state = to;
    if (this.onStateChange) {
      this.onStateChange({
        breaker: this.name,
        from,
        to,
        failures: this.failureTimestamps.length,
        timestamp: Date.now(),
      });
    }
  }

  private withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise<T>((resolve, reject) => {
      const timer = setTimeout(
        () => reject(new BreakerTimeoutError(this.name, ms)),
        ms
      );
      promise
        .then((val) => { clearTimeout(timer); resolve(val); })
        .catch((err) => { clearTimeout(timer); reject(err); });
    });
  }
}
