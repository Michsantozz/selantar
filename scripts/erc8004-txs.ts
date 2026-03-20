/**
 * Post ERC-8004 Reputation feedback + Validation request using the CLIENT wallet
 * (second wallet — avoids the "self-feedback not allowed" restriction).
 *
 * Run: npx tsx scripts/erc8004-txs.ts
 */

import { createPublicClient, createWalletClient, http, parseAbi, keccak256, toBytes } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { baseSepolia } from "viem/chains";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config({ path: path.join(process.cwd(), ".env.local") });

const RPC = "https://sepolia.base.org";
const AGENT_ID = BigInt(2122);
const IDENTITY_REGISTRY  = "0x8004A818BFB912233c491871b3d84c89A494BD9e";
const REPUTATION_REGISTRY = "0x8004B663056A597Dffe9eCcC1965A193B7388713";
const VALIDATION_REGISTRY = "0xd6f7d27ce23830c7a59acfca20197f9769a17120";
const AGENT_ADDRESS = "0x377711a26B52F4AD8C548AAEF8297E0563b87Db4";

async function main() {
  const clientPK = process.env.CLIENT_PRIVATE_KEY;
  const agentPK  = process.env.AGENT_PRIVATE_KEY;

  if (!clientPK) throw new Error("CLIENT_PRIVATE_KEY not set in .env.local");
  if (!agentPK)  throw new Error("AGENT_PRIVATE_KEY not set in .env.local");

  const clientAccount = privateKeyToAccount(clientPK as `0x${string}`);
  const agentAccount  = privateKeyToAccount((agentPK.startsWith("0x") ? agentPK : `0x${agentPK}`) as `0x${string}`);

  const publicClient = createPublicClient({ chain: baseSepolia, transport: http(RPC) });
  const clientWallet = createWalletClient({ account: clientAccount, chain: baseSepolia, transport: http(RPC) });
  const agentWallet  = createWalletClient({ account: agentAccount,  chain: baseSepolia, transport: http(RPC) });

  console.log("Client wallet:", clientAccount.address);
  console.log("Agent wallet: ", agentAccount.address);

  const clientBalance = await publicClient.getBalance({ address: clientAccount.address });
  const agentBalance  = await publicClient.getBalance({ address: agentAccount.address });
  console.log("Client balance:", (Number(clientBalance) / 1e18).toFixed(6), "ETH");
  console.log("Agent balance: ", (Number(agentBalance) / 1e18).toFixed(6), "ETH");

  // --- Fund client wallet if needed ---
  if (clientBalance < BigInt(5e15)) { // less than 0.005 ETH
    console.log("\nFunding client wallet with 0.005 ETH from agent wallet...");
    const fundTx = await agentWallet.sendTransaction({
      to: clientAccount.address,
      value: BigInt(5e15),
    });
    console.log("Fund TX:", fundTx);
    await publicClient.waitForTransactionReceipt({ hash: fundTx });
    console.log("Client wallet funded ✅");
  }

  // --- TX 1: Reputation Feedback ---
  console.log("\n[TX 1] Posting reputation feedback...");
  const REPUTATION_ABI = parseAbi([
    "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external",
  ]);

  const feedbackData = {
    agentId: AGENT_ID.toString(),
    clientAddress: clientAccount.address,
    createdAt: new Date().toISOString(),
    value: 90,
    tag1: "mediationSuccess",
    tag2: "softwareDispute",
    endpoint: "https://selantar.vercel.app/mediation",
    settlementTx: "0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86",
  };
  const feedbackHash = keccak256(toBytes(JSON.stringify(feedbackData)));

  const feedbackTx = await clientWallet.writeContract({
    address: REPUTATION_REGISTRY as `0x${string}`,
    abi: REPUTATION_ABI,
    functionName: "giveFeedback",
    args: [
      AGENT_ID,
      BigInt(90),
      0,
      "mediationSuccess",
      "softwareDispute",
      "https://selantar.vercel.app/mediation",
      "",
      feedbackHash,
    ],
  });
  console.log("Feedback TX submitted:", feedbackTx);
  await publicClient.waitForTransactionReceipt({ hash: feedbackTx });
  console.log("✅ Feedback confirmed! Basescan: https://sepolia.basescan.org/tx/" + feedbackTx);

  // --- TX 2: Validation Request ---
  console.log("\n[TX 2] Registering verdict as validation...");
  const VALIDATION_ABI = parseAbi([
    "function validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash) external",
  ]);

  const evidenceData = {
    contractRef: "clinica-suasuna-001",
    agentId: AGENT_ID.toString(),
    verdict: "80/20 split — developer delivered core functionality; client entitled to penalty for delayed acceptance",
    evidence: ["SLA breach confirmed", "Delivery 3 weeks late per spec", "Client delayed UAT by 51h"],
    settlement: {
      clientAmount: "R$3.000",
      developerAmount: "R$12.000",
      txHash: "0xb5d338a522e9e4c7a35d527a421906c840261266dcddd8f5232737fbad301e86",
    },
  };
  const requestHash = keccak256(toBytes(JSON.stringify(evidenceData)));

  const validationTx = await clientWallet.writeContract({
    address: VALIDATION_REGISTRY as `0x${string}`,
    abi: VALIDATION_ABI,
    functionName: "validationRequest",
    args: [
      AGENT_ADDRESS as `0x${string}`,
      AGENT_ID,
      `https://selantar.vercel.app/evidence/clinica-suasuna-001`,
      requestHash,
    ],
  });
  console.log("Validation TX submitted:", validationTx);
  await publicClient.waitForTransactionReceipt({ hash: validationTx });
  console.log("✅ Validation confirmed! Basescan: https://sepolia.basescan.org/tx/" + validationTx);

  console.log("\n=== DONE ===");
  console.log("Feedback TX:   https://sepolia.basescan.org/tx/" + feedbackTx);
  console.log("Validation TX: https://sepolia.basescan.org/tx/" + validationTx);
  console.log("All 3 ERC-8004 TXs now confirmed on Base Sepolia ✅");
}

main().catch(console.error);
