import { ToolLoopAgent, InferAgentUIMessage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import { parseContract } from "@/lib/tools/parse-contract";

export function createContractParserAgent() {
  return new ToolLoopAgent({
    model: openai("gpt-5.4-2026-03-05"),
    instructions: `You are Selantar's contract analysis engine.

When you receive a contract, call parseContract immediately with the full text.
After the tool returns, write a brief summary (2-3 sentences) of what was found:
- Number of parties and their roles
- Number of risks found and highest severity
- Number of milestones and total value
- Overall assessment (safe / needs attention / risky)
- Note any analysis steps that failed (null fields)

Be concise. No markdown formatting. Respond in the same language as the contract.`,
    tools: { parseContract },
    stopWhen: stepCountIs(3),
  });
}

export type ContractParserMessage = InferAgentUIMessage<
  ReturnType<typeof createContractParserAgent>
>;
