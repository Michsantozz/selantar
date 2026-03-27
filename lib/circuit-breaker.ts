import { mediationLog } from "@/lib/mediation-log";

export type BreakerLevel = "NORMAL" | "CAUTION" | "LOCKDOWN" | "EMERGENCY";

export interface BreakerStatus {
  level: BreakerLevel;
  reason: string;
  settlementCount1h: number;
  settlementCount10min: number;
  lastTriggeredAt?: string;
}

export class CircuitBreaker {
  private level: BreakerLevel = "NORMAL";
  private settlementTimestamps: number[] = []; // epoch ms de cada settlement
  private lastTriggeredAt?: string;
  private reason = "";

  // Chamado no início de executeSettlement — retorno rápido (js-early-exit)
  canExecute(): { allowed: boolean; level: BreakerLevel; reason: string } {
    this.evaluate();

    if (this.level === "LOCKDOWN" || this.level === "EMERGENCY") {
      return { allowed: false, level: this.level, reason: this.reason };
    }

    return { allowed: true, level: this.level, reason: this.reason };
  }

  // Chamado APÓS execução bem-sucedida de um settlement
  // amountUsd: total settlement amount — threshold $3000 (~1 ETH) triggers LOCKDOWN
  recordSettlement(caseId: string, amountUsd?: string): void {
    this.settlementTimestamps.push(Date.now());

    if (amountUsd) {
      const amount = parseFloat(amountUsd);
      // 1 ETH ≈ $3000 USD — threshold conservador conforme skill-context.md
      if (amount >= 3000) {
        this.level = "LOCKDOWN";
        this.reason = `Settlement amount $${amount} exceeds threshold ($3000 / ~1 ETH)`;
        this.lastTriggeredAt = new Date().toISOString();
      }
    }

    this.evaluate();

    if (this.level === "CAUTION") {
      console.warn(`[CircuitBreaker] CAUTION: ${this.reason}`);
    }
  }

  // Chamado quando falha on-chain é detectada
  recordOnChainFailure(caseId: string, error: string): void {
    this.level = "EMERGENCY";
    this.reason = `On-chain failure detected: ${error}`;
    this.lastTriggeredAt = new Date().toISOString();

    mediationLog.append(caseId, "CIRCUIT_BREAKER_TRIGGERED", {
      level: "EMERGENCY",
      reason: this.reason,
      triggeredAt: this.lastTriggeredAt,
    });
  }

  // Reset MANUAL — nunca automático
  reset(): void {
    this.level = "NORMAL";
    this.reason = "";
    this.settlementTimestamps = [];
    this.lastTriggeredAt = undefined;
  }

  getStatus(): BreakerStatus {
    const now = Date.now();
    return {
      level: this.level,
      reason: this.reason,
      settlementCount1h: this.countInWindow(now, 60 * 60 * 1000),
      settlementCount10min: this.countInWindow(now, 10 * 60 * 1000),
      lastTriggeredAt: this.lastTriggeredAt,
    };
  }

  private evaluate(): void {
    if (this.level === "EMERGENCY") return; // EMERGENCY só sai via reset manual

    const now = Date.now();
    const count10min = this.countInWindow(now, 10 * 60 * 1000);
    const count1h = this.countInWindow(now, 60 * 60 * 1000);

    if (count1h >= 5) {
      this.level = "LOCKDOWN";
      this.reason = `${count1h} settlements in the last hour (limit: 5)`;
      this.lastTriggeredAt = new Date().toISOString();
      return;
    }

    if (count10min >= 3) {
      this.level = "CAUTION";
      this.reason = `${count10min} settlements in the last 10 minutes (limit: 3)`;
      return;
    }

    if (this.level !== "LOCKDOWN") {
      this.level = "NORMAL";
      this.reason = "";
    }
  }

  private countInWindow(now: number, windowMs: number): number {
    // Limpar timestamps antigos antes de contar (js-set-map-lookups: manter array pequeno)
    this.settlementTimestamps = this.settlementTimestamps.filter(
      (ts) => now - ts < windowMs * 6 // guardar até 6x a maior janela
    );
    return this.settlementTimestamps.filter((ts) => now - ts < windowMs).length;
  }
}

// Singleton — mesmo padrão de mediationLog em lib/mediation-log.ts
export const circuitBreaker = new CircuitBreaker();
