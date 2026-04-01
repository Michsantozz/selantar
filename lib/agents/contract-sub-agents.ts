import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import {
  ContractHeaderSchema,
  RisksOutputSchema,
  MilestonesOutputSchema,
  ClauseScoresOutputSchema,
  DeployPlanOutputSchema,
  type RiskItem,
  type Milestone,
  type Party,
} from "@/lib/schemas/contract-parse";

const model = openai("gpt-5.4-2026-03-05");

// -- PHASE 1: Parallel --

export async function extractParties(
  contractText: string,
  signal: AbortSignal
) {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: ContractHeaderSchema }),
    system: `You extract structured metadata from contracts.
Extract: all parties (name, role, CNPJ/CPF, representative, city, initials for avatar),
payment info (total value as formatted string e.g. "R$ 15.000,00", terms),
timeline (start/end as ISO dates, duration in days), and jurisdiction.
Generate unique 2-letter initials for each party (use first letters of name).
Always respond in English.`,
    prompt: contractText,
  });
  if (!output)
    throw new Error("extractParties: model failed to produce valid output");
  return output;
}

export async function analyzeRisks(
  contractText: string,
  signal: AbortSignal
) {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: RisksOutputSchema }),
    system: `You are a contract risk analyst. Identify risky, vague, or unfair clauses.
For each risk: cite the exact clause number, give it a title, explain the risk,
quote the original text, classify severity (high/medium/low), and suggest an improvement.
Generate a unique ID per risk (e.g. "risk-1", "risk-2").
Find at least 3 risks. Always respond in English.`,
    prompt: contractText,
  });
  if (!output)
    throw new Error("analyzeRisks: model failed to produce valid output");
  return output;
}

export async function extractMilestones(
  contractText: string,
  signal: AbortSignal
) {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: MilestonesOutputSchema }),
    system: `You extract project milestones from contracts.
For each milestone: name, monetary value as a PLAIN NUMBER without currency symbols
or thousand separators (e.g. 15000 not "R$ 15.000,00" or "15.000"),
deadline as ISO date, and deliverables description.
Generate unique IDs (e.g. "ms-1", "ms-2").
If the contract doesn't have explicit milestones, infer them from scope/timeline.
Always respond in English.`,
    prompt: contractText,
  });
  if (!output)
    throw new Error(
      "extractMilestones: model failed to produce valid output"
    );
  return output;
}

// -- PHASE 2: Depends on PHASE 1, but run in parallel with each other --

export async function scoreClauses(
  contractText: string,
  risks: RiskItem[],
  signal: AbortSignal
) {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: ClauseScoresOutputSchema }),
    system: `You score contract clauses on a 0-100 scale.
0 = extremely dangerous, 100 = perfectly safe.
Classify each as "safe" (70-100), "caution" (40-69), or "danger" (0-39).
Provide a brief rationale for each score.
Focus especially on clauses that were flagged as risks.
If the risks array is empty, score the main clauses of the contract independently.`,
    prompt: `Contract:\n${contractText}\n\nPreviously identified risks:\n${JSON.stringify(risks, null, 2)}`,
  });
  if (!output)
    throw new Error("scoreClauses: model failed to produce valid output");
  return output;
}

export async function generateDeployPlan(
  contractText: string,
  milestones: Milestone[],
  parties: Party[],
  signal: AbortSignal
) {
  const { output } = await generateText({
    model,
    abortSignal: signal,
    output: Output.object({ schema: DeployPlanOutputSchema }),
    system: `You generate a deployment plan for putting a contract on-chain.
Create 4-5 deployment steps (e.g. "Review complete", "Escrow configured", "Contract registered", "Sentinel active").
Mark logical steps as "done", current as "current", remaining as "pending".
Assign placeholder wallet addresses (0x0000...dead) to each party.
Summarize milestones with formatted values. Include escrow total, network (Base Sepolia), standard (ERC-8004).`,
    prompt: `Contract:\n${contractText}\n\nMilestones:\n${JSON.stringify(milestones, null, 2)}\n\nParties:\n${JSON.stringify(parties, null, 2)}`,
  });
  if (!output)
    throw new Error(
      "generateDeployPlan: model failed to produce valid output"
    );
  return output;
}
