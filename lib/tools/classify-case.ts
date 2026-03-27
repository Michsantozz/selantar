import { tool } from "ai";
import { z } from "zod";
import { classifyDispute } from "@/lib/case-classifier";

export const classifyCase = tool({
  description:
    "Classify the dispute type from contract and evidence. Returns category, confidence, reasoning, and strategy preset (tone, max rounds, confidence threshold, proposal template). Run this at the start of mediation before analyzing evidence.",
  inputSchema: z.object({
    contract: z.string().describe("Contract text or summary"),
    evidence: z.string().describe("Initial evidence or dispute description"),
    caseId: z.string().describe("Case reference ID for event logging"),
  }),
  execute: async ({ contract, evidence, caseId }) => {
    try {
      const classification = await classifyDispute(contract, evidence);
      return {
        ...classification,
        caseId,
        timestamp: new Date().toISOString(),
      };
    } catch {
      // Fallback: return default classification without blocking mediation
      return {
        category: "CONTRACT_AMBIGUITY" as const,
        confidence: 0,
        reasoning: "Classification unavailable — proceeding with neutral strategy.",
        strategy: {
          tone: "conciliatory" as const,
          maxRounds: 4,
          confidenceThreshold: 0.55,
          proposalTemplate: "Analise o contrato e evidências para propor um acordo justo.",
        },
        caseId,
        timestamp: new Date().toISOString(),
      };
    }
  },
});
