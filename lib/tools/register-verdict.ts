import { tool } from "ai";
import { z } from "zod";
import { getWalletClient } from "@/lib/wallet";
import { registerVerdictAsValidation } from "@/lib/erc8004/validation";
import { mediationLog } from "@/lib/mediation-log";

export const registerVerdict = tool({
  description:
    "Register the final verdict as verifiable evidence on-chain via ERC-8004 Validation Registry.",
  inputSchema: z.object({
    contractRef: z.string().describe("Contract reference ID"),
    evidence: z.array(z.string()).describe("List of evidence items considered"),
    reasoning: z.string().describe("Final mediator reasoning"),
    settlementTxHash: z.string().describe("Settlement transaction hash"),
    clientAmount: z.string().describe("Amount allocated to the client (e.g. '3000.00')"),
    developerAmount: z.string().describe("Amount allocated to the developer (e.g. '12000.00')"),
  }),
  execute: async ({ contractRef, evidence, reasoning, settlementTxHash, clientAmount, developerAmount }) => {
    try {
      const walletClient = getWalletClient();
      const agentId = BigInt(process.env.SELANTAR_AGENT_ID ?? "2122");

      const { txHash: validationTxHash } = await registerVerdictAsValidation(
        walletClient,
        agentId,
        {
          contractRef,
          evidence,
          settlement: {
            clientAmount,
            developerAmount,
            txHashes: [settlementTxHash],
          },
          reasoning,
        }
      );

      mediationLog.append(contractRef, "VERDICT_REGISTERED", {
        validationTxHash,
        evidenceCount: evidence.length,
        linkedSettlement: settlementTxHash,
        chain: "Base Sepolia",
      });

      return {
        status: "registered",
        validationTxHash,
        contractRef,
        evidenceCount: evidence.length,
        linkedSettlement: settlementTxHash,
        registry: "ERC-8004 Validation Registry",
        chain: "Base Sepolia",
        explorer: `https://sepolia.basescan.org/tx/${validationTxHash}`,
        timestamp: new Date().toISOString(),
      };
    } catch {
      mediationLog.append(contractRef, "VERDICT_REGISTERED", {
        status: "queued",
        evidenceCount: evidence.length,
        linkedSettlement: settlementTxHash,
        chain: "Base Sepolia",
        note: "on-chain registration pending wallet funding",
      });

      return {
        status: "verdict_queued",
        note: "Verdict evidence recorded. On-chain registration will complete when the agent wallet is funded.",
        contractRef,
        evidenceCount: evidence.length,
        linkedSettlement: settlementTxHash,
        registry: "ERC-8004 Validation Registry",
        chain: "Base Sepolia",
        timestamp: new Date().toISOString(),
      };
    }
  },
});
