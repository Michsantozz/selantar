"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { motion } from "framer-motion";
import { RiskReview } from "@/app/contract/setup/_components/risk-review";
import { DeployReview } from "@/app/contract/setup/_components/deploy-review";

const MilestoneBuilder = dynamic(
  () => import("@/app/contract/setup/_components/milestone-builder").then(m => m.MilestoneBuilder),
  { ssr: false }
);
import { ContractHeader } from "./_components/contract-header";
import { FileTextIcon, ChevronLeftIcon, MoreHorizontalIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Data", done: true },
  { id: 2, label: "Risks", done: false },
  { id: 3, label: "Milestones", done: false },
  { id: 4, label: "Deploy", done: false },
];

const COL_LABELS = ["Risk Review", "Milestones", "Deploy Preview"] as const;

export default function ContractV2Page() {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      className="flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >

      {/* ── Top bar ── */}
      <motion.header
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
        className="shrink-0 h-11 border-b border-border flex items-center justify-between px-6"
      >
        <div className="flex items-center gap-3">
          <Link href="/forge" className="group flex items-center gap-1 text-muted-foreground/60 hover:text-foreground transition-colors">
            <ChevronLeftIcon className="size-3 transition-transform group-hover:-translate-x-0.5" />
            <span className="text-[10px] uppercase tracking-[0.15em] font-medium">Selantar</span>
          </Link>
          <div className="w-px h-3.5 bg-border" />
          <div className="flex items-center gap-2">
            <div className="flex size-5 items-center justify-center rounded bg-accent/8 border border-accent/15">
              <FileTextIcon className="size-2.5 text-accent" />
            </div>
            <span className="text-[13px] font-medium text-foreground">Contract review</span>
            <span className="text-[11px] text-muted-foreground/50 font-mono">contract-v2.pdf</span>
          </div>
        </div>
        <div className="flex items-center gap-2.5">
          <span className="flex items-center gap-1.5 rounded-full border border-emerald/15 bg-emerald/[0.06] px-2.5 py-[3px] text-[9px] font-semibold uppercase tracking-[0.15em] text-emerald">
            <span className="size-[5px] rounded-full bg-emerald animate-subtle-pulse" />
            AI Analysis Complete
          </span>
          <button className="flex size-6 items-center justify-center rounded border border-border/60 text-muted-foreground/40 hover:text-foreground transition-colors">
            <MoreHorizontalIcon className="size-3.5" />
          </button>
        </div>
      </motion.header>

      {/* ── Contract header ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
        className="shrink-0"
      >
        <ContractHeader />
      </motion.div>

      {/* ── Wizard stepper ── */}
      <div className="shrink-0 flex items-center gap-0 px-6 h-10 border-b border-border">
        {STEPS.map((step, i) => {
          const isActive = step.id === activeStep;
          const isDone = step.done || step.id < activeStep;
          return (
            <div key={step.id} className="flex items-center">
              {i > 0 && (
                <div className={cn(
                  "w-8 h-px mx-2",
                  isDone || (STEPS[i - 1]?.done || (STEPS[i - 1]?.id ?? 0) < activeStep)
                    ? "bg-emerald/30"
                    : "bg-border/50"
                )} />
              )}
              <button
                onClick={() => setActiveStep(step.id)}
                className={cn(
                  "flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-medium transition-all",
                  isActive && "bg-accent/8 text-accent",
                  isDone && !isActive && "text-emerald/80 hover:text-emerald",
                  !isActive && !isDone && "text-muted-foreground/30 hover:text-muted-foreground/50"
                )}
              >
                {isDone && !isActive ? (
                  <CheckIcon className="size-3 text-emerald/70" />
                ) : isActive ? (
                  <span className="size-[5px] rounded-full bg-accent" />
                ) : (
                  <span className="size-[5px] rounded-full bg-muted-foreground/20" />
                )}
                <span>{step.id}</span>
                <span>{step.label}</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* ── Three-column content ── */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="flex-1 grid divide-x divide-border overflow-hidden min-h-0"
        style={{ gridTemplateColumns: "1fr 1.1fr 1.15fr" }}>

        {[
          { label: COL_LABELS[0], content: <RiskReview /> },
          { label: COL_LABELS[1], content: <MilestoneBuilder /> },
          { label: COL_LABELS[2], content: <DeployReview /> },
        ].map((col, i) => (
          <div key={col.label} className="flex flex-col min-h-0">
            {/* Column header — minimal, typographic */}
            <div className="shrink-0 h-8 flex items-center px-5 border-b border-border/60">
              <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/35 font-medium">{col.label}</span>
            </div>
            <div className="flex-1 overflow-y-auto min-h-0">
              {col.content}
            </div>
          </div>
        ))}

      </motion.div>
    </motion.div>
  );
}
