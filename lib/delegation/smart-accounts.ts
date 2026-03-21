import {
  Implementation,
  toMetaMaskSmartAccount,
  getSmartAccountsEnvironment,
} from "@metamask/smart-accounts-kit";
import { privateKeyToAccount } from "viem/accounts";
import type { PublicClient } from "viem";
import { baseSepolia } from "viem/chains";

// Get the MetaMask delegation environment for Base Sepolia
export function getEnvironment() {
  return getSmartAccountsEnvironment(baseSepolia.id);
}

function normalizeKey(key: string): `0x${string}` {
  return (key.startsWith("0x") ? key : `0x${key}`) as `0x${string}`;
}

// Create a MetaMask Hybrid smart account for the Selantar agent (delegate)
export async function getAgentSmartAccount(publicClient: PublicClient) {
  const pk = process.env.AGENT_PRIVATE_KEY;
  if (!pk) throw new Error("AGENT_PRIVATE_KEY not set");

  const account = privateKeyToAccount(normalizeKey(pk));

  return toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: "0x",
    signer: { account },
  });
}

// Create a MetaMask Hybrid smart account for a dispute party (delegator)
export async function getPartySmartAccount(
  publicClient: PublicClient,
  privateKey: string
) {
  const account = privateKeyToAccount(normalizeKey(privateKey));

  return toMetaMaskSmartAccount({
    client: publicClient,
    implementation: Implementation.Hybrid,
    deployParams: [account.address, [], [], []],
    deploySalt: "0x",
    signer: { account },
  });
}
