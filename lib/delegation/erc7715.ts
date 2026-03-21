import {
  encodeFunctionData,
  encodePacked,
  createWalletClient,
  custom,
  parseEther,
  type Hex,
} from "viem";
import { DelegationManager } from "@metamask/delegation-abis";
import { ExecutionMode } from "@metamask/smart-accounts-kit";
import { erc7715ProviderActions } from "@metamask/smart-accounts-kit/actions";
import { createBundlerClient } from "viem/account-abstraction";
import { http } from "viem";
import type { Client } from "viem";
import { baseSepolia } from "viem/chains";
import { getPublicClient } from "@/lib/wallet";
import { getAgentSmartAccount, getEnvironment } from "./smart-accounts";

// ---------- TYPES ----------

interface RequestPermissionsParams {
  clientAddress: `0x${string}`;
  agentAddress: `0x${string}`;
  amount?: bigint;
  expirySeconds?: number;
}

interface PermissionsResponse {
  permissionsContext: `0x${string}`;
  delegationManager: `0x${string}`;
  dependencies: { factory: `0x${string}`; factoryData: `0x${string}` }[];
}

interface RedeemParams {
  permissionsContext: `0x${string}`;
  delegationManager: `0x${string}`;
  recipientAddress: `0x${string}`;
  amount: bigint;
}

// ---------- CLIENT-SIDE: Request ERC-7715 Permissions ----------

/**
 * Requests execution permissions via MetaMask using the Smart Accounts Kit.
 * Uses erc7715ProviderActions() to extend the wallet client.
 * Runs on the FRONTEND (needs window.ethereum).
 */
export async function requestExecutionPermissions(
  params: RequestPermissionsParams
): Promise<PermissionsResponse> {
  const { agentAddress, expirySeconds = 3600 } = params;

  const eth = (window as unknown as { ethereum?: { request: (a: Record<string, unknown>) => Promise<unknown> } }).ethereum;
  if (!eth) throw new Error("MetaMask not detected");

  // Switch to Base Sepolia before requesting permissions
  try {
    await eth.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: "0x14a34" }], // 84532 = Base Sepolia
    });
  } catch (switchErr: unknown) {
    // If chain not added, add it
    if ((switchErr as { code?: number })?.code === 4902) {
      await eth.request({
        method: "wallet_addEthereumChain",
        params: [{
          chainId: "0x14a34",
          chainName: "Base Sepolia",
          nativeCurrency: { name: "ETH", symbol: "ETH", decimals: 18 },
          rpcUrls: ["https://sepolia.base.org"],
          blockExplorerUrls: ["https://sepolia.basescan.org"],
        }],
      });
    }
  }

  // Create wallet client extended with ERC-7715 actions
  const walletClient = createWalletClient({
    transport: custom(eth as Parameters<typeof custom>[0]),
    chain: baseSepolia,
  }).extend(erc7715ProviderActions());

  const currentTime = Math.floor(Date.now() / 1000);
  const expiry = currentTime + expirySeconds;

  // Request permissions using the Smart Accounts Kit pattern
  // Supported types: native-token-periodic, erc20-token-periodic, native-token-stream, erc20-token-stream
  const grantedPermissions = await walletClient.requestExecutionPermissions([{
    chainId: baseSepolia.id,
    to: agentAddress,
    expiry,
    permission: {
      type: "native-token-periodic",
      data: {
        periodAmount: parseEther("0.001"),
        periodDuration: expirySeconds,
        startTime: currentTime,
        justification: "Selantar settlement execution — authorize agent to transfer settlement amount",
      },
    },
    isAdjustmentAllowed: true,
  }]);

  return grantedPermissions as unknown as PermissionsResponse;
}

// ---------- SERVER-SIDE: Redeem with Permissions Context ----------

function getBundlerTransport() {
  const apiKey = process.env.PIMLICO_API_KEY;
  if (!apiKey) throw new Error("PIMLICO_API_KEY not set");
  return http(`https://api.pimlico.io/v2/84532/rpc?apikey=${apiKey}`);
}

/**
 * Redeems delegations using the permissionsContext obtained from ERC-7715.
 * Runs on the BACKEND via Pimlico bundler.
 */
export async function redeemWithPermissionsContext(
  params: RedeemParams
): Promise<{ userOpHash: string }> {
  const { permissionsContext, recipientAddress, amount } = params;

  const publicClient = getPublicClient();
  const environment = getEnvironment();
  const agentSmartAccount = await getAgentSmartAccount(publicClient);

  // Native ETH transfer calldata: target + value + empty calldata
  const executionCalldata = encodePacked(
    ["address", "uint256", "bytes"],
    [recipientAddress, amount, "0x" as Hex]
  );

  const redeemCalldata = encodeFunctionData({
    abi: DelegationManager,
    functionName: "redeemDelegations",
    args: [
      [permissionsContext],
      [ExecutionMode.SingleDefault],
      [executionCalldata],
    ],
  });

  // Bundler client with Pimlico (same pattern as redeem.ts)
  const bundlerClient = createBundlerClient({
    client: publicClient as unknown as Client,
    transport: getBundlerTransport(),
    chain: baseSepolia,
    paymaster: true,
  });

  // Send UserOperation from the agent smart account
  const userOpHash = await bundlerClient.sendUserOperation({
    account: agentSmartAccount,
    calls: [
      {
        to: environment.DelegationManager,
        data: redeemCalldata,
      },
    ],
  });

  return { userOpHash };
}
