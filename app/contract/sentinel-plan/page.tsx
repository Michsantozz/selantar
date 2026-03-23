"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  useReactFlow,
  type Node,
  type Edge,
  type NodeProps,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { registerDemoAction } from "@/lib/demo-actions";
import {
  ShieldCheckIcon,
  CheckCircleIcon,
  FileTextIcon,
  GitBranchIcon,
  MessageCircleIcon,
  GlobeIcon,
  ServerIcon,
  WalletIcon,
  CalendarIcon,
  EyeIcon,
  SparklesIcon,
  ArrowRightIcon,
  LoaderIcon,
  CheckIcon,
  XIcon,
  ClockIcon,
  CircleDotIcon,
  SendIcon,
} from "lucide-react";
import { DeployCinematic } from "./_components/deploy-cinematic";

// ── Evolution API ─────────────────────────────────────────────────────────────

async function sendWhatsApp(text: string, delayMs = 1500) {
  try {
    await fetch("https://whats.vensa.pro/chat/sendPresence/testeultra2", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: "429683C4C977415CAAFCCE10F7D57E11" },
      body: JSON.stringify({ number: "5562994161690", options: { presence: "composing", delay: delayMs } }),
    });
    await new Promise((r) => setTimeout(r, delayMs));
    await fetch("https://whats.vensa.pro/message/sendText/testeultra2", {
      method: "POST",
      headers: { "Content-Type": "application/json", apikey: "429683C4C977415CAAFCCE10F7D57E11" },
      body: JSON.stringify({ number: "5562994161690", text, delay: 500 }),
    });
  } catch {
    // silently fail
  }
}

// ── Types ────────────────────────────────────────────────────────────────────

type ContractNodeData = {
  title: string;
  parties: { client: string; dev: string };
  value: string;
  milestones: number;
  duration: string;
};

type AnalysisNodeData = {
  label: string;
  findings: string[];
  status: "pending" | "running" | "done";
};

type ActionStatus = "pending" | "suggested" | "approved" | "rejected" | "sent" | "waiting" | "accepted" | "declined";

type ActionNodeData = {
  label: string;
  description: string;
  icon: keyof typeof actionIcons;
  frequency?: string;
  target?: string;
  status: ActionStatus;
  milestone?: string;
  sentTo?: string;
  timestamp?: string;
};

type MilestoneNodeData = {
  label: string;
  value: string;
  index: number;
};

type DateNodeData = {
  day: string;
  month: string;
  year?: string;
  isLate?: boolean;
};

type SentinelSayData = {
  text: string;
};

// ── Colors ───────────────────────────────────────────────────────────────────

const ACCENT = "oklch(0.7 0.18 50)";
const GREEN = "#22c55e";
const RED = "#ef4444";
const YELLOW = "#eab308";
const MUTED = "#3f3f46";
const BLUE = "#3b82f6";
const VIOLET = "#8b5cf6";

// ── Icon Map ─────────────────────────────────────────────────────────────────

const actionIcons = {
  github: GitBranchIcon,
  whatsapp: MessageCircleIcon,
  deploy: GlobeIcon,
  api: ServerIcon,
  escrow: WalletIcon,
  calendar: CalendarIcon,
  monitor: EyeIcon,
};

// ── Node Components ──────────────────────────────────────────────────────────

