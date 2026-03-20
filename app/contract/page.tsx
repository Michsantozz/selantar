"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  FileText,
  AlertTriangle,
  AlertCircle,
  CheckCircle2,
  Shield,
  ThumbsUp,
  ThumbsDown,
  Loader2,
  Lock,
  HeartHandshake,
} from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { DotPattern } from "@/components/ui/dot-pattern";
import { cn } from "@/lib/utils";

/* ─── WhatsApp icon ─── */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

/* ─── Data ─── */
const contract = {
  file: "Contrato_IA_Suasuna_Final.pdf",
  contractor: "ULTRASELF",
  client: "Suassuna Medical Clinic",
  value: "R$4,800 + R$400/mo · 12 months",
};

const issues = [
  {
    id: "sla-48h",
    severity: "high" as const,
    clause: "6.2.b",
    title: "SLA Says 48h But Means 24",
    body: 'The number says 48 but the words say "twenty-four." It only requires a plan, not a fix.',
    risk: "Booking AI could be down for weeks. Patients leave. No breach.",
    fix: "Hard 24h SLA for working fix. Penalty per day of downtime.",
  },
  {
    id: "ai-liability",
    severity: "medium" as const,
    clause: "3.4",
    title: "AI Errors Are Your Problem",
    body: "Wrong bookings, wrong doctor, wrong day — the clinic pays, not the builder.",
    risk: null,
    fix: "Shared liability. Builder liable for accuracy up to 95% SLA.",
  },
  {
    id: "no-escrow",
    severity: "medium" as const,
    clause: "8.1",
    title: "No Money Locked",
    body: "No escrow, no collateral. If something breaks, you chase invoices.",
    risk: null,
    fix: "Lock setup fee in smart escrow. 50% on deploy, 50% after 30 days.",
  },
];

const loadingSteps = [
  { label: "Reading the contract", duration: 1200 },
  { label: "Looking for problems", duration: 1800 },
  { label: "Building smart clauses", duration: 1500 },
  { label: "Wrapping up", duration: 1000 },
];

/* ═══════════════════════════════════════════════
   LOADING
   ═══════════════════════════════════════════════ */
function LoadingScreen({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const [done, setDone] = useState<number[]>([]);

  useEffect(() => {
    let t: NodeJS.Timeout;
    const go = (s: number) => {
      if (s >= loadingSteps.length) { t = setTimeout(onComplete, 500); return; }
      setStep(s);
      t = setTimeout(() => { setDone((p) => [...p, s]); go(s + 1); }, loadingSteps[s].duration);
    };
    t = setTimeout(() => go(0), 300);
    return () => clearTimeout(t);
  }, [onComplete]);

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex w-full max-w-md flex-col items-center"
      >
        <motion.div
          animate={{ scale: [1, 1.12, 1, 1.08, 1] }}
          transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 0.6, ease: "easeInOut", times: [0, 0.15, 0.35, 0.5, 0.7] }}
          className="mb-10"
        >
          <HeartHandshake className="size-12 text-primary" />
        </motion.div>

        <h2 className="mb-2 text-xl font-normal tracking-tight text-foreground">Reading Your Contract...</h2>
        <p className="mb-10 text-center text-sm text-muted-foreground max-w-xs">
          Sentinel is pulling apart every clause and building your smart escrow.
        </p>

        <div className="w-full rounded-xl border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="size-4 text-primary" />
              <span className="text-sm font-medium text-foreground">Sentinel Agent</span>
            </div>
            <span className="flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wider text-primary">
              <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
              Running
            </span>
          </div>
          <div className="flex flex-col gap-3">
            {loadingSteps.map((s, i) => {
              const isDone = done.includes(i);
              const isCurrent = step === i && !isDone;
              return (
                <div key={i} className="flex items-center gap-2.5">
                  {isDone ? <CheckCircle2 className="size-4 shrink-0 text-emerald" />
                    : isCurrent ? <Loader2 className="size-4 shrink-0 animate-spin text-primary" />
                    : <div className="size-4 shrink-0 rounded-full border border-border" />}
                  <span className={cn("text-sm", isDone ? "text-emerald" : isCurrent ? "text-foreground" : "text-muted-foreground/30")}>
                    {s.label}
                  </span>
                  {isDone && <span className="ml-auto text-[10px] text-muted-foreground/30">done</span>}
                </div>
              );
            })}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   ISSUE CARD — compact, horizontal-aware
   ═══════════════════════════════════════════════ */
