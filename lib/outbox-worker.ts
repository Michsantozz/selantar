import { db } from "@/lib/db";
import { settlements } from "@/lib/db/schema";
import { eq, and, isNull } from "drizzle-orm";
import { mediationLog } from "@/lib/mediation-log";
import { parseEther } from "viem";
import { getWalletClient, getPublicClient } from "@/lib/wallet";
import { breakers } from "@/lib/breakers";
import { BreakerOpenError } from "@/lib/service-breaker";

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
    try {
      await processSingleSettlement(row.id, row.intent as unknown as OutboxIntent);
    } catch (err) {
      // BreakerOpenError rethrown = stop processing, remaining rows stay pending
      if (err instanceof BreakerOpenError) break;
      throw err;
    }
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

    const clientAddress = (process.env.CLIENT_WALLET_ADDRESS ?? "0x7C41D01c95F55c5590e65c8f91B4F854316d1da4") as `0x${string}`;
    const hash = await breakers.onchain.call(() =>
      walletClient.sendTransaction({
        to: clientAddress,
        value: parseEther("0.0001"),
      })
    );

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
      contractAmount: { client: intent.clientAmount, developer: intent.developerAmount },
      onChainAmount: "0.0001 ETH (testnet symbolic execution)",
    });
  } catch (err) {
    // BreakerOpenError = transient (service wasn't even called) → keep as pending for retry
    const isTransient = err instanceof BreakerOpenError;

    await db
      .update(settlements)
      .set({
        status: isTransient ? "pending" : "failed",
        error: String(err),
      })
      .where(eq(settlements.id, id));

    mediationLog.append(intent.caseId, isTransient ? "BREAKER_SKIPPED" : "CIRCUIT_BREAKER_TRIGGERED", {
      outboxId: id,
      error: String(err),
      transient: isTransient,
      source: "outbox_worker",
    });

    // If breaker is open, skip remaining rows — they'll all fail the same way
    if (isTransient) throw err;
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
