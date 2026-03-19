import { tool } from "ai";
import { z } from "zod";

export const analyzeEvidence = tool({
  description:
    "Analyze contract evidence from a party in the dispute. Reviews documents, communications, deliverables, and payment records to build an objective assessment.",
  inputSchema: z.object({
    evidence: z.string().describe("The evidence text or description to analyze"),
    perspective: z
      .enum(["client", "developer", "neutral"])
      .describe("Whose perspective to consider"),
    evidenceType: z
      .enum(["contract", "communication", "deliverable", "payment", "other"])
      .describe("Type of evidence being analyzed"),
  }),
  execute: async ({ evidence, perspective, evidenceType }) => {
    // Score based on evidence quality — not random
    let score = 50;

    // Length indicates thoroughness
    const wordCount = evidence.split(/\s+/).length;
    if (wordCount > 200) score += 15;
    else if (wordCount > 100) score += 10;
    else if (wordCount > 50) score += 5;

    // Specificity indicators
    const specificityKeywords = [
      "email", "slack", "message", "invoice", "receipt",
      "contract", "clause", "deadline", "delivered", "approved",
      "signed", "timestamp", "screenshot", "log", "commit",
      "payment", "transfer", "date", "day ", "week",
    ];
    const matchCount = specificityKeywords.filter((kw) =>
      evidence.toLowerCase().includes(kw)
    ).length;
    score += Math.min(matchCount * 3, 20);

    // Evidence type weight
    const typeWeights: Record<string, number> = {
      contract: 10,
      payment: 8,
      communication: 6,
      deliverable: 7,
      other: 3,
    };
    score += typeWeights[evidenceType] ?? 3;

    // Clamp 0-100
    score = Math.max(0, Math.min(100, score));

    // Extract key findings from the evidence
    const findings: string[] = [];
    if (evidence.toLowerCase().includes("deadline"))
      findings.push("Timeline and deadline references identified");
    if (evidence.toLowerCase().includes("deliver"))
      findings.push("Deliverable status documented");
    if (evidence.toLowerCase().includes("payment") || evidence.toLowerCase().includes("escrow"))
      findings.push("Financial terms and payment records referenced");
    if (evidence.toLowerCase().includes("email") || evidence.toLowerCase().includes("slack") || evidence.toLowerCase().includes("message"))
      findings.push("Communication trail available for verification");
    if (evidence.toLowerCase().includes("approved") || evidence.toLowerCase().includes("signed"))
      findings.push("Formal approvals or signatures documented");
    if (findings.length === 0)
      findings.push("Evidence reviewed — limited specificity detected");

    return {
      analysis: `Analyzed ${evidenceType} evidence from ${perspective} perspective`,
      evidenceType,
      perspective,
      keyFindings: findings,
      credibilityScore: score,
      wordCount,
      timestamp: new Date().toISOString(),
    };
  },
});
