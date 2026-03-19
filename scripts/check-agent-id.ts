import { createPublicClient, http, parseAbi, decodeEventLog } from "viem";
import { baseSepolia } from "viem/chains";

const IDENTITY_ABI = parseAbi([
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
]);

async function main() {
  const client = createPublicClient({
    chain: baseSepolia,
    transport: http(),
  });

  const receipt = await client.getTransactionReceipt({
    hash: "0xd29614b2692fb8aa19e529ea2cfa99c66524df4571ef1e2bc3ae2e26afe5b45c" as `0x${string}`,
  });

  console.log("TX Status:", receipt.status);
  console.log("Logs count:", receipt.logs.length);

  for (const log of receipt.logs) {
    console.log("\nLog:", log.address);
    console.log("Topics:", log.topics);
    try {
      const decoded = decodeEventLog({
        abi: IDENTITY_ABI,
        data: log.data,
        topics: log.topics,
      });
      console.log("Decoded event:", decoded);
      console.log("AGENT ID:", decoded.args.agentId.toString());
    } catch {
      // Not our event, try raw
      console.log("Raw topic[1] (agentId):", BigInt(log.topics[1] ?? "0").toString());
    }
  }
}

main().catch(console.error);