function ContractNode({ data }: NodeProps<Node<ContractNodeData>>) {
  return (
    <div
      className="flex flex-col rounded-2xl border backdrop-blur-sm overflow-hidden"
      style={{
        width: 320,
        borderColor: `oklch(0.7 0.18 50 / 0.4)`,
        background: `oklch(0.7 0.18 50 / 0.04)`,
        boxShadow: `0 0 30px oklch(0.7 0.18 50 / 0.08)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: `oklch(0.7 0.18 50 / 0.08)`,
          borderBottom: `1px solid oklch(0.7 0.18 50 / 0.15)`,
        }}
      >
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `oklch(0.7 0.18 50 / 0.15)`, border: `1px solid oklch(0.7 0.18 50 / 0.25)` }}
        >
          <FileTextIcon className="size-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `oklch(0.7 0.18 50 / 0.7)` }}>
            Contract Received
          </p>
          <p className="text-[13px] font-semibold text-foreground truncate">{data.title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3">
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Client</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.parties.client}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Dev</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.parties.dev}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Value</p>
          <p className="text-[11px] font-bold" style={{ color: GREEN }}>{data.value}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Deadline</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.duration}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Milestones</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.milestones} deliverables mapped</p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: ACCENT, border: "none", width: 10, height: 10, bottom: -5 }}
      />
    </div>
  );
}

function AnalysisNode({ data }: NodeProps<Node<AnalysisNodeData>>) {
  const isDone = data.status === "done";
  const isRunning = data.status === "running";

  return (
    <div
      className="flex flex-col rounded-2xl border backdrop-blur-sm"
      style={{
        width: 320,
        borderColor: isDone ? `${GREEN}50` : isRunning ? ACCENT : `${MUTED}50`,
        background: isDone ? `${GREEN}04` : isRunning ? `oklch(0.7 0.18 50 / 0.04)` : `oklch(0.11 0.005 50 / 0.8)`,
        boxShadow: isRunning ? `0 0 30px oklch(0.7 0.18 50 / 0.1)` : undefined,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: isDone ? GREEN : ACCENT, border: "none", width: 10, height: 10, top: -5 }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-3 rounded-t-2xl px-4 py-3"
        style={{
          borderBottom: `1px solid ${isDone ? `${GREEN}15` : isRunning ? `oklch(0.7 0.18 50 / 0.12)` : `${MUTED}30`}`,
          background: isDone ? `${GREEN}06` : isRunning ? `oklch(0.7 0.18 50 / 0.06)` : `${MUTED}08`,
        }}
      >
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{
            background: isDone ? `${GREEN}18` : `oklch(0.7 0.18 50 / 0.15)`,
            border: `1.5px solid ${isDone ? `${GREEN}35` : `oklch(0.7 0.18 50 / 0.3)`}`,
          }}
        >
          {isDone ? (
            <CheckCircleIcon className="size-3.5" style={{ color: GREEN }} />
          ) : isRunning ? (
            <LoaderIcon className="size-3.5" style={{ color: ACCENT, animation: "sp-spin 1.5s linear infinite" }} />
          ) : (
            <ShieldCheckIcon className="size-3.5" style={{ color: MUTED }} />
          )}
        </div>
        <p className="text-[13px] font-semibold text-foreground">{data.label}</p>
      </div>

      {/* Findings */}
      <div className="flex flex-col gap-1.5 px-4 py-3">
        {(data.findings as string[]).map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircleIcon
              className="size-3 mt-0.5 shrink-0"
              style={{
                color: isDone ? GREEN : isRunning && i < 2 ? ACCENT : MUTED,
                opacity: isDone || (isRunning && i < 2) ? 0.8 : 0.3,
                transition: "all 0.3s",
              }}
            />
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: isDone || (isRunning && i < 2) ? "var(--foreground)" : MUTED,
                opacity: isDone || (isRunning && i < 2) ? 0.7 : 0.4,
                transition: "all 0.3s",
              }}
            >
              {f}
            </p>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: isDone ? GREEN : ACCENT, border: "none", width: 10, height: 10, bottom: -5 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="to-milestones"
        style={{ background: isDone ? GREEN : ACCENT, border: "none", width: 8, height: 8 }}
      />
    </div>
  );
}

const statusConfig: Record<ActionStatus, { label: string; color: string; bg: string; border: string; icon: typeof CheckIcon; animate?: boolean }> = {
  pending:   { label: "",                color: MUTED,   bg: "transparent",    border: `${MUTED}40`,  icon: CircleDotIcon },
  suggested: { label: "Suggestion",      color: ACCENT,  bg: `oklch(0.7 0.18 50 / 0.04)`, border: `oklch(0.7 0.18 50 / 0.4)`, icon: SparklesIcon, animate: true },
  approved:  { label: "Approved",        color: GREEN,   bg: `${GREEN}04`,     border: `${GREEN}40`,  icon: CheckIcon },
  rejected:  { label: "Rejected",        color: RED,     bg: `${RED}04`,       border: `${RED}30`,    icon: XIcon },
  sent:      { label: "Sent",            color: BLUE,    bg: `${BLUE}04`,      border: `${BLUE}40`,   icon: ArrowRightIcon },
  waiting:   { label: "Waiting",         color: YELLOW,  bg: `${YELLOW}04`,    border: `${YELLOW}40`, icon: ClockIcon, animate: true },
  accepted:  { label: "Accepted",        color: GREEN,   bg: `${GREEN}06`,     border: `${GREEN}50`,  icon: CheckCircleIcon },
  declined:  { label: "Declined",        color: RED,     bg: `${RED}04`,       border: `${RED}30`,    icon: XIcon },
};

function ActionNode({ data }: NodeProps<Node<ActionNodeData>>) {
  const icon = data.icon as keyof typeof actionIcons;
  const status = data.status as ActionStatus;
  const Icon = actionIcons[icon];
  const st = statusConfig[status];
  const isPending = status === "pending";
  const isSuggested = status === "suggested";

  const colorMap: Record<string, string> = {
    github: VIOLET,
    whatsapp: "#25D366",
    deploy: BLUE,
    api: YELLOW,
    escrow: GREEN,
    calendar: ACCENT,
    monitor: ACCENT,
  };

  const actionColor = colorMap[icon];

  return (
    <div
      className="flex flex-col rounded-xl border backdrop-blur-sm overflow-hidden"
      style={{
        width: 290,
        borderColor: isPending ? `${MUTED}40` : st.border,
        background: isPending ? "oklch(0.11 0.005 50 / 0.6)" : st.bg,
        boxShadow: isSuggested ? `0 0 24px ${actionColor}10` : undefined,
        opacity: status === "rejected" || status === "declined" ? 0.5 : isPending ? 0.4 : 1,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: isSuggested ? "sp-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: actionColor, border: "none", width: 8, height: 8, top: -4 }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5"
        style={{
          borderBottom: `1px solid ${isPending ? `${MUTED}20` : `${st.color}15`}`,
          background: isPending ? `${MUTED}06` : `${actionColor}06`,
        }}
      >
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: `${actionColor}15`, border: `1px solid ${actionColor}25` }}
        >
          <Icon className="size-3" style={{ color: actionColor }} />
        </div>
        <p className="text-[12px] font-semibold text-foreground/90 flex-1 truncate">
          {data.label}
        </p>

        {/* Status badge */}
        {!isPending && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: `${st.color}12`,
              border: `1px solid ${st.color}25`,
              animation: st.animate ? "sp-pulse 2s ease-in-out infinite" : undefined,
            }}
          >
            <st.icon className="size-2.5" style={{ color: st.color }} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: st.color }}>
              {st.label}
            </span>
          </div>
        )}
      </div>

      {/* Timestamp bar */}
      {data.timestamp && !isPending && (
        <div className="flex items-center gap-1.5 px-3.5 py-1" style={{ background: `${st.color}04`, borderBottom: `1px solid ${st.color}08` }}>
          <ClockIcon className="size-2.5" style={{ color: `${st.color}80` }} />
          <span className="text-[9px] font-mono" style={{ color: `${st.color}90` }}>
            {data.timestamp}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-2 px-3.5 py-2.5">
        <p className="text-[10px] leading-relaxed text-muted-foreground/70">
          {data.description}
        </p>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          {data.frequency && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
              style={{ color: `${actionColor}cc`, background: `${actionColor}10`, border: `1px solid ${actionColor}20` }}
            >
              <ClockIcon className="size-2" />
              {data.frequency}
            </span>
          )}
          {data.target && (
            <span
              className="rounded-full px-2 py-0.5 text-[8px] font-medium text-muted-foreground/50"
              style={{ background: `${MUTED}15`, border: `1px solid ${MUTED}25` }}
            >
              {data.target}
            </span>
          )}
          {data.milestone && (
            <span
              className="rounded-full px-2 py-0.5 text-[8px] font-medium"
              style={{ color: ACCENT, background: `oklch(0.7 0.18 50 / 0.08)`, border: `1px solid oklch(0.7 0.18 50 / 0.2)` }}
            >
              {data.milestone}
            </span>
          )}
        </div>

        {/* Sent to indicator */}
        {data.sentTo && ["sent", "waiting", "accepted", "declined"].includes(status) && (
          <div
            className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 mt-0.5"
            style={{
              borderColor: `${st.color}20`,
              background: `${st.color}06`,
            }}
          >
            <MessageCircleIcon className="size-3 shrink-0" style={{ color: st.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground/50">
                {status === "sent" ? "Sent to" : status === "waiting" ? "Awaiting response from" : status === "accepted" ? "Accepted by" : "Declined by"}
              </p>
              <p className="text-[10px] font-semibold truncate" style={{ color: st.color }}>
                {data.sentTo}
              </p>
            </div>
            {status === "waiting" && (
              <LoaderIcon className="size-3 shrink-0" style={{ color: YELLOW, animation: "sp-spin 2s linear infinite" }} />
            )}
          </div>
        )}

        {/* Action buttons (only when suggested) */}
        {isSuggested && (
          <div className="flex gap-2 mt-1">
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10px] font-semibold transition-all hover:brightness-125"
              style={{ borderColor: `${GREEN}40`, background: `${GREEN}10`, color: GREEN }}
            >
              <CheckIcon className="size-3" />
              Approve
            </button>
            <button
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10px] font-semibold transition-all hover:brightness-125"
              style={{ borderColor: `${RED}30`, background: `${RED}08`, color: `${RED}cc` }}
            >
              <XIcon className="size-3" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function DateNode({ data }: NodeProps<Node<DateNodeData>>) {
  const isLate = data.isLate ?? false;
  const color = isLate ? RED : ACCENT;

  return (
    <div
      className="relative"
      style={{
        width: 120,
        animation: "sp-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Outer container — pill shape */}
      <div
        style={{
          borderRadius: 20,
          border: `2px solid ${color}`,
          background: `oklch(0.08 0.01 50)`,
          overflow: "hidden",
        }}
      >
        {/* Top accent strip — solid color bar */}
        <div style={{ height: 4, background: color }} />

        {/* Content */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Calendar icon circle */}
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `${color}`,
              boxShadow: `0 0 16px ${color}40`,
            }}
          >
            <CalendarIcon className="size-4" style={{ color: "oklch(0.08 0.01 50)" }} />
          </div>

          {/* Date text */}
          <div>
            <p
              className="font-mono text-[22px] font-black leading-none tabular-nums tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              {data.day}
            </p>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mt-0.5"
              style={{ color }}
            >
              {data.month}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom connector — vertical line + dot */}
      <div className="flex flex-col items-center">
        <div style={{ width: 2, height: 12, background: `${color}40` }} />
        <div
          className="size-2 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, border: "none", width: 0, height: 0, bottom: 0, opacity: 0 }}
      />
    </div>
  );
}

function MilestoneNode({ data }: NodeProps<Node<MilestoneNodeData>>) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        width: 240,
        borderRadius: 16,
        border: `1.5px solid oklch(0.7 0.18 50 / 0.25)`,
        background: `oklch(0.1 0.005 50 / 0.85)`,
        boxShadow: `0 4px 20px oklch(0.7 0.18 50 / 0.04), inset 0 1px 0 oklch(0.7 0.18 50 / 0.06)`,
        animation: "sp-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: ACCENT, border: "none", width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="from-date"
        style={{ background: "transparent", border: "none", width: 0, height: 0, top: 0 }}
      />

      {/* Index badge */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-black"
        style={{
          background: `oklch(0.7 0.18 50 / 0.1)`,
          color: ACCENT,
          border: `1.5px solid oklch(0.7 0.18 50 / 0.2)`,
          boxShadow: `0 0 12px oklch(0.7 0.18 50 / 0.08)`,
        }}
      >
        M{data.index}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground/85 truncate tracking-tight">
          {data.label}
        </p>
        <span
          className="font-mono text-[10px] font-bold tabular-nums"
          style={{ color: GREEN }}
        >
          {data.value}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: ACCENT, border: "none", width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="actions"
        style={{ background: MUTED, border: "none", width: 8, height: 8, bottom: -4 }}
      />
    </div>
  );
}

function SentinelSayNode({ data }: NodeProps<Node<SentinelSayData>>) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border p-3.5 shadow-lg"
      style={{
        width: 280,
        borderColor: `oklch(0.7 0.18 50 / 0.35)`,
        background: `oklch(0.7 0.18 50 / 0.04)`,
        animation: "sp-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: ACCENT, border: "none", width: 8, height: 8, top: -4 }}
      />
      <div
        className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{ background: `oklch(0.7 0.18 50 / 0.15)`, border: `1px solid oklch(0.7 0.18 50 / 0.25)` }}
      >
        <SparklesIcon className="size-3" style={{ color: ACCENT }} />
      </div>
      <p className="text-[11px] leading-relaxed font-medium" style={{ color: `oklch(0.75 0.14 55)` }}>
        {data.text}
      </p>
    </div>
  );
}

// ── Node Types ───────────────────────────────────────────────────────────────

const nodeTypes = {
  contract: ContractNode,
  analysis: AnalysisNode,
  action: ActionNode,
  date: DateNode,
  milestone: MilestoneNode,
  sentinel: SentinelSayNode,
};

// ── Layout ───────────────────────────────────────────────────────────────────

const ROW_TOP = 0;           // contract + analysis stacked left
const ROW_MILESTONES = 80;   // milestone horizontal spine
const ROW_ACTIONS = 210;     // actions drop below milestones
const MS_X_START = 0;        // first milestone X
const MS_GAP_X = 340;        // horizontal gap between milestones (wider for action cards)
const CONTRACT_X = -420;     // contract node, left of milestones
const ANALYSIS_X = -420;     // analysis node, below contract
const ANALYSIS_Y = 220;
const SENTINEL_X = -420;
const SENTINEL_Y = 500;

// ── Sim Steps ────────────────────────────────────────────────────────────────

type SimAction = "analyze-start" | "analyze-done" | "show-milestones" | "show-action" | "set-status" | "show-sentinel";

type SimStep = {
  action: SimAction;
  targetId?: string;
  status?: ActionStatus;
  sentTo?: string;
  timestamp?: string;
  delay: number;
};

const SIM_STEPS: SimStep[] = [
  // ── Phase 1: Analysis ─────────────────────────────────────────────────────
  { action: "analyze-start", delay: 600 },
  { action: "analyze-done",  delay: 1800 },
  { action: "show-milestones", delay: 700 },

  // ── Phase 2: Actions appear as suggestions ────────────────────────────────
  { action: "show-action", targetId: "act-github",      timestamp: "21 Mar · 10:00", delay: 600 },
  { action: "show-action", targetId: "act-whatsapp-m1", timestamp: "21 Mar · 10:00", delay: 450 },
  { action: "show-action", targetId: "act-deploy",      timestamp: "21 Mar · 10:01", delay: 450 },
  { action: "show-action", targetId: "act-api",         timestamp: "21 Mar · 10:01", delay: 450 },
  { action: "show-action", targetId: "act-whatsapp-m3", timestamp: "21 Mar · 10:01", delay: 450 },
  { action: "show-action", targetId: "act-escrow",      timestamp: "21 Mar · 10:01", delay: 450 },

  // ── Sentinel speaks ───────────────────────────────────────────────────────
  { action: "show-sentinel", targetId: "sentinel-say", delay: 900 },

  // ── Phase 3: User approves → agent dispatches ─────────────────────────────
  // GitHub: approved → sent → waiting (still open — awaiting dev)
  { action: "set-status", targetId: "act-github", status: "approved", timestamp: "21 Mar · 10:02", delay: 600 },
  { action: "set-status", targetId: "act-github", status: "sent",     sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:02", delay: 400 },
  { action: "set-status", targetId: "act-github", status: "waiting",  sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:02 — awaiting confirmation", delay: 550 },

  // WhatsApp M1: approved → sent → waiting (still open — awaiting both)
  { action: "set-status", targetId: "act-whatsapp-m1", status: "approved", timestamp: "21 Mar · 10:03", delay: 350 },
  { action: "set-status", targetId: "act-whatsapp-m1", status: "sent",     sentTo: "Dr. Suassuna & Matheus", timestamp: "21 Mar · 10:03", delay: 350 },
  { action: "set-status", targetId: "act-whatsapp-m1", status: "waiting",  sentTo: "Dr. Suassuna & Matheus", timestamp: "21 Mar · 10:03 — scheduled for Mar 29", delay: 500 },

  // Deploy: approved → sent → accepted ✓
  { action: "set-status", targetId: "act-deploy", status: "approved", timestamp: "21 Mar · 10:04", delay: 350 },
  { action: "set-status", targetId: "act-deploy", status: "sent",     sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:04", delay: 350 },
  { action: "set-status", targetId: "act-deploy", status: "accepted", sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:08 — staging.clinica-suassuna.com", delay: 750 },

  // API: approved → sent → declined ✗ (dev declined — endpoints not ready)
  { action: "set-status", targetId: "act-api", status: "approved", timestamp: "21 Mar · 10:05", delay: 350 },
  { action: "set-status", targetId: "act-api", status: "sent",     sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:05", delay: 350 },
  { action: "set-status", targetId: "act-api", status: "declined", sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:12 — endpoints not ready yet", delay: 700 },

  // WhatsApp M3: rejected by user (removed from plan)
  { action: "set-status", targetId: "act-whatsapp-m3", status: "rejected", timestamp: "21 Mar · 10:06 — removed by user", delay: 400 },

  // Escrow: approved → sent → waiting (still open — awaiting signature)
  { action: "set-status", targetId: "act-escrow", status: "approved", timestamp: "21 Mar · 10:07", delay: 350 },
  { action: "set-status", targetId: "act-escrow", status: "sent",     sentTo: "Both parties", timestamp: "21 Mar · 10:07", delay: 350 },
  { action: "set-status", targetId: "act-escrow", status: "waiting",  sentTo: "Both parties", timestamp: "21 Mar · 10:07 — awaiting signature", delay: 500 },

  // ── Phase 4: GitHub responds — accepted ✓ ─────────────────────────────────
  { action: "set-status", targetId: "act-github", status: "accepted", sentTo: "Matheus (dev)", timestamp: "21 Mar · 10:14 — dev confirmou acesso", delay: 1000 },
];

// ── Initial Data ─────────────────────────────────────────────────────────────

const initialNodes: Node[] = [
  // ── Contract (top-left) ──
  {
    id: "contract", type: "contract", position: { x: CONTRACT_X, y: ROW_TOP },
    data: {
      title: "Site Clinica Suassuna",
      parties: { client: "Dr. Suassuna", dev: "Matheus (ULTRASELF)" },
      value: "R$ 4.800 + R$ 400/mo",
      milestones: 4,
      duration: "70 days",
    },
  },

  // ── Analysis (below contract) ──
  {
    id: "analysis", type: "analysis", position: { x: ANALYSIS_X, y: ANALYSIS_Y },
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

  // ── Date nodes (above milestones, hidden) ──
  {
    id: "d1", type: "date", position: { x: MS_X_START + 74, y: ROW_MILESTONES - 80 }, hidden: true,
    data: { day: "01", month: "Apr" },
  },
  {
    id: "d2", type: "date", position: { x: MS_X_START + MS_GAP_X + 74, y: ROW_MILESTONES - 80 }, hidden: true,
    data: { day: "15", month: "Apr" },
  },
  {
    id: "d3", type: "date", position: { x: MS_X_START + MS_GAP_X * 2 + 74, y: ROW_MILESTONES - 80 }, hidden: true,
    data: { day: "01", month: "May" },
  },
  {
    id: "d4", type: "date", position: { x: MS_X_START + MS_GAP_X * 3 + 74, y: ROW_MILESTONES - 80 }, hidden: true,
    data: { day: "10", month: "May" },
  },

  // ── Milestones (horizontal spine, hidden) ──
  {
    id: "m1", type: "milestone", position: { x: MS_X_START, y: ROW_MILESTONES }, hidden: true,
    data: { label: "Design System", value: "R$ 800", index: 1 },
  },
  {
    id: "m2", type: "milestone", position: { x: MS_X_START + MS_GAP_X, y: ROW_MILESTONES }, hidden: true,
    data: { label: "Frontend + CMS", value: "R$ 1.200", index: 2 },
  },
  {
    id: "m3", type: "milestone", position: { x: MS_X_START + MS_GAP_X * 2, y: ROW_MILESTONES }, hidden: true,
    data: { label: "API Integration", value: "R$ 1.600", index: 3 },
  },
  {
    id: "m4", type: "milestone", position: { x: MS_X_START + MS_GAP_X * 3, y: ROW_MILESTONES }, hidden: true,
    data: { label: "Go-Live + Support", value: "R$ 1.200", index: 4 },
  },

  // ── Actions (below their milestone, hidden) ──
  // M1 actions
  {
    id: "act-github", type: "action", position: { x: MS_X_START - 20, y: ROW_ACTIONS }, hidden: true,
    data: {
      label: "Monitor GitHub",
      description: "I'll track commits and PRs in the repo. If there's 5 days of inactivity, I notify the dev.",
      icon: "github", frequency: "daily", target: "ultraself/clinica-suassuna",
      status: "pending",
    },
  },
  {
    id: "act-whatsapp-m1", type: "action", position: { x: MS_X_START - 20, y: ROW_ACTIONS + 280 }, hidden: true,
    data: {
      label: "Follow-up M1 via WhatsApp",
      description: "3 days before the Design System deadline, I send a message to the dev asking for status and to the client to prepare their review.",
      icon: "whatsapp", frequency: "pre-milestone", milestone: "M1 · Design System",
      status: "pending",
    },
  },
  // M2 action
  {
    id: "act-deploy", type: "action", position: { x: MS_X_START + MS_GAP_X - 20, y: ROW_ACTIONS }, hidden: true,
    data: {
      label: "Verify Staging Deploy",
      description: "Before releasing M2, I check if staging is up and accessible. I test the URL and take a screenshot.",
      icon: "deploy", frequency: "pre-release", milestone: "M2 · Frontend",
      status: "pending",
    },
  },
  // M3 actions
  {
    id: "act-api", type: "action", position: { x: MS_X_START + MS_GAP_X * 2 - 20, y: ROW_ACTIONS }, hidden: true,
    data: {
      label: "Audit Endpoints",
      description: "I test the scheduling endpoints before M3 delivery. If they return 4xx/5xx, I block the release.",
      icon: "api", frequency: "pre-release", milestone: "M3 · Integration",
      status: "pending",
    },
  },
  {
    id: "act-whatsapp-m3", type: "action", position: { x: MS_X_START + MS_GAP_X * 2 - 20, y: ROW_ACTIONS + 280 }, hidden: true,
    data: {
      label: "Enforce Client SLA",
      description: "If the client doesn't respond to the review in 48h, I send a follow-up. After 72h, I escalate to the mediator.",
      icon: "whatsapp", frequency: "post-delivery", target: "Dr. Suassuna",
      status: "pending",
    },
  },
  // M4 action
  {
    id: "act-escrow", type: "action", position: { x: MS_X_START + MS_GAP_X * 3 - 20, y: ROW_ACTIONS }, hidden: true,
    data: {
      label: "Control Escrow",
      description: "I release payment ONLY after confirmation from both parties. No manual approval, no release.",
      icon: "escrow", frequency: "per milestone",
      status: "pending",
    },
  },

  // ── Sentinel says (bottom-left, hidden) ──
  {
    id: "sentinel-say", type: "sentinel", position: { x: SENTINEL_X, y: SENTINEL_Y }, hidden: true,
    data: {
      text: "Monitoring plan ready. 6 actions suggested covering GitHub, WhatsApp, deploys, APIs and escrow. Approve all or adjust individually.",
    },
  },
];

const initialEdges: Edge[] = [
  // Contract → Analysis (vertical)
  { id: "e-contract-analysis", source: "contract", target: "analysis", type: "smoothstep", style: { stroke: ACCENT, strokeWidth: 2.5, strokeDasharray: "6 4" } },

  // Analysis → M1 (hidden, connects analysis to milestone spine via right handle)
  { id: "e-analysis-m1", source: "analysis", sourceHandle: "to-milestones", target: "m1", type: "smoothstep", hidden: true, style: { stroke: GREEN, strokeWidth: 2 } },

  // Date → Milestone (hidden, thin dotted connector)
  { id: "e-d1-m1", source: "d1", target: "m1", targetHandle: "from-date", type: "smoothstep", hidden: true, style: { stroke: `oklch(0.7 0.18 50 / 0.2)`, strokeWidth: 1, strokeDasharray: "2 4" } },
  { id: "e-d2-m2", source: "d2", target: "m2", targetHandle: "from-date", type: "smoothstep", hidden: true, style: { stroke: `oklch(0.7 0.18 50 / 0.2)`, strokeWidth: 1, strokeDasharray: "2 4" } },
  { id: "e-d3-m3", source: "d3", target: "m3", targetHandle: "from-date", type: "smoothstep", hidden: true, style: { stroke: `oklch(0.7 0.18 50 / 0.2)`, strokeWidth: 1, strokeDasharray: "2 4" } },
  { id: "e-d4-m4", source: "d4", target: "m4", targetHandle: "from-date", type: "smoothstep", hidden: true, style: { stroke: `oklch(0.7 0.18 50 / 0.2)`, strokeWidth: 1, strokeDasharray: "2 4" } },

  // Milestone horizontal spine (hidden)
  { id: "e-m1-m2", source: "m1", target: "m2", type: "smoothstep", hidden: true, style: { stroke: ACCENT, strokeWidth: 2 } },
  { id: "e-m2-m3", source: "m2", target: "m3", type: "smoothstep", hidden: true, style: { stroke: ACCENT, strokeWidth: 2 } },
  { id: "e-m3-m4", source: "m3", target: "m4", type: "smoothstep", hidden: true, style: { stroke: ACCENT, strokeWidth: 2 } },

  // Milestone → Actions (vertical drop, hidden)
  { id: "e-m1-github", source: "m1", sourceHandle: "actions", target: "act-github", type: "smoothstep", hidden: true, style: { stroke: VIOLET, strokeWidth: 1.5, strokeDasharray: "5 3" } },
  { id: "e-m1-whatsapp", source: "m1", sourceHandle: "actions", target: "act-whatsapp-m1", type: "smoothstep", hidden: true, style: { stroke: "#25D366", strokeWidth: 1.5, strokeDasharray: "5 3" } },
  { id: "e-m2-deploy", source: "m2", sourceHandle: "actions", target: "act-deploy", type: "smoothstep", hidden: true, style: { stroke: BLUE, strokeWidth: 1.5, strokeDasharray: "5 3" } },
  { id: "e-m3-api", source: "m3", sourceHandle: "actions", target: "act-api", type: "smoothstep", hidden: true, style: { stroke: YELLOW, strokeWidth: 1.5, strokeDasharray: "5 3" } },
  { id: "e-m3-whatsapp2", source: "m3", sourceHandle: "actions", target: "act-whatsapp-m3", type: "smoothstep", hidden: true, style: { stroke: "#25D366", strokeWidth: 1.5, strokeDasharray: "5 3" } },
  { id: "e-m4-escrow", source: "m4", sourceHandle: "actions", target: "act-escrow", type: "smoothstep", hidden: true, style: { stroke: GREEN, strokeWidth: 1.5, strokeDasharray: "5 3" } },

  // Sentinel say (from analysis)
  { id: "e-analysis-sentinel", source: "analysis", target: "sentinel-say", type: "smoothstep", hidden: true, style: { stroke: ACCENT, strokeWidth: 1.5, strokeDasharray: "5 3" } },
];

// ── Simulation Hook ──────────────────────────────────────────────────────────

function useSentinelPlanSim() {
  const [nodes, setNodes] = useState<Node[]>(initialNodes);
  const [edges, setEdges] = useState<Edge[]>(initialEdges);
  const [stepIdx, setStepIdx] = useState(-1);
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const updateNodeData = useCallback((id: string, patch: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, data: { ...n.data, ...patch } } : n));
  }, []);

  const revealNode = useCallback((id: string, patch?: Record<string, unknown>) => {
    setNodes((prev) => prev.map((n) => n.id === id ? { ...n, hidden: false, data: patch ? { ...n.data, ...patch } : n.data } : n));
  }, []);

  const revealEdge = useCallback((source: string, target: string) => {
    setEdges((prev) => prev.map((e) =>
      (e.source === source && e.target === target) ? { ...e, hidden: false, animated: true } : e
    ));
  }, []);

  const startSim = useCallback(() => {
    setIsRunning(true);
    setStepIdx(0);
    setProgress(0);
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, []);

  useEffect(() => {
    if (!isRunning || stepIdx < 0 || stepIdx >= SIM_STEPS.length) {
      if (stepIdx >= SIM_STEPS.length) setIsRunning(false);
      return;
    }

    const step = SIM_STEPS[stepIdx];

    const timer = setTimeout(() => {
      switch (step.action) {
        case "analyze-start":
          updateNodeData("analysis", { status: "running", label: "Sentinel analyzing..." });
          setEdges((prev) => prev.map((e) =>
            e.id === "e-contract-analysis" ? { ...e, animated: true, style: { ...e.style, stroke: ACCENT, strokeDasharray: undefined } } : e
          ));
          break;

        case "analyze-done":
          updateNodeData("analysis", { status: "done", label: "Analysis complete" });
          setEdges((prev) => prev.map((e) =>
            e.id === "e-contract-analysis" ? { ...e, animated: false, style: { ...e.style, stroke: GREEN, strokeDasharray: undefined } } : e
          ));
          break;

        case "show-milestones":
          // Reveal dates first
          ["d1", "d2", "d3", "d4"].forEach((id) => revealNode(id));
          // Then milestones
          ["m1", "m2", "m3", "m4"].forEach((id) => revealNode(id));
          // Date → Milestone edges
          revealEdge("d1", "m1");
          revealEdge("d2", "m2");
          revealEdge("d3", "m3");
          revealEdge("d4", "m4");
          // Spine edges
          revealEdge("analysis", "m1");
          revealEdge("m1", "m2");
          revealEdge("m2", "m3");
          revealEdge("m3", "m4");
          break;

        case "show-action":
          if (step.targetId) {
            revealNode(step.targetId, { status: "suggested", timestamp: step.timestamp });
            // Find and reveal the edge to this action
            setEdges((prev) => prev.map((e) =>
              e.target === step.targetId ? { ...e, hidden: false, animated: true } : e
            ));
          }
          break;

        case "set-status":
          if (step.targetId) {
            const patch: Record<string, unknown> = { status: step.status };
            if (step.sentTo) patch.sentTo = step.sentTo;
            if (step.timestamp) patch.timestamp = step.timestamp;
            updateNodeData(step.targetId, patch);

            // Fetch real GitHub data when github node is accepted
            if (step.targetId === "act-github" && step.status === "accepted") {
              fetch("https://api.github.com/repos/Michsantozz/openclaw/commits?per_page=1")
                .then((r) => r.json())
                .then((commits) => {
                  const c = commits[0];
                  if (!c) return;
                  const sha = c.sha.slice(0, 7);
                  const msg = c.commit.message.split("\n")[0].slice(0, 50);
                  const author = c.commit.author.name;
                  const date = new Date(c.commit.author.date).toLocaleString("pt-BR", {
                    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit",
                  });
                  updateNodeData("act-github", {
                    target: "Michsantozz/openclaw",
                    description: `Last commit: "${msg}" by ${author} · ${date} · ${sha}`,
                  });
                })
                .catch(() => {/* silently fail */});
            }
          }
          break;

        case "show-sentinel":
          if (step.targetId) {
            revealNode(step.targetId);
            revealEdge("analysis", "sentinel-say");
          }
          break;
      }

      setProgress(((stepIdx + 1) / SIM_STEPS.length) * 100);
      setStepIdx((prev) => prev + 1);
    }, step.delay);

    return () => clearTimeout(timer);
  }, [stepIdx, isRunning, updateNodeData, revealNode, revealEdge]);

  return { nodes, edges, isRunning, progress, stepIdx, startSim };
}

// ── Page ─────────────────────────────────────────────────────────────────────


export default function SentinelPlanPage() {
  const { nodes, edges, isRunning, progress, stepIdx, startSim } = useSentinelPlanSim();
  const [chatOpen, setChatOpen] = useState(false);
  const [approving, setApproving] = useState(false);
  const [deploying, setDeploying] = useState(false);
  const router = useRouter();

  // Auto-start on mount
  useEffect(() => {
    const t = setTimeout(() => startSim(), 600);
    return () => clearTimeout(t);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleApprove = () => {
    setApproving(true);
    setTimeout(() => setDeploying(true), 600);
  };

  // Register for demo auto-click
  useEffect(() => {
    registerDemoAction("sentinel-approve", handleApprove);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDeployDone = () => {
    router.push("/contract/demo");
  };

  const phase =
    stepIdx < 0 ? null :
    stepIdx < 1 ? "Receiving contract" :
    stepIdx < 2 ? "Analyzing..." :
    stepIdx < 3 ? "Mapping milestones" :
    stepIdx < 9 ? "Suggesting actions" :
    stepIdx < SIM_STEPS.length ? "Finalizing plan" :
    "Plan ready";

  return (
    <div className="flex flex-col bg-background" style={{ height: "100dvh" }}>
      {/* ── Topbar ── */}
      <div className="shrink-0 flex h-14 items-center gap-3 border-b border-border bg-card/50 px-6">
        <div
          className="flex size-9 items-center justify-center rounded-xl border"
          style={{
            background: isRunning ? `oklch(0.7 0.18 50 / 0.12)` : `oklch(0.7 0.18 50 / 0.08)`,
            borderColor: `oklch(0.7 0.18 50 / 0.3)`,
            boxShadow: isRunning ? `0 0 16px oklch(0.7 0.18 50 / 0.2)` : undefined,
            transition: "all 0.5s",
          }}
        >
          <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
        </div>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground tracking-tight">Sentinel</h1>
          <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
            Monitoring Plan
          </p>
        </div>

        <div className="ml-auto flex items-center gap-4">
          {isRunning && phase && (
            <div className="flex items-center gap-2 rounded-full border px-3 py-1"
              style={{ borderColor: `oklch(0.7 0.18 50 / 0.2)`, background: `oklch(0.7 0.18 50 / 0.05)` }}>
              <div className="size-1.5 rounded-full" style={{ background: ACCENT, animation: "sp-pulse 1s ease-in-out infinite" }} />
              <span className="text-[11px] text-accent font-medium">{phase}</span>
            </div>
          )}

          {progress > 0 && (
            <div className="flex items-center gap-2.5">
              <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: `${MUTED}30` }}>
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress}%`,
                    background: progress === 100 ? GREEN : `linear-gradient(90deg, ${ACCENT}, oklch(0.75 0.15 60))`,
                    transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                  }}
                />
              </div>
              <span className="text-[10px] font-mono tabular-nums" style={{ color: progress === 100 ? GREEN : MUTED }}>
                {Math.round(progress)}%
              </span>
            </div>
          )}

          {!isRunning && progress === 100 && (
            <>
              <div className="flex items-center gap-1.5 rounded-full border px-3 py-1"
                style={{ borderColor: `${GREEN}40`, background: `${GREEN}08` }}>
                <CheckCircleIcon className="size-3" style={{ color: GREEN }} />
                <span className="text-[11px] font-semibold" style={{ color: GREEN }}>5 actions approved</span>
              </div>

              <button
                onClick={handleApprove}
                disabled={approving}
                className="flex items-center gap-2 rounded-xl border px-5 py-2 text-xs font-semibold transition-all disabled:opacity-50"
                style={{
                  borderColor: `${GREEN}50`,
                  background: `${GREEN}10`,
                  color: GREEN,
                }}
              >
                {approving ? (
                  <>
                    <LoaderIcon className="size-3" style={{ animation: "sp-spin 1.5s linear infinite" }} />
                    Activating...
                  </>
                ) : (
                  <>
                    <CheckCircleIcon className="size-3" />
                    Approve plan and activate contract
                    <ArrowRightIcon className="size-3" />
                  </>
                )}
              </button>
            </>
          )}

          {isRunning && (
            <button
              disabled
              className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold opacity-30 cursor-not-allowed"
              style={{ borderColor: `${MUTED}60`, color: MUTED }}
            >
              <LoaderIcon className="size-3" style={{ animation: "sp-spin 1.5s linear infinite" }} />
              Planning...
            </button>
          )}
        </div>
      </div>

      {/* ── Canvas + Chat Sidebar ── */}
      <div className="flex flex-1 min-h-0">
        {/* Chat Sidebar (left) */}
        {chatOpen && (
          <div
            className="flex flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0 min-h-0"
            style={{ width: 380 }}
          >
            {/* Header */}
            <div className="flex items-center gap-3 border-b border-border px-4 py-3">
              <div
                className="flex size-8 items-center justify-center rounded-lg"
                style={{ background: `oklch(0.7 0.18 50 / 0.12)`, border: `1px solid oklch(0.7 0.18 50 / 0.25)` }}
              >
                <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
              </div>
              <div className="flex-1">
                <p className="text-[13px] font-semibold text-foreground">Sentinel Chat</p>
                <p className="text-[10px] text-muted-foreground/40">Contract assistant</p>
              </div>
              <button
                onClick={() => setChatOpen(false)}
                className="flex size-6 items-center justify-center rounded-md transition-all hover:bg-muted/20"
              >
                <XIcon className="size-3.5 text-muted-foreground/50" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3">
              <div className="flex gap-2.5">
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
                  style={{ background: `oklch(0.7 0.18 50 / 0.12)`, border: `1px solid oklch(0.7 0.18 50 / 0.2)` }}
                >
                  <SparklesIcon className="size-2.5" style={{ color: ACCENT }} />
                </div>
                <div
                  className="rounded-xl rounded-tl-sm border px-3 py-2"
                  style={{ borderColor: `${MUTED}30`, background: `${MUTED}08` }}
                >
                  <p className="text-[11px] leading-relaxed text-foreground/75">
                    I analyzed the Suassuna Clinic contract. I identified 4 milestones and suggested 6 monitoring actions. What would you like to adjust?
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground/30">10:00</p>
                </div>
              </div>

              <div className="flex justify-end">
                <div
                  className="rounded-xl rounded-tr-sm px-3 py-2"
                  style={{ background: `oklch(0.7 0.18 50 / 0.08)`, border: `1px solid oklch(0.7 0.18 50 / 0.15)` }}
                >
                  <p className="text-[11px] leading-relaxed text-foreground/75">
                    The dev has a history of delays, I want more frequent follow-ups
                  </p>
                  <p className="mt-1 text-[9px] text-right" style={{ color: `oklch(0.7 0.18 50 / 0.35)` }}>10:02</p>
                </div>
              </div>

              <div className="flex gap-2.5">
                <div
                  className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
                  style={{ background: `oklch(0.7 0.18 50 / 0.12)`, border: `1px solid oklch(0.7 0.18 50 / 0.2)` }}
                >
                  <SparklesIcon className="size-2.5" style={{ color: ACCENT }} />
                </div>
                <div
                  className="rounded-xl rounded-tl-sm border px-3 py-2"
                  style={{ borderColor: `${MUTED}30`, background: `${MUTED}08` }}
                >
                  <p className="text-[11px] leading-relaxed text-foreground/75">
                    Understood. I'll adjust the GitHub monitor to <span className="font-semibold" style={{ color: ACCENT }}>2x per day</span> and add a commit check 48h before each deadline.
                  </p>
                  <p className="mt-1 text-[9px] text-muted-foreground/30">10:02</p>
                </div>
              </div>
            </div>

            {/* Input */}
            <div className="shrink-0 border-t border-border px-3 py-3">
              <div
                className="flex items-center gap-2 rounded-xl border px-3 py-2"
                style={{ borderColor: `${MUTED}40`, background: `${MUTED}06` }}
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
                  <SendIcon className="size-3" style={{ color: "oklch(0.08 0.01 50)" }} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Canvas */}
        <div className="relative flex-1 min-w-0">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
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
        <div
          style={{
            position: "fixed",
            bottom: 32,
            left: 32,
            zIndex: 9999,
          }}
        >
          <button
            onClick={() => setChatOpen(true)}
            className="group flex items-center gap-3 rounded-full border border-border/50 bg-card px-5 py-3 text-foreground shadow-lg backdrop-blur-md transition-all duration-300 ease-out hover:border-accent/40 hover:shadow-xl hover:shadow-accent/5 active:scale-95"
          >
            <div
              className="flex size-9 items-center justify-center rounded-full transition-transform duration-300 group-hover:rotate-[20deg] group-hover:scale-110"
              style={{
                background: ACCENT,
                boxShadow: `0 0 16px oklch(0.7 0.18 50 / 0.25)`,
              }}
            >
              <SparklesIcon className="size-4" style={{ color: "oklch(0.08 0.01 50)" }} />
            </div>
            <div className="pr-1">
              <p className="text-[12px] font-semibold leading-tight">Talk to Sentinel</p>
              <p className="text-[10px] text-muted-foreground/50">Adjust plan</p>
            </div>
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

      {/* ── Deploy Cinematic Overlay ── */}
      <DeployCinematic visible={deploying} onDone={handleDeployDone} />
    </div>
  );
}
