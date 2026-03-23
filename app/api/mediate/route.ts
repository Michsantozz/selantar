import { NextRequest, NextResponse } from "next/server";
import { withX402 } from "x402-next";
import { generateText, stepCountIs } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

import { analyzeEvidence } from "@/lib/tools/analyze-evidence";
import { proposeSettlement } from "@/lib/tools/propose-settlement";
import { executeSettlement } from "@/lib/tools/execute-settlement";
import { postFeedback } from "@/lib/tools/post-feedback";
import { registerVerdict } from "@/lib/tools/register-verdict";

export const maxDuration = 120;
export const runtime = "nodejs";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// The mediation handler — receives dispute, runs full mediation, returns verdict
const handler = async (req: NextRequest): Promise<NextResponse> => {
  const body = await req.json();
  const { contract, dispute, evidence } = body;

  if (!contract || !dispute) {
    return NextResponse.json(
      { error: "Missing required fields: contract, dispute" },
      { status: 400 }
    );
  }

  const disputeContext = `
## Contract
${typeof contract === "string" ? contract : JSON.stringify(contract, null, 2)}

## Dispute
${typeof dispute === "string" ? dispute : JSON.stringify(dispute, null, 2)}

${evidence ? `## Evidence\n${typeof evidence === "string" ? evidence : JSON.stringify(evidence, null, 2)}` : ""}
`.trim();

  const { text, steps } = await generateText({
    model: openrouter("openai/gpt-5.4-mini"),
    maxOutputTokens: 4096,
    stopWhen: stepCountIs(10),
    system: `You are Clara, a senior mediator at Selantar — an autonomous B2B dispute resolution service.

You received a mediation request via API from another agent or service. This is a single-shot mediation: analyze everything, run your tools, and produce a final verdict.

## Your process (execute ALL steps):
1. Analyze all evidence using analyzeEvidence (run multiple times for different perspectives/types)
2. Based on analysis, propose a fair settlement using proposeSettlement
3. Execute the settlement on-chain using executeSettlement
4. Post reputation feedback using postFeedback
5. Register the verdict as verifiable evidence using registerVerdict

## Output format
After running all tools, write your FINAL RESPONSE as a structured verdict:
- Start with "VERDICT:" on the first line
- Summarize your assessment (2-3 paragraphs)
- State the settlement split with amounts
- List the conditions
- Reference all on-chain transaction hashes

Be direct, fair, and concrete. No fluff.`,
    prompt: disputeContext,
    tools: {
      analyzeEvidence,
      proposeSettlement,
      executeSettlement,
      postFeedback,
      registerVerdict,
    },
  });

  // Extract tool results from steps for the structured response
  const toolResults: Record<string, unknown>[] = [];
  const txHashes: string[] = [];

  for (const step of steps) {
    for (const call of step.toolCalls) {
      const result = step.toolResults.find(
        (r: { toolCallId: string }) => r.toolCallId === call.toolCallId
      );
      if (result) {
        const output = (result.output ?? {}) as Record<string, unknown>;
        toolResults.push({
          tool: call.toolName,
          input: call.input,
          output,
        });
        // Collect tx hashes
        if (output.txHash) txHashes.push(output.txHash as string);
        if (output.feedbackTxHash) txHashes.push(output.feedbackTxHash as string);
        if (output.validationTxHash) txHashes.push(output.validationTxHash as string);
      }
    }
  }

  // Find settlement proposal and execution results
  const settlement = toolResults.find((r) => r.tool === "proposeSettlement");
  const execution = toolResults.find((r) => r.tool === "executeSettlement");
  const feedback = toolResults.find((r) => r.tool === "postFeedback");
  const validation = toolResults.find((r) => r.tool === "registerVerdict");

  return NextResponse.json({
    verdict: text,
    settlement: settlement?.output ?? null,
    execution: execution?.output ?? null,
    erc8004: {
      feedback: feedback?.output ?? null,
      validation: validation?.output ?? null,
    },
    txHashes,
    toolExecutions: toolResults.length,
    timestamp: new Date().toISOString(),
  });
};

// Use env var for wallet address — derived at runtime from AGENT_PRIVATE_KEY
import { getWalletClient } from "@/lib/wallet";
const SELANTAR_WALLET = (() => {
  try { return getWalletClient().account.address; }
  catch { return (process.env.AGENT_WALLET_ADDRESS ?? "0x0") as `0x${string}`; }
})();

export const POST = withX402(handler, SELANTAR_WALLET, {
  price: "$0.10",
  network: "base-sepolia",
  config: {
    description: "Selantar AI Mediation — autonomous B2B dispute resolution with on-chain settlement and ERC-8004 receipts",
  },
});

// GET — service discovery (no payment required)
export async function GET() {
  return NextResponse.json({
    service: "Selantar Mediation",
    description:
      "Autonomous B2B dispute resolution with AI-powered mediation, on-chain settlement, and ERC-8004 verifiable receipts",
    protocol: "x402",
    price: "$0.10 USDC",
    network: "base-sepolia",
    method: "POST",
    endpoint: "/api/mediate",
    inputSchema: {
      contract: {
        type: "string | object",
        required: true,
        description: "Contract text or structured contract data",
      },
      dispute: {
        type: "string | object",
        required: true,
        description: "Dispute description or structured dispute data",
      },
      evidence: {
        type: "string | object | array",
        required: false,
        description: "Supporting evidence (documents, communications, deliverables)",
      },
    },
    outputSchema: {
      verdict: "string — mediator's final assessment and decision",
      settlement: "object — proposed fund distribution with amounts and conditions",
      execution: "object — on-chain settlement execution details with tx hash",
      erc8004: {
        feedback: "object — reputation feedback posted to ERC-8004 Reputation Registry",
        validation: "object — verdict registered on ERC-8004 Validation Registry",
      },
      txHashes: "string[] — all on-chain transaction hashes",
    },
    erc8004: {
      agentId: process.env.SELANTAR_AGENT_ID ?? "2122",
      registries: {
        identity: "0x8004A818BFB912233c491871b3d84c89A494BD9e",
        reputation: "0x8004B663056A597Dffe9eCcC1965A193B7388713",
        validation: "0xd6f7d27ce23830c7a59acfca20197f9769a17120",
      },
    },
  });
}
