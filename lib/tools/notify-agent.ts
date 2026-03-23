import { tool } from "ai";
import { z } from "zod";

const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL ?? "https://whats.vensa.pro";
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY ?? "429683C4C977415CAAFCCE10F7D57E11";
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE ?? "testeultra2";
const NOTIFY_NUMBER = process.env.OPENCLAW_NOTIFY_TO ?? "5562994161690";

/**
 * AI SDK tool that enables agent-to-agent communication.
 * Clara (AI SDK agent) calls this tool to notify external agents
 * via WhatsApp (Evolution API) or OpenClaw gateway.
 *
 * This is agent-to-agent: AI SDK agent → Evolution/OpenClaw → WhatsApp delivery
 */
export const notifyAgent = tool({
  description:
    "Send a notification to the external monitoring agent via WhatsApp. Use this after important actions: evidence analyzed, settlement proposed, settlement executed, feedback posted, or verdict registered. The notification keeps stakeholders informed in real-time.",
  inputSchema: z.object({
    event: z
      .enum([
        "evidence_analyzed",
        "settlement_proposed",
        "settlement_executed",
        "feedback_posted",
        "verdict_registered",
        "mediation_started",
        "mediation_completed",
      ])
      .describe("The type of mediation event"),
    summary: z
      .string()
      .describe("A short summary of what happened (1-3 sentences, Portuguese)"),
    txHash: z
      .string()
      .optional()
      .describe("Transaction hash if an on-chain action was performed"),
  }),
  execute: async ({ event, summary, txHash }) => {
    const eventEmojis: Record<string, string> = {
      evidence_analyzed: "🔍",
      settlement_proposed: "⚖️",
      settlement_executed: "✅",
      feedback_posted: "⭐",
      verdict_registered: "📜",
      mediation_started: "🚀",
      mediation_completed: "🏁",
    };

    const emoji = eventEmojis[event] ?? "📋";
    const lines = [`${emoji} *Selantar — ${event.replace(/_/g, " ").toUpperCase()}*`, "", summary];

    if (txHash) {
      lines.push("", `🔗 TX: ${txHash}`);
      lines.push(`https://hashscan.io/testnet/transaction/${txHash}`);
    }

    const text = lines.join("\n");

    try {
      // Send typing indicator first
      await fetch(`${EVOLUTION_API_URL}/chat/sendPresence/${EVOLUTION_INSTANCE}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
        body: JSON.stringify({
          number: NOTIFY_NUMBER,
          options: { presence: "composing", delay: 1000 },
        }),
      });

      await new Promise((r) => setTimeout(r, 1000));

      // Send the message
      const res = await fetch(
        `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json", apikey: EVOLUTION_API_KEY },
          body: JSON.stringify({ number: NOTIFY_NUMBER, text, delay: 500 }),
        },
      );

      const ok = res.ok;
      return {
        success: ok,
        channel: "whatsapp",
        event,
        message: ok
          ? `Notification sent to WhatsApp (+${NOTIFY_NUMBER})`
          : `Failed to send (status ${res.status})`,
      };
    } catch {
      return {
        success: false,
        channel: "whatsapp",
        event,
        message: "Notification delivery failed (network error). Mediation continues normally.",
      };
    }
  },
});
