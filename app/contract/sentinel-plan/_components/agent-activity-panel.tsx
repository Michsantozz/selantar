"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ShieldCheckIcon,
  BotIcon,
  GitBranchIcon,
  MessageCircleIcon,
  CheckCircleIcon,
  XCircleIcon,
  XIcon,
  SendIcon,
  ServerIcon,
  SparklesIcon,
  PhoneIcon,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { cn } from "@/lib/utils";

// ── Colors (match sentinel-plan) ──
const ACCENT = "oklch(0.72 0.19 154)";
const GREEN = "oklch(0.72 0.17 162)";
const RED = "oklch(0.65 0.2 25)";
const MUTED = "oklch(0.55 0.02 260)";
const CLARA_COLOR = "oklch(0.7 0.18 280)";

// ── Types ──

export type AgentEvent = {
  id: string;
  timestamp: string;
  agent: "sentinel" | "clara" | "openclaw";
  type: "tool" | "thinking" | "message" | "notify";
  title: string;
  status: "running" | "done" | "error";
  steps?: Array<{ text: string; done: boolean }>;
  output?: string;
  whatsappSent?: boolean;
};

interface AgentActivityPanelProps {
  events: AgentEvent[];
  onClose: () => void;
}

// ── Agent Avatar ──

function AgentAvatar({ agent }: { agent: AgentEvent["agent"] }) {
  const config = {
    sentinel: { bg: `oklch(0.7 0.18 50 / 0.12)`, border: `oklch(0.7 0.18 50 / 0.25)`, icon: ShieldCheckIcon, color: ACCENT },
    clara: { bg: `oklch(0.7 0.18 280 / 0.12)`, border: `oklch(0.7 0.18 280 / 0.25)`, icon: SparklesIcon, color: CLARA_COLOR },
    openclaw: { bg: `oklch(0.65 0.15 150 / 0.12)`, border: `oklch(0.65 0.15 150 / 0.25)`, icon: BotIcon, color: GREEN },
  }[agent];

  const Icon = config.icon;

  return (
    <div
      className="flex size-7 shrink-0 items-center justify-center rounded-full"
      style={{ background: config.bg, border: `1px solid ${config.border}` }}
    >
      <Icon className="size-3" style={{ color: config.color }} />
    </div>
  );
}

// ── Status Badge ──

