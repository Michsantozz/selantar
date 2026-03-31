import { mediationLog } from "@/lib/mediation-log";
import { readdir } from "fs/promises";
import { join } from "path";
import type { MediationOutcome } from "@/lib/learning";
import type { MediationEvent } from "@/lib/mediation-log";

export enum CaseState {
  INTAKE              = "INTAKE",
  EVIDENCE_COLLECTION = "EVIDENCE_COLLECTION",
  ANALYSIS            = "ANALYSIS",
  NEGOTIATION         = "NEGOTIATION",
  PROPOSAL            = "PROPOSAL",
  COUNTER_PROPOSAL    = "COUNTER_PROPOSAL",
  AGREEMENT           = "AGREEMENT",
  SETTLEMENT_PENDING  = "SETTLEMENT_PENDING",
  SETTLEMENT_EXECUTED = "SETTLEMENT_EXECUTED",
  CLOSED              = "CLOSED",
  ABANDONED           = "ABANDONED",
}

export const VALID_TRANSITIONS: Record<CaseState, CaseState[]> = {
  [CaseState.INTAKE]:              [CaseState.EVIDENCE_COLLECTION, CaseState.ABANDONED],
  [CaseState.EVIDENCE_COLLECTION]: [CaseState.ANALYSIS, CaseState.ABANDONED],
  [CaseState.ANALYSIS]:            [CaseState.NEGOTIATION, CaseState.ABANDONED],
  [CaseState.NEGOTIATION]:         [CaseState.PROPOSAL, CaseState.ABANDONED],
  [CaseState.PROPOSAL]:            [CaseState.COUNTER_PROPOSAL, CaseState.AGREEMENT, CaseState.ABANDONED],
  [CaseState.COUNTER_PROPOSAL]:    [CaseState.PROPOSAL, CaseState.AGREEMENT, CaseState.ABANDONED],
  [CaseState.AGREEMENT]:           [CaseState.SETTLEMENT_PENDING],
  [CaseState.SETTLEMENT_PENDING]:  [CaseState.SETTLEMENT_EXECUTED],
  [CaseState.SETTLEMENT_EXECUTED]: [CaseState.CLOSED],
  [CaseState.CLOSED]:              [],
  [CaseState.ABANDONED]:           [],
};

export interface StateTransition {
  from:      CaseState;
  to:        CaseState;
  timestamp: string;
}

export class MediationCase {
  private state:   CaseState        = CaseState.INTAKE;
  readonly caseId: string;
  private history: StateTransition[] = [];

  constructor(caseId: string) {
    this.caseId = caseId;
  }

  transition(newState: CaseState): void {
    const allowed = VALID_TRANSITIONS[this.state];
    if (!allowed.includes(newState)) {
      throw new Error(
        `Invalid transition: ${this.state} → ${newState}. Allowed: ${allowed.join(", ") || "none"}`
      );
    }

    const from = this.state;
    this.state = newState;
    this.history.push({ from, to: newState, timestamp: new Date().toISOString() });

    mediationLog.append(this.caseId, "STATE_TRANSITION", {
      from,
      to:        newState,
      timestamp: new Date().toISOString(),
    });

    if (newState === CaseState.CLOSED || newState === CaseState.ABANDONED) {
      triggerLearningLoop(this.caseId);
    }
  }

  canTransitionTo(newState: CaseState): boolean {
    return VALID_TRANSITIONS[this.state].includes(newState);
  }

  getState(): CaseState {
    return this.state;
  }

  getHistory(): StateTransition[] {
    return [...this.history]; // cópia — imutabilidade
  }
}

// Map singleton — padrão js-set-map-lookups (O(1) lookup)
const caseStore = new Map<string, MediationCase>();

export function createCase(caseId: string): MediationCase {
  const existing = caseStore.get(caseId);
  if (existing && existing.getState() !== CaseState.CLOSED && existing.getState() !== CaseState.ABANDONED) {
    return existing; // idempotente — só reutiliza se ainda ativo
  }
  learnedCases.delete(caseId); // libera para futuro learning loop

  const mediationCase = new MediationCase(caseId);
  caseStore.set(caseId, mediationCase);

  mediationLog.append(caseId, "CASE_OPENED", {
    initialState: CaseState.INTAKE,
    createdAt:    new Date().toISOString(),
  });

  return mediationCase;
}

export function getCase(caseId: string): MediationCase | undefined {
  return caseStore.get(caseId);
}

// Exportar Map para uso futuro em admin/metrics (F13)
export { caseStore };

const MIN_OUTCOMES_FOR_LEARNING = 3;
const LOG_DIR = join(process.cwd(), ".mediation-logs");
const learnedCases = new Set<string>();

async function collectOutcomes(): Promise<MediationOutcome[]> {
  let files: string[];
  try {
    files = (await readdir(LOG_DIR)).filter((f: string) => f.endsWith(".json"));
  } catch {
    return [];
  }

  const outcomes: MediationOutcome[] = [];
  for (const file of files) {
    try {
      const caseId = file.replace(".json", "");
      const events = mediationLog.getAll(caseId);

      const closed = events.find(
        (e: MediationEvent) =>
          e.eventType === "STATE_TRANSITION" &&
          ((e.payload as Record<string, unknown>).to === CaseState.CLOSED ||
           (e.payload as Record<string, unknown>).to === CaseState.ABANDONED)
      );
      if (!closed) continue;

      const analyses = events.filter(
        (e: MediationEvent) => e.eventType === "ANALYSIS_COMPLETE"
      );
      const avgScore = analyses.length > 0
        ? analyses.reduce((s, e) => s + (Number((e.payload as Record<string, unknown>).credibilityScore) || 0), 0) / analyses.length
        : 50;
      const normalized = avgScore / 100;

      const settled = events.some(
        (e: MediationEvent) => e.eventType === "SETTLEMENT_EXECUTED"
      );

      outcomes.push({
        caseId,
        compliance_rate:   settled ? 0.8 : 0.3,
        resolution_rate:   settled ? 1.0 : 0.0,
        response_speed:    0.7,
        evidence_quality:  normalized,
        cooperation_score: settled ? 0.75 : 0.25,
        successful:        (closed.payload as Record<string, unknown>).to === CaseState.CLOSED,
      });
    } catch (err) {
      console.error(`[learning] failed to process case file ${file}:`, err);
    }
  }

  return outcomes;
}

function triggerLearningLoop(caseId: string): void {
  const runKey = `${caseId}:${Date.now()}`;
  if (learnedCases.has(caseId)) return;
  learnedCases.add(caseId);

  (async () => {
    const outcomes = await collectOutcomes();
    if (outcomes.length < MIN_OUTCOMES_FOR_LEARNING) return;

    const { adjustWeights } = await import("@/lib/learning");
    await adjustWeights(outcomes);
    console.log(`[learning] adjusted weights from ${outcomes.length} outcomes (trigger: ${runKey})`);
  })().catch((err) => {
    console.error(`[learning] loop failed for case ${caseId}:`, err);
  });
}