function IssueCard({
  issue,
  response,
  onRespond,
}: {
  issue: typeof issues[0];
  response: "agree" | "disagree" | null;
  onRespond: (r: "agree" | "disagree") => void;
}) {
  const isHigh = issue.severity === "high";

  return (
    <div className={cn(
      "rounded-xl border p-5 transition-all duration-300",
      response ? "opacity-75" : "",
      isHigh ? "border-destructive/20 bg-destructive/[0.02]" : "border-primary/15 bg-primary/[0.015]"
    )}>
      {/* Header row */}
      <div className="mb-2.5 flex items-center gap-2">
        {isHigh
          ? <AlertCircle className="size-4 text-destructive shrink-0" />
          : <AlertTriangle className="size-4 text-primary shrink-0" />}
        <h3 className="text-sm font-medium text-foreground">{issue.title}</h3>
        <span className={cn(
          "rounded border px-1.5 py-0.5 font-mono text-[9px] font-medium uppercase tracking-wider",
          isHigh ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-primary/30 bg-primary/10 text-primary"
        )}>{issue.clause}</span>
        {response && (
          <span className={cn(
            "ml-auto rounded border px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wider",
            response === "agree" ? "border-emerald/30 bg-emerald/10 text-emerald" : "border-destructive/30 bg-destructive/10 text-destructive"
          )}>
            {response === "agree" ? "Accepted" : "Disputed"}
          </span>
        )}
      </div>

      {/* Body — short */}
      <p className="text-[13px] leading-relaxed text-foreground/70 mb-2.5">{issue.body}</p>

      {/* Risk if high */}
      {issue.risk && (
        <p className="text-[12px] leading-relaxed text-destructive/80 mb-2.5">
          <span className="font-medium">Risk:</span> {issue.risk}
        </p>
      )}

      {/* Sentinel fix — inline, not in a box */}
      <p className="text-[12px] leading-relaxed text-primary/80 mb-3">
        <span className="font-medium">Fix:</span> {issue.fix}
      </p>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => onRespond("agree")}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200",
            response === "agree"
              ? "border-emerald/40 bg-emerald/10 text-emerald"
              : "border-border text-muted-foreground hover:border-emerald/25 hover:text-emerald"
          )}
        >
          <ThumbsUp className="size-3" />
          Agree
        </button>
        <button
          onClick={() => onRespond("disagree")}
          className={cn(
            "flex items-center gap-1.5 rounded-md border px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200",
            response === "disagree"
              ? "border-destructive/40 bg-destructive/10 text-destructive"
              : "border-border text-muted-foreground hover:border-destructive/25 hover:text-destructive"
          )}
        >
          <ThumbsDown className="size-3" />
          Disagree
        </button>
        <button className="ml-auto flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-[11px] text-muted-foreground transition-all duration-200 hover:border-emerald/25 hover:text-emerald">
          <WhatsAppIcon className="size-3" />
          Ask via WhatsApp
        </button>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   RESULTS
   ═══════════════════════════════════════════════ */
