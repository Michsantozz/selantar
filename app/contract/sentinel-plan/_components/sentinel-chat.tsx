"use client";

import { useState, useRef, useEffect } from "react";
import type { UIMessage } from "ai";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  ShieldCheckIcon,
  SparklesIcon,
  XIcon,
  SendIcon,
  FileTextIcon,
  ShieldAlertIcon,
  FlagIcon,
  ZapIcon,
  CheckCircleIcon,
} from "lucide-react";

const SENTINEL_STEPS = [
  { icon: FileTextIcon,    label: "Reading contract structure" },
  { icon: ShieldAlertIcon, label: "Evaluating risks & clauses" },
  { icon: FlagIcon,        label: "Mapping milestones & deadlines" },
  { icon: ZapIcon,         label: "Generating monitoring actions" },
  { icon: CheckCircleIcon, label: "Plan ready" },
];

interface SentinelChatProps {
  messages: UIMessage[];
  sendMessage: (msg: { text: string }) => void;
  status: string;
  onClose: () => void;
}

export function SentinelChat({
  messages,
  sendMessage,
  status,
  onClose,
}: SentinelChatProps) {
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const isStreaming = status === "streaming" || status === "submitted";

  // Animate Chain of Thought steps during streaming
  const [visibleStep, setVisibleStep] = useState(0);
  const stepRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => {
    if (isStreaming) {
      setVisibleStep(0);
      stepRef.current = setInterval(() => {
        setVisibleStep(s => Math.min(s + 1, SENTINEL_STEPS.length - 2));
      }, 4500);
    } else {
      if (stepRef.current) clearInterval(stepRef.current);
      if (status === "ready") setVisibleStep(SENTINEL_STEPS.length - 1);
    }
    return () => { if (stepRef.current) clearInterval(stepRef.current); };
  }, [isStreaming, status]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = () => {
    const text = input.trim();
    if (!text || isStreaming) return;
    setInput("");
    sendMessage({ text });
  };

  return (
    <div
      className="flex flex-col border-r border-border bg-card/50 backdrop-blur-sm shrink-0 min-h-0"
      style={{ width: 380 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-muted/20">
          <ShieldCheckIcon className="size-4 text-foreground/70" />
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

      {/* Progress bar — thin amber line below header while streaming */}
      <div className="shrink-0 h-px w-full bg-border overflow-hidden">
        <div
          className="h-full bg-amber-400/70 transition-all duration-700 ease-out"
          style={{
            width: isStreaming
              ? `${Math.round(((visibleStep + 1) / SENTINEL_STEPS.length) * 100)}%`
              : visibleStep === SENTINEL_STEPS.length - 1 ? "100%" : "0%",
          }}
        />
      </div>

      {/* Messages */}
      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-y-auto px-4 py-4 flex flex-col gap-3"
      >
        {/* Chain of Thought — timeline, steps appear one by one */}
        {(isStreaming || visibleStep === SENTINEL_STEPS.length - 1) && messages.some(m => m.role === "assistant") && (
          <div className="flex flex-col py-2 px-1">
            {SENTINEL_STEPS.slice(0, visibleStep + 1).map((step, i) => {
              const Icon = step.icon;
              const isDone = i < visibleStep;
              const isActive = i === visibleStep;
              const isLast = i === SENTINEL_STEPS.slice(0, visibleStep + 1).length - 1;
              return (
                <div key={i} className="flex gap-3 animate-in fade-in-0 slide-in-from-top-1 duration-300">
                  {/* Icon + connector line */}
                  <div className="flex flex-col items-center">
                    <div className={`size-5 rounded-full flex items-center justify-center shrink-0 border transition-colors duration-300 ${
                      isDone ? "border-border bg-transparent" :
                      isActive ? "border-amber-400/40 bg-amber-400/5" :
                      "border-border/40 bg-transparent"
                    }`}>
                      <Icon className={`size-2.5 transition-colors duration-300 ${
                        isDone ? "text-muted-foreground/30" :
                        isActive ? "text-amber-400" :
                        "text-muted-foreground/40"
                      }`} />
                    </div>
                    {!isLast && (
                      <div className="w-px bg-border/50 flex-1 mt-1 mb-1" style={{ minHeight: 20 }} />
                    )}
                  </div>
                  {/* Label */}
                  <div className={`flex items-start ${isLast ? "pb-0" : "pb-4"}`}>
                    {isActive && isStreaming ? (
                      <Shimmer
                        as="span"
                        duration={1.8}
                        spread={3}
                        className="text-[12px] leading-snug pt-0.5 [--color-muted-foreground:oklch(0.88_0.18_60)]"
                      >
                        {step.label}
                      </Shimmer>
                    ) : (
                      <span className={`text-[12px] leading-snug pt-0.5 transition-colors duration-300 ${
                        isDone ? "text-muted-foreground/35" : "text-foreground/80"
                      }`}>
                        {step.label}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {messages.map((msg, msgIdx) => {
          // Hide the first user message — it's the raw JSON payload sent to the API
          if (msg.role === "user" && msgIdx === 0) return null;

          if (msg.role === "user") {
            return (
              <div key={msg.id} className="flex justify-end">
                <div className="rounded-xl rounded-tr-sm border border-border bg-muted/10 px-3 py-2 max-w-[85%]">
                  {msg.parts
                    .filter((p) => p.type === "text")
                    .map((p, i) => (
                      <p key={i} className="text-[11px] leading-relaxed text-foreground/75">
                        {p.text}
                      </p>
                    ))}
                </div>
              </div>
            );
          }

          if (msg.role === "assistant") {
            const textParts = msg.parts.filter((p) => p.type === "text");
            if (textParts.length === 0) return null;
            return (
              <div key={msg.id} className="flex gap-2.5">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5 border border-border bg-muted/20">
                  <SparklesIcon className="size-2.5 text-muted-foreground/60" />
                </div>
                <div className="rounded-xl rounded-tl-sm border border-border bg-muted/5 px-3 py-2 max-w-[85%]">
                  {textParts.map((p, i) => (
                    <p key={i} className="text-[11px] leading-relaxed text-foreground/75">
                      {p.text}
                    </p>
                  ))}
                </div>
              </div>
            );
          }

          return null;
        })}
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-border px-3 py-3">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/5 px-3 py-2">
          <input
            type="text"
            placeholder="Talk to Sentinel..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
            disabled={isStreaming}
            className="flex-1 bg-transparent text-[11px] text-foreground outline-none placeholder:text-muted-foreground/25 disabled:opacity-50"
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || isStreaming}
            className="flex size-7 items-center justify-center rounded-lg bg-foreground/10 transition-all hover:bg-foreground/15 disabled:opacity-30"
          >
            <SendIcon className="size-3 text-foreground/70" />
          </button>
        </div>
      </div>
    </div>
  );
}
