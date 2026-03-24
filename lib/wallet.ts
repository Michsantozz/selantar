import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "@/lib/hedera/chains";

const RPC_URL = process.env.HEDERA_RPC_URL ?? "https://testnet.hashio.io/api";

// Cached instances — avoid recreating clients on every tool call
let _walletClient: ReturnType<typeof createWalletClient> | null = null;
let _publicClient: ReturnType<typeof createPublicClient> | null = null;
let _clientWalletClient: ReturnType<typeof createWalletClient> | null = null;

export function getWalletClient() {
  if (_walletClient) return _walletClient;

  const privateKey = process.env.AGENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error(
      "AGENT_PRIVATE_KEY not set in environment variables. Add it to .env.local"
    );
  }

  const account = privateKeyToAccount(
    (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  _walletClient = createWalletClient({
    account,
    chain: hederaTestnet,
    transport: http(RPC_URL),
  });
  return _walletClient;
}

export function getPublicClient() {
  if (_publicClient) return _publicClient;

  _publicClient = createPublicClient({
    chain: hederaTestnet,
    transport: http(RPC_URL),
  });
  return _publicClient;
}

/**
 * Client wallet — used for ERC-8004 feedback (avoids self-feedback restriction).
 * In production, feedback comes from the dispute parties, not the mediator.
 */
export function getClientWalletClient() {
  if (_clientWalletClient) return _clientWalletClient;

  const privateKey = process.env.CLIENT_PRIVATE_KEY;
  if (!privateKey) {
    throw new Error("CLIENT_PRIVATE_KEY not set in environment variables");
  }

  const account = privateKeyToAccount(
    (privateKey.startsWith("0x") ? privateKey : `0x${privateKey}`) as `0x${string}`
  );

  _clientWalletClient = createWalletClient({
    account,
    chain: hederaTestnet,
    transport: http(RPC_URL),
  });
  return _clientWalletClient;
}
