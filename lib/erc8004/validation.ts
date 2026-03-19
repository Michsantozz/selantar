import { parseAbi, keccak256, toBytes } from "viem";
import { ERC8004_ADDRESSES } from "./addresses";

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
): Promise<string> {
  const evidenceJson = JSON.stringify(evidence);
  const requestHash = keccak256(toBytes(evidenceJson));

  const validator = validatorAddress ?? walletClient.account.address;

  const hash = await walletClient.writeContract({
    address: ERC8004_ADDRESSES.baseSepolia.validationRegistry,
    abi: VALIDATION_ABI,
    functionName: "validationRequest",
    args: [
      validator,
      agentId,
      `https://selantar.xyz/evidence/${evidence.contractRef}`,
      requestHash,
    ],
  });

  console.log("Verdict evidence registered on-chain! TX:", hash);
  console.log("Request Hash:", requestHash);
  return hash;
}
