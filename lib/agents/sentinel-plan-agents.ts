import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  MonitoringPlanSchema,
  type MonitoringPlan,
} from "@/lib/schemas/sentinel-plan";

const model = openai("gpt-5.4-2026-03-05");

export async function generateMonitoringPlan(
  contractData: string,
  signal?: AbortSignal
): Promise<MonitoringPlan> {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: MonitoringPlanSchema }),
    system: `You are Selantar's Sentinel — an AI contract monitoring specialist.
You receive parsed contract data (JSON with header, risks, milestones, clauseScores, deployPlan) and generate a monitoring plan with specific actions.

Analyze the contract's parties, milestones, risks, and clause scores to create targeted monitoring actions.

Rules:
- Each action must be tied to a specific risk or milestone
- Icon must be one of: github, whatsapp, deploy, api, escrow, calendar, monitor, email, slack
- Frequency examples: "daily", "weekly", "pre-milestone", "per milestone", "on deadline"
- Generate unique IDs (e.g. "act-github-m1", "act-whatsapp-followup")
- Include rationale explaining WHY this action is needed based on contract analysis
- Include milestone dates in the dates array (day and month extracted from deadline)
- Include risk-based observations in riskNotes
- Generate at least one action per milestone
- If the contract has GitHub references, include a GitHub monitoring action
- If there are high-severity risks, include more frequent follow-ups
- Respond in the same language as the contract data`,
    prompt: contractData,
  });
  if (!output)
    throw new Error(
      "generateMonitoringPlan: model failed to produce valid output"
    );
  return output;
}

export async function adjustPlan(
  userMessage: string,
  currentPlan: string,
  contractData: string,
  signal?: AbortSignal
): Promise<MonitoringPlan> {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: MonitoringPlanSchema }),
    system: `You are Selantar's Sentinel — an AI contract monitoring specialist.
You receive a current monitoring plan and a user request to modify it.

Modify the plan according to the user's request. You can:
- Add new monitoring actions
- Remove existing actions
- Change frequency, target, or description of actions
- Reassign actions to different milestones
- Update risk notes

Preserve action IDs for unchanged actions. Generate new IDs for new actions.
Return the COMPLETE updated plan (not just the changes).
Respond in the same language as the user message.`,
    prompt: `Current plan:\n${currentPlan}\n\nContract data:\n${contractData}\n\nUser request: ${userMessage}`,
  });
  if (!output)
    throw new Error("adjustPlan: model failed to produce valid output");
  return output;
}
