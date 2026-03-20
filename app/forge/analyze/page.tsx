"use client";

import { useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  ScanSearch,
  ShieldAlert,
  FileCheck,
} from "lucide-react";
import Link from "next/link";
import { ContractUpload } from "../_components/contract-upload";
import { RiskAnalysis } from "../_components/risk-analysis";
import { DotPattern } from "@/components/ui/dot-pattern";
import { Separator } from "@/components/ui/separator";

export default function AnalyzePage() {
  const [analyzed, setAnalyzed] = useState(false);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/analyze-contract" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  const handleAnalyze = (contractText: string) => {
    setAnalyzed(true);
    sendMessage({ text: contractText });
  };

  const analysisContent = messages
    .filter((m) => m.role === "assistant")
    .map((m) =>
      m.parts
        .filter((p) => p.type === "text")
        .map((p) => p.text)
        .join("")
    )
    .join("");

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DotPattern
        width={24}
        height={24}
        cr={0.6}
        className="text-primary/[0.02] [mask-image:radial-gradient(900px_circle_at_50%_30%,white,transparent)]"
      />

      <div className="relative mx-auto max-w-[1600px] px-8 lg:px-12">
        {/* ── Navigation ── */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center py-5"
        >
          <Link
            href="/forge"
            className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Forge
          </Link>

          <Separator orientation="vertical" className="mx-4 !h-4" />

          <div className="flex items-center gap-2">
            <span className="size-[6px] rounded-full bg-primary" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Contract Analysis
            </span>
          </div>
        </motion.div>

        <div className="h-px bg-border" />

        {/* ── Title ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.4 }}
          className="pt-8 pb-8"
        >
          <h1 className="text-[1.75rem] font-normal tracking-tight text-foreground lg:text-3xl">
            Upload your contract.
            <span className="text-muted-foreground/60">
              {" "}
              Sentinel scans every clause.
            </span>
          </h1>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-muted-foreground">
            The AI hunts loopholes, flags vague terms, scores every clause for
            risk, and recommends fixes — before you sign.
          </p>
        </motion.div>

        {/* ── Main content ── */}
        <div className="grid gap-8 pb-16 lg:grid-cols-[1.2fr_0.8fr] lg:gap-12">
          {/* Left — Upload + Results */}
          <div className="flex flex-col gap-6">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
            >
              <ContractUpload onSubmit={handleAnalyze} isLoading={isLoading} />
            </motion.div>

            {analyzed && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <RiskAnalysis
                  content={analysisContent}
                  isStreaming={isLoading}
                />

                {!isLoading && analysisContent && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="mt-6 flex justify-end"
                  >
                    <Link
                      href="/mediation"
                      className="hero-cta group flex items-center gap-2.5 rounded-md px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-foreground transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Start Mediation
                      <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
                    </Link>
                  </motion.div>
                )}
              </motion.div>
            )}
          </div>

          {/* Right — Context panel */}
          {!analyzed && (
            <motion.div
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="flex flex-col gap-5"
            >
              {/* What the AI analyzes */}
              <div className="rounded-xl border border-border bg-card p-6">
                <h3 className="mb-5 text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  What Sentinel looks for
                </h3>
                <div className="flex flex-col gap-5">
                  {[
                    {
                      icon: ScanSearch,
                      title: "Risk clauses",
                      desc: "Ambiguous terms, missing protections, and clauses that could trigger disputes.",
                    },
                    {
                      icon: ShieldAlert,
                      title: "Ambiguity score",
                      desc: "Each clause is scored for risk — high, medium, or low — so you know where to focus.",
                    },
                    {
                      icon: FileCheck,
                      title: "Recommendations",
                      desc: "Concrete fixes to protect both parties before the contract is signed.",
                    },
                  ].map(({ icon: Icon, title, desc }) => (
                    <div key={title} className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30">
                        <Icon className="size-4 text-primary" />
                      </div>
                      <div>
                        <span className="text-sm font-medium text-foreground">
                          {title}
                        </span>
                        <p className="mt-0.5 text-[13px] leading-relaxed text-muted-foreground">
                          {desc}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Example output preview */}
              <div className="rounded-xl border border-border bg-card/60 p-6">
                <div className="mb-4 flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
                    Sample output
                  </span>
                  <span className="rounded-md border border-border bg-muted/30 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">
                    preview
                  </span>
                </div>
                <div className="flex flex-col gap-2">
                  {[
                    { label: "4.2 — Late delivery penalty", risk: "high" },
                    { label: "7.1 — IP ownership transfer", risk: "medium" },
                    { label: "3.5 — Scope of deliverables", risk: "medium" },
                    { label: "1.1 — Contracting parties", risk: "low" },
                  ].map(({ label, risk }) => (
                    <div
                      key={label}
                      className="flex items-center justify-between rounded-md border border-border bg-muted/20 px-3 py-2.5"
                    >
                      <span className="mr-3 truncate text-[13px] text-muted-foreground">
                        {label}
                      </span>
                      <span
                        className={`shrink-0 rounded-md border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ${
                          risk === "high"
                            ? "border-destructive/30 bg-destructive/10 text-destructive"
                            : risk === "medium"
                              ? "border-primary/30 bg-primary/10 text-primary"
                              : "border-emerald/30 bg-emerald/10 text-emerald"
                        }`}
                      >
                        {risk}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity signal */}
              <div className="flex items-center gap-2 px-1">
                <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
                <span className="font-mono text-[10px] text-muted-foreground/40">
                  47 contracts analyzed this week
                </span>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}
