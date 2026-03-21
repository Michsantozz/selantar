import { createDelegation } from "@metamask/smart-accounts-kit";
import type {
  Delegation,
  MetaMaskSmartAccount,
  SmartAccountsEnvironment,
} from "@metamask/smart-accounts-kit";
import { type Hex, toHex } from "viem";

// Create and sign a delegation from a party to the agent
// Scope: nativeTokenTransferAmount — limits ETH the agent can move
export async function createAndSignDelegation(params: {
  delegatorAccount: MetaMaskSmartAccount;
  agentAddress: Hex;
  environment: SmartAccountsEnvironment;
  maxAmount: bigint; // in wei
}): Promise<Delegation> {
  const { delegatorAccount, agentAddress, environment, maxAmount } = params;

  // Unique salt per delegation so the enforcer treats each as a fresh allowance
  const salt = toHex(BigInt(Date.now()) * 1000000n + BigInt(Math.floor(Math.random() * 1000000)), { size: 32 });

  // Create the delegation with native ETH transfer scope
  const delegation = createDelegation({
    scope: {
      type: "nativeTokenTransferAmount" as const,
      maxAmount,
    },
    to: agentAddress,
    from: delegatorAccount.address,
    environment,
    salt,
  });

  // Sign the delegation with the delegator's smart account
  const signature = await delegatorAccount.signDelegation({
    delegation,
  });

  // Return delegation with signature attached
  return {
    ...delegation,
    signature,
  };
}
