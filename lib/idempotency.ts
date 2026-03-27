import { createHash } from "crypto";

const TTL_MS = 24 * 60 * 60 * 1000; // 24h em ms

export interface IdempotencyRecord {
  key: string;
  result: unknown;
  createdAt: number;
}

export interface IdempotencyCheck {
  cached: boolean;
  result?: unknown;
}

export class IdempotencyStore {
  // Padrão js-cache-function-results: Map module-level
  private store = new Map<string, IdempotencyRecord>();

  checkIdempotency(key: string): IdempotencyCheck {
    // js-early-exit: retornar imediatamente se não encontrado
    const record = this.store.get(key);
    if (!record) return { cached: false };

    // Expirou? Remover e tratar como novo
    if (Date.now() - record.createdAt > TTL_MS) {
      this.store.delete(key);
      return { cached: false };
    }

    return { cached: true, result: record.result };
  }

  saveResult(key: string, result: unknown): void {
    // Purge expired antes de salvar — garante limpeza frequente sem scheduler
    this.purgeExpired();

    this.store.set(key, {
      key,
      result,
      createdAt: Date.now(),
    });
  }

  // Limpeza automática de registros expirados
  purgeExpired(): void {
    const now = Date.now();
    for (const [key, record] of this.store) {
      if (now - record.createdAt > TTL_MS) {
        this.store.delete(key);
      }
    }
  }

  size(): number {
    return this.store.size;
  }
}

// Singleton — mesmo padrão de mediationLog e circuitBreaker
export const idempotencyStore = new IdempotencyStore();

// Para cases (em mediation-chat/route.ts)
export function buildCaseKey(params: {
  contractRef: string;
  partyA: string;
  partyB: string;
  disputeType: string;
}): string {
  const data = [params.contractRef, params.partyA, params.partyB, params.disputeType].join("|");
  return createHash("sha256").update(data).digest("hex");
}

// Para settlements (em execute-settlement tool)
export function buildSettlementKey(params: {
  caseId: string;
  settlementTerms: string;
  amount: string;
}): string {
  const data = [params.caseId, params.settlementTerms, params.amount].join("|");
  return createHash("sha256").update(data).digest("hex");
}

// Para delegations (em delegation/grant route)
export function buildDelegationKey(params: {
  contractRef: string;
  maxAmountEth: string;
}): string {
  const data = [params.contractRef, params.maxAmountEth].join("|");
  return createHash("sha256").update(data).digest("hex");
}
