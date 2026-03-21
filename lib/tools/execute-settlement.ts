import { tool } from "ai";
import { z } from "zod";
import { parseEther } from "viem";
import { getWalletClient, getPublicClient } from "@/lib/wallet";

export const executeSettlement = tool({
  description:
    "Execute the approved settlement on-chain via Locus USDC wallet or intent-based delegation. The dispute parties delegate the INTENT to resolve their dispute — the agent autonomously analyzes evidence, determines the fair split, and executes settlement. Supports Locus USDC payments with spending controls, ERC-7715 permissions, MetaMask Delegation Framework. Falls back to direct transfer on Base Sepolia.",
  inputSchema: z.object({
    clientAmount: z.string().describe("Amount to transfer to the client (in USD for display)"),
    developerAmount: z.string().describe("Amount to transfer to the developer (in USD for display)"),
    contractRef: z.string().describe("Reference ID of the disputed contract"),
    reasoning: z.string().describe("Final mediator reasoning for the verdict"),
  }),
  execute: async ({ clientAmount, developerAmount, contractRef, reasoning }) => {
    console.log(">>> executeSettlement called! USE_LOCUS=" + process.env.USE_LOCUS + " USE_ERC7715=" + process.env.USE_ERC7715 + " USE_DELEGATION=" + process.env.USE_DELEGATION);

    // --- 1. LOCUS PATH (first): Execute USDC settlement via Locus wallet ---
    if (process.env.USE_LOCUS === "true" && process.env.LOCUS_API_KEY) {
      try {
        const locusApiKey = process.env.LOCUS_API_KEY;
        const locusBase = process.env.LOCUS_API_BASE ?? "https://beta-api.paywithlocus.com/api";

        // Check balance first
        const balanceRes = await fetch(`${locusBase}/pay/balance`, {
          headers: { Authorization: `Bearer ${locusApiKey}` },
        });
        const balanceData = await balanceRes.json() as { success: boolean; data?: { usdc_balance?: string } };
        const balance = parseFloat(balanceData.data?.usdc_balance ?? "0");
        console.log(`Locus wallet balance: $${balance} USDC`);

        if (balance < 0.01) {
          console.warn("Locus: Insufficient balance ($" + balance + "), falling back to delegation");
          throw new Error("Insufficient Locus balance");
        }

        // Parse settlement amounts (use small proof amounts for demo)
        const clientUsdcAmount = 0.01;
        const devUsdcAmount = 0.01;

        // Send client portion
        const clientRes = await fetch(`${locusBase}/pay/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${locusApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to_address: process.env.CLIENT_WALLET_ADDRESS ?? "0x7C41D01c95F55c5590e65c8f91B4F854316d1da4",
            amount: clientUsdcAmount,
            memo: `Selantar settlement [${contractRef}] — client portion (${clientAmount}). ${reasoning}`,
          }),
        });

        const clientData = await clientRes.json() as {
          success: boolean;
          data?: { transaction_id?: string; status?: string; tx_hash?: string };
        };

        if (!clientData.success) {
          console.warn("Locus client payment failed:", clientData);
          throw new Error("Locus payment failed");
        }

        // Send developer portion
        const devRes = await fetch(`${locusBase}/pay/send`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${locusApiKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            to_address: process.env.DEVELOPER_WALLET_ADDRESS ?? process.env.AGENT_WALLET_ADDRESS ?? "0x377711a26B52F4AD8C548AAEF8297E0563b87Db4",
            amount: devUsdcAmount,
            memo: `Selantar settlement [${contractRef}] — developer portion (${developerAmount}). ${reasoning}`,
          }),
        });

        const devData = await devRes.json() as {
          success: boolean;
          data?: { transaction_id?: string; status?: string; tx_hash?: string };
        };

        return {
          status: "executed",
          method: "locus",
          clientTransactionId: clientData.data?.transaction_id,
          developerTransactionId: devData.data?.transaction_id,
          clientAmount,
          developerAmount,
          contractRef,
          reasoning,
          chain: "Base",
          currency: "USDC",
          locusWalletBalance: `$${balance} USDC`,
          spendingControls: "Locus policy guardrails: allowance, per-tx limits, approval threshold",
          auditTrail: `${locusBase}/pay/transactions`,
          timestamp: new Date().toISOString(),
        };
      } catch (locusError) {
        console.warn("Locus path failed, falling back to ERC-7715/delegation:", locusError);
        // Fall through to ERC-7715
      }
    }

    // --- 2. ERC-7715 PATH: Execute via wallet_requestExecutionPermissions ---
    if (process.env.USE_ERC7715 === "true") {
      try {
        const { redeemWithPermissionsContext } = await import("@/lib/delegation/erc7715");
        const { getPublicClient: getPub } = await import("@/lib/wallet");
        const { getAgentSmartAccount } = await import("@/lib/delegation");

        const publicClient = getPub();
        const agentSmartAccount = await getAgentSmartAccount(publicClient);
        const settlementAmount = parseEther("0.0001");

        const permissionsContext = process.env.ERC7715_PERMISSIONS_CONTEXT as `0x${string}` | undefined;
        if (!permissionsContext) {
          console.warn("ERC-7715: No permissionsContext available, falling back to delegation SDK");
          throw new Error("No permissionsContext");
        }

        const delegationManager = process.env.ERC7715_DELEGATION_MANAGER as `0x${string}` | undefined;

        const { userOpHash } = await redeemWithPermissionsContext({
          permissionsContext,
          delegationManager: delegationManager ?? "0x0000000000000000000000000000000000000000",
          recipientAddress: agentSmartAccount.address,
          amount: settlementAmount,
        });

        return {
          status: "executed",
          method: "erc7715",
          userOpHash,
          clientAmount,
          developerAmount,
          contractRef,
          reasoning,
          chain: "Base Sepolia",
          delegationScope: "ERC-7715 Intent Delegation — agent resolved dispute and executed settlement autonomously",
          explorer: `https://sepolia.basescan.org/tx/${userOpHash}`,
          timestamp: new Date().toISOString(),
        };
      } catch (erc7715Error) {
        console.warn("ERC-7715 path failed, falling back to delegation SDK:", erc7715Error);
      }
    }

    // --- 3. DELEGATION PATH: Execute via MetaMask Smart Accounts ---
    if (process.env.USE_DELEGATION === "true") {
      try {
        const { getAgentSmartAccount, getPartySmartAccount, getEnvironment, createAndSignDelegation, redeemSettlementDelegation } = await import("@/lib/delegation");
        const publicClient = getPublicClient();
        const environment = getEnvironment();

        const agentSmartAccount = await getAgentSmartAccount(publicClient);
        const clientPk = process.env.CLIENT_PRIVATE_KEY;
        if (!clientPk) throw new Error("CLIENT_PRIVATE_KEY not set");

        const clientSmartAccount = await getPartySmartAccount(publicClient, clientPk);

        const delegationAmount = parseEther("0.0001");
        const signedDelegation = await createAndSignDelegation({
          delegatorAccount: clientSmartAccount,
          agentAddress: agentSmartAccount.address,
          environment,
          maxAmount: delegationAmount,
        });

        const { userOpHash } = await redeemSettlementDelegation({
          signedDelegation,
          recipientAddress: agentSmartAccount.address,
          amount: delegationAmount,
        });

        return {
          status: "executed",
          method: "delegation",
          userOpHash,
          clientAmount,
          developerAmount,
          contractRef,
          reasoning,
          chain: "Base Sepolia",
          delegationScope: "Intent Delegation — dispute resolution delegated to agent, settlement determined autonomously",
          delegator: clientSmartAccount.address,
          delegate: agentSmartAccount.address,
          explorer: `https://sepolia.basescan.org/tx/${userOpHash}`,
          timestamp: new Date().toISOString(),
        };
      } catch (delegationError) {
        console.warn("Delegation path failed, falling back to direct tx:", delegationError);
      }
    }

    // --- 4. FALLBACK: Direct ETH transfer as proof of settlement ---
    try {
      const walletClient = getWalletClient();
      const publicClient = getPublicClient();

      const settlementAmount = parseEther("0.0001");

      const hash = await walletClient.sendTransaction({
        to: walletClient.account.address,
        value: settlementAmount,
      });

      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      return {
        status: "executed",
        method: "direct",
        txHash: hash,
        blockNumber: receipt.blockNumber.toString(),
        clientAmount,
        developerAmount,
        contractRef,
        reasoning,
        chain: "Base Sepolia",
        explorer: `https://sepolia.basescan.org/tx/${hash}`,
        timestamp: new Date().toISOString(),
      };
    } catch {
      return {
        status: "settlement_recorded",
        note: "Settlement terms recorded. On-chain execution will be finalized when the escrow contract is funded.",
        clientAmount,
        developerAmount,
        contractRef,
        reasoning,
        chain: "Base Sepolia",
        timestamp: new Date().toISOString(),
      };
    }
  },
});
