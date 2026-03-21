"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ArrowRight, Upload, DollarSign, Clock, Paperclip } from "lucide-react";
import { scenarios } from "@/lib/scenarios";
import { DotPattern } from "@/components/ui/dot-pattern";

/* ─── Scenario context ─── */
const scenarioMeta: Record<string, { emoji: string; brief: string }> = {
  "clinica-suasuna": {
    emoji: "🏥",
    brief: "Doctor wants a refund. Dev was blocked by the clinic's secretary for 3 weeks. AI investigates chat logs and brokers a deal.",
  },
  "ecommerce-quebrado": {
    emoji: "🛒",
    brief: "Payment gateway broke mid-project. Client blames the dev. AI analyzes the API changelog and proposes a fair split.",
  },
  "freelancer-fantasma": {
    emoji: "👻",
    brief: "Freelancer vanished after delivering 3 of 4 sprints. Client wants a full refund. AI calculates proportional payment.",
  },
};

/* ─── Shared motion ─── */
const cardReveal = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

/* ═══════════════════════════════════════════════
   CARD 1 — Parse & Protect
   ═══════════════════════════════════════════════ */
function ParseCard() {
  return (
    <motion.div
      {...cardReveal(0.15)}
      className="group flex h-full flex-col rounded-xl border border-border bg-card transition-colors duration-500 hover:border-primary/15"
    >
      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="size-[6px] rounded-full bg-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Parse & Protect
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/25">
          01 — Contract Analysis
        </span>
      </div>

      <div className="h-px bg-border" />

      {/* ── Body ── */}
      <div className="flex flex-1 flex-col px-7 pt-8 pb-7">
        {/* Heading block */}
        <div className="mb-8">
          <h3 className="text-[1.65rem] font-normal tracking-tight leading-[1.15] text-foreground">
            Drop a contract. 📄
            <br />
            <span className="text-muted-foreground/60">
              Watch Sentinel tear it apart.
            </span>
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/50 max-w-[360px]">
            Upload any PDF. The AI hunts loopholes, flags vague terms,
            and scores every clause for risk before you sign.
          </p>
        </div>

        {/* Upload zone */}
        <Link
          href="/forge/analyze"
          className="block rounded-lg border border-dashed border-border/80 bg-muted/[0.04] px-6 py-8 text-center transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/25 hover:bg-primary/[0.02] active:scale-[0.99]"
        >
          <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-lg bg-muted/30 transition-colors duration-500 group-hover:bg-primary/10">
            <Upload className="size-[18px] text-muted-foreground/40 transition-colors duration-500 group-hover:text-primary/60" />
          </div>
          <p className="text-sm text-muted-foreground/60">
            Drag & drop your contract PDF
          </p>
          <p className="mt-1.5 text-[11px] text-muted-foreground/25">
            PDF only · Max 10 MB · Private & encrypted
          </p>
        </Link>

        {/* Divider */}
        <div className="my-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/30">or</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        {/* Demo contract option */}
        <Link
          href="/contract"
          className="group/demo flex flex-col items-center gap-3 rounded-lg border border-primary/15 bg-primary/[0.03] px-6 py-6 text-center transition-all duration-500 hover:border-primary/30 hover:bg-primary/[0.06] active:scale-[0.99]"
        >
          <div className="flex items-center gap-2.5">
            <span className="size-2 rounded-full bg-primary animate-subtle-pulse" />
            <span className="text-sm font-medium text-foreground transition-colors">
              No contract? No problem.
            </span>
          </div>
          <p className="text-[12px] leading-relaxed text-muted-foreground/50">
            Load a sample SaaS contract and watch the AI tear it apart in real time.
          </p>
          <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary/70 transition-colors group-hover/demo:text-primary">
            Try Demo
            <ArrowRight className="size-3 transition-transform duration-500 group-hover/demo:translate-x-0.5" />
          </span>
        </Link>

        <div className="flex-1" />

        {/* CTA */}
        <div className="mt-8">
          <Link
            href="/forge/analyze"
            className="group/btn flex w-full items-center justify-center gap-2.5 rounded-md bg-foreground py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-background transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:bg-foreground/90 active:scale-[0.98]"
          >
            Analyze a Contract
            <ArrowRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   CARD 2 — Go to War
   ═══════════════════════════════════════════════ */
function WarCard() {
  return (
    <motion.div
      {...cardReveal(0.25)}
      className="flex h-full flex-col rounded-xl border border-border bg-card transition-colors duration-500 hover:border-destructive/12"
    >
      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="size-[6px] rounded-full bg-destructive" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Go to War
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/25">
          02 — Live Mediation
        </span>
      </div>

      <div className="h-px bg-border" />

      {/* ── Body: stacked scenario cards ── */}
      <div className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
        {scenarios.map((scenario, i) => {
          const meta = scenarioMeta[scenario.id];
          return (
            <Link
              key={scenario.id}
              href={`/mediation/briefing?scenario=${scenario.id}`}
              className="group/sc flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/25 hover:shadow-[0_4px_24px_oklch(0.72_0.17_55/0.04)]"
            >
              {/* Image strip */}
              <div className="relative h-24 w-full shrink-0 overflow-hidden">
                <Image
                  src={scenario.visual.image}
                  alt={scenario.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sc:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 via-30% to-transparent" />

                {/* Viewfinder corners */}
                <span className="absolute left-2 top-2 size-3 border-l border-t border-foreground/12" />
                <span className="absolute right-2 top-2 size-3 border-r border-t border-foreground/12" />
                <span className="absolute left-2 bottom-2 size-3 border-l border-b border-foreground/12" />
                <span className="absolute right-2 bottom-2 size-3 border-r border-b border-foreground/12" />

                {/* Case overlay */}
                <div className="absolute inset-x-0 top-0 flex items-center px-4 pt-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    Case {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex flex-col gap-2 px-4 pb-4 pt-2">
                <div className="flex items-baseline justify-between gap-2">
                  <h4 className="flex items-center gap-2 text-[14px] font-medium tracking-tight text-foreground transition-colors duration-300 group-hover/sc:text-primary">
                    <span className="text-sm">{meta?.emoji}</span>
                    {scenario.title}
                  </h4>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-primary">
                    {scenario.escrow}
                  </span>
                </div>

                <p className="text-[11px] text-muted-foreground/40">
                  {scenario.tagline}
                </p>

                <div className="flex items-center gap-2 font-mono text-[10px]">
                  <span className="text-foreground/35">{scenario.parties.client.name}</span>
                  <span className="text-[9px] font-bold text-primary/60">VS</span>
                  <span className="text-foreground/35">{scenario.parties.developer.name}</span>
                </div>

                <div className="mt-1 flex items-center justify-between border-t border-border/40 pt-2">
                  <div className="flex items-center gap-3 font-mono text-[9px] uppercase tracking-wider text-muted-foreground/25">
                    <span className="flex items-center gap-1">
                      <DollarSign className="size-2.5" />
                      {scenario.contract.currency} {scenario.contract.value}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="size-2.5" />
                      {scenario.contract.duration}
                    </span>
                    <span className="flex items-center gap-1">
                      <Paperclip className="size-2.5" />
                      {scenario.evidence.length}
                    </span>
                  </div>
                  <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-foreground/60 transition-colors duration-300 group-hover/sc:text-primary">
                    Open
                    <ArrowRight className="size-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sc:translate-x-0.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* ── Footer CTA ── */}
      <div className="border-t border-border px-7 py-5">
        <Link
          href="/mediation"
          className="hero-cta group/btn flex w-full items-center justify-center gap-2.5 rounded-md py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.01] active:scale-[0.98]"
        >
          Enter the War Room
          <ArrowRight className="size-3.5 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/btn:translate-x-1" />
        </Link>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE — Title LEFT, Cards RIGHT side by side
   ═══════════════════════════════════════════════ */
export default function ForgePage() {
  return (
    <div className="relative h-[calc(100dvh-65px)] overflow-hidden">
      <DotPattern
        width={24}
        height={24}
        cr={0.6}
        className="text-primary/[0.03] [mask-image:radial-gradient(800px_circle_at_25%_40%,white,transparent)]"
      />

      <div className="relative mx-auto flex h-full max-w-[1600px] gap-12 px-8 py-8 lg:px-12">

        {/* ─── LEFT: Title panel ─── */}
        <motion.aside
          initial={{ opacity: 0, x: -12 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="hidden w-[300px] shrink-0 flex-col justify-center lg:flex"
        >
          <div className="flex items-center gap-2.5">
            <span className="size-[7px] rounded-full bg-primary" />
            <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
              Forge
            </span>
          </div>

          <h1 className="mt-7 text-[2.75rem] font-normal tracking-tight leading-[1.08] text-foreground">
            Two ways
            <br />
            to see Selantar
            <br />
            <span className="font-display italic text-primary">think.</span>
          </h1>

          <p className="mt-5 text-[15px] leading-relaxed text-muted-foreground/50">
            Analyze a real contract and watch Sentinel hunt for risk —
            or jump into a live dispute and see the AI mediate under pressure.
          </p>

          <div className="mt-10 h-px w-full bg-border/60" />

          <div className="mt-7 flex flex-col gap-4">
            {[
              "Upload a contract or pick a scenario",
              "AI analyzes evidence, finds who's at fault",
              "Settlement proposed and executed on-chain",
            ].map((text, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="pt-px font-mono text-[11px] tabular-nums text-primary/30">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="text-[13px] leading-snug text-muted-foreground/35">
                  {text}
                </span>
              </div>
            ))}
          </div>

          <div className="mt-auto pt-8">
            <span className="block font-mono text-[10px] text-muted-foreground/20">
              Drop a contract to begin
            </span>
            <span className="mt-1 block font-mono text-[10px] text-muted-foreground/12">
              Base Sepolia
            </span>
          </div>
        </motion.aside>

        {/* ─── Mobile: title above cards ─── */}
        <div className="flex flex-col gap-6 lg:hidden">
          <div>
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Forge
              </span>
            </div>
            <h1 className="mt-4 text-3xl font-normal tracking-tight text-foreground">
              Two ways to see Selantar{" "}
              <span className="font-display italic text-primary">think.</span>
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground/50">
              Analyze a contract or jump into a live dispute.
            </p>
          </div>
          <ParseCard />
          <WarCard />
        </div>

        {/* ─── Desktop: Two cards side by side ─── */}
        <div className="hidden flex-1 gap-5 lg:flex">
          <div className="flex-1 min-w-0">
            <ParseCard />
          </div>
          <div className="flex-1 min-w-0">
            <WarCard />
          </div>
        </div>
      </div>
    </div>
  );
}
