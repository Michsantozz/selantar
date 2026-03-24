import { generateText, Output, tool } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";
import { z } from "zod";
import { NextResponse } from "next/server";

export const maxDuration = 60;
export const runtime = "nodejs";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

// Schema matches RiskItem[] from risk-review.tsx exactly
const RiskSchema = z.object({
  id: z.string(),
  clause: z.string(),
  title: z.string(),
  description: z.string(),
  severity: z.enum(["high", "medium", "low"]),
  originalText: z.string(),
  suggestion: z.string(),
});

const MilestoneSchema = z.object({
  id: z.string(),
  label: z.string(),
  value: z.string(),
  deadline: z.string(),
  deliverables: z.array(z.string()),
});

const ContractPlanSchema = z.object({
  summary: z.object({
    title: z.string(),
    client: z.string(),
    developer: z.string(),
    totalValue: z.string(),
    duration: z.string(),
    scope: z.string(),
  }),
  risks: z.array(RiskSchema),
  milestones: z.array(MilestoneSchema),
});

// Tool: the agent calls this to submit the parsed plan
const submitContractPlan = tool({
  description: "Submit the parsed contract plan with risks and milestones",
  inputSchema: ContractPlanSchema,
  execute: async (input) => {
    return { success: true, plan: input };
  },
});

export async function POST(req: Request) {
  const body = await req.json();
  const contractText = body?.contractText?.slice(0, 50000) ?? "";

  if (!contractText) {
    return NextResponse.json({ error: "contractText is required" }, { status: 400 });
  }

  try {
    const { text, toolResults } = await generateText({
      model: openrouter("openai/gpt-5.4-mini"),
      maxOutputTokens: 3000,
      tools: { submitContractPlan },
      toolChoice: "required",
      system: `You are a contract analysis agent for Selantar, a B2B dispute mediation platform on Hedera.

Your job: parse the contract and call the submitContractPlan tool with structured data.

Rules for risks:
- Find 4-6 risks in the contract
- Each risk MUST have: clause reference, title, description, severity (high/medium/low), original text from contract, and a concrete suggestion
- At least 1 high, 1 medium, 1 low severity
- Suggestions must be specific rewrites, not vague advice

Rules for milestones:
- Extract 3-5 payment milestones from the contract
- Each milestone needs: label (short name), value (amount with currency), deadline, and list of deliverables
- IDs should be m1, m2, m3, etc.

Rules for summary:
- Extract client name, developer name, total value, duration, scope
- Keep scope to 1 sentence

ALWAYS call the submitContractPlan tool. Never respond with text only.`,
      prompt: `Parse this contract:\n\n${contractText}`,
    });

    // AI SDK v6: toolResults[].output (not .result)
    for (const tr of toolResults ?? []) {
      if (tr.toolName === "submitContractPlan" && tr.output) {
        const output = tr.output as { success: boolean; plan: z.infer<typeof ContractPlanSchema> };
        return NextResponse.json(output.plan);
      }
    }

    return NextResponse.json({ error: "Agent did not produce a plan" }, { status: 500 });
  } catch (error) {
    console.error("[parse-contract] Error:", error);
    return NextResponse.json(
      { error: "Failed to parse contract" },
      { status: 500 }
    );
  }
}
