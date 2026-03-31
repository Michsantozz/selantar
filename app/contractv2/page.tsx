"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport, isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import { DEMO_CONTRACT } from "@/lib/demo-contract";
import type { ParsedContract } from "@/lib/schemas/contract-parse";
import { Shimmer } from "@/components/ai-elements/shimmer";
import {
  ChainOfThought,
  ChainOfThoughtHeader,
  ChainOfThoughtContent,
  ChainOfThoughtStep,
} from "@/components/ai-elements/chain-of-thought";
import { RiskReview } from "@/app/contract/setup/_components/risk-review";
import { DeployReview } from "@/app/contract/setup/_components/deploy-review";
import { ContractHeader } from "./_components/contract-header";
import {
  FileTextIcon,
  ChevronLeftIcon,
  MoreHorizontalIcon,
  CheckIcon,
  UsersIcon,
  ShieldAlertIcon,
  FlagIcon,
  BarChartIcon,
  RocketIcon,
  LoaderIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const MilestoneBuilder = dynamic(
  () => import("@/app/contract/setup/_components/milestone-builder").then(m => m.MilestoneBuilder),
  { ssr: false }
);

const STORAGE_KEY = "selentar-parsed-contract";

const STEPS = [
  { id: 1, label: "Data", done: true },
  { id: 2, label: "Risks", done: false },
  { id: 3, label: "Milestones", done: false },
  { id: 4, label: "Deploy", done: false },
];

export default function ContractV2Page() {
  const searchParams = useSearchParams();
  const isDemo = searchParams.get("demo") === "true";
  const [activeStep, setActiveStep] = useState(2);

  // Restore from sessionStorage on mount (read-only — never updated via setState)
  const [cachedData] = useState<ParsedContract | null>(() => {
    if (typeof window === "undefined") return null;
    try {
      const stored = sessionStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/parse-contract" }),
  });

  // Auto-send demo contract — ref guard prevents double-send in Strict Mode
  const hasSentRef = useRef(false);
  useEffect(() => {
    if (isDemo && !hasSentRef.current && !cachedData) {
      hasSentRef.current = true;
      sendMessage({ text: DEMO_CONTRACT });
    }
  }, [isDemo, cachedData, sendMessage]);

  // Extract parsed data from tool output
  const parsed = extractParsedData(messages) ?? cachedData;
  const isAnalyzing = status === "streaming" || status === "submitted";

  // Cache parsed results in sessionStorage (ref prevents re-writes)
  const hasCachedRef = useRef(!!cachedData);
  useEffect(() => {
    if (parsed && !hasCachedRef.current) {
      hasCachedRef.current = true;
      try {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      } catch { /* quota exceeded — ignore */ }
    }
  }, [parsed]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >

      {/* 1st — Nav + status */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1, ease: [0, 0, 0.2, 1] }}
        className="shrink-0 h-12 border-b border-border bg-card/30 flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-3">
          <Link href="/forge" className="group flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors">
            <ChevronLeftIcon className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-xs uppercase tracking-wider">Selantar</span>
          </Link>
          <div className="w-px h-4 bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex size-6 items-center justify-center rounded-md bg-accent/10 border border-accent/20">
              <FileTextIcon className="size-3 text-accent" />
            </div>
            <span className="text-sm font-medium text-foreground">Contract review</span>
            <span className="text-xs text-muted-foreground">contract-v2.pdf</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {isAnalyzing ? (
            <span className="flex items-center gap-1.5 rounded-full border border-accent/20 bg-accent/8 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-accent">
              <LoaderIcon className="size-3 animate-spin" />
              Analyzing...
            </span>
          ) : parsed ? (
            <span className="flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald">
              <span className="size-1.5 rounded-full bg-emerald" />
              AI Analysis Complete
            </span>
          ) : (
            <span className="flex items-center gap-1.5 rounded-full border border-border px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
              Ready
            </span>
          )}
          <button className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontalIcon className="size-4" />
          </button>
        </div>
      </motion.div>

      {/* 2nd — Contract header */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0, 0, 0.2, 1] }}
        className="shrink-0"
      >
        <ContractHeader
          data={parsed?.header}
          risksCount={parsed?.risks?.risks?.length}
          loading={isAnalyzing && !parsed?.header}
        />
      </motion.div>

      {/* Analysis status — Shimmer during, ChainOfThought after */}
      {isAnalyzing && !parsed && (
        <div className="shrink-0 flex items-center gap-3 px-6 py-3 border-b border-border bg-card/20">
          <Shimmer className="text-sm">Analyzing contract — extracting parties, risks, and milestones...</Shimmer>
        </div>
      )}
      {parsed && (
        <div className="shrink-0 px-6 py-3 border-b border-border bg-card/20">
          <ChainOfThought defaultOpen>
            <ChainOfThoughtHeader />
            <ChainOfThoughtContent>
              {parsed.header && (
                <ChainOfThoughtStep label="Parties & metadata extracted" status="complete" icon={UsersIcon} />
              )}
              {parsed.risks && (
                <ChainOfThoughtStep label={`${parsed.risks.risks.length} risks identified`} status="complete" icon={ShieldAlertIcon} />
              )}
              {parsed.milestones && (
                <ChainOfThoughtStep label={`${parsed.milestones.milestones.length} milestones found`} status="complete" icon={FlagIcon} />
              )}
              {parsed.clauseScores && (
                <ChainOfThoughtStep label="Clauses scored" status="complete" icon={BarChartIcon} />
              )}
              {parsed.deployPlan && (
                <ChainOfThoughtStep label="Deploy plan generated" status="complete" icon={RocketIcon} />
              )}
            </ChainOfThoughtContent>
          </ChainOfThought>
        </div>
      )}

      {/* 3rd — Wizard steps */}
      <div className="shrink-0 flex items-center gap-1 px-6 py-2.5 border-b border-border bg-card/20">
        {STEPS.map((step, i) => {
          const isActive = step.id === activeStep;
          const isDone = step.done || step.id < activeStep;
          return (
            <div key={step.id} className="flex items-center gap-1">
              {i > 0 && <div className="w-6 h-px bg-border mx-1" />}
              <button
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-3 py-1 text-xs font-medium transition-colors",
                  isActive && "bg-accent/10 text-accent border border-accent/20",
                  isDone && !isActive && "text-emerald",
                  !isActive && !isDone && "text-muted-foreground/40"
                )}
              >
                {isDone && !isActive && <CheckIcon className="size-3 text-emerald" />}
                {isActive && <span className="size-1.5 rounded-full bg-accent" />}
                <span>{step.id}</span>
                <span>{step.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* 4th/5th/6th — Content columns */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5, ease: [0, 0, 0.2, 1] }}
        className="flex-1 grid divide-x divide-border overflow-hidden min-h-0"
        style={{ gridTemplateColumns: "1fr 1fr 1.2fr" }}>

        {/* Col 1 — Risk Review */}
        <div id="cv2-risk-col" className="flex flex-col min-h-0">
          <div className="shrink-0 h-9 flex items-center px-5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Risk Review</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <RiskReview
              risks={parsed?.risks?.risks}
              clauseScores={parsed?.clauseScores?.scores}
              loading={isAnalyzing && !parsed?.risks}
            />
          </div>
        </div>

        {/* Col 2 — Milestones */}
        <div id="cv2-milestones-col" className="flex flex-col min-h-0">
          <div className="shrink-0 h-9 flex items-center px-5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Milestones</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <MilestoneBuilder
              initialMilestones={parsed?.milestones?.milestones}
              loading={isAnalyzing && !parsed?.milestones}
            />
          </div>
        </div>

        {/* Col 3 — Deploy Preview */}
        <div id="cv2-deploy-col" className="flex flex-col min-h-0">
          <div className="shrink-0 h-9 flex items-center px-5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Deploy Preview</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <DeployReview
              deployPlan={parsed?.deployPlan}
              loading={isAnalyzing && !parsed?.deployPlan}
            />
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}

function extractParsedData(messages: UIMessage[]): ParsedContract | null {
  const assistant = messages.filter(m => m.role === "assistant").at(-1);
  if (!assistant) return null;

  // findLast pattern — get the LAST tool result (in case model calls tool more than once)
  for (let i = assistant.parts.length - 1; i >= 0; i--) {
    const part = assistant.parts[i];
    if (isToolUIPart(part) && part.type === "tool-parseContract" && part.state === "output-available") {
      return part.output as ParsedContract;
    }
  }
  return null;
}
