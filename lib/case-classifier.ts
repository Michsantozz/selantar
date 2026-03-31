import { generateText, Output } from "ai";
import { openai } from "@ai-sdk/openai";
import { z } from "zod";

export type DisputeCategory =
  | "LATE_DELIVERY"
  | "NON_PAYMENT"
  | "BAD_FAITH"
  | "CONTRACT_AMBIGUITY"
  | "FORCE_MAJEURE"
  | "SCOPE_CREEP"
  | "QUALITY_DISPUTE";

export interface DisputeStrategy {
  tone: "conciliatory" | "assertive";
  maxRounds: number;
  confidenceThreshold: number;
  proposalTemplate: string;
}

export interface ClassificationResult {
  category: DisputeCategory;
  confidence: number;
  reasoning: string;
  strategy: DisputeStrategy;
}

export const STRATEGY_PRESETS: Record<DisputeCategory, DisputeStrategy> = {
  LATE_DELIVERY:      { tone: "conciliatory", maxRounds: 3, confidenceThreshold: 0.65, proposalTemplate: "Atraso documentado. Proposta: desconto proporcional + prazo revisado." },
  NON_PAYMENT:        { tone: "assertive",    maxRounds: 2, confidenceThreshold: 0.80, proposalTemplate: "Pagamento em atraso. Proposta: valor integral + juros de mora." },
  BAD_FAITH:          { tone: "assertive",    maxRounds: 2, confidenceThreshold: 0.85, proposalTemplate: "Evidência de má-fé. Proposta: ressarcimento integral + compensação." },
  CONTRACT_AMBIGUITY: { tone: "conciliatory", maxRounds: 4, confidenceThreshold: 0.55, proposalTemplate: "Cláusula ambígua. Proposta: interpretação mais favorável ao devedor." },
  FORCE_MAJEURE:      { tone: "conciliatory", maxRounds: 3, confidenceThreshold: 0.60, proposalTemplate: "Evento externo documentado. Proposta: prorrogação sem penalidade." },
  SCOPE_CREEP:        { tone: "conciliatory", maxRounds: 4, confidenceThreshold: 0.60, proposalTemplate: "Escopo expandido sem aditivo. Proposta: pagamento proporcional ao entregue." },
  QUALITY_DISPUTE:    { tone: "assertive",    maxRounds: 3, confidenceThreshold: 0.70, proposalTemplate: "Entrega abaixo do especificado. Proposta: retrabalho ou desconto." },
};

export async function classifyDispute(
  contract: string,
  evidence: string
): Promise<ClassificationResult> {
  const result = await generateText({
    model: openai("gpt-5.4-2026-03-05"),
    output: Output.object({
      schema: z.object({
        category: z.enum([
          "LATE_DELIVERY", "NON_PAYMENT", "BAD_FAITH",
          "CONTRACT_AMBIGUITY", "FORCE_MAJEURE", "SCOPE_CREEP", "QUALITY_DISPUTE",
        ]),
        confidence: z.number().min(0).max(1),
        reasoning: z.string(),
      }),
    }),
    prompt: `You are a dispute classification expert. Analyze the contract and evidence below and classify the dispute.

CONTRACT:
${contract}

EVIDENCE:
${evidence}

Classify into exactly one category:
- LATE_DELIVERY: delivery was late or missed deadlines
- NON_PAYMENT: payment was not made or delayed
- BAD_FAITH: party acted in bad faith, fraud, or deception
- CONTRACT_AMBIGUITY: contract terms are unclear or ambiguous
- FORCE_MAJEURE: external event beyond parties' control
- SCOPE_CREEP: work expanded beyond original scope without agreement
- QUALITY_DISPUTE: delivered work does not meet quality standards

Return category, confidence (0-1), and brief reasoning.`,
  });

  const { category, confidence, reasoning } = result.output;

  return {
    category,
    confidence,
    reasoning,
    strategy: STRATEGY_PRESETS[category],
  };
}
