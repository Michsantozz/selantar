import { createAgentUIStreamResponse } from "ai";
import { createSentinelPlanAgent } from "@/lib/agents/sentinel-plan-agent";
import { randomUUID } from "crypto";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = createSentinelPlanAgent();

  const uiMessages = messages.map(
    (msg: { id?: string; role: string; parts: unknown[] }) => ({
      ...msg,
      id: msg.id ?? randomUUID(),
    })
  );

  return createAgentUIStreamResponse({
    agent,
    uiMessages,
  });
}
