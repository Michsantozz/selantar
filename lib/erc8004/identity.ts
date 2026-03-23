import { createPublicClient, http, parseAbi } from "viem";
import { hederaTestnet } from "@/lib/hedera/chains";
import { ERC8004_ADDRESSES } from "./addresses";

const IDENTITY_ABI = parseAbi([
  "function register(string agentURI) returns (uint256 agentId)",
  "function setAgentURI(uint256 agentId, string newURI) external",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
]);

/**
 * Register Selantar on the Identity Registry.
 * Run ONCE during initial project setup.
 * Save the returned agentId in .env and agent.json
 */
export async function registerSelantarAgent(
  walletClient: any,
  agentJsonUrl: string
): Promise<bigint> {
  const hash = await walletClient.writeContract({
    address: ERC8004_ADDRESSES.hederaTestnet.identityRegistry,
    abi: IDENTITY_ABI,
    functionName: "register",
    args: [agentJsonUrl],
  });

  console.log("Selantar registered! TX:", hash);

  const publicClient = createPublicClient({
    chain: hederaTestnet,
    transport: http("https://testnet.hashio.io/api"),
  });
  const receipt = await publicClient.waitForTransactionReceipt({ hash });

  const log = receipt.logs[0];
  const agentId = BigInt(log.topics[1] ?? "0");

  console.log("Agent ID:", agentId.toString());
  console.log("Update AGENT_ID in .env and agent.json!");

  return agentId;
}
