import { createAgentUIStreamResponse } from "ai";
import { createContractParserAgent } from "@/lib/agents/contract-parser-agent";
import { randomUUID } from "crypto";

export const maxDuration = 120;
export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages } = await req.json();

  const agent = createContractParserAgent();

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
