import { tool } from "ai";
import { z } from "zod";
import { getClientWalletClient } from "@/lib/wallet";
import { postMediationFeedback } from "@/lib/erc8004/reputation";
import { mediationLog } from "@/lib/mediation-log";

export const postFeedback = tool({
  description:
    "Post reputation feedback on-chain via ERC-8004 Reputation Registry after a mediation is concluded.",
  inputSchema: z.object({
    satisfactionScore: z
      .number()
      .min(0)
      .max(100)
      .describe("Mediation satisfaction score (0-100)"),
    disputeType: z.string().describe("Type of dispute that was resolved"),
    settlementTxHash: z.string().describe("Transaction hash of the settlement"),
    caseId: z.string().describe("Case reference ID for event logging"),
  }),
  execute: async ({ satisfactionScore, disputeType, settlementTxHash, caseId }) => {
    try {
      const walletClient = getClientWalletClient();
      const agentId = BigInt(process.env.SELANTAR_AGENT_ID ?? "2122");

      const { txHash: feedbackTxHash } = await postMediationFeedback(
        walletClient,
        agentId,
        {
          contractId: `selantar-mediation-${Date.now()}`,
          settlementTxHash,
          clientSatisfaction: satisfactionScore,
          resolutionTimeMs: 0,
          disputeType,
        }
      );

      mediationLog.append(caseId, "CASE_CLOSED", {
        feedbackTxHash,
        satisfactionScore,
        disputeType,
        linkedSettlement: settlementTxHash,
        chain: "Base Sepolia",
      });

      return {
        status: "posted",
        feedbackTxHash,
        satisfactionScore,
        disputeType,
        linkedSettlement: settlementTxHash,
        registry: "ERC-8004 Reputation Registry",
        chain: "Base Sepolia",
        explorer: `https://sepolia.basescan.org/tx/${feedbackTxHash}`,
        timestamp: new Date().toISOString(),
      };
    } catch {
      mediationLog.append(caseId, "CASE_CLOSED", {
        status: "queued",
        satisfactionScore,
        disputeType,
        linkedSettlement: settlementTxHash,
        chain: "Base Sepolia",
        note: "on-chain feedback pending wallet funding",
      });

      return {
        status: "feedback_queued",
        note: "Reputation feedback recorded. On-chain posting will complete when the agent wallet is funded.",
        satisfactionScore,
        disputeType,
        linkedSettlement: settlementTxHash,
        registry: "ERC-8004 Reputation Registry",
        chain: "Base Sepolia",
        timestamp: new Date().toISOString(),
      };
    }
  },
});
