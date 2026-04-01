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
- Always respond in English regardless of the input language
- Keep labels SHORT (max 3-4 words, e.g. "Monitor GitHub", "Verify Staging")
- Keep descriptions SHORT (max 15 words — fits a small UI card)
- Keep rationale to 1 sentence max
- Keep riskNotes short (max 12 words each)
- Keep milestone labels short (max 3 words, e.g. "Design System", "Go-Live")
- Each action must be tied to a specific risk or milestone
- Icon must be one of: github, whatsapp, deploy, api, escrow, calendar, monitor, email, slack
- Frequency examples: "daily", "weekly", "pre-milestone", "per milestone", "on deadline"
- Generate unique IDs (e.g. "act-github-m1", "act-whatsapp-followup")
- Include milestone dates in the dates array (day and month extracted from deadline)
- Generate at least one action per milestone
- If the contract has GitHub references, include a GitHub monitoring action
- If there are high-severity risks, include more frequent follow-ups`,
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
Always respond in English regardless of the input language.
Keep all labels, descriptions, and notes SHORT (labels max 4 words, descriptions max 15 words).`,
    prompt: `Current plan:\n${currentPlan}\n\nContract data:\n${contractData}\n\nUser request: ${userMessage}`,
  });
  if (!output)
    throw new Error("adjustPlan: model failed to produce valid output");
  return output;
}
