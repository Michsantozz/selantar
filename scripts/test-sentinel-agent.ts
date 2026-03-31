/**
 * Sentinel Plan Agent — E2E test
 * Run: npx tsx scripts/test-sentinel-agent.ts
 */

import { ToolLoopAgent, stepCountIs, createAgentUIStreamResponse } from "ai";
import { openai } from "@ai-sdk/openai";
import { generateMonitoringPlan, adjustPlan } from "../lib/tools/sentinel-plan-tools";
import { randomUUID } from "crypto";

// Recreate agent inline to avoid @/ alias issues with tsx
const agent = new ToolLoopAgent({
  model: openai("gpt-5.4-2026-03-05"),
  instructions: `You are Selantar's Sentinel. You create monitoring plans for contracts.
When you receive contract data, call generateMonitoringPlan immediately with the full JSON.
Always be concise. Respond in the same language as the user.`,
  tools: { generateMonitoringPlan, adjustPlan },
  stopWhen: stepCountIs(5),
});

const uiMessages = [{
  id: randomUUID(),
  role: "user" as const,
  parts: [{ type: "text" as const, text: 'Generate monitoring plan for: Site Clinica Suassuna, client Dr. Suassuna, dev Matheus, R$4800, milestones: Design System R$800 deadline Apr 1, Frontend+CMS R$1200 deadline Apr 15, API Integration R$1600 deadline May 1, Go-Live R$1200 deadline May 10. GitHub repo ultraself/clinica-suassuna. No late penalty clause found.' }]
}];

async function main() {
  console.log("Calling agent...");
  const response = await createAgentUIStreamResponse({ agent, uiMessages });
  const reader = response.body?.getReader();
  if (!reader) { console.log("FAIL: no reader"); process.exit(1); }

  const decoder = new TextDecoder();
  let chunks = "";
  let count = 0;
  const timeout = setTimeout(() => { console.log("TIMEOUT after 50s, chunks:", count); console.log("Last data:", chunks.slice(-500)); process.exit(1); }, 50000);

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    const text = decoder.decode(value);
    chunks += text;
    count++;
    if (count <= 5) console.log("Chunk", count, ":", text.slice(0, 150));
  }
  clearTimeout(timeout);
  console.log("---");
  console.log("Total chunks:", count);
  console.log("Has tool call:", chunks.includes("generateMonitoringPlan"));
  console.log("Has plan data:", chunks.includes("actions") && chunks.includes("milestones"));
  console.log(count > 0 ? "PASS" : "FAIL");
}
main();
