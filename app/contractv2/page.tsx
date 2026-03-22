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
import { FileTextIcon, SparklesIcon, ChevronLeftIcon, MoreHorizontalIcon, CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { id: 1, label: "Data", done: true },
  { id: 2, label: "Risks", done: false },
  { id: 3, label: "Milestones", done: false },
  { id: 4, label: "Deploy", done: false },
];

export default function ContractV2Page() {
  const [activeStep, setActiveStep] = useState(2);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col bg-background"
      style={{ height: "100dvh" }}
    >

      {/* 1st — Nav + status + PDF source */}
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
          <span className="flex items-center gap-1.5 rounded-full border border-emerald/20 bg-emerald/8 px-2.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-emerald">
            <span className="size-1.5 rounded-full bg-emerald" />
            AI Analysis Complete
          </span>
          <button className="flex size-7 items-center justify-center rounded-md border border-border text-muted-foreground hover:text-foreground transition-colors">
            <MoreHorizontalIcon className="size-4" />
          </button>
        </div>
      </motion.div>

      {/* 2nd — Contract object + parties + value + deadline */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3, ease: [0, 0, 0.2, 1] }}
        className="shrink-0"
      >
        <ContractHeader />
      </motion.div>

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

        {/* Col 1 — Risk Review (4th) */}
        <div className="flex flex-col min-h-0">
          <div className="shrink-0 h-9 flex items-center px-5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Risk Review</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <RiskReview />
          </div>
        </div>

        {/* Col 2 — Milestones (5th) */}
        <div className="flex flex-col min-h-0">
          <div className="shrink-0 h-9 flex items-center px-5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Milestones</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <MilestoneBuilder />
          </div>
        </div>

        {/* Col 3 — Deploy Preview + Clara (6th) */}
        <div className="flex flex-col min-h-0">
          <div className="shrink-0 h-9 flex items-center px-5 border-b border-border">
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[10px] uppercase tracking-widest text-muted-foreground font-medium">Deploy Preview</span>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-5 min-h-0">
            <DeployReview />
          </div>
        </div>

      </motion.div>
    </motion.div>
  );
}
