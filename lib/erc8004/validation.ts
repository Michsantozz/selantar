import { parseAbi, keccak256, toBytes } from "viem";
import { ERC8004_ADDRESSES } from "./addresses";
import { simulateAndWrite } from "@/lib/wallet";
import { canonicalJSON } from "@/lib/canonical-json";
import { pinEvidence } from "@/lib/ipfs";
import type { FilecoinResult } from "@/lib/ipfs";
import { buildDualURI } from "@/lib/filecoin";

const VALIDATION_ABI = parseAbi([
  "function validationRequest(address validatorAddress, uint256 agentId, string requestURI, bytes32 requestHash) external",
  "function getValidationStatus(bytes32 requestHash) external view returns (address, uint256, uint8, bytes32, string, uint256)",
]);

export interface SelantarEvidence {
  contractRef: string;
  evidence: string[];
  settlement: {
    clientAmount: string;
    developerAmount: string;
    txHashes: string[];
  };
  reasoning: string;
}

/**
 * Register the verdict as verifiable evidence on-chain.
 * Optional but significantly increases the "Verifiability" score.
 */
export async function registerVerdictAsValidation(
  walletClient: any,
  agentId: bigint,
  evidence: SelantarEvidence,
  validatorAddress?: string
): Promise<{ txHash: string; ipfsCid: string; filecoinPromise: Promise<FilecoinResult | null> }> {
  const evidenceJson = canonicalJSON(evidence);
  const requestHash = keccak256(toBytes(evidenceJson));

  // Pin verdict evidence to IPFS — permanent, verifiable by anyone with the CID
  let requestURI = `https://selantar.vercel.app/evidence/${evidence.contractRef}`;
  let ipfsCid = "";
  let filecoinPromise: Promise<FilecoinResult | null> = Promise.resolve(null);
  try {
    const { cid, filecoinPromise: fp } = await pinEvidence(evidence, `selantar-verdict-${evidence.contractRef}`);
    ipfsCid = cid;
    filecoinPromise = fp;
    requestURI = buildDualURI(cid);
  } catch (e) {
    console.warn("IPFS pin failed, falling back to Vercel URL:", (e as Error).message);
  }

  const validator = validatorAddress ?? walletClient.account.address;

  const hash = await simulateAndWrite(walletClient, {
    address: ERC8004_ADDRESSES.baseSepolia.validationRegistry,
    abi: VALIDATION_ABI,
    functionName: "validationRequest",
    args: [
      validator,
      agentId,
      requestURI,
      requestHash,
    ],
  });

  return { txHash: hash, ipfsCid, filecoinPromise };
}
