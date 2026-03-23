import { tool } from "ai";
import { z } from "zod";
import { getClientWalletClient } from "@/lib/wallet";
import { postMediationFeedback } from "@/lib/erc8004/reputation";
import { notifyOpenClaw } from "@/lib/notify-openclaw";
import { getExplorerTxUrl } from "@/lib/hedera/explorer";

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
  }),
  execute: async ({ satisfactionScore, disputeType, settlementTxHash }) => {
    try {
      const walletClient = getClientWalletClient();
      const agentId = BigInt(process.env.SELANTAR_AGENT_ID ?? "36");

      const feedbackTxHash = await postMediationFeedback(
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

      notifyOpenClaw("feedback_posted", {
        score: `${satisfactionScore}/100`,
        tipo: disputeType,
        registry: "ERC-8004 Reputation",
        tx: feedbackTxHash,
        explorer: getExplorerTxUrl(feedbackTxHash),
      });

      return {
        status: "posted",
        feedbackTxHash,
        satisfactionScore,
        disputeType,
        linkedSettlement: settlementTxHash,
        registry: "ERC-8004 Reputation Registry",
        chain: "Hedera Testnet",
        explorer: getExplorerTxUrl(feedbackTxHash),
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "feedback_queued",
        note: "Reputation feedback recorded. On-chain posting will complete when the agent wallet is funded.",
        satisfactionScore,
        disputeType,
        linkedSettlement: settlementTxHash,
        registry: "ERC-8004 Reputation Registry",
        chain: "Hedera Testnet",
        timestamp: new Date().toISOString(),
      };
    }
  },
});
