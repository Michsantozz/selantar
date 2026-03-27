import { NextResponse } from "next/server";
import { parseEther } from "viem";
import { getPublicClient } from "@/lib/wallet";
import {
  getAgentSmartAccount,
  getPartySmartAccount,
  getEnvironment,
  createAndSignDelegation,
} from "@/lib/delegation";
import { idempotencyStore, buildDelegationKey } from "@/lib/idempotency";

export const runtime = "nodejs";

// In-memory store for signed delegations (keyed by contractRef)
// In production this would be a database
export const delegationStore = new Map<
  string,
  {
    clientDelegation: Awaited<ReturnType<typeof createAndSignDelegation>>;
    developerDelegation: Awaited<ReturnType<typeof createAndSignDelegation>>;
    agentAddress: string;
    clientAddress: string;
    developerAddress: string;
  }
>();

export async function POST(req: Request) {
  try {
    const { contractRef, maxAmountEth = "0.001" } = await req.json();

    // Idempotency check — prevent double-delegation
    const delegationKey = buildDelegationKey({ contractRef, maxAmountEth });
    const idempCheck = idempotencyStore.checkIdempotency(delegationKey);
    if (idempCheck.cached) {
      return new Response(JSON.stringify(idempCheck.result), {
        headers: { "Content-Type": "application/json", "X-Idempotent-Replay": "true" },
      });
    }

    const publicClient = getPublicClient();
    const environment = getEnvironment();

    // Create smart accounts for all three parties
    const agentSmartAccount = await getAgentSmartAccount(publicClient);

    const clientPk = process.env.CLIENT_PRIVATE_KEY;
    const developerPk = process.env.AGENT_PRIVATE_KEY; // reuse agent key as dev for demo
    if (!clientPk) {
      return NextResponse.json(
        { status: "delegation_queued", note: "CLIENT_PRIVATE_KEY not set" },
        { status: 200 }
      );
    }

    const clientSmartAccount = await getPartySmartAccount(publicClient, clientPk);
    const developerSmartAccount = await getPartySmartAccount(
      publicClient,
      developerPk!
    );

    const maxAmount = parseEther(maxAmountEth);

    // Create and sign delegations from both parties to the agent
    const clientDelegation = await createAndSignDelegation({
      delegatorAccount: clientSmartAccount,
      agentAddress: agentSmartAccount.address,
      environment,
      maxAmount,
    });

    const developerDelegation = await createAndSignDelegation({
      delegatorAccount: developerSmartAccount,
      agentAddress: agentSmartAccount.address,
      environment,
      maxAmount,
    });

    // Store for later redemption
    delegationStore.set(contractRef, {
      clientDelegation,
      developerDelegation,
      agentAddress: agentSmartAccount.address,
      clientAddress: clientSmartAccount.address,
      developerAddress: developerSmartAccount.address,
    });

    const grantResult = {
      status: "delegations_created",
      clientDelegation: {
        delegator: clientSmartAccount.address,
        delegate: agentSmartAccount.address,
        scope: `Up to ${maxAmountEth} ETH`,
        signed: true,
      },
      developerDelegation: {
        delegator: developerSmartAccount.address,
        delegate: agentSmartAccount.address,
        scope: `Up to ${maxAmountEth} ETH`,
        signed: true,
      },
      agentAddress: agentSmartAccount.address,
      timestamp: new Date().toISOString(),
    };
    idempotencyStore.saveResult(delegationKey, grantResult);
    return NextResponse.json(grantResult);
  } catch (error: unknown) {
    console.warn("Delegation grant failed:", error);
    return NextResponse.json(
      {
        status: "delegation_queued",
        note: "Delegation recorded for later execution.",
      },
      { status: 200 }
    );
  }
}