function ResultsScreen() {
  const [responses, setResponses] = useState<Record<string, "agree" | "disagree" | null>>({});
  const reviewed = Object.values(responses).filter(Boolean).length;
  const allDone = reviewed === issues.length;

  return (
    <div className="mx-auto flex h-[calc(100dvh-130px)] max-w-[1500px] flex-col">
      {/* ── Top bar: title left, contract summary right ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-8 py-6"
      >
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="size-[6px] rounded-full bg-primary" />
            <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Analysis Complete
            </span>
          </div>
          <h1 className="text-2xl font-normal tracking-tight text-foreground">
            {issues.length} issues found in your contract.
          </h1>
          <p className="mt-1.5 text-sm text-muted-foreground">
            Review each one. Sentinel can message the other party via WhatsApp for context.
          </p>
        </div>

      </motion.div>

      {/* ── Contract summary — 4 columns ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="mb-6 grid grid-cols-4 gap-4"
      >
        {/* File */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText className="size-4 text-primary" />
            <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50">Contract</span>
          </div>
          <p className="text-sm font-medium text-foreground truncate">{contract.file}</p>
        </div>

        {/* Parties */}
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 block mb-2">Parties</span>
          <p className="text-sm text-foreground">
            <span className="font-medium">{contract.contractor}</span>
            <span className="mx-1.5 text-[10px] font-bold text-primary">VS</span>
            <span className="font-medium">{contract.client}</span>
          </p>
        </div>

        {/* Setup */}
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 block mb-2">Setup Fee</span>
          <p className="font-mono text-xl font-medium text-foreground">R$4,800</p>
        </div>

        {/* Recurring */}
        <div className="rounded-xl border border-border bg-card p-4">
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground/50 block mb-2">Recurring</span>
          <p className="font-mono text-xl font-medium text-foreground">R$400<span className="text-sm text-muted-foreground">/mo</span></p>
          <p className="text-[11px] text-muted-foreground/50">12 months</p>
        </div>
      </motion.div>

      {/* ── Main: left text + right issues grid ── */}
      <div className="flex flex-1 gap-10 min-h-0">

        {/* LEFT — Sentinel context (40%) */}
        <motion.div
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.1 }}
          className="hidden w-[340px] shrink-0 flex-col justify-between lg:flex"
        >
          <div>
            {/* What Sentinel does */}
            <div className="flex items-center gap-2 mb-4">
              <Shield className="size-4 text-primary" />
              <span className="text-sm font-medium text-foreground">How Sentinel works</span>
            </div>

            <div className="flex flex-col gap-3 mb-8">
              {[
                "Reads every clause and cross-references with legal databases",
                "Scans WhatsApp & email threads between both parties for context",
                "Flags contradictions, missing protections, and risky language",
                "Generates smart contract clauses to replace weak ones",
              ].map((text, i) => (
                <div key={i} className="flex items-start gap-2.5">
                  <CheckCircle2 className="size-3.5 shrink-0 mt-0.5 text-emerald" />
                  <span className="text-[13px] leading-snug text-muted-foreground">{text}</span>
                </div>
              ))}
            </div>

            <Separator className="mb-6" />

            {/* Verdict */}
            <div className="mb-6">
              <span className="text-[10px] font-medium uppercase tracking-[0.15em] text-muted-foreground/50 mb-2 block">
                Sentinel&apos;s Verdict
              </span>
              <p className="text-[13px] leading-relaxed text-muted-foreground italic">
                &ldquo;Lock funds on-chain, set hard deadlines, and let the contract enforce itself. Both sides need guarantees.&rdquo;
              </p>
            </div>

            <Separator className="mb-6" />

            {/* Progress */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-foreground">Your Review</span>
                <span className="font-mono text-xs text-muted-foreground">{reviewed}/{issues.length}</span>
              </div>
              <div className="h-1 w-full rounded-full bg-border overflow-hidden mb-2">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  animate={{ width: `${(reviewed / issues.length) * 100}%` }}
                  transition={{ duration: 0.3 }}
                />
              </div>
              <p className="text-xs text-muted-foreground/60">
                {allDone ? "Ready to generate." : `${issues.length - reviewed} left`}
              </p>
            </div>
          </div>

          {/* Bottom link */}
          <Link href="/forge" className="flex items-center gap-1.5 text-xs text-muted-foreground/40 transition-colors hover:text-foreground py-4">
            <ArrowLeft className="size-3" />
            New contract
          </Link>
        </motion.div>

        {/* RIGHT — Issues GRID + CTA */}
        <div className="flex flex-1 flex-col gap-4 overflow-y-auto min-h-0 pb-4">
          {/* Grid: 2 columns on xl, 1 on smaller */}
          <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
            {issues.map((issue, i) => (
              <motion.div
                key={issue.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.12 + i * 0.06 }}
              >
                <IssueCard
                  issue={issue}
                  response={responses[issue.id] ?? null}
                  onRespond={(r) => setResponses((p) => ({ ...p, [issue.id]: r }))}
                />
              </motion.div>
            ))}
          </div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-2"
          >
            <button
              disabled={!allDone}
              className={cn(
                "group flex w-full items-center justify-center gap-2.5 rounded-xl py-3.5 text-sm font-medium uppercase tracking-wider transition-all duration-300",
                allDone
                  ? "bg-foreground text-background hover:bg-foreground/90 active:scale-[0.99]"
                  : "cursor-not-allowed border border-border text-muted-foreground/20"
              )}
            >
              <Lock className="size-4" />
              Generate Smart Contract
              <ArrowRight className={cn("size-3.5 transition-transform", allDone && "group-hover:translate-x-1")} />
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */
export default function ContractAnalysisPage() {
  const [loading, setLoading] = useState(true);
  const handleComplete = useCallback(() => setLoading(false), []);

  return (
    <div className="relative min-h-screen">
      <DotPattern
        width={24}
        height={24}
        cr={0.6}
        className="text-primary/[0.02] [mask-image:radial-gradient(900px_circle_at_50%_30%,white,transparent)]"
      />

      <div className="relative mx-auto max-w-[1500px] px-8 lg:px-12">
        {/* Nav */}
        <div className="flex items-center py-4">
          <Link href="/forge" className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground">
            <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
            Forge
          </Link>
          <Separator orientation="vertical" className="mx-4 !h-4" />
          <div className="flex items-center gap-2">
            <span className="size-[6px] rounded-full bg-primary" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">Contract Analysis</span>
          </div>
        </div>
        <div className="h-px bg-border" />

        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div key="load" exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.25 }}>
              <LoadingScreen onComplete={handleComplete} />
            </motion.div>
          ) : (
            <motion.div key="results" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <ResultsScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
