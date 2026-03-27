import { mediationLog } from "@/lib/mediation-log";

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
  if (existing) return existing; // idempotente

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
