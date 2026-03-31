import { parseAbi, keccak256, toBytes } from "viem";
import { ERC8004_ADDRESSES } from "./addresses";
import { simulateAndWrite } from "@/lib/wallet";
import { canonicalJSON } from "@/lib/canonical-json";
import { pinEvidence } from "@/lib/ipfs";
import type { FilecoinResult } from "@/lib/ipfs";
import { buildDualURI } from "@/lib/filecoin";

const REPUTATION_ABI = parseAbi([
  "function giveFeedback(uint256 agentId, int128 value, uint8 valueDecimals, string tag1, string tag2, string endpoint, string feedbackURI, bytes32 feedbackHash) external",
]);

export interface MediationResult {
  contractId: string;
  settlementTxHash: string;
  clientSatisfaction: number; // 0-100
  resolutionTimeMs: number;
  disputeType: string;
}

/**
 * Post feedback on-chain after a completed mediation.
 * Call at the end of the mediation flow, when transfers are confirmed.
 */
export async function postMediationFeedback(
  walletClient: any,
  agentId: bigint,
  result: MediationResult
): Promise<{ txHash: string; ipfsCid: string; filecoinPromise: Promise<FilecoinResult | null> }> {
  const feedbackData = {
    agentRegistry: `eip155:84532:${ERC8004_ADDRESSES.baseSepolia.identityRegistry}`,
    agentId: agentId.toString(),
    clientAddress: walletClient.account.address,
    createdAt: new Date().toISOString(),
    value: result.clientSatisfaction,
    valueDecimals: 0,
    tag1: "mediationSuccess",
    tag2: result.disputeType,
    endpoint: "https://selantar.vercel.app/mediation",
    proofOfPayment: {
      txHash: result.settlementTxHash,
      chainId: "84532",
    },
  };

  const feedbackJson = canonicalJSON(feedbackData);
  const feedbackHash = keccak256(toBytes(feedbackJson));

  // Pin feedback evidence to IPFS — verifiable by anyone with the CID
  let feedbackURI = "";
  let ipfsCid = "";
  let filecoinPromise: Promise<FilecoinResult | null> = Promise.resolve(null);
  try {
    const { cid, filecoinPromise: fp } = await pinEvidence(feedbackData, `selantar-feedback-${result.contractId}`);
    ipfsCid = cid;
    filecoinPromise = fp;
    feedbackURI = buildDualURI(cid);
  } catch (e) {
    console.warn("IPFS pin failed, writing on-chain without URI:", (e as Error).message);
  }

  const hash = await simulateAndWrite(walletClient, {
    address: ERC8004_ADDRESSES.baseSepolia.reputationRegistry,
    abi: REPUTATION_ABI,
    functionName: "giveFeedback",
    args: [
      agentId,
      BigInt(result.clientSatisfaction),
      0,
      "mediationSuccess",
      result.disputeType,
      "https://selantar.vercel.app/mediation",
      feedbackURI,
      feedbackHash,
    ],
  });

  return { txHash: hash, ipfsCid, filecoinPromise };
}
