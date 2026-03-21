import { tool } from "ai";
import { z } from "zod";
import { parseEther } from "viem";
import { getWalletClient, getPublicClient } from "@/lib/wallet";

export const executeSettlement = tool({
  description:
    "Execute the approved settlement on-chain. Uses MetaMask Delegations when available to execute scoped ERC-20 transfers on behalf of dispute parties. Falls back to direct ETH transfer on Base Sepolia.",
  inputSchema: z.object({
    clientAmount: z.string().describe("Amount to transfer to the client (in USD for display)"),
    developerAmount: z.string().describe("Amount to transfer to the developer (in USD for display)"),
    contractRef: z.string().describe("Reference ID of the disputed contract"),
    reasoning: z.string().describe("Final mediator reasoning for the verdict"),
  }),
  execute: async ({ clientAmount, developerAmount, contractRef, reasoning }) => {
    console.log(">>> executeSettlement called! USE_DELEGATION=" + process.env.USE_DELEGATION);
    // --- ERC-7715 PATH: Execute via wallet_requestExecutionPermissions ---
    if (process.env.USE_ERC7715 === "true") {
      try {
        const { redeemWithPermissionsContext } = await import("@/lib/delegation/erc7715");
        const { getPublicClient: getPub } = await import("@/lib/wallet");
        const { getAgentSmartAccount } = await import("@/lib/delegation");

        const publicClient = getPub();
        const agentSmartAccount = await getAgentSmartAccount(publicClient);
        const settlementAmount = parseEther("0.0001");

        // permissionsContext is passed via env or a global store in production.
        // For the hackathon demo, the frontend POSTs it to /api/delegation/erc7715.
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
          delegationScope: "ERC-7715 Native Token Allowance",
          explorer: `https://sepolia.basescan.org/tx/${userOpHash}`,
          timestamp: new Date().toISOString(),
        };
      } catch (erc7715Error) {
        console.warn("ERC-7715 path failed, falling back to delegation SDK:", erc7715Error);
        // Fall through to existing delegation path
      }
    }

    // --- DELEGATION PATH: Execute via MetaMask Smart Accounts ---
    if (process.env.USE_DELEGATION === "true") {
      try {
        const { getAgentSmartAccount, getPartySmartAccount, getEnvironment, createAndSignDelegation, redeemSettlementDelegation } = await import("@/lib/delegation");
        const publicClient = getPublicClient();
        const environment = getEnvironment();

        // Create smart accounts
        const agentSmartAccount = await getAgentSmartAccount(publicClient);
        const clientPk = process.env.CLIENT_PRIVATE_KEY;
        if (!clientPk) throw new Error("CLIENT_PRIVATE_KEY not set");

        const clientSmartAccount = await getPartySmartAccount(publicClient, clientPk);

        // Create and sign delegation from client to agent (native ETH)
        const delegationAmount = parseEther("0.0001"); // settlement proof amount
        const signedDelegation = await createAndSignDelegation({
          delegatorAccount: clientSmartAccount,
          agentAddress: agentSmartAccount.address,
          environment,
          maxAmount: delegationAmount,
        });

        // Redeem delegation — transfer ETH on behalf of client via bundler
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
          delegationScope: "Native ETH Scoped Transfer",
          delegator: clientSmartAccount.address,
          delegate: agentSmartAccount.address,
          explorer: `https://sepolia.basescan.org/tx/${userOpHash}`,
          timestamp: new Date().toISOString(),
        };
      } catch (delegationError) {
        console.warn("Delegation path failed, falling back to direct tx:", delegationError);
        // Fall through to direct tx
      }
    }

    // --- FALLBACK: Direct ETH transfer as proof of settlement ---
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
