import { createWalletClient, http } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import { registerSelantarAgent } from "../lib/erc8004/identity";

async function main() {
  const account = privateKeyToAccount(
    process.env.AGENT_PRIVATE_KEY as `0x${string}`
  );

  const walletClient = createWalletClient({
    account,
    chain: baseSepolia,
    transport: http(),
  });

  const agentJsonUrl = "https://selantar.vercel.app/agent.json";

  const agentId = await registerSelantarAgent(walletClient, agentJsonUrl);

  console.log("\nSetup complete!");
  console.log("Add to .env:");
  console.log(`SELANTAR_AGENT_ID=${agentId.toString()}`);
  console.log("\nUpdate agent.json with agentId:", agentId.toString());
}

main().catch(console.error);
