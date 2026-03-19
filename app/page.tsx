"use client";

import Link from "next/link";
import {
  ArrowRight,
  FileText,
  CircleDollarSign,
  Fingerprint,
  BadgeCheck,
  Eye,
  Blocks,
  HeartHandshake,
  ScanSearch,
  MessageSquareWarning,
  Handshake,
  ReceiptText,
  TrendingUp,
  AlertTriangle,
  Clock,
  ShieldOff,
} from "lucide-react";

import { BlurFade } from "@/components/ui/blur-fade";
import { TextAnimate } from "@/components/ui/text-animate";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { Marquee } from "@/components/ui/marquee";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { DotPattern } from "@/components/ui/dot-pattern";
import { BorderBeam } from "@/components/ui/border-beam";
import { Heatmap } from "@paper-design/shaders-react";
import { useState, useEffect } from "react";

/* ─── Section Label (Factory.ai pattern) ─── */
function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-primary" />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ─── Preload image for Heatmap shader ─── */
function useLoadedImage(src: string) {
  const [img, setImg] = useState<HTMLImageElement | null>(null);
  useEffect(() => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => setImg(image);
    image.src = src;
  }, [src]);
  return img;
}

/* ═══════════════════════════════════════════════
   HERO — Heatmap shader + staggered copy + stats
   ═══════════════════════════════════════════════ */
