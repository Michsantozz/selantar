"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { registerDemoAction } from "@/lib/demo-actions";
import type { ParsedContract } from "@/lib/schemas/contract-parse";
import type { MonitoringPlan } from "@/lib/schemas/sentinel-plan";
import { planToReactFlow } from "@/lib/sentinel-plan-layout";
import { sentinelNodeTypes } from "./_components/sentinel-nodes";
import { SentinelChat } from "./_components/sentinel-chat";
import { SentinelTopbar } from "./_components/sentinel-topbar";
import { DeployCinematic } from "./_components/deploy-cinematic";
import { SparklesIcon, LoaderIcon, ShieldCheckIcon, ZapIcon, ChevronRightIcon } from "lucide-react";
import {
  ACCENT,
  GREEN,
  YELLOW,
  MUTED,
  BLUE,
  VIOLET,
  CONTRACT_X,
  ROW_TOP,
  ANALYSIS_X,
  ANALYSIS_Y,
  SENTINEL_X,
  SENTINEL_Y,
  ROW_MILESTONES,
  ROW_ACTIONS,
  MS_X_START,
  MS_GAP_X,
  type ActionStatus,
} from "./_components/sentinel-constants";

// ── Constants ───────────────────────────────────────────────────────────────

const STORAGE_KEY = "selentar-parsed-contract";

// ── Telegram via API (replaces hardcoded token) ─────────────────────────────

async function sendTelegramNotify(text: string, buttons?: unknown[][]) {
  try {
    await fetch("/api/sentinel-notify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text, buttons }),
    });
  } catch {
    /* silently fail */
  }
}

// ── Extract MonitoringPlan from chat messages ───────────────────────────────

function extractMonitoringPlan(messages: UIMessage[]): MonitoringPlan | null {
  for (let m = messages.length - 1; m >= 0; m--) {
    const msg = messages[m];
    if (msg.role !== "assistant") continue;

    for (let i = msg.parts.length - 1; i >= 0; i--) {
      const part = msg.parts[i];
      if (
        isToolUIPart(part) &&
        part.state === "output-available" &&
        (part.type === "tool-generateMonitoringPlan" ||
          part.type === "tool-adjustPlan")
      ) {
        return part.output as MonitoringPlan;
      }
    }
  }
  return null;
}

// ── Simulation Types & Data (fallback when no sessionStorage) ───────────────

type SimAction =
  | "analyze-start"
  | "analyze-done"
  | "show-milestones"
  | "show-action"
  | "set-status"
  | "show-sentinel";

type SimStep = {
  action: SimAction;
  targetId?: string;
  status?: ActionStatus;
  sentTo?: string;
  timestamp?: string;
  delay: number;
};

const SIM_STEPS: SimStep[] = [
  { action: "analyze-start", delay: 600 },
  { action: "analyze-done", delay: 1800 },
  { action: "show-milestones", delay: 700 },
  {
    action: "show-action",
    targetId: "act-github",
    timestamp: "21 Mar · 10:00",
    delay: 600,
  },
  {
    action: "show-action",
    targetId: "act-whatsapp-m1",
    timestamp: "21 Mar · 10:00",
    delay: 450,
  },
  {
    action: "show-action",
    targetId: "act-deploy",
    timestamp: "21 Mar · 10:01",
    delay: 450,
  },
  {
    action: "show-action",
    targetId: "act-api",
    timestamp: "21 Mar · 10:01",
    delay: 450,
  },
  {
    action: "show-action",
    targetId: "act-whatsapp-m3",
    timestamp: "21 Mar · 10:01",
    delay: 450,
  },
  {
    action: "show-action",
    targetId: "act-escrow",
    timestamp: "21 Mar · 10:01",
    delay: 450,
  },
  { action: "show-sentinel", targetId: "sentinel-say", delay: 900 },
  {
    action: "set-status",
    targetId: "act-github",
    status: "approved",
    timestamp: "21 Mar · 10:02",
    delay: 600,
  },
  {
    action: "set-status",
    targetId: "act-github",
    status: "sent",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:02",
    delay: 400,
  },
  {
    action: "set-status",
    targetId: "act-github",
    status: "waiting",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:02 — awaiting confirmation",
    delay: 550,
  },
  {
    action: "set-status",
    targetId: "act-whatsapp-m1",
    status: "approved",
    timestamp: "21 Mar · 10:03",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-whatsapp-m1",
    status: "sent",
    sentTo: "Dr. Suassuna & Matheus",
    timestamp: "21 Mar · 10:03",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-whatsapp-m1",
    status: "waiting",
    sentTo: "Dr. Suassuna & Matheus",
    timestamp: "21 Mar · 10:03 — scheduled for Mar 29",
    delay: 500,
  },
  {
    action: "set-status",
    targetId: "act-deploy",
    status: "approved",
    timestamp: "21 Mar · 10:04",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-deploy",
    status: "sent",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:04",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-deploy",
    status: "accepted",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:08 — staging.clinica-suassuna.com",
    delay: 750,
  },
  {
    action: "set-status",
    targetId: "act-api",
    status: "approved",
    timestamp: "21 Mar · 10:05",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-api",
    status: "sent",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:05",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-api",
    status: "declined",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:12 — endpoints not ready yet",
    delay: 700,
  },
  {
    action: "set-status",
    targetId: "act-whatsapp-m3",
    status: "rejected",
    timestamp: "21 Mar · 10:06 — removed by user",
    delay: 400,
  },
  {
    action: "set-status",
    targetId: "act-escrow",
    status: "approved",
    timestamp: "21 Mar · 10:07",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-escrow",
    status: "sent",
    sentTo: "Both parties",
    timestamp: "21 Mar · 10:07",
    delay: 350,
  },
  {
    action: "set-status",
    targetId: "act-escrow",
    status: "waiting",
    sentTo: "Both parties",
    timestamp: "21 Mar · 10:07 — awaiting signature",
    delay: 500,
  },
  {
    action: "set-status",
    targetId: "act-github",
    status: "accepted",
    sentTo: "Matheus (dev)",
    timestamp: "21 Mar · 10:14 — dev confirmou acesso",
    delay: 1000,
  },
];

