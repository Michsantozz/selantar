"use client";

import type { UIMessage, ChatStatus } from "ai";
import { isToolUIPart } from "ai";
import { Scale, Send, Square, Search, FileCheck, Gavel, CheckCircle2, Play, HeartHandshake } from "lucide-react";
import { Shimmer } from "@/components/ai-elements/shimmer";
import { motion, AnimatePresence } from "motion/react";
import { Badge } from "@/components/ui/badge";
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from "@/components/ai-elements/conversation";
import {
  Message,
  MessageContent,
  MessageResponse,
} from "@/components/ai-elements/message";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";

import { cn } from "@/lib/utils";
import type { Scenario } from "@/lib/scenarios";

interface MediationChatProps {
  messages: UIMessage[];
  input: string;
  setInput: (v: string) => void;
  onSubmit: (text: string) => void;
  status: ChatStatus;
  onStop: () => void;
  scenario?: Scenario | null;
  started?: boolean;
  onStart?: () => void;
  onReviewSettlement?: () => void;
  settlementSealed?: boolean;
}

export function MediationChat({
  messages,
  input,
  setInput,
  onSubmit,
  status,
  onStop,
  scenario,
  started = true,
  onStart,
  onReviewSettlement,
  settlementSealed,
}: MediationChatProps) {
  const displayMessages = messages.length > 0 ? messages : null;
  const showMock = !displayMessages && !started;

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden relative">
      {/* Start overlay — blocks chat until user clicks */}
      {!started && onStart && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-card/95 backdrop-blur-sm">
          <div className="flex flex-col items-center">
            <div className="flex size-11 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <HeartHandshake className="size-5 text-primary" />
            </div>
            <p className="mt-4 text-sm font-medium text-foreground">
              {scenario?.title ?? "Mediation Room"}
            </p>
            <p className="mt-1 text-xs text-muted-foreground/50 max-w-[260px] text-center leading-relaxed">
              Clara will analyze evidence, mediate the dispute, and execute settlement on-chain.
            </p>
            <button
              onClick={onStart}
              className="mt-6 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/15 px-5 py-2.5 text-[13px] font-medium text-primary transition-all hover:bg-primary/25 hover:border-primary/50 hover:scale-[1.02] active:scale-[0.98]"
            >
              <Play className="size-3.5 fill-primary" />
              Start Mediation
            </button>
            <p className="mt-3 text-[10px] text-muted-foreground/30 font-mono">
              Uses gas on Base Sepolia
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2.5">
          <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10">
            <Scale className="size-3.5 text-primary" />
          </div>
          <div>
            <span className="text-xs font-medium">Mediation Chat</span>
            <span className="ml-2 text-[10px] text-muted-foreground/50 font-mono">
              Selantar · Real-time analysis
            </span>
          </div>
        </div>
        <Badge
          variant="outline"
          className={`text-[10px] h-5 px-1.5 ${
            !showMock && (status === "streaming" || status === "submitted")
              ? "border-primary/30 bg-primary/10 text-primary"
              : "border-emerald/30 bg-emerald/10 text-emerald"
          }`}
        >
          {showMock
            ? "AI Active"
            : status === "streaming"
              ? "Analyzing..."
              : status === "submitted"
                ? "Processing..."
                : "AI Active"}
        </Badge>
      </div>

      {/* Conversation area */}
      <Conversation className="flex-1 min-h-0">
        <ConversationContent className="gap-4 px-4 py-4">
          {showMock ? (
            <MockMediationConversation />
          ) : !displayMessages ? (
            /* Started but no messages yet — Clara is loading */
            <div className="flex items-center gap-3 rounded-md border border-primary/10 bg-primary/[0.03] px-4 py-3">
              <div className="relative h-1 w-16 overflow-hidden rounded-full bg-primary/10">
                <span className="absolute inset-y-0 left-0 w-8 animate-analysis-scan rounded-full bg-primary/50" />
              </div>
              <span className="text-[10px] font-mono text-muted-foreground/50">
                <Shimmer duration={2}>Clara is analyzing the case...</Shimmer>
              </span>
            </div>
          ) : (
            displayMessages?.map((message) => {
              // Detect client opening message (synthetic)
              const isClientOpening = "_isClientOpening" in message;
              const clientName = isClientOpening
                ? (message as unknown as { _clientName: string })._clientName
                : null;

              // Hide context messages
              const isContextMsg =
                !isClientOpening &&
                message.role === "user" &&
                message.parts.some(
                  (p) =>
                    p.type === "text" &&
                    p.text.length > 300 &&
                    p.text.includes("CONTRACT:")
                );

              if (isContextMsg) return null;

              // Client opening — show with name and complaint styling
              if (isClientOpening && clientName) {
                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                    className="flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        {clientName}
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-destructive/10 text-destructive">
                        Complainant
                      </span>
                    </div>
                    <div className="max-w-[90%] rounded-lg border border-border bg-muted/30 p-4">
                      {message.parts.map((part, i) =>
                        part.type === "text" ? (
                          <p key={i} className="text-sm leading-relaxed text-foreground/80 whitespace-pre-line">
                            {part.text}
                          </p>
                        ) : null
                      )}
                    </div>
                  </motion.div>
                );
              }

              // Mediator messages (assistant)
              if (message.role === "assistant") {
                // Check if this message contains a completed proposeSettlement
                const hasSettlementProposal = message.parts.some(
                  (p) =>
                    isToolUIPart(p) &&
                    p.type === "tool-proposeSettlement" &&
                    p.state === "output-available"
                );

                return (
                  <motion.div
                    key={message.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4, delay: 0.1, ease: [0.4, 0, 0.2, 1] }}
                    className="flex flex-col gap-1.5"
                  >
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-foreground">
                        Clara
                      </span>
                      <span className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-primary/15 text-primary">
                        Mediator · Selantar
                      </span>
                    </div>
                    <div className="max-w-[95%]">
                      <MessageContent>
                        {renderMessageParts(message.parts)}
                      </MessageContent>
                    </div>

                    {/* Review Settlement button — appears after proposeSettlement completes */}
                    {hasSettlementProposal && onReviewSettlement && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.4 }}
                        className="pt-2"
                      >
                        <div className="flex items-center gap-3 mb-3">
                          <div className="flex-1 h-px bg-primary/20" />
                          <span className="text-xs uppercase tracking-wider text-primary/50">
                            {settlementSealed ? "Settlement sealed" : "Settlement proposed"}
                          </span>
                          <div className="flex-1 h-px bg-primary/20" />
                        </div>

                        <button
                          onClick={onReviewSettlement}
                          disabled={settlementSealed}
                          className={cn(
                            "w-full rounded-md border py-3 flex items-center justify-center gap-2.5 text-xs font-medium uppercase tracking-wider transition-all",
                            settlementSealed
                              ? "border-emerald/30 bg-emerald/[0.06] text-emerald cursor-default"
                              : "border-primary/30 bg-primary/[0.06] text-primary hover:border-primary/50 hover:bg-primary/[0.10]"
                          )}
                        >
                          {settlementSealed ? (
                            <>
                              <CheckCircle2 className="size-4" />
                              Settlement Sealed On-Chain
                            </>
                          ) : (
                            <>
                              <FileCheck className="size-4" />
                              Review Settlement
                            </>
                          )}
                        </button>
                      </motion.div>
                    )}
                  </motion.div>
                );
              }

              // User messages — we are ULTRASELF (the developer responding)
              const devName = scenario?.parties.developer.name ?? "You";
              return (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
                  className="flex flex-col gap-1.5 items-end"
                >
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <span className="text-xs font-medium text-foreground">
                      {devName}
                    </span>
                    <span className="rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider bg-secondary text-muted-foreground">
                      Respondent
                    </span>
                  </div>
                  <div className="max-w-[85%] rounded-lg border border-border bg-muted/30 p-4">
                    {message.parts.map((part, i) =>
                      part.type === "text" && part.text.trim() ? (
                        <p key={i} className="text-sm leading-relaxed text-foreground/80">
                          {part.text}
                        </p>
                      ) : null
                    )}
                  </div>
                </motion.div>
              );
            })
          )}
        </ConversationContent>
        <ConversationScrollButton />
      </Conversation>

      {/* Input */}
      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-lg border border-border/50 bg-secondary/20 px-3 py-2">
          <textarea
            placeholder="Respond as the developer..."
            value={input}
            onChange={(e) => setInput(e.currentTarget.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                onSubmit(input);
              }
            }}
            className="min-h-10 max-h-32 flex-1 resize-none bg-transparent text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none"
            rows={1}
          />
          {status === "streaming" ? (
            <button
              onClick={onStop}
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-destructive/10 text-destructive transition-colors hover:bg-destructive/20"
            >
              <Square className="size-3.5" />
            </button>
          ) : (
            <button
              onClick={() => onSubmit(input)}
              disabled={!input.trim()}
              className="flex size-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-30"
            >
              <Send className="size-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Bottom status bar */}
      <div className="flex items-center justify-between border-t border-border px-4 py-1.5 bg-muted/20">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
            <span className="text-[10px] text-muted-foreground/50">
              {showMock ? "Demo — select a scenario to begin" : "Mediation in progress"}
            </span>
          </div>
          <span className="text-[10px] font-mono text-muted-foreground/30">
            On-chain · ERC-8004
          </span>
        </div>
        {showMock && (
          <span className="text-[9px] font-mono uppercase tracking-wider text-primary/50">
            Demo
          </span>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Styled message wrapper with name + badge
// ============================================================================

function ChatMessage({
  name,
  role,
  badge,
  badgeColor,
  children,
  align = "left",
}: {
  name: string;
  role: string;
  badge?: string;
  badgeColor?: string;
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex flex-col gap-1.5 ${align === "right" ? "items-end" : ""}`}>
      <div className={`flex items-center gap-2 ${align === "right" ? "flex-row-reverse" : ""}`}>
        <span className="text-xs font-medium text-foreground">{name}</span>
        {badge && (
          <span
            className={`rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider ${
              badgeColor ?? "bg-muted text-muted-foreground"
            }`}
          >
            {badge}
          </span>
        )}
      </div>
      <div
        className={`max-w-[85%] rounded-lg border p-4 ${
          role === "client"
            ? "border-border bg-muted/30"
            : role === "dev"
              ? "border-border bg-muted/30"
              : role === "mediator"
                ? "border-primary/20 bg-primary/[0.04]"
                : "border-border bg-muted/30"
        }`}
      >
        {children}
      </div>
    </div>
  );
}

// ============================================================================
// Mock Conversation — Rich demo showcasing the full mediation flow
// ============================================================================

function MockMediationConversation() {
  return (
    <>
      {/* Client opens */}
      <ChatMessage
        name="Dr. Ernani Suassuna"
        role="client"
        align="left"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Look, this isn't working. The AI isn't booking patients and we are
          losing leads. I've already put good money into the first two phases
          of this project, but I'm ready to pull the plug. I need a refund for
          this last part.
        </p>
      </ChatMessage>

      {/* Developer responds */}
      <ChatMessage
        name="Michael (ULTRASELF)"
        role="dev"
        align="right"
      >
        <p className="text-sm leading-relaxed text-muted-foreground">
          Doc, the AI is fully trained and ready to go. We just can't turn it
          on because we're still waiting for your team to give us access to the
          calendar. We asked for it on Tuesday.
        </p>
      </ChatMessage>

      {/* Mediator enters — de-escalation */}
      <ChatMessage
        name="Selantar"
        role="mediator"
        badge="Mediator"
        badgeColor="bg-primary/15 text-primary"
      >
        <p className="text-sm leading-relaxed text-foreground/80">
          Hi Dr. Suassuna, hi Michael. Let's take a breath and figure this out.
          I've been monitoring the project, and honestly, Phases 1 and 2 went
          perfectly. The foundation is solid. Let's not throw away a great
          investment over a communication hiccup.
        </p>
      </ChatMessage>

      {/* Mediator analyzing */}
      <ChatMessage
        name="Selantar"
        role="mediator"
        badge="Analyzing"
        badgeColor="bg-primary/15 text-primary/80"
      >
        <p className="text-sm leading-relaxed text-foreground/80">
          Dr. Suassuna, I totally understand your frustration. Getting patients
          booked is the whole point. But checking the WhatsApp logs, Michael's
          team did send the calendar link to your front desk on Tuesday morning.
          It looks like your team was swa...
        </p>
      </ChatMessage>

      {/* Analysis indicator */}
      <div className="flex items-center gap-3 rounded-md border border-primary/10 bg-primary/[0.03] px-4 py-2.5">
        <div className="relative h-1 w-16 overflow-hidden rounded-full bg-primary/10">
          <span className="absolute inset-y-0 left-0 w-8 animate-analysis-scan rounded-full bg-primary/50" />
        </div>
        <span className="text-[10px] font-mono text-muted-foreground/50">
          Selantar analyzing evidence...
        </span>
      </div>
    </>
  );
}

// ============================================================================
// Message parts renderer — groups tools into a single collapsible CoT
// ============================================================================

function renderMessageParts(parts: UIMessage["parts"]) {
  const elements: React.ReactNode[] = [];
  let toolGroup: { index: number; toolName: string; meta: ToolMeta; part: ReturnType<typeof extractToolPart> }[] = [];

  function flushToolGroup() {
    if (toolGroup.length === 0) return;

    const finishedStates = ["output-available", "output-error", "output-denied"];
    const allDone = toolGroup.every((t) => finishedStates.includes(t.part.state));
    const anyRunning = !allDone;
    const completedCount = toolGroup.filter(
      (t) => finishedStates.includes(t.part.state)
    ).length;
    const groupKey = `cot-tools-${toolGroup[0].index}`;

    elements.push(
      <div key={groupKey} className="rounded-xl border border-border bg-card/50 overflow-hidden">
        {/* Header bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span
            className={`size-2 rounded-full ${
              anyRunning ? "bg-primary animate-pulse" : "bg-emerald"
            }`}
          />
          <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
            {anyRunning ? (
              <Shimmer duration={2}>
                {`Analyzing case — step ${completedCount + 1} of ${toolGroup.length}`}
              </Shimmer>
            ) : (
              `Analysis complete — ${toolGroup.length} steps`
            )}
          </span>
          {allDone && (
            <CheckCircle2 className="ml-auto size-3.5 text-emerald" />
          )}
        </div>

        {/* Steps timeline */}
        <div className="px-4 py-3 space-y-0">
          <AnimatePresence mode="popLayout">
            {toolGroup.map((t, tIdx) => {
              const isDone = t.part.state === "output-available";
              const isError = t.part.state === "output-error" || t.part.state === "output-denied";
              const isFinished = isDone || isError;
              const isActive = !isFinished && (tIdx === 0 || ["output-available", "output-error", "output-denied"].includes(toolGroup[tIdx - 1].part.state));
              const isPending = !isFinished && !isActive;
              const output = isDone ? (t.part.output as Record<string, unknown> | null) : null;
              const errorText = isError ? t.part.errorText : undefined;
              const hasExplorer =
                isDone && output && typeof output === "object" && "explorer" in output;
              const Icon = getToolIcon(t.toolName);

              return (
                <motion.div
                  key={t.index}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.3,
                    delay: tIdx * 0.08,
                    ease: [0.4, 0, 0.2, 1],
                  }}
                  className="relative flex gap-3 py-2.5"
                >
                  {/* Vertical line connector */}
                  {tIdx < toolGroup.length - 1 && (
                    <div className="absolute left-[9px] top-[30px] bottom-0 w-px bg-border" />
                  )}

                  {/* Icon */}
                  <div
                    className={`relative z-10 flex size-[18px] shrink-0 items-center justify-center rounded-full border ${
                      isDone
                        ? "border-emerald/30 bg-emerald/10"
                        : isError
                          ? "border-primary/30 bg-primary/5"
                          : isActive
                            ? "border-primary/50 bg-primary/10"
                            : "border-border bg-muted/30"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="size-3 text-emerald" />
                    ) : isError ? (
                      <Icon className="size-2.5 text-primary/60" />
                    ) : isActive ? (
                      <Icon className="size-2.5 text-primary animate-pulse" />
                    ) : (
                      <span className="size-1.5 rounded-full bg-muted-foreground/20" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0 space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs ${
                          isDone
                            ? "text-foreground/80"
                            : isActive
                              ? "text-foreground/70"
                              : "text-muted-foreground/40"
                        }`}
                      >
                        {t.meta.label}
                      </span>
                      {isDone && t.toolName === "analyzeEvidence" && output?.credibilityScore != null && (
                        <span className="font-mono text-[10px] text-muted-foreground/60">
                          {String(output.credibilityScore)}%
                        </span>
                      )}
                      {isActive && (
                        <Shimmer duration={1.5}>Processing</Shimmer>
                      )}
                      {isPending && (
                        <span className="font-mono text-[10px] text-muted-foreground/30">
                          waiting
                        </span>
                      )}
                    </div>

                    {/* Expanded result — completed or errored steps */}
                    {isFinished && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
                        className="overflow-hidden"
                      >
                        <div className="space-y-1 pb-1">
                          {isDone && renderToolSummary(t.toolName, output)}
                          {isError && errorText && (
                            <p className="text-xs text-muted-foreground/60">
                              {errorText}
                            </p>
                          )}
                          {hasExplorer && (
                            <a
                              href={String(output.explorer)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 font-mono text-[10px] text-primary hover:underline"
                            >
                              View on Basescan →
                            </a>
                          )}
                        </div>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </div>
    );

    toolGroup = [];
  }

  for (let i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (part.type === "text" && part.text.trim()) {
      flushToolGroup();
      elements.push(
        <MessageResponse key={`text-${i}`}>{part.text}</MessageResponse>
      );
      continue;
    }

    if (part.type === "reasoning") {
      flushToolGroup();
      elements.push(
        <ChainOfThought key={`cot-${i}`} defaultOpen={false}>
          <ChainOfThoughtHeader className="rounded-md border border-border bg-muted/30 px-3 py-2">
            <span className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Internal reasoning
              </span>
            </span>
          </ChainOfThoughtHeader>
          <ChainOfThoughtContent>
            {parseReasoningSteps(part.text).map((step, si) => (
              <ChainOfThoughtStep
                key={si}
                icon={getStepIcon(step)}
                label={
                  <span className="text-xs text-foreground/80">
                    {step.split("\n")[0]}
                  </span>
                }
                description={
                  step.includes("\n")
                    ? step.split("\n").slice(1).join("\n").trim()
                    : undefined
                }
                status="complete"
              />
            ))}
          </ChainOfThoughtContent>
        </ChainOfThought>
      );
      continue;
    }

    if (isToolUIPart(part)) {
      const toolName = part.type.replace("tool-", "");
      const meta = getToolMeta(toolName);
      toolGroup.push({ index: i, toolName, meta, part: extractToolPart(part) });
      continue;
    }
  }

  flushToolGroup();
  return elements;
}

function extractToolPart(part: { state: string; input?: unknown; output?: unknown; errorText?: string }) {
  return {
    state: part.state,
    input: part.input,
    output: part.output,
    errorText: "errorText" in part ? (part.errorText as string | undefined) : undefined,
  };
}

// ============================================================================
// Tool metadata — neutral labels that don't favor either party
// ============================================================================

interface ToolMeta {
  label: string;
  isOnchain: boolean;
}

function getToolMeta(toolName: string): ToolMeta {
  const meta: Record<string, ToolMeta> = {
    analyzeEvidence: { label: "Evidence analysis", isOnchain: false },
    proposeSettlement: { label: "Settlement proposal", isOnchain: false },
    executeSettlement: { label: "Delegated settlement execution", isOnchain: true },
    postFeedback: { label: "Reputation record", isOnchain: true },
    registerVerdict: { label: "Verdict registration", isOnchain: true },
  };
  return meta[toolName] ?? { label: toolName, isOnchain: false };
}

// ============================================================================
// Reasoning step parser — splits reasoning text into discrete steps
// ============================================================================

function parseReasoningSteps(text: string): string[] {
  // Split on numbered items, bullet points, or double newlines
  const lines = text.split(/\n/).filter((l) => l.trim());
  if (lines.length <= 1) return [text];

  const steps: string[] = [];
  let current = "";

  for (const line of lines) {
    // Detect step boundaries: numbered (1. 2.) or headers (## **)
    if (/^\d+[\.\)]\s|^[-•]\s|^#{1,3}\s|^\*\*/.test(line.trim())) {
      if (current.trim()) steps.push(current.trim());
      current = line;
    } else {
      current += "\n" + line;
    }
  }
  if (current.trim()) steps.push(current.trim());

  return steps.length > 0 ? steps : [text];
}

// ============================================================================
// Step icon mapping — picks icon based on content keywords
// ============================================================================

// ============================================================================
// Tool summary renderer — shows human-readable output instead of raw JSON
// ============================================================================

function renderToolSummary(toolName: string, output: Record<string, unknown> | null) {
  if (!output) return null;

  switch (toolName) {
    case "analyzeEvidence": {
      const findings = output.keyFindings as string[] | undefined;
      if (!findings || findings.length === 0) return null;
      return (
        <ul className="space-y-0.5">
          {findings.map((f, idx) => (
            <li key={idx} className="flex items-start gap-1.5 text-xs text-muted-foreground">
              <span className="mt-1.5 size-1 shrink-0 rounded-full bg-muted-foreground/30" />
              {f}
            </li>
          ))}
        </ul>
      );
    }

    case "proposeSettlement": {
      const split = output.proposedSplit as Record<string, number> | undefined;
      const rationale = output.rationale as string | undefined;
      return (
        <div className="space-y-1.5">
          {rationale && (
            <p className="text-xs leading-relaxed text-foreground/70">{rationale}</p>
          )}
          {split && (
            <div className="flex items-center gap-3 font-mono text-[11px]">
              {Object.entries(split).map(([party, pct]) => (
                <span key={party} className="text-muted-foreground">
                  {party}: <span className="text-foreground/80">{pct}%</span>
                </span>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "executeSettlement": {
      const txHash = (output.txHash ?? output.userOpHash) as string | undefined;
      const status = output.status as string | undefined;
      const method = output.method as string | undefined;
      const isQueued = status?.includes("queued") || status?.includes("recorded");
      const isDelegation = method === "delegation";
      return (
        <div className="space-y-1">
          {isDelegation && (
            <span className="inline-flex items-center gap-1 rounded border border-primary/20 bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium text-primary">
              Via MetaMask Delegation
            </span>
          )}
          {isDelegation && output.delegationScope && (
            <p className="text-[10px] text-muted-foreground/50">
              {String(output.delegationScope)}
            </p>
          )}
          {txHash && (
            <p className="font-mono text-[10px] text-muted-foreground/60 truncate">
              tx: {txHash}
            </p>
          )}
          {!txHash && isQueued && (
            <p className="text-xs text-muted-foreground/50">
              Registered — pending on-chain confirmation
            </p>
          )}
        </div>
      );
    }

    case "postFeedback":
    case "registerVerdict": {
      const txHash = (output.txHash ?? output.feedbackTxHash ?? output.validationTxHash) as string | undefined;
      const status = output.status as string | undefined;
      const isQueued = status?.includes("queued") || status?.includes("recorded");
      return (
        <div className="space-y-1">
          {txHash && (
            <p className="font-mono text-[10px] text-muted-foreground/60 truncate">
              tx: {txHash}
            </p>
          )}
          {!txHash && isQueued && (
            <p className="text-xs text-muted-foreground/50">
              Registered — pending on-chain confirmation
            </p>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}

function getToolIcon(toolName: string) {
  switch (toolName) {
    case "analyzeEvidence": return Search;
    case "proposeSettlement": return Scale;
    case "executeSettlement": return Gavel;
    case "postFeedback": return FileCheck;
    case "registerVerdict": return Gavel;
    default: return Search;
  }
}

function getStepIcon(step: string) {
  const lower = step.toLowerCase();
  if (lower.includes("evidence") || lower.includes("review") || lower.includes("analyz"))
    return Search;
  if (lower.includes("settlement") || lower.includes("propos") || lower.includes("split"))
    return Scale;
  if (lower.includes("verdict") || lower.includes("decision") || lower.includes("conclud"))
    return Gavel;
  if (lower.includes("contract") || lower.includes("clause") || lower.includes("deliver"))
    return FileCheck;
  return Search;
}
