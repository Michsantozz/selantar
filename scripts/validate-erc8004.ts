import { createPublicClient, http, parseAbi, getAddress } from "viem";
import { baseSepolia, base } from "viem/chains";

const IDENTITY_ABI = parseAbi([
  "function name() view returns (string)",
  "function symbol() view returns (string)",
]);

const ADDRESSES = {
  baseSepolia: {
    identityRegistry: "0x8004A818BFB912233c491871b3d84c89A494BD9e" as `0x${string}`,
    reputationRegistry: "0x8004B663056A597Dffe9eCcC1965A193B7388713" as `0x${string}`,
  },
  base: {
    identityRegistry: "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432" as `0x${string}`,
    reputationRegistry: "0x8004BAa17C55a88189AE136b182e5fdA19dE9b63" as `0x${string}`,
  },
};

async function validateNetwork(
  networkName: string,
  chain: typeof baseSepolia | typeof base,
  addresses: (typeof ADDRESSES)["baseSepolia"]
) {
  console.log(`\n=== ${networkName} ===`);

  const client = createPublicClient({
    chain,
    transport: http(),
  });

  // Check Identity Registry has code deployed
  const identityCode = await client.getCode({ address: addresses.identityRegistry });
  const hasIdentityCode = identityCode && identityCode !== "0x";
  console.log(`Identity Registry (${addresses.identityRegistry}): ${hasIdentityCode ? "DEPLOYED" : "NO CODE"}`);

  if (hasIdentityCode) {
    try {
      const [name, symbol] = await Promise.all([
        client.readContract({
          address: addresses.identityRegistry,
          abi: IDENTITY_ABI,
          functionName: "name",
        }),
        client.readContract({
          address: addresses.identityRegistry,
          abi: IDENTITY_ABI,
          functionName: "symbol",
        }),
      ]);
      console.log(`  Name: ${name}, Symbol: ${symbol}`);
    } catch (e: any) {
      console.log(`  (name/symbol not available — might be proxy)`);
    }
  }

  // Check Reputation Registry has code deployed
  const reputationCode = await client.getCode({ address: addresses.reputationRegistry });
  const hasReputationCode = reputationCode && reputationCode !== "0x";
  console.log(`Reputation Registry (${addresses.reputationRegistry}): ${hasReputationCode ? "DEPLOYED" : "NO CODE"}`);
}

async function main() {
  console.log("Validating ERC-8004 contracts on-chain...");
  await validateNetwork("Base Sepolia (testnet)", baseSepolia, ADDRESSES.baseSepolia);
  await validateNetwork("Base Mainnet", base, ADDRESSES.base);
  console.log("\n--- RESULT ---");
  console.log("If all show DEPLOYED, the ERC-8004 integration is viable.");
  console.log("Next step: register the agent with a funded wallet (needs ETH for gas).");
}

main().catch(console.error);
