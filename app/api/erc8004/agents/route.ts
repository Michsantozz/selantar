import { createPublicClient, http, parseAbi } from "viem";
import { hederaTestnet } from "@/lib/hedera/chains";
import { ERC8004_ADDRESSES } from "@/lib/erc8004/addresses";
import { NextResponse } from "next/server";

const IDENTITY_ABI = parseAbi([
  "function ownerOf(uint256 agentId) view returns (address)",
  "function tokenURI(uint256 tokenId) view returns (string)",
  "function name() view returns (string)",
  "function symbol() view returns (string)",
]);

const client = createPublicClient({
  chain: hederaTestnet,
  transport: http("https://testnet.hashio.io/api"),
});

const registry = ERC8004_ADDRESSES.hederaTestnet.identityRegistry;

export async function GET() {
  try {
    // Scan agent IDs 1-40 to find registered agents
    const checks = Array.from({ length: 40 }, (_, i) => i + 1).map(async (id) => {
      try {
        const owner = await client.readContract({
          address: registry,
          abi: IDENTITY_ABI,
          functionName: "ownerOf",
          args: [BigInt(id)],
        });
        let uri = "";
        try {
          uri = await client.readContract({
            address: registry,
            abi: IDENTITY_ABI,
            functionName: "tokenURI",
            args: [BigInt(id)],
          }) as string;
        } catch {
          // tokenURI may not exist for all
        }
        return { id, owner, uri, registered: true };
      } catch {
        return null;
      }
    });

    const results = await Promise.all(checks);
    const agents = results.filter(Boolean);

    return NextResponse.json({
      registry,
      chain: "Hedera Testnet (296)",
      totalAgents: agents.length,
      agents,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to query Identity Registry" },
      { status: 500 }
    );
  }
}
