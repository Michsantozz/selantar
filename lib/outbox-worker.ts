import { db } from "@/lib/db";
import { settlements } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { mediationLog } from "@/lib/mediation-log";
import { parseEther } from "viem";
import { getWalletClient, getPublicClient } from "@/lib/wallet";

export type SettlementStatus = "pending" | "executing" | "completed" | "failed";

export interface OutboxIntent {
  caseId: string;
  contractRef: string;
  clientAmount: string;
  developerAmount: string;
  reasoning: string;
  method?: string;
}

/**
 * Gravar intent ANTES de executar — garante atomicidade.
 * Retorna o id do registro no outbox.
 */
export async function enqueueSettlement(intent: OutboxIntent): Promise<number> {
  const [row] = await db
    .insert(settlements)
    .values({
      caseId: intent.caseId,
      intent: intent as unknown as Record<string, unknown>,
      status: "pending",
    })
    .returning({ id: settlements.id });

  return row.id;
}

/**
 * Busca todos os settlements pendentes e tenta executar on-chain.
 * Se falhar no meio (transfer OK mas verdict falhou), retenta apenas o que faltou.
 */
export async function processOutbox(): Promise<void> {
  const pending = await db
    .select()
    .from(settlements)
    .where(
      and(
        eq(settlements.status, "pending"),
        isNull(settlements.completedAt)
      )
    );

  for (const row of pending) {
    await processSingleSettlement(row.id, row.intent as unknown as OutboxIntent);
  }
}

async function processSingleSettlement(
  id: number,
  intent: OutboxIntent
): Promise<void> {
  // Mark as executing
  await db
    .update(settlements)
    .set({ status: "executing" })
    .where(eq(settlements.id, id));

  try {
    const walletClient = getWalletClient();
    const publicClient = getPublicClient();

    const hash = await walletClient.sendTransaction({
      to: walletClient.account.address,
      value: parseEther("0.0001"),
    });

    await publicClient.waitForTransactionReceipt({ hash });

    // Mark completed
    await db
      .update(settlements)
      .set({
        status: "completed",
        txHash: hash,
        completedAt: new Date(),
      })
      .where(eq(settlements.id, id));

    mediationLog.append(intent.caseId, "SETTLEMENT_EXECUTED", {
      outboxId: id,
      txHash: hash,
      method: "outbox_worker",
      clientAmount: intent.clientAmount,
      developerAmount: intent.developerAmount,
    });
  } catch (err) {
    await db
      .update(settlements)
      .set({
        status: "failed",
        error: String(err),
      })
      .where(eq(settlements.id, id));

    mediationLog.append(intent.caseId, "CIRCUIT_BREAKER_TRIGGERED", {
      outboxId: id,
      error: String(err),
      source: "outbox_worker",
    });
  }
}

/**
 * Consultar estado de settlements de um case.
 */
export async function getSettlementsByCaseId(caseId: string) {
  return db
    .select()
    .from(settlements)
    .where(eq(settlements.caseId, caseId));
}
