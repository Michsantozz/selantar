/**
 * Fire-and-forget webhook bridge to OpenClaw Gateway.
 * Sends mediation events as WhatsApp notifications via /hooks/agent.
 * Never blocks or breaks the mediation flow — all errors are silently caught.
 */

const OPENCLAW_HOOKS_URL = process.env.OPENCLAW_HOOKS_URL ?? "http://127.0.0.1:18789/hooks/agent";
const OPENCLAW_HOOKS_TOKEN = process.env.OPENCLAW_HOOKS_TOKEN ?? "";
const OPENCLAW_NOTIFY_TO = process.env.OPENCLAW_NOTIFY_TO ?? "";

type MediationEvent =
  | "evidence_analyzed"
  | "settlement_proposed"
  | "settlement_executed"
  | "feedback_posted"
  | "verdict_registered";

const EVENT_LABELS: Record<MediationEvent, string> = {
  evidence_analyzed: "Evidencia Analisada",
  settlement_proposed: "Settlement Proposto",
  settlement_executed: "Settlement Executado",
  feedback_posted: "Reputacao Postada",
  verdict_registered: "Veredito Registrado",
};

export function notifyOpenClaw(
  event: MediationEvent,
  details: Record<string, unknown>,
): void {
  if (!OPENCLAW_HOOKS_TOKEN || !OPENCLAW_NOTIFY_TO) return;

  const label = EVENT_LABELS[event];
  const detailLines = Object.entries(details)
    .filter(([, v]) => v !== undefined && v !== null && v !== "")
    .map(([k, v]) => `- ${k}: ${v}`)
    .join("\n");

  const message = [
    `[Selantar] ${label}`,
    "",
    detailLines,
    "",
    "Format this as a short WhatsApp notification (max 4 lines, use emojis). Write in Portuguese (pt-BR).",
  ].join("\n");

  void fetch(OPENCLAW_HOOKS_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${OPENCLAW_HOOKS_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message,
      name: "Selantar",
      channel: "whatsapp",
      to: OPENCLAW_NOTIFY_TO,
      deliver: true,
      timeoutSeconds: 30,
    }),
  }).catch(() => {
    // Silent — never break mediation
  });
}
