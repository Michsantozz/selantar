/**
 * Update tokenURI for Agent #2122 on ERC-8004 Identity Registry
 * Points NFT metadata to the live Vercel deployment.
 *
 * Run: npx tsx scripts/update-agent-uri.ts
 */

import { createPublicClient, createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const IDENTITY_REGISTRY = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const AGENT_ID = BigInt(2122);
const NEW_URI = "https://selantar.vercel.app/agent.json";

async function main() {
  const pk = process.env.AGENT_PRIVATE_KEY;
  if (!pk) throw new Error("AGENT_PRIVATE_KEY not set in .env.local");

  const account = privateKeyToAccount(
    (pk.startsWith("0x") ? pk : `0x${pk}`) as `0x${string}`
  );

  const publicClient = createPublicClient({
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http("https://sepolia.base.org"),
  });

  console.log("Wallet:", account.address);
  console.log("Updating tokenURI for Agent #2122...");
  console.log("New URI:", NEW_URI);

  const hash = await walletClient.writeContract({
    address: IDENTITY_REGISTRY as `0x${string}`,
    abi: parseAbi([
      "function setAgentURI(uint256 agentId, string newURI) external",
    ]),
    functionName: "setAgentURI",
    args: [AGENT_ID, NEW_URI],
  });

  console.log("TX submitted:", hash);
  await publicClient.waitForTransactionReceipt({ hash });
  console.log("✅ TokenURI updated!");
  console.log("Basescan:", `https://sepolia.basescan.org/tx/${hash}`);
}

main().catch(console.error);