function StatusBadge({ status }: { status: AgentEvent["status"] }) {
  if (status === "running") {
    return (
      <Badge variant="outline" className="h-4 px-1.5 text-[9px] border-accent/30 bg-accent/10 text-accent gap-1">
        <span className="size-1 rounded-full bg-accent animate-pulse" />
        Running
      </Badge>
    );
  }
  if (status === "done") {
    return (
      <Badge variant="outline" className="h-4 px-1.5 text-[9px] gap-1" style={{ borderColor: `${GREEN}40`, background: `${GREEN}08`, color: GREEN }}>
        <CheckCircleIcon className="size-2.5" />
        Done
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="h-4 px-1.5 text-[9px] gap-1" style={{ borderColor: `${RED}40`, background: `${RED}08`, color: RED }}>
      <XCircleIcon className="size-2.5" />
      Error
    </Badge>
  );
}

// ── Agent Label ──

function AgentLabel({ agent }: { agent: AgentEvent["agent"] }) {
  const labels = {
    sentinel: { name: "Sentinel", role: "Monitor", color: ACCENT },
    clara: { name: "Clara", role: "Mediator", color: CLARA_COLOR },
    openclaw: { name: "OpenClaw", role: "Messenger", color: GREEN },
  }[agent];

  return (
    <div className="flex items-center gap-2">
      <span className="text-[11px] font-semibold text-foreground">{labels.name}</span>
      <span
        className="rounded px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-widest"
        style={{ background: `color-mix(in oklch, ${labels.color}, transparent 88%)`, color: labels.color }}
      >
        {labels.role}
      </span>
    </div>
  );
}

// ── Event Card ──

function EventCard({ event }: { event: AgentEvent }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12, scale: 0.97 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
      className="flex gap-3"
    >
      <AgentAvatar agent={event.agent} />

      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1.5">
          <AgentLabel agent={event.agent} />
          <div className="flex items-center gap-2">
            <StatusBadge status={event.status} />
            <span className="text-[9px] text-muted-foreground/40 font-mono">{event.timestamp}</span>
          </div>
        </div>

        {/* Tool card */}
        {event.type === "tool" && (
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: `${MUTED}25`, background: `${MUTED}05` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <ServerIcon className="size-3 text-muted-foreground/50" />
              <span className="text-[10px] font-mono font-medium text-foreground/70">{event.title}</span>
            </div>

            {event.steps && (
              <ChainOfThought defaultOpen={true}>
                <ChainOfThoughtHeader>
                  <span className="text-[10px]">
                    {event.status === "running" ? (
                      <Shimmer duration={2}>Processing...</Shimmer>
                    ) : (
                      `${event.steps.filter(s => s.done).length}/${event.steps.length} steps completed`
                    )}
                  </span>
                </ChainOfThoughtHeader>
                <ChainOfThoughtContent>
                  {event.steps.map((step, i) => (
                    <ChainOfThoughtStep key={i}>
                      <div className="flex items-center gap-2">
                        {step.done ? (
                          <CheckCircleIcon className="size-3 shrink-0" style={{ color: GREEN }} />
                        ) : (
                          <span className="size-3 shrink-0 rounded-full border border-muted-foreground/20" />
                        )}
                        <span className={cn(
                          "text-[10px]",
                          step.done ? "text-foreground/60" : "text-muted-foreground/40"
                        )}>
                          {step.text}
                        </span>
                      </div>
                    </ChainOfThoughtStep>
                  ))}
                </ChainOfThoughtContent>
              </ChainOfThought>
            )}

            {event.output && (
              <div
                className="mt-2 rounded-md px-2.5 py-2 text-[10px] font-mono leading-relaxed"
                style={{ background: `${MUTED}08`, color: `${MUTED}` }}
              >
                {event.output}
              </div>
            )}
          </div>
        )}

        {/* Thinking card */}
        {event.type === "thinking" && (
          <div
            className="rounded-lg border p-3"
            style={{ borderColor: `${CLARA_COLOR}20`, background: `${CLARA_COLOR}05` }}
          >
            <div className="flex items-center gap-2 mb-1">
              <SparklesIcon className="size-3" style={{ color: CLARA_COLOR }} />
              <span className="text-[10px] font-medium" style={{ color: CLARA_COLOR }}>{event.title}</span>
            </div>
            {event.output && (
              <p className="text-[10px] leading-relaxed text-foreground/60 mt-1">
                {event.output}
              </p>
            )}
          </div>
        )}

        {/* Message / notify card */}
        {(event.type === "message" || event.type === "notify") && (
          <div
            className="rounded-lg border p-3"
            style={{
              borderColor: event.whatsappSent ? `${GREEN}25` : `${MUTED}25`,
              background: event.whatsappSent ? `${GREEN}04` : `${MUTED}05`,
            }}
          >
            <div className="flex items-center gap-2 mb-1.5">
              {event.whatsappSent ? (
                <PhoneIcon className="size-3" style={{ color: GREEN }} />
              ) : (
                <MessageCircleIcon className="size-3 text-muted-foreground/50" />
              )}
              <span className="text-[10px] font-medium text-foreground/70">{event.title}</span>
              {event.whatsappSent && (
                <span className="text-[8px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded"
                  style={{ background: `${GREEN}12`, color: GREEN }}>
                  WhatsApp
                </span>
              )}
            </div>
            {event.output && (
              <p className="text-[10px] leading-relaxed text-foreground/60 whitespace-pre-line">
                {event.output}
              </p>
            )}
          </div>
        )}

        {/* Agent-to-agent arrow */}
        {event.type === "notify" && event.agent === "clara" && (
          <div className="flex items-center gap-2 mt-2 ml-1">
            <div className="h-px flex-1" style={{ background: `${MUTED}20` }} />
            <div className="flex items-center gap-1.5">
              <span className="text-[8px] uppercase tracking-widest text-muted-foreground/30">via</span>
              <AgentAvatar agent="openclaw" />
              <span className="text-[9px] font-medium text-muted-foreground/50">OpenClaw → Evolution API</span>
            </div>
            <div className="h-px flex-1" style={{ background: `${MUTED}20` }} />
          </div>
        )}
      </div>
    </motion.div>
  );
}

// ── Main Panel ──

export function AgentActivityPanel({ events, onClose }: AgentActivityPanelProps) {
  return (
    <div
      className="flex flex-col border-l border-border bg-card/50 backdrop-blur-sm shrink-0 min-h-0"
      style={{ width: 420 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div
          className="flex size-8 items-center justify-center rounded-lg"
          style={{ background: `oklch(0.7 0.18 50 / 0.12)`, border: `1px solid oklch(0.7 0.18 50 / 0.25)` }}
        >
          <BotIcon className="size-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1">
          <p className="text-[13px] font-semibold text-foreground">Agent Activity</p>
          <p className="text-[10px] text-muted-foreground/40">Real-time agent communication</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="h-5 px-2 text-[9px] border-accent/20 bg-accent/5 text-accent gap-1">
            <span className="size-1.5 rounded-full bg-accent animate-pulse" />
            Live
          </Badge>
          <button
            onClick={onClose}
            className="flex size-6 items-center justify-center rounded-md transition-all hover:bg-muted/20"
          >
            <XIcon className="size-3.5 text-muted-foreground/50" />
          </button>
        </div>
      </div>

      {/* Events feed */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-5">
        {events.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 gap-3">
            <div className="size-10 rounded-full flex items-center justify-center" style={{ background: `${MUTED}10` }}>
              <BotIcon className="size-4" style={{ color: MUTED }} />
            </div>
            <p className="text-[11px] text-muted-foreground/40 text-center">
              Agent activity will appear here as the<br />monitoring plan executes.
            </p>
          </div>
        ) : (
          <AnimatePresence mode="popLayout">
            {events.map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex -space-x-1.5">
            <AgentAvatar agent="sentinel" />
            <AgentAvatar agent="clara" />
            <AgentAvatar agent="openclaw" />
          </div>
          <span className="text-[9px] text-muted-foreground/40">3 agents connected</span>
        </div>
        <span className="text-[9px] font-mono text-muted-foreground/30">
          {events.length} events
        </span>
      </div>
    </div>
  );
}