const simInitialNodes: Node[] = [
  {
    id: "contract",
    type: "contract",
    position: { x: CONTRACT_X, y: ROW_TOP },
    data: {
      title: "Site Clinica Suassuna",
      parties: { client: "Dr. Suassuna", dev: "Matheus (ULTRASELF)" },
      value: "R$ 4.800 + R$ 400/mo",
      milestones: 4,
      duration: "70 days",
    },
  },
  {
    id: "analysis",
    type: "analysis",
    position: { x: ANALYSIS_X, y: ANALYSIS_Y },
    data: {
      label: "Sentinel analyzing...",
      status: "pending",
      findings: [
        "4 milestones identified with values and deadlines",
        "GitHub repo linked: ultraself/clinica-suassuna",
        "WhatsApp of both parties in the contract",
        "Scheduling API mentioned in M3 delivery",
        "No late penalty clause found",
      ],
    },
  },
  {
    id: "d1",
    type: "date",
    position: { x: MS_X_START + 74, y: ROW_MILESTONES - 80 },
    hidden: true,
    data: { day: "01", month: "Apr" },
  },
  {
    id: "d2",
    type: "date",
    position: { x: MS_X_START + MS_GAP_X + 74, y: ROW_MILESTONES - 80 },
    hidden: true,
    data: { day: "15", month: "Apr" },
  },
  {
    id: "d3",
    type: "date",
    position: {
      x: MS_X_START + MS_GAP_X * 2 + 74,
      y: ROW_MILESTONES - 80,
    },
    hidden: true,
    data: { day: "01", month: "May" },
  },
  {
    id: "d4",
    type: "date",
    position: {
      x: MS_X_START + MS_GAP_X * 3 + 74,
      y: ROW_MILESTONES - 80,
    },
    hidden: true,
    data: { day: "10", month: "May" },
  },
  {
    id: "m1",
    type: "milestone",
    position: { x: MS_X_START, y: ROW_MILESTONES },
    hidden: true,
    data: { label: "Design System", value: "R$ 800", index: 1 },
  },
  {
    id: "m2",
    type: "milestone",
    position: { x: MS_X_START + MS_GAP_X, y: ROW_MILESTONES },
    hidden: true,
    data: { label: "Frontend + CMS", value: "R$ 1.200", index: 2 },
  },
  {
    id: "m3",
    type: "milestone",
    position: { x: MS_X_START + MS_GAP_X * 2, y: ROW_MILESTONES },
    hidden: true,
    data: { label: "API Integration", value: "R$ 1.600", index: 3 },
  },
  {
    id: "m4",
    type: "milestone",
    position: { x: MS_X_START + MS_GAP_X * 3, y: ROW_MILESTONES },
    hidden: true,
    data: { label: "Go-Live + Support", value: "R$ 1.200", index: 4 },
  },
  {
    id: "act-github",
    type: "action",
    position: { x: MS_X_START - 20, y: ROW_ACTIONS },
    hidden: true,
    data: {
      label: "Monitor GitHub",
      description:
        "I'll track commits and PRs in the repo. If there's 5 days of inactivity, I notify the dev.",
      icon: "github",
      frequency: "daily",
      target: "ultraself/clinica-suassuna",
      status: "pending",
    },
  },
  {
    id: "act-whatsapp-m1",
    type: "action",
    position: { x: MS_X_START - 20, y: ROW_ACTIONS + 280 },
    hidden: true,
    data: {
      label: "Follow-up M1 via WhatsApp",
      description:
        "3 days before the Design System deadline, I send a message to the dev asking for status and to the client to prepare their review.",
      icon: "whatsapp",
      frequency: "pre-milestone",
      milestone: "M1 · Design System",
      status: "pending",
    },
  },
  {
    id: "act-deploy",
    type: "action",
    position: { x: MS_X_START + MS_GAP_X - 20, y: ROW_ACTIONS },
    hidden: true,
    data: {
      label: "Verify Staging Deploy",
      description:
        "Before releasing M2, I check if staging is up and accessible. I test the URL and take a screenshot.",
      icon: "deploy",
      frequency: "pre-release",
      milestone: "M2 · Frontend",
      status: "pending",
    },
  },
  {
    id: "act-api",
    type: "action",
    position: { x: MS_X_START + MS_GAP_X * 2 - 20, y: ROW_ACTIONS },
    hidden: true,
    data: {
      label: "Audit Endpoints",
      description:
        "I test the scheduling endpoints before M3 delivery. If they return 4xx/5xx, I block the release.",
      icon: "api",
      frequency: "pre-release",
      milestone: "M3 · Integration",
      status: "pending",
    },
  },
  {
    id: "act-whatsapp-m3",
    type: "action",
    position: { x: MS_X_START + MS_GAP_X * 2 - 20, y: ROW_ACTIONS + 280 },
    hidden: true,
    data: {
      label: "Enforce Client SLA",
      description:
        "If the client doesn't respond to the review in 48h, I send a follow-up. After 72h, I escalate to the mediator.",
      icon: "whatsapp",
      frequency: "post-delivery",
      target: "Dr. Suassuna",
      status: "pending",
    },
  },
  {
    id: "act-escrow",
    type: "action",
    position: { x: MS_X_START + MS_GAP_X * 3 - 20, y: ROW_ACTIONS },
    hidden: true,
    data: {
      label: "Control Escrow",
      description:
        "I release payment ONLY after confirmation from both parties. No manual approval, no release.",
      icon: "escrow",
      frequency: "per milestone",
      status: "pending",
    },
  },
  {
    id: "sentinel-say",
    type: "sentinel",
    position: { x: SENTINEL_X, y: SENTINEL_Y },
    hidden: true,
    data: {
      text: "Monitoring plan ready. 6 actions suggested covering GitHub, WhatsApp, deploys, APIs and escrow. Approve all or adjust individually.",
    },
  },
];

