import { streamText } from "ai";
import { createOpenRouter } from "@openrouter/ai-sdk-provider";

export const maxDuration = 120;
export const runtime = "nodejs";

const openrouter = createOpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req: Request) {
  const body = await req.json();
  const contractText = typeof body?.contractText === "string" ? body.contractText.slice(0, 100000) : "";
  if (!contractText) {
    return new Response(JSON.stringify({ error: "contractText is required" }), { status: 400 });
  }

  const result = streamText({
    model: openrouter("openai/gpt-5.4-mini"),
    maxOutputTokens: 4096,
    system: `You are Selantar's contract analyzer. Analyze the provided contract and return a structured risk assessment.

Your analysis must include:
1. **Contract Summary** — Brief overview of the agreement
2. **Key Clauses** — Important terms, obligations, and conditions
3. **Risk Assessment** — Potential issues, ambiguities, or unfair terms (rate each: Low/Medium/High)
4. **Dispute Triggers** — Clauses most likely to cause disputes
5. **Recommendations** — Suggestions for dispute prevention

Be thorough, objective, and professional. Respond in Portuguese (pt-BR).`,
    prompt: `Analyze this contract:\n\n${contractText}`,
  });

  return result.toUIMessageStreamResponse();
}
