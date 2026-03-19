import { createAgentUIStreamResponse } from "ai";
import { createClientAgent } from "@/lib/agents/client-agent";
import { randomUUID } from "crypto";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages, scenarioId } = await req.json();

  if (!scenarioId || typeof scenarioId !== "string") {
    return new Response(
      JSON.stringify({ error: "scenarioId is required" }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

  let agent;
  try {
    agent = createClientAgent(scenarioId);
  } catch {
    return new Response(
      JSON.stringify({ error: `Unknown scenario: ${scenarioId}` }),
      { status: 400, headers: { "Content-Type": "application/json" } }
    );
  }

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