const simInitialEdges: Edge[] = [
  {
    id: "e-contract-analysis",
    source: "contract",
    target: "analysis",
    type: "smoothstep",
    style: {
      stroke: ACCENT,
      strokeWidth: 2.5,
      strokeDasharray: "6 4",
    },
  },
  {
    id: "e-analysis-m1",
    source: "analysis",
    sourceHandle: "to-milestones",
    target: "m1",
    type: "smoothstep",
    hidden: true,
    style: { stroke: GREEN, strokeWidth: 2 },
  },
  {
    id: "e-d1-m1",
    source: "d1",
    target: "m1",
    targetHandle: "from-date",
    type: "smoothstep",
    hidden: true,
    style: {
      stroke: `oklch(0.7 0.18 50 / 0.2)`,
      strokeWidth: 1,
      strokeDasharray: "2 4",
    },
  },
  {
    id: "e-d2-m2",
    source: "d2",
    target: "m2",
    targetHandle: "from-date",
    type: "smoothstep",
    hidden: true,
    style: {
      stroke: `oklch(0.7 0.18 50 / 0.2)`,
      strokeWidth: 1,
      strokeDasharray: "2 4",
    },
  },
  {
    id: "e-d3-m3",
    source: "d3",
    target: "m3",
    targetHandle: "from-date",
    type: "smoothstep",
    hidden: true,
    style: {
      stroke: `oklch(0.7 0.18 50 / 0.2)`,
      strokeWidth: 1,
      strokeDasharray: "2 4",
    },
  },
  {
    id: "e-d4-m4",
    source: "d4",
    target: "m4",
    targetHandle: "from-date",
    type: "smoothstep",
    hidden: true,
    style: {
      stroke: `oklch(0.7 0.18 50 / 0.2)`,
      strokeWidth: 1,
      strokeDasharray: "2 4",
    },
  },
  {
    id: "e-m1-m2",
    source: "m1",
    target: "m2",
    type: "smoothstep",
    hidden: true,
    style: { stroke: ACCENT, strokeWidth: 2 },
  },
  {
    id: "e-m2-m3",
    source: "m2",
    target: "m3",
    type: "smoothstep",
    hidden: true,
    style: { stroke: ACCENT, strokeWidth: 2 },
  },
  {
    id: "e-m3-m4",
    source: "m3",
    target: "m4",
    type: "smoothstep",
    hidden: true,
    style: { stroke: ACCENT, strokeWidth: 2 },
  },
  {
    id: "e-m1-github",
    source: "m1",
    sourceHandle: "actions",
    target: "act-github",
    type: "smoothstep",
    hidden: true,
    style: { stroke: VIOLET, strokeWidth: 1.5, strokeDasharray: "5 3" },
  },
  {
    id: "e-m1-whatsapp",
    source: "m1",
    sourceHandle: "actions",
    target: "act-whatsapp-m1",
    type: "smoothstep",
    hidden: true,
    style: {
      stroke: "#25D366",
      strokeWidth: 1.5,
      strokeDasharray: "5 3",
    },
  },
  {
    id: "e-m2-deploy",
    source: "m2",
    sourceHandle: "actions",
    target: "act-deploy",
    type: "smoothstep",
    hidden: true,
    style: { stroke: BLUE, strokeWidth: 1.5, strokeDasharray: "5 3" },
  },
  {
    id: "e-m3-api",
    source: "m3",
    sourceHandle: "actions",
    target: "act-api",
    type: "smoothstep",
    hidden: true,
    style: { stroke: YELLOW, strokeWidth: 1.5, strokeDasharray: "5 3" },
  },
  {
    id: "e-m3-whatsapp2",
    source: "m3",
    sourceHandle: "actions",
    target: "act-whatsapp-m3",
    type: "smoothstep",
    hidden: true,
    style: {
      stroke: "#25D366",
      strokeWidth: 1.5,
      strokeDasharray: "5 3",
    },
  },
  {
    id: "e-m4-escrow",
    source: "m4",
    sourceHandle: "actions",
    target: "act-escrow",
    type: "smoothstep",
    hidden: true,
    style: { stroke: GREEN, strokeWidth: 1.5, strokeDasharray: "5 3" },
  },
  {
    id: "e-analysis-sentinel",
    source: "analysis",
    target: "sentinel-say",
    type: "smoothstep",
    hidden: true,
    style: { stroke: ACCENT, strokeWidth: 1.5, strokeDasharray: "5 3" },
  },
];

