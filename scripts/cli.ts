#!/usr/bin/env npx tsx
/**
 * Selantar CLI — F15
 *
 * Usage: npm run cli -- <command> [args]
 *
 * Commands:
 *   cases list              List all cases with state
 *   cases show <caseId>     Show case detail and event history
 *   cases replay <caseId>   Re-run mediation (dry-run)
 *   verify <caseId>         Verify hash-chain integrity
 *   export <caseId>         Export full case as JSON
 *   metrics                 Show aggregated metrics
 *   breaker status          Show circuit breaker state
 *   breaker reset           Reset circuit breaker manually
 */

// Load env synchronously before any project imports
import { config } from "dotenv";
import { resolve, join } from "path";
import { readdirSync, existsSync } from "fs";

config({ path: resolve(process.cwd(), ".env.local") });

// Project imports after env is loaded
import { mediationLog } from "@/lib/mediation-log";
import { circuitBreaker } from "@/lib/circuit-breaker";
import { replayMediation } from "@/lib/replay";
import { CaseState } from "@/lib/case-lifecycle";

// ── Helpers ───────────────────────────────────────────────────────────────────

const LOG_DIR = join(process.cwd(), ".mediation-logs");

/** Returns all caseIds that have persisted event logs on disk. */
function listCaseIds(): string[] {
  if (!existsSync(LOG_DIR)) return [];
  return readdirSync(LOG_DIR)
    .filter((f) => f.endsWith(".json"))
    .map((f) => f.replace(/\.json$/, ""));
}

function printJSON(data: unknown): void {
  process.stdout.write(JSON.stringify(data, null, 2) + "\n");
}

function die(msg: string): never {
  process.stderr.write(`Error: ${msg}\n`);
  process.exit(1);
}

function requireArg(value: string | undefined, usage: string): string {
  if (!value || !value.trim()) die(`Missing argument. Usage: ${usage}`);
  return value.trim();
}

// ── Commands ──────────────────────────────────────────────────────────────────

function cmdCasesList(): void {
  const caseIds = listCaseIds();
  if (caseIds.length === 0) {
    process.stdout.write("No cases found.\n");
    return;
  }
  printJSON(
    caseIds.map((caseId) => {
      const events = mediationLog.getAll(caseId);
      const lastState = events
        .filter((e) => e.eventType === "STATE_TRANSITION")
        .at(-1);
      const state = lastState
        ? String(lastState.payload.to)
        : events.length > 0
        ? "INTAKE"
        : "UNKNOWN";
      return { caseId, state, event_count: events.length };
    })
  );
}

function cmdCasesShow(caseId: string): void {
  const events = mediationLog.getAll(caseId);
  if (events.length === 0) die(`Case not found: ${caseId}`);

  const transitions = events.filter((e) => e.eventType === "STATE_TRANSITION");
  const lastState = transitions.at(-1);
  const state = lastState ? String(lastState.payload.to) : "INTAKE";

  printJSON({
    caseId,
    state,
    event_count: events.length,
    state_history: transitions.map((e) => ({
      from: e.payload.from,
      to: e.payload.to,
      timestamp: e.timestamp,
    })),
    events,
  });
}

async function cmdCasesReplay(caseId: string): Promise<void> {
  const events = mediationLog.getAll(caseId);
  if (events.length === 0) die(`Case not found: ${caseId}`);

  process.stdout.write(`Replaying case ${caseId} (dry-run)…\n`);
  try {
    const result = await replayMediation(caseId);
    printJSON(result);
  } catch (err) {
    die(err instanceof Error ? err.message : String(err));
  }
}

function cmdVerify(caseId: string): void {
  const events = mediationLog.getAll(caseId);
  if (events.length === 0) die(`Case not found: ${caseId}`);

  const verification = mediationLog.verifyChain(caseId);
  const lastHash = events[events.length - 1].hash;

  printJSON({
    caseId,
    chain_length: events.length,
    is_valid: verification.valid,
    verification_timestamp: new Date().toISOString(),
    last_hash: lastHash,
    ...(verification.brokenAt !== undefined && { broken_at: verification.brokenAt }),
    ...(verification.details && { details: verification.details }),
  });
}

function cmdExport(caseId: string): void {
  const events = mediationLog.getAll(caseId);
  if (events.length === 0) die(`Case not found: ${caseId}`);
  process.stdout.write(mediationLog.exportJSON(caseId) + "\n");
}

function cmdMetrics(): void {
  const caseIds = listCaseIds();

  let active = 0;
  let resolved = 0;
  let abandoned = 0;
  let totalEvents = 0;
  const byState: Record<string, number> = {};

  for (const caseId of caseIds) {
    const events = mediationLog.getAll(caseId);
    totalEvents += events.length;

    const lastTransition = events
      .filter((e) => e.eventType === "STATE_TRANSITION")
      .at(-1);
    const state = lastTransition ? String(lastTransition.payload.to) : "INTAKE";

    byState[state] = (byState[state] ?? 0) + 1;

    if (state === CaseState.CLOSED) resolved++;
    else if (state === CaseState.ABANDONED) abandoned++;
    else active++;
  }

  printJSON({
    total_cases: caseIds.length,
    active_cases: active,
    resolved_cases: resolved,
    abandoned_cases: abandoned,
    total_events: totalEvents,
    resolution_rate:
      caseIds.length > 0 ? Math.round((resolved / caseIds.length) * 100) : 0,
    cases_by_state: byState,
    generated_at: new Date().toISOString(),
  });
}

function cmdBreakerStatus(): void {
  printJSON(circuitBreaker.getStatus());
}

function cmdBreakerReset(): void {
  circuitBreaker.reset();
  process.stdout.write("Circuit breaker reset to NORMAL.\n");
}

function printHelp(): void {
  process.stdout.write(`
Selantar CLI

Usage: npm run cli -- <command> [args]

Commands:
  cases list              List all cases with state
  cases show <caseId>     Show case detail and events
  cases replay <caseId>   Re-run mediation (dry-run)
  verify <caseId>         Verify hash-chain integrity
  export <caseId>         Export full case as JSON
  metrics                 Show aggregated metrics
  breaker status          Show circuit breaker state
  breaker reset           Reset circuit breaker to NORMAL
\n`);
}

// ── Router ────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const [, , cmd, sub, arg] = process.argv;

  switch (cmd) {
    case "cases":
      switch (sub) {
        case "list":   return cmdCasesList();
        case "show":   return cmdCasesShow(requireArg(arg, "cases show <caseId>"));
        case "replay": return await cmdCasesReplay(requireArg(arg, "cases replay <caseId>"));
        default:       die(`Unknown subcommand: cases ${sub ?? ""}. Try: list, show, replay`);
      }

    case "verify":  return cmdVerify(requireArg(sub, "verify <caseId>"));
    case "export":  return cmdExport(requireArg(sub, "export <caseId>"));
    case "metrics": return cmdMetrics();

    case "breaker":
      switch (sub) {
        case "status": return cmdBreakerStatus();
        case "reset":  return cmdBreakerReset();
        default:       die(`Unknown subcommand: breaker ${sub ?? ""}. Try: status, reset`);
      }

    default:
      printHelp();
  }
}

main().catch((err: unknown) => {
  process.stderr.write(`Fatal: ${err instanceof Error ? err.message : String(err)}\n`);
  process.exit(1);
});
