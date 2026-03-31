import {
  createWalletClient,
  createPublicClient,
  http,
} from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";

const RPC_URL = "https://sepolia.base.org";

export function getWalletClient() {
  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "AGENT_PRIVATE_KEY not set in environment variables. Add it to .env.local"
    );
  }

  const account = privateKeyToAccount(
    (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
}

/**
 * Simulate a contract write before sending the real transaction.
 * Catches reverts BEFORE spending gas — returns the TX hash only if
 * the simulation succeeds. Zero gas wasted on reverts.
 *
 * Technique from Sentinel8004's writer — they learned the hard way:
 * 90% of their first 1,854 attestations reverted silently because
 * they skipped simulation and hardcoded gas limits.
 */
export async function simulateAndWrite(
  walletClient: ReturnType<typeof getWalletClient> | ReturnType<typeof getClientWalletClient>,
  params: {
    address: `0x${string}`;
    abi: readonly unknown[];
    functionName: string;
    args: readonly unknown[];
  }
): Promise<string> {
  const publicClient = getPublicClient();

  // Dry-run against current chain state — reverts throw with clear error message
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- viem's simulateContract/writeContract generics are too complex to type narrowly here
  const { request } = await (publicClient.simulateContract as any)({
    ...params,
    account: walletClient.account!,
  });

  // Simulation passed — send the real TX with exact gas estimate from simulation
  // eslint-disable-next-line @typescript-eslint/no-explicit-any -- viem request type from simulate is opaque
  return walletClient.writeContract(request as any);
}

/**
 * Client wallet — used for ERC-8004 feedback (avoids self-feedback restriction).
 * In production, feedback comes from the dispute parties, not the mediator.
 */
export function getClientWalletClient() {
  const privateKey = process.env.CLIENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("CLIENT_PRIVATE_KEY not set in environment variables");
  }

  const account = privateKeyToAccount(
    (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  return createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(RPC_URL),
  });
}
