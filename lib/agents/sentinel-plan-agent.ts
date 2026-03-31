import { ToolLoopAgent, InferAgentUIMessage, stepCountIs } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  generateMonitoringPlan,
  adjustPlan,
} from "@/lib/tools/sentinel-plan-tools";

export function createSentinelPlanAgent() {
  return new ToolLoopAgent({
    model: openai("gpt-5.4-2026-03-05"),
    instructions: `You are Selantar's Sentinel. You create monitoring plans for contracts.

When you receive contract data, call generateMonitoringPlan immediately with the full JSON.
When the user asks to adjust the plan, call adjustPlan with their request, the current plan, and the contract data.

After generating or adjusting a plan, write a brief summary:
- How many actions were suggested and what they cover
- Key risks that influenced the plan
- What the user can ask you to change

Always be concise. Respond in the same language as the user.`,
    tools: { generateMonitoringPlan, adjustPlan },
    stopWhen: stepCountIs(5),
  });
}

export type SentinelPlanMessage = InferAgentUIMessage<
  ReturnType<typeof createSentinelPlanAgent>
>;
