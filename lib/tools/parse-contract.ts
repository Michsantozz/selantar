import { tool } from "ai";
import { z } from "zod";
import {
  extractParties,
  analyzeRisks,
  extractMilestones,
  scoreClauses,
  generateDeployPlan,
} from "@/lib/agents/contract-sub-agents";

export const parseContract = tool({
  description:
    "Parse a contract: extract parties, risks, milestones, score clauses, and generate deploy plan.",
  inputSchema: z.object({
    contractText: z
      .string()
      .min(100, "Contract text too short to analyze")
      .max(50000, "Contract text too long")
      .describe("Full contract text to analyze"),
  }),
  execute: async ({ contractText }, { abortSignal }) => {
    // PHASE 1 — 3 sub-agents in parallel with Promise.allSettled
    const phase1 = await Promise.allSettled([
      extractParties(contractText, abortSignal),
      analyzeRisks(contractText, abortSignal),
      extractMilestones(contractText, abortSignal),
    ]);

    const header =
      phase1[0].status === "fulfilled" ? phase1[0].value : null;
    const risks =
      phase1[1].status === "fulfilled" ? phase1[1].value : null;
    const milestones =
      phase1[2].status === "fulfilled" ? phase1[2].value : null;

    // PHASE 2 — scoreClauses and deployPlan run in parallel (both depend on PHASE 1)
    const phase2 = await Promise.allSettled([
      scoreClauses(contractText, risks?.risks ?? [], abortSignal),
      generateDeployPlan(
        contractText,
        milestones?.milestones ?? [],
        header?.parties ?? [],
        abortSignal
      ),
    ]);

    const clauseScores =
      phase2[0].status === "fulfilled" ? phase2[0].value : null;
    const deployPlan =
      phase2[1].status === "fulfilled" ? phase2[1].value : null;

    return { header, risks, milestones, clauseScores, deployPlan };
  },
});
