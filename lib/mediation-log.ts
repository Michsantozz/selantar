import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync, mkdirSync } from "fs";
import { join } from "path";

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
  | "CIRCUIT_BREAKER_TRIGGERED";

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
  const data = JSON.stringify({
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
    writeFileSync(
      logPath(caseId),
      JSON.stringify([...existing, event], null, 2),
      "utf-8"
    );
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
  ): { valid: boolean; invalidAt?: number; reason?: string } {
    const events = this.getAll(caseId);
    for (let i = 0; i < events.length; i++) {
      const event = events[i];
      const expectedPrev =
        i === 0 ? "0".repeat(64) : events[i - 1].hash;
      if (event.prevHash !== expectedPrev) {
        return {
          valid: false,
          invalidAt: i,
          reason: `prevHash mismatch at seq ${i}`,
        };
      }
      const { hash, ...partial } = event;
      if (hash !== computeHash(partial)) {
        return {
          valid: false,
          invalidAt: i,
          reason: `hash mismatch at seq ${i}`,
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