// ── Simulation Hook ─────────────────────────────────────────────────────────

function useSentinelPlanSim() {
  const [nodes, setNodes] = useState<Node[]>(simInitialNodes);
  const [edges, setEdges] = useState<Edge[]>(simInitialEdges);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateNodeData = useCallback(
    (id: string, patch: Record<string, unknown>) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === id ? { ...n, data: { ...n.data, ...patch } } : n
        )
      );
    },
    []
  );

  const revealNode = useCallback(
    (id: string, patch?: Record<string, unknown>) => {
      setNodes((prev) =>
        prev.map((n) =>
          n.id === id
            ? {
                ...n,
                hidden: false,
                data: patch ? { ...n.data, ...patch } : n.data,
              }
            : n
        )
      );
    },
    []
  );

  const revealEdge = useCallback((source: string, target: string) => {
    setEdges((prev) =>
      prev.map((e) =>
        e.source === source && e.target === target
          ? { ...e, hidden: false, animated: true }
          : e
      )
    );
  }, []);

  const startSim = useCallback(() => {
    setIsRunning(true);
    setStepIdx(0);
    setProgress(0);
    setNodes(simInitialNodes);
    setEdges(simInitialEdges);
  }, []);

  useEffect(() => {
    if (!isRunning || stepIdx < 0 || stepIdx >= SIM_STEPS.length) {
      return;
    }

    const step = SIM_STEPS[stepIdx];

    const timer = setTimeout(() => {
      switch (step.action) {
        case "analyze-start":
          updateNodeData("analysis", {
            status: "running",
            label: "Sentinel analyzing...",
          });
          setEdges((prev) =>
            prev.map((e) =>
              e.id === "e-contract-analysis"
                ? {
                    ...e,
                    animated: true,
                    style: {
                      ...e.style,
                      stroke: ACCENT,
                      strokeDasharray: undefined,
                    },
                  }
                : e
            )
          );
          break;

        case "analyze-done":
          updateNodeData("analysis", {
            status: "done",
            label: "Analysis complete",
          });
          setEdges((prev) =>
            prev.map((e) =>
              e.id === "e-contract-analysis"
                ? {
                    ...e,
                    animated: false,
                    style: {
                      ...e.style,
                      stroke: GREEN,
                      strokeDasharray: undefined,
                    },
                  }
                : e
            )
          );
          sendTelegramNotify(
            "\ud83d\udd0d *An\u00e1lise conclu\u00edda \u2014 Selantar*\n\n" +
              "\ud83d\udccb Site Clinica Suassuna\n" +
              "\ud83d\udc64 Dr. Suassuna \u2194 Matheus (ULTRASELF)\n" +
              "\ud83d\udcb0 R$ 4.800 \u00b7 4 milestones \u00b7 70 dias\n\n" +
              "\u2705 4 milestones com valores e deadlines\n" +
              "\u2705 GitHub repo linkado\n" +
              "\u2705 WhatsApp das partes no contrato\n" +
              "\u26a0\ufe0f Sem cl\u00e1usula de penalidade por atraso"
          );
          break;

        case "show-milestones":
          ["d1", "d2", "d3", "d4"].forEach((id) => revealNode(id));
          ["m1", "m2", "m3", "m4"].forEach((id) => revealNode(id));
          revealEdge("d1", "m1");
          revealEdge("d2", "m2");
          revealEdge("d3", "m3");
          revealEdge("d4", "m4");
          revealEdge("analysis", "m1");
          revealEdge("m1", "m2");
          revealEdge("m2", "m3");
          revealEdge("m3", "m4");
          break;

        case "show-action":
          if (step.targetId) {
            revealNode(step.targetId, {
              status: "suggested",
              timestamp: step.timestamp,
            });
            setEdges((prev) =>
              prev.map((e) =>
                e.target === step.targetId
                  ? { ...e, hidden: false, animated: true }
                  : e
              )
            );
          }
          break;

        case "set-status":
          if (step.targetId) {
            const patch: Record<string, unknown> = { status: step.status };
            if (step.sentTo) patch.sentTo = step.sentTo;
            if (step.timestamp) patch.timestamp = step.timestamp;
            updateNodeData(step.targetId, patch);

            if (
              step.targetId === "act-github" &&
              step.status === "accepted"
            ) {
              fetch(
                "https://api.github.com/repos/Michsantozz/openclaw/commits?per_page=1"
              )
                .then((r) => r.json())
                .then((commits) => {
                  const c = commits[0];
                  if (!c) return;
                  const sha = c.sha.slice(0, 7);
                  const msg = c.commit.message
                    .split("\n")[0]
                    .slice(0, 50);
                  const author = c.commit.author.name;
                  const date = new Date(
                    c.commit.author.date
                  ).toLocaleString("pt-BR", {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });
                  updateNodeData("act-github", {
                    target: "Michsantozz/openclaw",
                    description: `Last commit: "${msg}" by ${author} \u00b7 ${date} \u00b7 ${sha}`,
                  });
                })
                .catch(() => {
                  /* silently fail */
                });
            }
          }
          break;

        case "show-sentinel":
          if (step.targetId) {
            revealNode(step.targetId);
            revealEdge("analysis", "sentinel-say");
          }
          sendTelegramNotify(
            "\u2696\ufe0f *Plano de Monitoramento Pronto*\n\n" +
              "6 a\u00e7\u00f5es sugeridas:\n" +
              "\ud83d\udd00 Monitor GitHub \u2014 commits e PRs\n" +
              "\ud83d\udcac Follow-up WhatsApp \u2014 pr\u00e9-milestone\n" +
              "\ud83c\udf10 Verificar Deploy \u2014 staging up\n" +
              "\ud83d\udd0c Auditar Endpoints \u2014 antes de release\n" +
              "\ud83d\udcac Enforce SLA \u2014 cobrar resposta do cliente\n" +
              "\ud83d\udcb0 Controle de Escrow \u2014 pagamento seguro\n\n" +
              "Aprovar plano de monitoramento?",
            [
              [
                {
                  text: "\u2705 Aprovar Tudo",
                  callback_data: "approve_all",
                  style: "success",
                },
                {
                  text: "\u274c Rejeitar",
                  callback_data: "reject_all",
                  style: "danger",
                },
              ],
              [
                {
                  text: "\u2699\ufe0f Ajustar Individualmente",
                  callback_data: "adjust",
                  style: "primary",
                },
              ],
            ]
          );
          break;
      }

      setProgress(((stepIdx + 1) / SIM_STEPS.length) * 100);
      if (stepIdx + 1 >= SIM_STEPS.length) {
        setIsRunning(false);
      } else {
        setStepIdx((prev) => prev + 1);
      }
    }, step.delay);

    return () => clearTimeout(timer);
  }, [stepIdx, isRunning, updateNodeData, revealNode, revealEdge]);

  const skipToEnd = useCallback(() => {
    // Reveal all nodes
    setNodes((prev) =>
      prev.map((n) => {
        const finals: Record<string, Record<string, unknown>> = {
          analysis: { status: "done", label: "Analysis complete" },
          "act-github": { status: "accepted", sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:14 — dev confirmou acesso" },
          "act-whatsapp-m1": { status: "waiting", sentTo: "Dr. Suassuna & Matheus", timestamp: "21 Mar · 10:03 — scheduled for Mar 29" },
          "act-deploy": { status: "accepted", sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:08 — staging.clinica-suassuna.com" },
          "act-api": { status: "declined", sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:12 — endpoints not ready yet" },
          "act-whatsapp-m3": { status: "rejected", timestamp: "21 Mar · 10:06 — removed by user" },
          "act-escrow": { status: "waiting", sentTo: "Both parties", timestamp: "21 Mar · 10:07 — awaiting signature" },
        };
        const patch = finals[n.id];
        return {
          ...n,
          hidden: false,
          data: patch ? { ...n.data, ...patch } : n.data,
        };
      })
    );
    // Reveal all edges
    setEdges((prev) =>
      prev.map((e) => ({
        ...e,
        hidden: false,
        animated: false,
        style: {
          ...e.style,
          stroke: e.id === "e-contract-analysis" ? GREEN : e.style?.stroke,
          strokeDasharray: e.id === "e-contract-analysis" ? undefined : e.style?.strokeDasharray,
        },
      }))
    );
    setIsRunning(false);
    setProgress(100);
    setStepIdx(SIM_STEPS.length);
  }, []);

  return { nodes, edges, isRunning, progress, stepIdx, startSim, skipToEnd };
}

// ── Page ────────────────────────────────────────────────────────────────────

export default function SentinelPlanPage() {
  const router = useRouter();
  const [chatOpen, setChatOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const [actionStatuses, setActionStatuses] = useState<
    Record<string, ActionStatus>
  >({});

  // ── Read ParsedContract from sessionStorage (after mount to avoid hydration mismatch) ──
  const [parsedContract, setParsedContract] = useState<ParsedContract | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      if (stored) setParsedContract(JSON.parse(stored));
    } catch {
      // no stored contract — stay in sim mode
    }
  }, []);

  const isRealMode = !!parsedContract;

  // Auto-open chat when real mode starts
  useEffect(() => {
    if (isRealMode) {
      const t = setTimeout(() => setChatOpen(true), 400);
      return () => clearTimeout(t);
    }
  }, [isRealMode]);

  // ── Real mode: useChat ──
  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/sentinel-plan" }),
  });

  const hasSentRef = useRef(false);
  useEffect(() => {
    if (isRealMode && !hasSentRef.current) {
      hasSentRef.current = true;
      sendMessage({ text: JSON.stringify(parsedContract) });
    }
  }, [isRealMode, parsedContract, sendMessage]);

  const plan = useMemo(
    () => (isRealMode ? extractMonitoringPlan(messages) : null),
    [isRealMode, messages]
  );
  const isAnalyzing =
    isRealMode && (status === "streaming" || status === "submitted");

  const planLayout = useMemo(
    () => (plan ? planToReactFlow(plan) : { nodes: [], edges: [] }),
    [plan]
  );

  // ── Sim mode: simulation hook ──
  const sim = useSentinelPlanSim();

  useEffect(() => {
    if (!isRealMode) {
      const t = setTimeout(() => sim.startSim(), 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isRealMode]);

  // ── Action handlers ──
  const handleActionApprove = useCallback((actionId: string) => {
    setActionStatuses((prev) => ({ ...prev, [actionId]: "approved" }));
  }, []);

  const handleActionReject = useCallback((actionId: string) => {
    setActionStatuses((prev) => ({ ...prev, [actionId]: "rejected" }));
  }, []);

  // ── Build real mode nodes ──
  const realNodes = useMemo((): Node[] => {
    if (!isRealMode) return [];
    const result: Node[] = [];

    // Contract node
    if (parsedContract?.header) {
      const h = parsedContract.header;
      result.push({
        id: "contract",
        type: "contract",
        position: { x: CONTRACT_X, y: ROW_TOP },
        data: {
          title: h.subject,
          parties: {
            client: h.parties[0]?.name ?? "Client",
            dev: h.parties[1]?.name ?? "Developer",
          },
          value: h.payment.total,
          milestones: parsedContract.milestones?.milestones.length ?? 0,
          duration: `${h.timeline.durationDays} days`,
        },
      });
    }

    // Analysis node
    result.push({
      id: "analysis",
      type: "analysis",
      position: { x: ANALYSIS_X, y: ANALYSIS_Y },
      data: {
        label: plan
          ? "Analysis complete"
          : isAnalyzing
            ? "Sentinel analyzing..."
            : "Waiting for data",
        status: plan ? "done" : isAnalyzing ? "running" : "pending",
        findings: plan?.riskNotes.slice(0, 5) ?? [
          "Analyzing contract structure...",
          "Identifying milestones...",
          "Evaluating risks...",
        ],
      },
    });

    // Plan nodes with action statuses and callbacks
    for (const n of planLayout.nodes) {
      if (n.type === "action") {
        result.push({
          ...n,
          data: {
            ...n.data,
            status: actionStatuses[n.id] ?? "suggested",
            onApprove: () => handleActionApprove(n.id),
            onReject: () => handleActionReject(n.id),
          },
        });
      } else {
        result.push(n);
      }
    }

    return result;
  }, [
    isRealMode,
    parsedContract,
    plan,
    isAnalyzing,
    planLayout.nodes,
    actionStatuses,
    handleActionApprove,
    handleActionReject,
  ]);

  // ── Build real mode edges ──
  const realEdges = useMemo((): Edge[] => {
    if (!isRealMode) return [];
    const result: Edge[] = [
      {
        id: "e-contract-analysis",
        source: "contract",
        target: "analysis",
        type: "smoothstep",
        animated: isAnalyzing,
        style: {
          stroke: plan ? GREEN : ACCENT,
          strokeWidth: 2.5,
          strokeDasharray: plan ? undefined : "6 4",
        },
      },
    ];

    if (plan && plan.milestones.length > 0) {
      result.push({
        id: "e-analysis-m1",
        source: "analysis",
        sourceHandle: "to-milestones",
        target: plan.milestones[0].id,
        type: "smoothstep",
        style: { stroke: GREEN, strokeWidth: 2 },
      });

      result.push({
        id: "e-analysis-sentinel",
        source: "analysis",
        target: "sentinel-say",
        type: "smoothstep",
        style: {
          stroke: ACCENT,
          strokeWidth: 1.5,
          strokeDasharray: "5 3",
        },
      });
    }

    result.push(...planLayout.edges);
    return result;
  }, [isRealMode, plan, isAnalyzing, planLayout.edges]);

  // ── Choose mode ──
  const nodes = isRealMode ? realNodes : sim.nodes;
  const edges = isRealMode ? realEdges : sim.edges;
  const isRunning = isRealMode ? isAnalyzing : sim.isRunning;
  const progress = isRealMode
    ? plan
      ? 100
      : isAnalyzing
        ? 50
        : 0
    : sim.progress;
  const phase = isRealMode
    ? plan
      ? "Plan ready"
      : isAnalyzing
        ? "Generating plan..."
        : null
    : sim.stepIdx < 0
      ? null
      : sim.stepIdx < 1
        ? "Receiving contract"
        : sim.stepIdx < 2
          ? "Analyzing..."
          : sim.stepIdx < 3
            ? "Mapping milestones"
            : sim.stepIdx < 9
              ? "Suggesting actions"
              : sim.stepIdx < SIM_STEPS.length
                ? "Finalizing plan"
                : "Plan ready";

  const approvedCount = Object.values(actionStatuses).filter(
    (s) => s === "approved"
  ).length;

  // ── Approve all ──
  const handleApprove = useCallback(() => {
    setApproving(true);
    if (isRealMode && plan) {
      const statuses: Record<string, ActionStatus> = {};
      for (const action of plan.actions) {
        if (
          !actionStatuses[action.id] ||
          actionStatuses[action.id] === "suggested"
        ) {
          statuses[action.id] = "approved";
        }
      }
      setActionStatuses((prev) => ({ ...prev, ...statuses }));
    }
    setTimeout(() => setDeploying(true), 600);
  }, [isRealMode, plan, actionStatuses]);

  // Register for demo auto-click
  useEffect(() => {
    registerDemoAction("sentinel-approve", handleApprove);
  }, [handleApprove]);

  const handleDeployDone = () => {
    router.push("/contract/demo");
  };

  return (
    <div
      className="flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >
      <SentinelTopbar
        isRunning={isRunning}
        progress={progress}
        phase={phase}
        approving={approving}
        onApprove={handleApprove}
        approvedCount={isRealMode ? approvedCount : undefined}
      />

      <div className="flex flex-1 min-h-0">
        {/* Chat sidebar — real mode uses functional chat, sim mode hidden */}
        {chatOpen &&
          (isRealMode ? (
            <SentinelChat
              messages={messages}
              sendMessage={sendMessage}
              status={status}
              onClose={() => setChatOpen(false)}
            />
          ) : (
            <SimChatSidebar onClose={() => setChatOpen(false)} />
          ))}

        {/* Canvas */}
        <div className="relative flex-1 min-w-0">
          {/* Blur canvas while analyzing — no spinner */}
          {isRealMode && isAnalyzing && !plan && (
            <div className="absolute inset-0 z-10 backdrop-blur-sm" />
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={sentinelNodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            proOptions={{ hideAttribution: true }}
            nodesDraggable={false}
            nodesConnectable={false}
            elementsSelectable={false}
            panOnDrag
            zoomOnScroll
            minZoom={0.2}
            maxZoom={1.5}
          >
            <Background color="#27272a" gap={28} size={1} />
          </ReactFlow>
        </div>
      </div>

      {/* Floating chat button */}
      {!chatOpen && (
        <div className="fixed bottom-8 left-8 z-50">
          <button
            onClick={() => setChatOpen(true)}
            className="group relative overflow-hidden flex items-center gap-2.5 rounded-lg border border-accent/25 bg-accent/5 pl-3.5 pr-4.5 py-2.5 shadow-lg shadow-accent/5 backdrop-blur-sm transition-all duration-200 hover:bg-accent/10 hover:border-accent/40 hover:shadow-accent/15 active:scale-[0.97]"
          >
            {/* beam sweep */}
            <span className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_3s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent/15 to-transparent" />
            <div className="relative z-10 flex size-7 items-center justify-center rounded-md border border-accent/20 bg-accent/10">
              <SparklesIcon className="size-3.5 text-accent" />
            </div>
            <div className="relative z-10 pr-0.5">
              <p className="text-[12px] font-semibold leading-tight text-accent">
                Talk to Sentinel
              </p>
              <p className="text-[9px] text-muted-foreground/40 mt-px">
                Adjust plan
              </p>
            </div>
          </button>
        </div>
      )}

      {/* Skip to prefilled — shows while anything is loading */}
      {(sim.isRunning || (isRealMode && !plan)) && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2.5 animate-in fade-in-0 slide-in-from-bottom-4 duration-500 fill-mode-both" style={{ animationDelay: "1.5s" }}>
          <p className="text-[11px] text-muted-foreground/50 tracking-wider uppercase">
            AI is analyzing — this takes ~45s
          </p>
          <button
            onClick={() => {
              setParsedContract(null);
              setChatOpen(false);
              sim.skipToEnd();
            }}
            className="group relative overflow-hidden flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/5 px-5 py-2.5 text-sm font-medium text-accent shadow-lg shadow-accent/10 backdrop-blur-sm transition-all hover:bg-accent/10 hover:border-accent/50 hover:shadow-accent/20"
          >
            {/* beam sweep */}
            <span
              className="pointer-events-none absolute inset-0 -translate-x-full animate-[shimmer_2s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-accent/20 to-transparent"
              style={{ animationDelay: "0.5s" }}
            />
            <ZapIcon className="size-3.5 shrink-0 relative z-10" />
            <span className="relative z-10">Skip to prefilled demo</span>
            <ChevronRightIcon className="size-3.5 shrink-0 relative z-10 text-accent/50 transition-transform group-hover:translate-x-0.5" />
          </button>
        </div>
      )}

      <style>{`
        @keyframes sp-pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        @keyframes sp-spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes sp-appear {
          from { opacity: 0; transform: scale(0.85) translateX(-12px); }
          to { opacity: 1; transform: scale(1) translateX(0); }
        }
      `}</style>

      <DeployCinematic visible={deploying} onDone={handleDeployDone} />
    </div>
  );
}

// ── Sim Chat Sidebar (static, matches monolith visual) ──────────────────────

import {
  XIcon,
  SendIcon,
} from "lucide-react";

function SimChatSidebar({ onClose }: { onClose: () => void }) {
  return (
    <div
      className="flex flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0 min-h-0"
      style={{ width: 380 }}
    >
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{
            background: `oklch(0.7 0.18 50 / 0.12)`,
            border: `1px solid oklch(0.7 0.18 50 / 0.25)`,
          }}
        >
          <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">
            Sentinel Chat
          </p>
          <p className="text-[10px] text-muted-foreground/40">
            Contract assistant
          </p>
        </div>
        <button
          onClick={onClose}
          className="flex size-6 items-center justify-center rounded-md transition-all hover:bg-muted/20"
        >
          <XIcon className="size-3.5 text-muted-foreground/50" />
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
        <div className="flex gap-2.5">
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
            style={{
              background: `oklch(0.7 0.18 50 / 0.12)`,
              border: `1px solid oklch(0.7 0.18 50 / 0.2)`,
            }}
          >
            <SparklesIcon className="size-2.5" style={{ color: ACCENT }} />
          </div>
          <div
            className="rounded-xl rounded-tl-sm border px-3 py-2"
            style={{
              borderColor: `${MUTED}30`,
              background: `${MUTED}08`,
            }}
          >
            <p className="text-[11px] leading-relaxed text-foreground/75">
              I analyzed the Suassuna Clinic contract. I identified 4
              milestones and suggested 6 monitoring actions. What would you
              like to adjust?
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground/30">
              10:00
            </p>
          </div>
        </div>

        <div className="flex justify-end">
          <div
            className="rounded-xl rounded-tr-sm px-3 py-2"
            style={{
              background: `oklch(0.7 0.18 50 / 0.08)`,
              border: `1px solid oklch(0.7 0.18 50 / 0.15)`,
            }}
          >
            <p className="text-[11px] leading-relaxed text-foreground/75">
              The dev has a history of delays, I want more frequent
              follow-ups
            </p>
            <p
              className="mt-1 text-[9px] text-right"
              style={{ color: `oklch(0.7 0.18 50 / 0.35)` }}
            >
              10:02
            </p>
          </div>
        </div>

        <div className="flex gap-2.5">
          <div
            className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
            style={{
              background: `oklch(0.7 0.18 50 / 0.12)`,
              border: `1px solid oklch(0.7 0.18 50 / 0.2)`,
            }}
          >
            <SparklesIcon className="size-2.5" style={{ color: ACCENT }} />
          </div>
          <div
            className="rounded-xl rounded-tl-sm border px-3 py-2"
            style={{
              borderColor: `${MUTED}30`,
              background: `${MUTED}08`,
            }}
          >
            <p className="text-[11px] leading-relaxed text-foreground/75">
              Understood. I&apos;ll adjust the GitHub monitor to{" "}
              <span
                className="font-semibold"
                style={{ color: ACCENT }}
              >
                2x per day
              </span>{" "}
              and add a commit check 48h before each deadline.
            </p>
            <p className="mt-1 text-[9px] text-muted-foreground/30">
              10:02
            </p>
          </div>
        </div>
      </div>

      <div className="shrink-0 border-t border-border px-3 py-3">
        <div
          className="flex items-center gap-2 rounded-xl border px-3 py-2"
          style={{
            borderColor: `${MUTED}40`,
            background: `${MUTED}06`,
          }}
        >
          <input
            type="text"
            placeholder="Talk to Sentinel..."
            className="flex-1 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground/25"
          />
          <button
            className="flex size-7 items-center justify-center rounded-lg transition-all hover:brightness-125"
            style={{ background: ACCENT }}
          >
            <SendIcon
              className="size-3"
              style={{ color: "oklch(0.08 0.01 50)" }}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