function HeroSection() {
  const logoImage = useLoadedImage("/veredict-logo.png");
  return (
    <section className="relative min-h-[calc(100dvh-65px)] flex items-center overflow-hidden -mt-[65px] pt-[65px]">
      {/* Animated grid — subtle depth */}
      <div className="pointer-events-none absolute inset-0">
        <AnimatedGridPattern
          width={48}
          height={48}
          numSquares={30}
          maxOpacity={0.06}
          duration={5}
          repeatDelay={1}
          className="fill-primary/15 stroke-primary/6 [mask-image:radial-gradient(700px_circle_at_60%_40%,white,transparent)]"
        />
      </div>

      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-[10%] top-[15%] h-[600px] w-[600px] rounded-full bg-primary/[0.04] blur-[120px]" />
        <div className="absolute left-[5%] bottom-[20%] h-[400px] w-[400px] rounded-full bg-primary/[0.02] blur-[100px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 lg:px-9 lg:py-32">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Left — Copy */}
          <div>
            <BlurFade delay={0.1}>
              <SectionLabel label="Care protocol" />
            </BlurFade>

            <BlurFade delay={0.25}>
              <h1 className="mt-8 text-5xl font-normal tracking-tight leading-[1.05] text-foreground lg:text-7xl">
                Contracts break.
                <br />
                <span className="font-display italic text-primary">
                  We fix the people.
                </span>
              </h1>
            </BlurFade>

            <BlurFade delay={0.55}>
              <p className="mt-6 max-w-sm text-sm leading-relaxed text-muted-foreground">
                AI that listens to both sides, protects egos, and settles
                disputes on-chain. No lawyers. No delays.
              </p>
            </BlurFade>

            <BlurFade delay={0.65}>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <Link
                  href="/forge"
                  className="hero-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-sm font-medium uppercase tracking-wider text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span className="relative z-10 flex items-center gap-2">
                    Drop your contract
                    <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                  </span>
                </Link>

                <Link
                  href="/mediation"
                  className="group inline-flex items-center gap-1.5 rounded-lg border border-border bg-transparent px-5 py-2.5 text-sm font-medium uppercase tracking-wider text-foreground transition-colors hover:bg-muted active:scale-[0.98]"
                >
                  See it mediate
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </div>
            </BlurFade>

            <BlurFade delay={0.8}>
              <div className="mt-14 flex items-center gap-8 border-t border-border/40 pt-8">
                {[
                  { value: "11%", label: "revenue lost to contract friction" },
                  { value: "24h", label: "average dispute resolution" },
                  { value: "0", label: "humans required" },
                ].map(({ value, label }) => (
                  <div key={value} className="flex flex-col">
                    <span className="font-mono text-2xl font-medium text-foreground">{value}</span>
                    <span className="mt-1 text-xs leading-snug text-muted-foreground max-w-[120px]">{label}</span>
                  </div>
                ))}
              </div>
            </BlurFade>
          </div>

          {/* Right — Heatmap shader visual */}
          <BlurFade delay={0.3}>
            <div
              aria-hidden="true"
              className="relative mx-auto flex w-full max-w-md items-center justify-center overflow-hidden rounded-lg"
              style={{
                aspectRatio: "3/4",
                maskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                maskComposite: "intersect",
                WebkitMaskImage: "linear-gradient(to bottom, transparent 0%, black 10%, black 90%, transparent 100%), linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)",
                WebkitMaskComposite: "destination-in",
              }}
            >
              {logoImage && (
                <Heatmap
                  width={720}
                  height={720}
                  image={logoImage}
                  colors={["#1a0800", "#3d1500", "#7c3a0a", "#c45e1a", "#ef6f2e", "#ff9944", "#ffe0a0"]}
                  colorBack="#151312"
                  contour={0.5}
                  angle={0}
                  noise={0}
                  innerGlow={0.5}
                  outerGlow={0.5}
                  speed={1}
                  scale={0.75}
                />
              )}
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   THE PROBLEM — Conflict chat visualization
   ═══════════════════════════════════════════════ */
const conflictMessages = [
  {
    side: "client" as const,
    name: "Dr. Suasuna",
    role: "Client",
    text: "I was in the ICU for 3 weeks. My secretary never forwarded the revision request.",
    time: "14:32",
  },
  {
    side: "dev" as const,
    name: "Matheus",
    role: "Developer",
    text: "Milestone 3 was due Nov 15. I delivered on time. No response for 40 days.",
    time: "14:35",
  },
  {
    side: "client" as const,
    name: "Dr. Suasuna",
    role: "Client",
    text: "The work doesn't match what we agreed. I want a full refund.",
    time: "14:41",
  },
  {
    side: "dev" as const,
    name: "Matheus",
    role: "Developer",
    text: "I followed the spec exactly. The escrow should release. This is bad faith.",
    time: "14:43",
  },
];

function ProblemSection() {
  return (
    <section className="relative py-12 lg:py-20 bg-card/40">
      <div className="mx-auto max-w-7xl px-4 lg:px-9">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <BlurFade delay={0.1} inView>
              <SectionLabel label="The problem" />
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-6 text-4xl font-normal tracking-tight leading-tight text-foreground lg:text-[3.25rem]">
                Smart contracts created
                <br />
                a new problem.
              </h2>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                Web3 promised to fix trust. Instead it gave us rigid, cold numbers
                for emotional creatures. When a doctor freezes your escrow because
                his own secretary ignored your message, no smart contract can
                understand that context.
              </p>
            </BlurFade>
            <BlurFade delay={0.4} inView>
              <p className="mt-4 max-w-lg text-base leading-relaxed text-muted-foreground">
                You don't need a judge. You need someone who{" "}
                <span className="text-foreground font-medium">cares</span>.
                That's why we believe{" "}
                <span className="text-primary font-medium">
                  attention is the new gold
                </span>{" "}
                for the next decade.
              </p>
            </BlurFade>
          </div>

          {/* Conflict chat */}
          <BlurFade delay={0.3} inView>
            <div className="relative rounded-xl border border-border bg-card p-5 overflow-hidden">
              <BorderBeam
                size={200}
                duration={8}
                colorFrom="oklch(0.72 0.17 55)"
                colorTo="oklch(0.62 0.22 25)"
                borderWidth={1}
              />
              <div className="mb-4 flex items-center justify-between border-b border-border pb-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="size-4 text-primary" />
                  <span className="text-xs font-medium uppercase tracking-wider text-primary">
                    Active dispute
                  </span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="size-3 text-muted-foreground/60" />
                  <span className="font-mono text-[10px] text-muted-foreground/60">
                    40 days unresolved
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-3">
                {conflictMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`flex flex-col gap-1 rounded-lg border p-3 ${
                      msg.side === "client"
                        ? "border-destructive/15 bg-destructive/[0.03]"
                        : "border-border bg-muted/30"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span
                          className={`size-1.5 rounded-full ${
                            msg.side === "client" ? "bg-destructive/60" : "bg-muted-foreground/40"
                          }`}
                        />
                        <span className="text-xs font-medium text-foreground">
                          {msg.name}
                        </span>
                        <span className="text-[10px] text-muted-foreground/60">
                          {msg.role}
                        </span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground/60">
                        {msg.time}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {msg.text}
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-lg border border-primary/15 bg-primary/[0.04] px-3 py-2.5">
                <ShieldOff className="size-3.5 shrink-0 text-primary/70" />
                <span className="text-xs text-muted-foreground">
                  Smart contract locked. Neither party can release funds.
                  <span className="ml-1 text-primary font-medium">
                    Human context required.
                  </span>
                </span>
              </div>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   HOW IT WORKS — Centered 3-col (breaks the split monotony)
   ═══════════════════════════════════════════════ */
function HowItWorksSection() {
  const steps = [
    {
      num: "01",
      icon: ScanSearch,
      title: "AI audits your contract",
      description:
        "Upload a PDF. Veredict hunts loopholes, flags vague terms, and eliminates ambiguity. Every clause gets a risk score.",
    },
    {
      num: "02",
      icon: Blocks,
      title: "Deploys a living contract",
      description:
        "Structures milestones, defines rules, and deploys secure on-chain escrow. As milestones are approved, cash releases instantly.",
    },
    {
      num: "03",
      icon: Eye,
      title: "Sentinel watches the context",
      description:
        "The AI audits real-world evidence: CRM logs, messages, delivery history. When a dispute hits, it already has proof.",
    },
  ];

  return (
    <section className="relative py-14 lg:py-22 border-t border-border">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-9">
        {/* Centered header — breaks left-aligned monotony */}
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <BlurFade delay={0.1} inView>
            <div className="flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                How it works
              </span>
            </div>
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="mt-6 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-5xl">
              From dead PDF to{" "}
              <span className="font-display italic text-primary">
                living contract.
              </span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Drop a standard contract. Our intelligence tears it apart,
              hunts for loopholes, flags vague terms, and transforms it into
              a living agreement with milestones, rules, and on-chain escrow.
            </p>
          </BlurFade>
        </div>

        {/* 3-col viewfinder grid */}
        <div className="grid gap-4 lg:grid-cols-3">
          {steps.map(({ num, icon: Icon, title, description }, i) => (
            <BlurFade key={num} delay={0.1 + i * 0.12} inView>
              <div className="group relative flex h-full flex-col rounded-xl border border-border bg-card p-7 transition-all duration-300 hover:border-primary/25 hover:-translate-y-1 hover:shadow-[0_8px_30px_oklch(0.72_0.17_55/0.06)] active:translate-y-0">
                {/* Viewfinder corner brackets */}
                <span className="absolute left-2 top-2 size-4 border-l border-t border-foreground/12" />
                <span className="absolute right-2 top-2 size-4 border-r border-t border-foreground/12" />
                <span className="absolute left-2 bottom-2 size-4 border-l border-b border-foreground/12" />
                <span className="absolute right-2 bottom-2 size-4 border-r border-b border-foreground/12" />

                {/* Content */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex size-9 items-center justify-center rounded-md bg-primary/8">
                    <Icon className="size-4 text-primary" />
                  </div>
                  <span className="font-mono text-[10px] text-muted-foreground/60 tracking-wider">
                    {num}/03
                  </span>
                </div>

                <h3 className="mt-5 text-base font-medium tracking-tight text-foreground">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {description}
                </p>
              </div>
            </BlurFade>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   BENTO — Asymmetric grid with micro-animations
   Layout: [Mediation tall] [Escrow]
                             [Sentinel]
           [Receipts wide ───────────]
   ═══════════════════════════════════════════════ */
function MediationMicroAnim() {
  return (
    <div className="absolute right-4 bottom-20 flex flex-col gap-1.5 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
      {[
        { text: "I understand both perspectives.", delay: 0 },
        { text: "Let me propose a fair resolution.", delay: 1.2 },
        { text: "Settlement: 80/20 split.", delay: 2.4 },
      ].map(({ text, delay }) => (
        <div
          key={text}
          className="w-fit rounded-md border border-border bg-card px-2.5 py-1 text-[9px] text-muted-foreground animate-message-in"
          style={{ animationDelay: `${delay}s`, animationFillMode: "both" }}
        >
          {text}
        </div>
      ))}
    </div>
  );
}

function EscrowMicroAnim() {
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-2 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
      {[
        { label: "M1", pct: "100%", color: "bg-emerald" },
        { label: "M2", pct: "100%", color: "bg-emerald" },
        { label: "M3", pct: "60%", color: "bg-primary" },
      ].map(({ label, pct, color }) => (
        <div key={label} className="flex items-center gap-2">
          <span className="text-[9px] text-muted-foreground w-6 shrink-0">{label}</span>
          <div className="h-1 w-16 rounded-full bg-border overflow-hidden">
            <div className={`h-full rounded-full ${color}`} style={{ width: pct }} />
          </div>
        </div>
      ))}
    </div>
  );
}

function ReceiptMicroAnim() {
  return (
    <div className="absolute right-4 top-4 flex flex-col gap-1 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
      <span className="font-mono text-[8px] text-emerald/60">tx confirmed</span>
      <span className="font-mono text-[9px] text-muted-foreground/60 tracking-tight">
        0x7a3f...b4e2
      </span>
      <span className="font-mono text-[9px] text-muted-foreground/40 tracking-tight">
        block #19847231
      </span>
    </div>
  );
}

const bentoFeatures = [
  {
    name: "Empathetic Mediation",
    description:
      "The AI doesn't quote rules. It cools the room, drops a reality check, protects egos, and shifts the conversation from blame to resolution.",
    Icon: HeartHandshake,
    href: "/mediation",
    cta: "Enter Mediation",
    className: "lg:col-span-2",
    background: <MediationMicroAnim />,
  },
  {
    name: "On-chain Escrow",
    description:
      "Milestones approved, cash released. No banks, no wire fees, no chasing invoices.",
    Icon: CircleDollarSign,
    href: "/forge",
    cta: "Setup Escrow",
    className: "",
    background: <EscrowMicroAnim />,
  },
  {
    name: "Sentinel Intelligence",
    description:
      "Audits CRM, messages, and delivery logs. Uncovers truth before anyone can spin a story.",
    Icon: Eye,
    href: "/forge",
    cta: "See Sentinel",
    className: "",
    background: (
      <div className="absolute right-4 top-4 flex flex-col gap-1 opacity-40 group-hover:opacity-80 transition-opacity duration-500">
        {["WhatsApp", "GitHub", "CRM", "Email"].map((ch) => (
          <div key={ch} className="flex items-center gap-1.5">
            <span className="size-1 rounded-full bg-emerald/60" />
            <span className="text-[9px] text-muted-foreground">{ch}</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    name: "Verifiable Receipts",
    description:
      "Every verdict registered on-chain via ERC-8004. Identity, reputation, and validation. Permanently auditable.",
    Icon: Fingerprint,
    href: "/contract",
    cta: "View On-chain",
    className: "lg:col-span-2",
    background: <ReceiptMicroAnim />,
  },
];

function BentoSection() {
  return (
    <section className="relative py-12 lg:py-20">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-9">
        <div className="mb-8 max-w-2xl">
          <BlurFade delay={0.1} inView>
            <SectionLabel label="Capabilities" />
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="mt-6 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-[2.75rem]">
              Not a judge.
              <br />
              A{" "}
              <span className="font-display italic text-primary">
                political advisor.
              </span>
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Veredict transforms angry developers into strategic CEOs.
              It de-escalates, proposes diplomatic wins, and settles. All on-chain.
            </p>
          </BlurFade>
        </div>

        <BentoGrid className="auto-rows-[18rem] lg:grid-cols-3 gap-5">
          {bentoFeatures.map((feature, i) => (
            <BlurFade key={feature.name} delay={0.1 + i * 0.1} inView className={`${feature.className} [&>div]:h-full`}>
              <BentoCard
                name={feature.name}
                description={feature.description}
                Icon={feature.Icon}
                href={feature.href}
                cta={feature.cta}
                className=""
                background={feature.background}
              />
            </BlurFade>
          ))}
        </BentoGrid>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   PIPELINE MARQUEE — Full-width, breaks rhythm
   ═══════════════════════════════════════════════ */
const pipelineSteps = [
  { icon: FileText, label: "PDF Uploaded", mono: "Dead contract drops" },
  { icon: ScanSearch, label: "AI Audit", mono: "Loopholes flagged" },
  { icon: Blocks, label: "Living Contract", mono: "Milestones deployed" },
  { icon: CircleDollarSign, label: "Escrow Funded", mono: "Cash secured on-chain" },
  { icon: Eye, label: "Sentinel Active", mono: "Evidence collected" },
  { icon: MessageSquareWarning, label: "Dispute Triggered", mono: "24h clock starts" },
  { icon: HeartHandshake, label: "AI Mediates", mono: "Egos protected" },
  { icon: Handshake, label: "Settlement", mono: "Both sides sign" },
  { icon: ReceiptText, label: "Receipt Issued", mono: "ERC-8004 registered" },
];

function PipelineSection() {
  return (
    <section className="relative py-12 lg:py-20 overflow-hidden border-t border-border bg-card/30">
      <div className="mx-auto max-w-7xl px-4 lg:px-9">
        <div className="mb-10 max-w-2xl">
          <BlurFade delay={0.1} inView>
            <SectionLabel label="Pipeline" />
          </BlurFade>
          <BlurFade delay={0.2} inView>
            <h2 className="mt-6 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-[2.75rem]">
              From fragile paper to settled cash.
            </h2>
          </BlurFade>
          <BlurFade delay={0.3} inView>
            <p className="mt-6 text-base leading-relaxed text-muted-foreground">
              Every step autonomous. Every action verifiable. Every receipt on-chain.
            </p>
          </BlurFade>
        </div>
      </div>

      <Marquee pauseOnHover className="[--duration:60s] [--gap:1.5rem] mt-6">
        {pipelineSteps.map(({ icon: Icon, label, mono }, i) => (
          <div
            key={label}
            className="flex w-72 flex-col gap-4 rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:border-primary/25 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_oklch(0.72_0.17_55/0.05)]"
          >
            <div className="flex items-center gap-3">
              <Icon className="size-4 shrink-0 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">
                  {label}
                </span>
                <span className="font-mono text-[10px] text-muted-foreground/60">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
            </div>
            <span className="text-xs leading-relaxed text-muted-foreground">
              {mono}
            </span>
          </div>
        ))}
      </Marquee>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   ERC-8004 — On-chain trust layer (with dot pattern)
   ═══════════════════════════════════════════════ */
function ERC8004Section() {
  return (
    <section className="relative py-14 lg:py-22 overflow-hidden">
      <DotPattern
        width={24}
        height={24}
        cr={0.8}
        className="text-primary/[0.06] [mask-image:radial-gradient(600px_circle_at_30%_50%,white,transparent)]"
      />
      <div className="relative mx-auto max-w-7xl px-4 lg:px-9">
        <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <BlurFade delay={0.1} inView>
              <SectionLabel label="On-chain trust" />
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-6 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-[2.75rem]">
                Credit is never
                <br />
                a cold number.
              </h2>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <p className="mt-6 max-w-lg text-base leading-relaxed text-muted-foreground">
                We look past statistics to see the human behind the deal.
                Every mediation builds an on-chain bureau. Not just
                payments, but professional truth. This truth unlocks a new economy.
              </p>
            </BlurFade>
          </div>

          <div className="divide-y divide-border">
            {[
              {
                title: "Identity Registry",
                description:
                  "Registered as an autonomous agent on Base. Every action traceable to a verified on-chain identity.",
                icon: Fingerprint,
                badge: "REGISTERED",
              },
              {
                title: "Reputation Registry",
                description:
                  "Each settlement builds reputation. Verified professional truth that unlocks real liquidity.",
                icon: TrendingUp,
                badge: "ACTIVE",
              },
              {
                title: "Validation Registry",
                description:
                  "Every verdict stored as cryptographic evidence. Permanent, auditable, impossible to erase.",
                icon: BadgeCheck,
                badge: "VERIFIED",
              },
            ].map(({ title, description, icon: Icon, badge }, i) => (
              <BlurFade key={title} delay={0.2 + i * 0.1} inView>
                <div className="flex items-start justify-between gap-6 py-6">
                  <div className="flex items-start gap-4">
                    <Icon className="mt-0.5 size-5 shrink-0 text-primary" />
                    <div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium text-foreground">
                          {title}
                        </span>
                        <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">
                          {badge}
                        </span>
                      </div>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   VISION — Vertical timeline
   ═══════════════════════════════════════════════ */
function VisionSection() {
  const phases = [
    {
      num: "01",
      label: "NOW",
      live: true,
      title: "Mediation Protocol",
      description: "AI mediator that listens, protects egos, and settles disputes on-chain. The first protocol where machines care about context, not just code.",
      tags: ["Contract audit", "AI mediation", "On-chain escrow", "ERC-8004 receipts"],
      Icon: HeartHandshake,
    },
    {
      num: "02",
      label: "NEXT",
      live: false,
      title: "Omnichannel Sentinel",
      description: "Evidence collected from every channel where business happens. Mediation meets you where the context lives.",
      tags: ["WhatsApp", "GitHub", "CRM", "Auto-docs"],
      Icon: Eye,
    },
    {
      num: "03",
      label: "HORIZON",
      live: false,
      title: "Trust Economy",
      description: "On-chain reputation unlocks liquidity, insurance, and credit lines. Honesty becomes capital.",
      tags: ["Credit bureau", "Smart insurance", "Trust-backed liquidity"],
      Icon: TrendingUp,
    },
  ];

  return (
    <section className="relative py-12 lg:py-20 border-t border-border">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-9">
        <div className="grid items-start gap-12 lg:grid-cols-[1fr_1.8fr] lg:gap-16">
          {/* Left — sticky heading */}
          <div className="lg:sticky lg:top-28">
            <BlurFade delay={0.1} inView>
              <SectionLabel label="Vision" />
            </BlurFade>
            <BlurFade delay={0.2} inView>
              <h2 className="mt-6 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-[2.75rem]">
                Where trust becomes{" "}
                <span className="font-display italic text-primary">capital.</span>
              </h2>
            </BlurFade>
            <BlurFade delay={0.3} inView>
              <p className="mt-6 text-base leading-relaxed text-muted-foreground">
                Three phases. One mission. Build the trust infrastructure
                the internet economy never had.
              </p>
            </BlurFade>
          </div>

          {/* Right — compact phase cards */}
          <div className="flex flex-col gap-4">
            {phases.map(({ num, label, live, title, description, tags, Icon }, i) => (
              <BlurFade key={num} delay={0.15 + i * 0.12} inView>
                <div
                  className={`group rounded-xl border p-5 lg:p-6 transition-all duration-300 ${
                    live
                      ? "border-primary/25 bg-primary/[0.03]"
                      : "border-border bg-card hover:border-border/80"
                  }`}
                >
                  {/* Top row — number + label + icon */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`font-mono text-xs font-medium ${live ? "text-primary" : "text-muted-foreground/60"}`}>
                        {num}
                      </span>
                      <span className={`text-[10px] font-medium uppercase tracking-widest ${live ? "text-primary" : "text-muted-foreground/60"}`}>
                        {label}
                      </span>
                      {live && (
                        <span className="flex items-center gap-1">
                          <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
                          <span className="font-mono text-[10px] text-primary/70">LIVE</span>
                        </span>
                      )}
                    </div>
                    <Icon className={`size-5 ${live ? "text-primary/30" : "text-muted-foreground/15"}`} />
                  </div>

                  {/* Title + description */}
                  <h3 className={`mt-3 text-lg font-medium tracking-tight ${live ? "text-foreground" : "text-foreground/80"}`}>
                    {title}
                  </h3>
                  <p className={`mt-1.5 text-sm leading-relaxed ${live ? "text-muted-foreground" : "text-muted-foreground/70"}`}>
                    {description}
                  </p>

                  {/* Tags row */}
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className={`rounded-md px-2 py-0.5 text-[10px] font-medium ${
                          live
                            ? "border border-primary/20 bg-primary/[0.06] text-primary/80"
                            : "border border-border bg-muted/20 text-muted-foreground/60"
                        }`}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </BlurFade>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ═══════════════════════════════════════════════
   CTA — Centered with ShimmerButton
   ═══════════════════════════════════════════════ */
function CTASection() {
  return (
    <section className="relative py-14 lg:py-22 border-t border-border">
      <div className="relative mx-auto max-w-7xl px-4 lg:px-9">
        <div className="flex flex-col items-center text-center">
          <BlurFade delay={0.1} inView>
            <div className="flex items-center justify-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Get started
              </span>
            </div>
          </BlurFade>

          <BlurFade delay={0.2} inView>
            <TextAnimate
              as="h2"
              animation="blurInUp"
              by="word"
              className="mt-6 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-[3.25rem]"
              once
            >
              Stop bleeding revenue to broken contracts.
            </TextAnimate>
          </BlurFade>

          <BlurFade delay={0.4} inView>
            <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-muted-foreground">
              Drop your contract, let the AI audit and protect it, and settle
              every dispute on-chain. No lawyers, no delays, no taking the fall.
            </p>
          </BlurFade>

          <BlurFade delay={0.5} inView>
            <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/forge"
                className="hero-cta group relative inline-flex items-center gap-2 overflow-hidden rounded-lg px-6 py-3 text-sm font-medium uppercase tracking-wider text-foreground transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span className="relative z-10 flex items-center gap-2">
                  Drop your contract
                  <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>

              <a
                href="https://sepolia.basescan.org/address/0x377711a26B52F4AD8C548AAEF8297E0563b87Db4"
                target="_blank"
                rel="noopener noreferrer"
                className="group inline-flex items-center gap-1.5 text-sm font-medium uppercase tracking-wider text-foreground transition-colors hover:text-primary"
              >
                <span className="size-1.5 rounded-full bg-primary" />
                Verify on-chain
                <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
              </a>
            </div>
          </BlurFade>
        </div>
      </div>
    </section>
  );
}

/* ─── Footer ─── */
function Footer() {
  return (
    <footer className="border-t border-border py-10">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 lg:px-9">
        <div className="flex items-center gap-2.5">
          <HeartHandshake className="size-4 text-primary" />
          <span className="text-sm font-medium tracking-tight">
            Veredict<span className="text-primary">LLM</span>
          </span>
        </div>

        <div className="flex items-center gap-6">
          <span className="text-xs text-muted-foreground">
            Built for{" "}
            <span className="font-medium text-foreground">The Synthesis</span>
          </span>
          <span className="h-3 w-px bg-border" />
          <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-xs font-medium uppercase tracking-wider text-primary">
            ERC-8004
          </span>
        </div>
      </div>
    </footer>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */
export default function LandingPage() {
  return (
    <>
      <HeroSection />
      <ProblemSection />
      <HowItWorksSection />
      <BentoSection />
      <PipelineSection />
      <ERC8004Section />
      <VisionSection />
      <CTASection />
      <Footer />
    </>
  );
}
