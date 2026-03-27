import { tool, generateText, Output } from "ai";
import { z } from "zod";
import { createGoogleGenerativeAI } from "@ai-sdk/google";
import { mediationLog } from "@/lib/mediation-log";
import { getCase, CaseState } from "@/lib/case-lifecycle";

const google = createGoogleGenerativeAI({
  apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY,
});

export interface AnalysisResult {
  relevance: number;
  credibility: number;
  probativeWeight: number;
  redFlags: string[];
  compositeScore: number;
  reasoning: string;
}

const analysisSchema = z.object({
  relevance: z.number().min(0).max(100).describe("How relevant is this evidence to the contract dispute (0-100)"),
  credibility: z.number().min(0).max(100).describe("Document type, consistency, and verifiability score (0-100)"),
  probativeWeight: z.number().min(0).max(100).describe("How much this evidence alone supports the claim (0-100)"),
  redFlags: z.array(z.string()).describe("List of contradictions, impossible dates, suspicious formatting, or anomalies"),
  reasoning: z.string().describe("Concise LLM reasoning for the scores"),
});

export const analyzeEvidence = tool({
  description:
    "Analyze contract evidence semantically via LLM. Evaluates relevance, credibility, probative weight, and red flags. Returns scored AnalysisResult compatible with ERC-8004 reputation.",
  inputSchema: z.object({
    evidence: z.string().describe("The evidence text or description to analyze"),
    perspective: z
      .enum(["client", "developer", "neutral"])
      .describe("Whose perspective to consider"),
    evidenceType: z
      .enum(["contract", "communication", "deliverable", "payment", "other"])
      .describe("Type of evidence being analyzed"),
    caseId: z.string().describe("Case reference ID for event logging"),
    contractContext: z.string().optional().describe("Contract text or summary for relevance comparison"),
  }),
  execute: async ({ evidence, perspective, evidenceType, caseId, contractContext }) => {
    // State machine guard — allow only EVIDENCE_COLLECTION or ANALYSIS
    const mediationCase = getCase(caseId);
    if (mediationCase) {
      const allowed = [CaseState.EVIDENCE_COLLECTION, CaseState.ANALYSIS];
      if (!allowed.includes(mediationCase.getState())) {
        return {
          status: "blocked",
          reason: `analyzeEvidence requires state EVIDENCE_COLLECTION or ANALYSIS, current: ${mediationCase.getState()}`,
          currentState: mediationCase.getState(),
          caseId,
          timestamp: new Date().toISOString(),
        };
      }
    }

    let analysisResult: AnalysisResult;

    try {
      const result = await generateText({
        model: google("gemini-2.0-flash"),
        output: Output.object({ schema: analysisSchema }),
        prompt: `You are a legal evidence analyst for B2B contract dispute mediation.

Analyze the following ${evidenceType} evidence from the ${perspective}'s perspective.
${contractContext ? `\nCONTRACT CONTEXT:\n${contractContext}\n` : ""}
EVIDENCE TO ANALYZE:
${evidence}

Score each dimension 0-100:
- relevance: How relevant is this evidence to the contract dispute?
- credibility: Document type quality, internal consistency, and verifiability
- probativeWeight: How much does this evidence alone sustain the claim?
- redFlags: List any contradictions, impossible dates, suspicious patterns, or anomalies (empty array if none)
- reasoning: Brief explanation of your assessment

Be objective. Do not favor either party.`,
      });

      const { relevance, credibility, probativeWeight, redFlags, reasoning } = result.output;
      const compositeScore = Math.round(
        relevance * 0.35 + credibility * 0.35 + probativeWeight * 0.30
      );

      analysisResult = { relevance, credibility, probativeWeight, redFlags, compositeScore, reasoning };
    } catch {
      // Fallback to keyword-based scoring if LLM unavailable
      const wordCount = evidence.split(/\s+/).length;
      const keywords = ["email","invoice","contract","deadline","delivered","payment","signed","timestamp","screenshot","commit"];
      const matchCount = keywords.filter((kw) => evidence.toLowerCase().includes(kw)).length;
      const base = 50 + Math.min(wordCount > 100 ? 15 : wordCount > 50 ? 8 : 0, 15) + Math.min(matchCount * 3, 20);
      const clamped = Math.max(0, Math.min(100, base));

      analysisResult = {
        relevance: clamped,
        credibility: clamped,
        probativeWeight: clamped,
        redFlags: [],
        compositeScore: clamped,
        reasoning: "LLM unavailable — fallback keyword scoring applied.",
      };
    }

    mediationLog.append(caseId, "ANALYSIS_COMPLETE", {
      evidenceType,
      perspective,
      credibilityScore: analysisResult.compositeScore,
      relevance: analysisResult.relevance,
      probativeWeight: analysisResult.probativeWeight,
      redFlagsCount: analysisResult.redFlags.length,
    });

    return {
      ...analysisResult,
      evidenceType,
      perspective,
      caseId,
      timestamp: new Date().toISOString(),
    };
  },
});
