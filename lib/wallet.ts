import { createWalletClient, createPublicClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { hederaTestnet } from "@/lib/hedera/chains";

const RPC_URL = process.env.HEDERA_RPC_URL ?? "https://testnet.hashio.io/api";

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
    chain: hederaTestnet,
    transport: http(RPC_URL),
  });
}

export function getPublicClient() {
  return createPublicClient({
    chain: hederaTestnet,
    transport: http(RPC_URL),
  });
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
    chain: hederaTestnet,
    transport: http(RPC_URL),
  });
}
