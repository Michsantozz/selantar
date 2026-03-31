import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";
import { canonicalJSON } from "@/lib/canonical-json";

// ---- DB dual-write (F18) ----
// Writes to Postgres when DATABASE_URL is set, falls back to files.
// getAll() remains file-based (sync) to avoid breaking callers.
// Full async read path can be adopted in a future migration.
let _db: typeof import("@/lib/db") | null | undefined = undefined;
async function getDbModule() {
  if (!process.env.DATABASE_URL) return null;
  if (_db !== undefined) return _db;
  try {
    _db = await import("@/lib/db");
  } catch {
    _db = null;
  }
  return _db;
}

const LOG_DIR = join(process.cwd(), ".mediation-logs");

function ensureLogDir(): void {
  mkdirSync(LOG_DIR, { recursive: true });
}

function logPath(caseId: string): string {
  return join(LOG_DIR, `${caseId}.json`);
}

export type MediationEventType =
  | "CASE_OPENED"
  | "EVIDENCE_SUBMITTED"
  | "ANALYSIS_COMPLETE"
  | "SETTLEMENT_PROPOSED"
  | "SETTLEMENT_ACCEPTED"
  | "SETTLEMENT_REJECTED"
  | "SETTLEMENT_EXECUTED"
  | "VERDICT_REGISTERED"
  | "CASE_CLOSED"
  | "CIRCUIT_BREAKER_TRIGGERED"
  | "STATE_TRANSITION"
  | "WEIGHT_ADJUSTMENT"
  | "FILECOIN_STORED";

export interface MediationEvent {
  seq: number;
  caseId: string;
  eventType: MediationEventType;
  timestamp: string;
  payload: Record<string, unknown>;
  prevHash: string;
  hash: string;
}

function computeHash(event: Omit<MediationEvent, "hash">): string {
  const data = canonicalJSON({
    seq: event.seq,
    caseId: event.caseId,
    eventType: event.eventType,
    timestamp: event.timestamp,
    payload: event.payload,
    prevHash: event.prevHash,
  });
  return createHash("sha256").update(data).digest("hex");
}

export class MediationEventLog {
  append(
    caseId: string,
    eventType: MediationEventType,
    payload: Record<string, unknown>
  ): MediationEvent {
    ensureLogDir();
    const existing = this.getAll(caseId);
    const seq = existing.length;
    const prevHash = seq === 0 ? "0".repeat(64) : existing[seq - 1].hash;
    const timestamp = new Date().toISOString();
    const partial: Omit<MediationEvent, "hash"> = {
      seq,
      caseId,
      eventType,
      timestamp,
      payload,
      prevHash,
    };
    const event: MediationEvent = { ...partial, hash: computeHash(partial) };

    // Always write to file (sync, reliable)
    ensureLogDir();
    writeFileSync(logPath(caseId), JSON.stringify([...existing, event], null, 2), "utf-8");

    // Dual-write to Postgres fire-and-forget
    getDbModule().then((mod) => {
      if (!mod) return;
      mod.db.insert(mod.mediationEvents).values({
        seq: event.seq,
        caseId: event.caseId,
        eventType: event.eventType,
        timestamp: event.timestamp,
        payload: event.payload,
        prevHash: event.prevHash,
        hash: event.hash,
      }).catch(() => { /* DB unavailable — file already written */ });
    });

    return event;
  }

  getAll(caseId: string): MediationEvent[] {
    const path = logPath(caseId);
    if (!existsSync(path)) return [];
    try {
      return JSON.parse(readFileSync(path, "utf-8"));
    } catch {
      return [];
    }
  }

  verifyChain(
    caseId: string
  ): { valid: boolean; brokenAt?: number; details?: string } {
    const events = this.getAll(caseId);
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const expectedPrev =
        i === 0 ? "0".repeat(64) : events[i - 1].hash;
      if (event.prevHash !== expectedPrev) {
        return {
          valid: false,
          brokenAt: i,
          details: `prevHash mismatch at seq ${i}`,
        };
      }
      const { hash, ...partial } = event;
      if (hash !== computeHash(partial)) {
        return {
          valid: false,
          brokenAt: i,
          details: `hash mismatch at seq ${i}`,
        };
      }
    }
    return { valid: true };
  }

  exportJSON(caseId: string): string {
    return JSON.stringify(
      {
        caseId,
        totalEvents: this.getAll(caseId).length,
        chainIntegrity: this.verifyChain(caseId),
        events: this.getAll(caseId),
      },
      null,
      2
    );
  }
}

export const mediationLog = new MediationEventLog();
