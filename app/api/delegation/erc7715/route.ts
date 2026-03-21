import { NextResponse } from "next/server";
import { parseEther } from "viem";
import { redeemWithPermissionsContext } from "@/lib/delegation/erc7715";

export const runtime = "nodejs";
export const maxDuration = 120;

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const { permissionsContext, delegationManager, recipientAddress, amount } =
      body as {
        permissionsContext: `0x${string}`;
        delegationManager: `0x${string}`;
        recipientAddress: `0x${string}`;
        amount: string;
      };

    if (!permissionsContext || !delegationManager || !recipientAddress || !amount) {
      return NextResponse.json(
        { error: "Missing required fields: permissionsContext, delegationManager, recipientAddress, amount" },
        { status: 400 }
      );
    }

    const { userOpHash } = await redeemWithPermissionsContext({
      permissionsContext,
      delegationManager,
      recipientAddress,
      amount: parseEther(amount),
    });

    return NextResponse.json({
      userOpHash,
      explorer: `https://sepolia.basescan.org/tx/${userOpHash}`,
    });
  } catch (error) {
    console.error("ERC-7715 redeem failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "ERC-7715 redeem failed" },
      { status: 500 }
    );
  }
}
