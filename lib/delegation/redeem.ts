import {
  createExecution,
  ExecutionMode,
} from "@metamask/smart-accounts-kit";
import { DelegationManager } from "@metamask/delegation-abis";
import type { Delegation } from "@metamask/smart-accounts-kit";
import {
  encodeFunctionData,
  encodePacked,
  encodeAbiParameters,
  type Hex,
} from "viem";
import { createBundlerClient } from "viem/account-abstraction";
import { http } from "viem";
import type { Client } from "viem";
import { baseSepolia } from "viem/chains";
import { getPublicClient } from "@/lib/wallet";
import { getEnvironment, getAgentSmartAccount } from "./smart-accounts";

function getBundlerTransport() {
  const apiKey = process.env.PIMLICO_API_KEY;
  if (!apiKey) throw new Error("PIMLICO_API_KEY not set");
  return http(`https://api.pimlico.io/v2/84532/rpc?apikey=${apiKey}`);
}

// Encode a delegation chain into bytes for redeemDelegations
function encodeDelegationChain(delegations: Delegation[]): Hex {
  return encodeAbiParameters(
    [
      {
        type: "tuple[]",
        components: [
          { name: "delegate", type: "address" },
          { name: "delegator", type: "address" },
          { name: "authority", type: "bytes32" },
          {
            name: "caveats",
            type: "tuple[]",
            components: [
              { name: "enforcer", type: "address" },
              { name: "terms", type: "bytes" },
              { name: "args", type: "bytes" },
            ],
          },
          { name: "salt", type: "uint256" },
          { name: "signature", type: "bytes" },
        ],
      },
    ],
    [
      delegations.map((d) => ({
        delegate: d.delegate as `0x${string}`,
        delegator: d.delegator as `0x${string}`,
        authority: d.authority as `0x${string}`,
        caveats: d.caveats.map((c) => ({
          enforcer: c.enforcer as `0x${string}`,
          terms: c.terms as `0x${string}`,
          args: c.args as `0x${string}`,
        })),
        salt: d.salt === "0x" || d.salt === "" ? 0n : BigInt(d.salt),
        signature: d.signature as `0x${string}`,
      })),
    ]
  );
}

// Encode execution calldata: target (20 bytes) + value (32 bytes) + callData
function encodeExecutionCalldata(target: Hex, value: bigint, callData: Hex): Hex {
  return encodePacked(
    ["address", "uint256", "bytes"],
    [target, value, callData]
  );
}

// Redeem a signed delegation to transfer native ETH on behalf of the delegator.
// Uses Pimlico bundler (ERC-4337) so the smart account is msg.sender.
export async function redeemSettlementDelegation(params: {
  signedDelegation: Delegation;
  recipientAddress: Hex;
  amount: bigint; // in wei
}): Promise<{ userOpHash: string }> {
  const { signedDelegation, recipientAddress, amount } = params;

  const publicClient = getPublicClient();
  const environment = getEnvironment();
  const agentSmartAccount = await getAgentSmartAccount(publicClient);

  // Native ETH transfer — empty calldata, value = amount
  const executionCalldata = encodeExecutionCalldata(
    recipientAddress,
    amount,
    "0x" as Hex
  );

  const permissionContext = encodeDelegationChain([signedDelegation]);

  const redeemCalldata = encodeFunctionData({
    abi: DelegationManager,
    functionName: "redeemDelegations",
    args: [
      [permissionContext],
      [ExecutionMode.SingleDefault],
      [executionCalldata],
    ],
  });

  // Bundler client with Pimlico
  const bundlerClient = createBundlerClient({
    client: publicClient as Client,
    transport: getBundlerTransport(),
    chain: baseSepolia,
    paymaster: true,
  });

  // Send UserOperation FROM the agent smart account (the delegate)
  const userOpHash = await bundlerClient.sendUserOperation({
    account: agentSmartAccount,
    calls: [
      {
        to: environment.DelegationManager,
        data: redeemCalldata,
      },
    ],
  });

  return { userOpHash };
}
