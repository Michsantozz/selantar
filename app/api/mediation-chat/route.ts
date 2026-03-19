import { createAgentUIStreamResponse } from "ai";
import { mediatorAgent } from "@/lib/agents/mediator-agent";
import { randomUUID } from "crypto";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  // Ensure every message has an id (useChat sends it, but external callers may not)
  const uiMessages = messages.map(
    (msg: { id?: string; role: string; parts: unknown[] }) => ({
      ...msg,
      id: msg.id ?? randomUUID(),
    })
  );

  return createAgentUIStreamResponse({
    agent: mediatorAgent,
    uiMessages,
  });
}
