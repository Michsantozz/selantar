"use client";

import { useState, useEffect } from "react";
import {
  ArrowRight,
  ExternalLink,
  FileText,
  Shield,
  Eye,
  Rocket,
  Scale,
  Zap,
  Check,
  Globe2,
  Layers,
  Database,
  Cpu,
  ChevronRight,
} from "lucide-react";
import { Heatmap } from "@paper-design/shaders-react";
import { BorderBeam } from "@/components/ui/border-beam";
import { AnimatedGridPattern } from "@/components/ui/animated-grid-pattern";
import { DotPattern } from "@/components/ui/dot-pattern";

/* ─── Preload image ─── */
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

/* ─── Slide shell ─── */
function Slide({ children, id }: { children: React.ReactNode; id: string }) {
  return (
    <section id={id} className="relative flex h-screen w-full snap-start overflow-hidden bg-[#000]">
      {children}
    </section>
  );
}

/* ─── Slide counter — bottom left ─── */
function SN({ n }: { n: string }) {
  return (
    <div className="absolute bottom-5 left-8 flex items-center gap-3 lg:left-12">
      <div className="h-px w-6 bg-[#e2863a]" />
      <span className="font-mono text-[10px] tracking-widest text-[#8e8e93]">{n} / 14</span>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════ */

export default function PitchDeckPage() {
  const logo = useLoadedImage("/selantar-logo.png");

  return (
    <div className="h-screen overflow-y-auto snap-y snap-mandatory">

      {/* ═══ 01 — COVER ═══ */}
      <Slide id="s1">
        {/* Grid texture */}
        <div className="pointer-events-none absolute inset-0">
          <AnimatedGridPattern
            width={52}
            height={52}
            numSquares={25}
            maxOpacity={0.06}
            duration={5}
            className="fill-[#e2863a]/10 stroke-[#e2863a]/5 [mask-image:radial-gradient(600px_circle_at_70%_45%,white,transparent)]"
          />
        </div>

        {/* Glow */}
        <div className="pointer-events-none absolute right-[5%] top-[10%] h-[700px] w-[700px] rounded-full bg-[#e2863a]/[0.06] blur-[150px]" />

        <div className="relative z-10 flex h-full w-full">
          {/* LEFT 55% — text */}
          <div className="flex w-full flex-col justify-between px-8 py-8 lg:w-[55%] lg:px-14 lg:py-10">
            {/* top bar */}
            <div className="flex items-center gap-3">
              <span className="size-2 rounded-full bg-[#e2863a]" />
              <span className="text-[11px] font-medium uppercase tracking-[0.25em] text-[#8e8e93]">
                Hedera Hello Future Apex 2026
              </span>
            </div>

            {/* center */}
            <div>
              <h1 className="text-[clamp(5rem,15vw,12rem)] leading-[0.8] tracking-[-0.06em]">
                <span className="font-display italic text-[#f2f2f7]">Sel</span>
                <span className="font-display italic text-[#e2863a]">an</span>
                <span className="font-display italic text-[#f2f2f7]">tar</span>
              </h1>

              <p className="mt-5 text-[clamp(1rem,2vw,1.4rem)] tracking-tight text-[#f2f2f7]/80">
                The oracle for human intention.
              </p>

              <div className="mt-6 h-[2px] w-56 bg-gradient-to-r from-[#e2863a] to-transparent" />

              <p className="mt-6 max-w-md text-base leading-relaxed text-[#f2f2f7]/60">
                Autonomous AI mediation on Hedera.
              </p>
              <p className="text-lg font-medium text-[#f2f2f7]">
                Contracts break. We fix the people.
              </p>
            </div>

            {/* bottom */}
            <div className="flex items-end justify-between">
              <a href="https://selantar-hedera.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-xs text-[#f2f2f7]/50 transition-colors hover:text-[#e2863a]">
                selantar-hedera.vercel.app <ExternalLink className="size-3" />
              </a>
              <div className="flex gap-2">
                {["Agent #36", "ERC-8004", "Chain 296"].map((t) => (
                  <span key={t} className="rounded border border-[#e2863a]/25 bg-[#e2863a]/8 px-2.5 py-1 font-mono text-[10px] text-[#e2863a]">{t}</span>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT 45% — Brasão Heatmap */}
          <div className="hidden h-full w-[45%] items-center justify-center lg:flex">
            <div
              className="relative flex h-[85%] w-full items-center justify-center overflow-hidden"
              style={{
                maskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 50%, transparent 100%)",
                WebkitMaskImage: "radial-gradient(ellipse 85% 80% at 50% 50%, black 50%, transparent 100%)",
              }}
            >
              {logo && (
                <Heatmap
                  width={800}
                  height={800}
                  image={logo}
                  colors={["#1a0800", "#3d1500", "#7c3a0a", "#c45e1a", "#ef6f2e", "#ff9944", "#ffe0a0"]}
                  colorBack="#000000"
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
          </div>
        </div>
        <SN n="01" />
      </Slide>

      {/* ═══ 02 — THE PROBLEM ═══ */}
      <Slide id="s2">
        <div className="pointer-events-none absolute top-1/2 left-[12%] -translate-y-1/2 h-[600px] w-[600px] rounded-full bg-[#ff453a]/[0.04] blur-[120px]" />

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1.1fr_1fr]">
            {/* left — the number */}
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                The Problem
              </span>

              <div className="mt-8">
                <span className="block text-[clamp(5rem,14vw,11rem)] font-light leading-[0.8] tracking-[-0.05em] text-[#f2f2f7]">
                  $50<span className="text-[#e2863a]">B</span>
                </span>
                <span className="mt-3 block text-lg font-medium tracking-wide text-[#f2f2f7]/80">
                  stuck in business disputes. Every year.
                </span>
              </div>

              <div className="mt-12 h-px w-full max-w-sm bg-[#2c2c2e]" />

              <div className="mt-8 flex gap-10">
                {[
                  { v: "11%", l: "of SMB revenue lost" },
                  { v: "400M", l: "businesses worldwide" },
                  { v: "0", l: "oracles built for this" },
                ].map((s) => (
                  <div key={s.v}>
                    <span className="font-mono text-3xl text-[#f2f2f7]">{s.v}</span>
                    <span className="mt-1 block text-sm text-[#f2f2f7]/50">{s.l}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* right — copy */}
            <div className="flex flex-col gap-6 border-l border-[#2c2c2e] pl-8 lg:pl-12">
              <p className="text-[clamp(1.3rem,2.5vw,1.8rem)] leading-snug text-[#f2f2f7]">
                Smart contracts gave us hard cold numbers for emotional creatures.
              </p>
              <p className="text-lg leading-relaxed text-[#f2f2f7]/50">
                Rigid code that doesn&rsquo;t know you were in the hospital.
                Doesn&rsquo;t care your secretary quit last week.
              </p>
              <div className="mt-2 border-l-2 border-[#e2863a] pl-4">
                <p className="text-base text-[#f2f2f7]/70">
                  400 million businesses. Zero solutions that understand both the contract <strong className="text-[#f2f2f7]">AND</strong> the people.
                </p>
              </div>
            </div>
          </div>
        </div>
        <SN n="02" />
      </Slide>

      {/* ═══ 03 — THE INSIGHT ═══ */}
      <Slide id="s3">
        <div className="pointer-events-none absolute bottom-[5%] right-[8%] h-[500px] w-[500px] rounded-full bg-[#e2863a]/[0.05] blur-[130px]" />

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-start gap-20 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                The Insight
              </span>

              <h2 className="mt-10 text-[clamp(2rem,5vw,3.5rem)] leading-[1.08] tracking-[-0.02em] text-[#f2f2f7]">
                <span className="font-display italic">Nobody</span> wants to chase money.
                <br />
                <span className="font-display italic">Nobody</span> wants that text saying
                <br />
                <span className="text-[#e2863a]">&ldquo;hey, you owe me.&rdquo;</span>
              </h2>

              <div className="mt-8 h-[2px] w-48 bg-gradient-to-r from-[#e2863a] to-transparent" />
            </div>

            {/* right col — explanation */}
            <div className="flex flex-col gap-5 pt-8">
              <p className="text-xl leading-relaxed text-[#f2f2f7]/70">
                That awkward human moment — that&rsquo;s where
                <strong className="text-[#f2f2f7]"> billions of dollars</strong> get stuck every year.
              </p>
              <p className="text-lg text-[#f2f2f7]/45">Not because anyone&rsquo;s a bad person.</p>
              <p className="text-xl font-medium text-[#f2f2f7]">
                Because the conversation sucks and nobody wants to have it.
              </p>
              <div className="mt-6 flex items-center gap-3">
                <div className="h-[2px] w-14 bg-[#e2863a]" />
                <span className="font-mono text-sm text-[#e2863a]">$40B / year in friction</span>
              </div>
            </div>
          </div>
        </div>
        <SN n="03" />
      </Slide>

      {/* ═══ 04 — THE SOLUTION ═══ */}
      <Slide id="s4">
        <div className="pointer-events-none absolute top-[10%] left-[3%] h-[600px] w-[600px] rounded-full bg-[#e2863a]/[0.06] blur-[140px]" />

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.3fr]">
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                The Solution
              </span>

              <p className="mt-8 text-[clamp(1.4rem,3vw,2.2rem)] leading-[1.2] tracking-tight text-[#f2f2f7]/70">
                What if that conversation didn&rsquo;t have to happen{" "}
                <strong className="text-[#f2f2f7]">between the two of you?</strong>
              </p>
              <p className="mt-5 text-lg leading-relaxed text-[#f2f2f7]/50">
                What if someone stepped in — no ego, no judgment, no skin in the game — and just figured it out?
              </p>
            </div>

            {/* Clara card */}
            <div className="relative rounded-2xl border border-[#e2863a]/20 bg-[#0a0a0a] p-8">
              <div className="flex items-center gap-4 mb-7">
                <div className="flex size-14 items-center justify-center rounded-xl bg-[#e2863a]/10">
                  <Scale className="size-7 text-[#e2863a]" />
                </div>
                <div>
                  <span className="block text-2xl font-medium text-[#f2f2f7]">Meet Clara.</span>
                  <span className="font-mono text-sm text-[#e2863a]">Agent #36 on Hedera</span>
                </div>
              </div>

              {["She reads contracts. Understands what happened.",
                "Reaches people on their phone.",
                "Turns stuck money into settled money.",
                "Without making it weird.",
              ].map((t, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <ArrowRight className="mt-1 size-4 shrink-0 text-[#e2863a]" />
                  <span className="text-base leading-relaxed text-[#f2f2f7]/80">{t}</span>
                </div>
              ))}

              <BorderBeam size={80} duration={8} colorFrom="#e2863a" colorTo="#e2863a00" borderWidth={1} />
            </div>
          </div>
        </div>
        <SN n="04" />
      </Slide>

      {/* ═══ 05 — HOW IT WORKS ═══ */}
      <Slide id="s5">
        <div className="pointer-events-none absolute right-0 top-0 h-full w-2/5 opacity-[0.04]">
          <DotPattern width={18} height={18} cr={1} />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col justify-center px-8 lg:px-14">
          <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
            How It Works
          </span>
          <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] tracking-tight text-[#f2f2f7]">
            Six steps. <span className="text-[#e2863a]">Fully autonomous.</span>
          </h2>

          <div className="mt-10 grid grid-cols-2 gap-x-6 gap-y-4 lg:grid-cols-3">
            {[
              { icon: FileText, n: "01", title: "DROP", desc: "Upload your contract into Selantar" },
              { icon: Eye, n: "02", title: "AUDIT", desc: "AI tears it apart — flags risks, vague clauses, ambiguity" },
              { icon: Shield, n: "03", title: "GUARD", desc: "Sentinel builds monitoring — GitHub, WhatsApp, deadlines" },
              { icon: Rocket, n: "04", title: "DEPLOY", desc: "Escrow on-chain. Milestones encoded. ERC-8004 registered." },
              { icon: Scale, n: "05", title: "MEDIATE", desc: "Clara analyzes evidence, mediates, proposes settlement" },
              { icon: Zap, n: "06", title: "SETTLE", desc: "On-chain execution. Reputation posted. Verdict stored. NFT." },
            ].map((s) => (
              <div key={s.n} className="flex gap-4 rounded-xl border border-[#2c2c2e] bg-[#0a0a0a] p-5 transition-colors hover:border-[#e2863a]/20">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-[#e2863a]/10">
                  <s.icon className="size-[18px] text-[#e2863a]" />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-[10px] text-[#e2863a]">{s.n}</span>
                    <span className="text-sm font-medium text-[#f2f2f7]">{s.title}</span>
                  </div>
                  <span className="text-xs leading-relaxed text-[#f2f2f7]/55">{s.desc}</span>
                </div>
              </div>
            ))}
          </div>

          <p className="mt-8 text-sm text-[#f2f2f7]/50">
            Every step autonomous. Every transaction on Hedera.
          </p>
        </div>
        <SN n="05" />
      </Slide>

      {/* ═══ 06 — DEMO CASE ═══ */}
      <Slide id="s6">
        <div className="pointer-events-none absolute bottom-0 left-0 h-[500px] w-[500px] rounded-full bg-[#e2863a]/[0.05] blur-[130px]" />

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-start gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            {/* left */}
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                Live Demo
              </span>
              <h2 className="mt-6 text-[clamp(2rem,4.5vw,3.5rem)] tracking-tight leading-[0.95] text-[#f2f2f7]">
                The Suasuna
                <br />Clinic
              </h2>
              <div className="mt-6 flex gap-8">
                <div><span className="font-mono text-3xl text-[#e2863a]">R$30K</span><span className="mt-1 block text-sm text-[#f2f2f7]/50">contract</span></div>
                <div className="w-px bg-[#2c2c2e]" />
                <div><span className="font-mono text-3xl text-[#f2f2f7]">CRM</span><span className="mt-1 block text-sm text-[#f2f2f7]/50">development</span></div>
              </div>
              <p className="mt-6 text-base leading-relaxed text-[#f2f2f7]/55">
                Doctor is furious — patients can&rsquo;t book. Developer locked out — secretary ignored 5 access requests over 3 weeks.
              </p>
              <p className="mt-3 text-sm font-medium text-[#f2f2f7]/70">
                Clara doesn&rsquo;t point fingers.
              </p>
            </div>

            {/* right — dialogue */}
            <div className="flex flex-col gap-3">
              {[
                { who: "Clara", text: "\"Doctor, when was the last time you personally checked this project?\"" },
                { who: null, text: "He goes quiet." },
                { who: "Clara", text: "\"Developer, when the emails stopped, what else did you try?\"" },
                { who: null, text: "Pause. Nothing." },
              ].map((m, i) => m.who ? (
                <div key={i} className="rounded-lg border border-[#2c2c2e] bg-[#0a0a0a] px-5 py-4">
                  <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#e2863a]">{m.who}</span>
                  <p className="text-base text-[#f2f2f7]/85">{m.text}</p>
                </div>
              ) : (
                <p key={i} className="py-1.5 text-center text-sm font-display italic text-[#f2f2f7]/35">{m.text}</p>
              ))}

              {/* settlement result */}
              <div className="mt-3 rounded-xl border-2 border-[#e2863a]/30 bg-[#e2863a]/[0.06] p-5">
                <span className="mb-2 block font-mono text-[10px] uppercase tracking-widest text-[#e2863a]">Settlement Executed</span>
                <p className="text-lg font-medium text-[#f2f2f7]">48-hour extension. 20% discount.</p>
                <p className="mt-1 text-sm text-[#f2f2f7]/60">Both sides sign. One click. On-chain.</p>
              </div>
            </div>
          </div>
        </div>
        <SN n="06" />
      </Slide>

      {/* ═══ 07 — WHY HEDERA ═══ */}
      <Slide id="s7">
        <div className="pointer-events-none absolute inset-0">
          <AnimatedGridPattern
            width={44}
            height={44}
            numSquares={20}
            maxOpacity={0.05}
            duration={6}
            className="fill-[#e2863a]/8 stroke-[#e2863a]/4 [mask-image:radial-gradient(500px_circle_at_50%_50%,white,transparent)]"
          />
        </div>

        <div className="relative z-10 flex h-full w-full flex-col justify-center px-8 lg:px-14">
          <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
            Why Hedera
          </span>
          <h2 className="mt-6 text-[clamp(2rem,4vw,3rem)] tracking-tight text-[#f2f2f7]">
            Three services. <span className="text-[#e2863a]">One mediation.</span>
          </h2>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { title: "EVM Smart Contracts", icon: Layers, items: ["3 ERC-8004 registries (Identity, Reputation, Validation)", "HBAR settlement transfers", "Custom ValidationRegistry deployed by Selantar"] },
              { title: "Consensus Service (HCS)", icon: Database, items: ["Every mediation step logged immutably", "Topic 0.0.8351168 — verifiable audit trail", "5 messages per mediation"] },
              { title: "Token Service (HTS)", icon: Cpu, items: ["Completed mediation mints SLNTR NFT", "Token 0.0.8351617 — proof of resolution", "Agent accumulates on-chain badges"] },
            ].map((c) => (
              <div key={c.title} className="relative rounded-xl border border-[#2c2c2e] bg-[#0a0a0a] p-6">
                <div className="flex items-center gap-3 mb-5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-[#e2863a]/10">
                    <c.icon className="size-[18px] text-[#e2863a]" />
                  </div>
                  <span className="text-sm font-medium text-[#f2f2f7]">{c.title}</span>
                </div>
                {c.items.map((t) => (
                  <div key={t} className="flex items-start gap-2 py-1">
                    <ChevronRight className="mt-0.5 size-3.5 shrink-0 text-[#e2863a]" />
                    <span className="text-sm leading-snug text-[#f2f2f7]/70">{t}</span>
                  </div>
                ))}
                <BorderBeam size={50} duration={12} colorFrom="#e2863a" colorTo="#e2863a00" borderWidth={1} />
              </div>
            ))}
          </div>

          <p className="mt-6 font-mono text-sm text-[#f2f2f7]/50">
            9 on-chain operations per mediation. All verified on HashScan.
          </p>
        </div>
        <SN n="07" />
      </Slide>

      {/* ═══ 08 — ON-CHAIN PROOF ═══ */}
      <Slide id="s8">
        <div className="pointer-events-none absolute right-[5%] top-[15%] h-[500px] w-[500px] rounded-full bg-[#30d158]/[0.04] blur-[120px]" />

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-start gap-14 lg:grid-cols-[1.3fr_0.7fr]">
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                On-Chain Proof
              </span>
              <h2 className="mt-6 text-[clamp(1.8rem,3.5vw,2.8rem)] tracking-tight text-[#f2f2f7]">
                Verified Transactions — <span className="text-[#e2863a]">Hedera Testnet</span>
              </h2>

              <div className="mt-8 overflow-hidden rounded-xl border border-[#2c2c2e] bg-[#0a0a0a]">
                {[
                  { l: "Agent Registration", h: "0xe290eedd..." },
                  { l: "Settlement (HBAR)", h: "0xc90d1cf1..." },
                  { l: "Client Funding", h: "0x11f93d3c..." },
                  { l: "Reputation Feedback", h: "0x3a68bdb5..." },
                  { l: "ValidationRegistry Deploy", h: "0x8048e037..." },
                  { l: "HCS Topic Created", h: "0.0.8351168" },
                  { l: "HTS Token (SLNTR)", h: "0.0.8351617" },
                ].map((tx, i) => (
                  <div key={tx.l} className={`flex items-center justify-between px-5 py-3 ${i < 6 ? "border-b border-[#2c2c2e]/60" : ""}`}>
                    <span className="text-sm text-[#f2f2f7]/70">{tx.l}</span>
                    <div className="flex items-center gap-3">
                      <span className="font-mono text-sm text-[#f2f2f7]/50">{tx.h}</span>
                      <Check className="size-4 text-[#30d158]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* agent identity */}
            <div className="flex flex-col gap-5">
              <div className="relative rounded-xl border border-[#e2863a]/20 bg-[#0a0a0a] p-6">
                <span className="mb-5 block font-mono text-[10px] uppercase tracking-widest text-[#e2863a]">Agent Identity</span>
                {[
                  { k: "Agent ID", v: "#36", c: "text-[#f2f2f7]" },
                  { k: "Trust Score", v: "85", c: "text-[#30d158]" },
                  { k: "Registry", v: "ERC-8004", c: "text-[#f2f2f7]" },
                ].map((r, i) => (
                  <div key={r.k}>
                    <div className="flex items-center justify-between py-3">
                      <span className="text-sm text-[#f2f2f7]/55">{r.k}</span>
                      <span className={`font-mono text-xl ${r.c}`}>{r.v}</span>
                    </div>
                    {i < 2 && <div className="h-px bg-[#2c2c2e]/60" />}
                  </div>
                ))}
                <BorderBeam size={50} duration={8} colorFrom="#30d158" colorTo="#30d15800" borderWidth={1} />
              </div>

              <div className="rounded-lg border border-[#2c2c2e] bg-[#0a0a0a]/60 p-3">
                <span className="font-mono text-[10px] leading-relaxed text-[#f2f2f7]/40 break-all">
                  hashscan.io/testnet/account/0xFE5561A1a064ae13DbcF23BA1e3ff85Fc3da7B04
                </span>
              </div>
            </div>
          </div>
        </div>
        <SN n="08" />
      </Slide>

      {/* ═══ 09 — NETWORK EFFECT ═══ */}
      <Slide id="s9">
        <div className="pointer-events-none absolute left-0 bottom-0 h-full w-1/3 opacity-[0.04]">
          <DotPattern width={22} height={22} cr={0.8} />
        </div>

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-center gap-16 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                Network Effect
              </span>
              <h2 className="mt-6 text-[clamp(2rem,4.5vw,3.2rem)] tracking-tight text-[#f2f2f7]">
                Every network starts <span className="font-display italic">somewhere.</span>
              </h2>
              <p className="mt-5 text-lg leading-relaxed text-[#f2f2f7]/60">
                Every dispute resolved makes the next one more trustworthy.
              </p>
              <p className="mt-3 text-base font-medium text-[#e2863a]">
                We are day one. The flywheel is ready to spin.
              </p>
            </div>

            <div className="flex flex-col gap-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { v: "3", l: "EVM transactions" },
                  { v: "5", l: "HCS messages" },
                  { v: "1", l: "NFT receipt" },
                  { v: "2", l: "new Hedera accounts" },
                ].map((m) => (
                  <div key={m.l} className="rounded-xl border border-[#2c2c2e] bg-[#0a0a0a] p-5">
                    <span className="font-mono text-4xl text-[#e2863a]">{m.v}</span>
                    <span className="mt-2 block text-sm text-[#f2f2f7]/70">{m.l}</span>
                    <span className="text-xs text-[#f2f2f7]/35">per mediation</span>
                  </div>
                ))}
              </div>
              <div className="rounded-lg border border-[#e2863a]/15 bg-[#e2863a]/[0.05] p-4">
                <p className="text-sm text-[#f2f2f7]/70">
                  <strong className="text-[#f2f2f7]">100 mediations/month</strong> = 200 accounts, 300 TXs, 500 HCS msgs, 100 NFTs.
                </p>
              </div>
            </div>
          </div>
        </div>
        <SN n="09" />
      </Slide>

      {/* ═══ 10 — TECH STACK ═══ */}
      <Slide id="s10">
        <div className="relative z-10 flex h-full w-full flex-col justify-center px-8 lg:px-14">
          <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
            Tech Stack
          </span>

          <div className="mt-8 flex flex-wrap gap-2.5">
            {["Next.js 16", "React 19", "AI SDK v6 (Vercel)", "viem", "@hashgraph/sdk", "@xyflow/react", "OpenClaw", "Tailwind CSS v4", "framer-motion", "shadcn/ui", "Zod", "TypeScript"].map((t) => (
              <span key={t} className="rounded-lg border border-[#2c2c2e] bg-[#0a0a0a] px-4 py-2.5 font-mono text-sm text-[#f2f2f7]/80">{t}</span>
            ))}
          </div>

          <div className="mt-10 h-px w-full max-w-md bg-[#e2863a]/30" />

          <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-[#f2f2f7]/40">Hedera Services & AI</p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {["Hedera Testnet (Chain ID 296)", "ERC-8004", "HCS", "HTS", "OpenRouter (GPT-5.4-mini)", "Gemini 3.1 Pro", "Evolution API (WhatsApp)"].map((t) => (
              <span key={t} className="rounded-lg border border-[#e2863a]/25 bg-[#e2863a]/8 px-4 py-2.5 font-mono text-sm text-[#e2863a]">{t}</span>
            ))}
          </div>
        </div>
        <SN n="10" />
      </Slide>

      {/* ═══ 11 — ROADMAP ═══ */}
      <Slide id="s11">
        <div className="relative z-10 flex h-full w-full flex-col justify-center px-8 lg:px-14">
          <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
            Roadmap
          </span>

          <div className="mt-10 grid grid-cols-1 gap-5 md:grid-cols-3">
            {[
              { status: "NOW", color: "#30d158", title: "AI Mediation", desc: "On-chain settlement live on Hedera Testnet. 3 services integrated. 9 verified transactions." },
              { status: "NEXT", color: "#e2863a", title: "Context Expansion", desc: "WhatsApp, GitHub, CRM integration via OpenClaw. Sentinel monitors work in real-time. Your work documents itself." },
              { status: "HORIZON", color: "#8e8e93", title: "Trust Economy", desc: "Consent-based on-chain reputation bureau. Credit is never a cold number. Instant liquidity. Smart insurance." },
            ].map((p) => (
              <div key={p.status} className="relative flex flex-col rounded-xl border border-[#2c2c2e] bg-[#0a0a0a] p-7">
                <div className="mb-5 flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="font-mono text-xs uppercase tracking-widest" style={{ color: p.color }}>{p.status}</span>
                </div>
                <h3 className="text-xl font-medium text-[#f2f2f7] mb-3">{p.title}</h3>
                <p className="text-sm leading-relaxed text-[#f2f2f7]/55 flex-1">{p.desc}</p>
                {p.status === "NOW" && <BorderBeam size={50} duration={10} colorFrom="#30d158" colorTo="#30d15800" borderWidth={1} />}
              </div>
            ))}
          </div>
        </div>
        <SN n="11" />
      </Slide>

      {/* ═══ 12 — MARKET ═══ */}
      <Slide id="s12">
        <div className="pointer-events-none absolute bottom-[5%] left-[8%] h-[500px] w-[500px] rounded-full bg-[#e2863a]/[0.05] blur-[130px]" />

        <div className="relative z-10 flex h-full w-full items-center px-8 lg:px-14">
          <div className="grid w-full grid-cols-1 items-start gap-14 lg:grid-cols-2">
            <div>
              <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a]">
                Market
              </span>

              <div className="mt-8 flex flex-col gap-7">
                {[
                  { tag: "TAM", value: "$40-50B/yr", desc: "in commercial disputes" },
                  { tag: "SAM", value: "400M", desc: "small businesses worldwide" },
                  { tag: "SOM", value: "Freelancers + agencies", desc: "with payment disputes" },
                ].map((m) => (
                  <div key={m.tag} className="flex items-start gap-5">
                    <span className="w-10 shrink-0 pt-1.5 font-mono text-xs text-[#e2863a]">{m.tag}</span>
                    <div>
                      <span className="font-mono text-3xl text-[#f2f2f7]">{m.value}</span>
                      <span className="block text-sm text-[#f2f2f7]/50">{m.desc}</span>
                    </div>
                  </div>
                ))}
              </div>

              <p className="mt-8 text-sm text-[#f2f2f7]/40">Pre-revenue | MVP validated on Hedera Testnet</p>
              <p className="mt-1 text-sm text-[#f2f2f7]/40">GTM: WhatsApp communities → freelancer marketplaces → B2B SaaS</p>
            </div>

            {/* comparison */}
            <div className="rounded-xl border border-[#2c2c2e] bg-[#0a0a0a] p-7">
              <h3 className="text-xs font-medium uppercase tracking-widest text-[#f2f2f7]/40 mb-6">Cost Comparison</h3>

              <div className="mb-5">
                <span className="text-xs text-[#f2f2f7]/35 block mb-2">Traditional Arbitration</span>
                <div className="flex justify-between items-center py-2"><span className="text-sm text-[#f2f2f7]/55">Cost</span><span className="font-mono text-2xl text-[#ff453a]">$10K — $50K</span></div>
                <div className="flex justify-between items-center py-2"><span className="text-sm text-[#f2f2f7]/55">Timeline</span><span className="font-mono text-2xl text-[#ff453a]">6 — 18 months</span></div>
              </div>

              <div className="h-[2px] bg-gradient-to-r from-[#e2863a] to-transparent" />

              <div className="mt-5">
                <span className="text-xs text-[#f2f2f7]/35 block mb-2">Selantar</span>
                <div className="flex justify-between items-center py-2"><span className="text-sm text-[#f2f2f7]/55">Cost</span><span className="font-mono text-2xl text-[#30d158]">~$0.01 gas</span></div>
                <div className="flex justify-between items-center py-2"><span className="text-sm text-[#f2f2f7]/55">Timeline</span><span className="font-mono text-2xl text-[#30d158]">minutes</span></div>
              </div>
            </div>
          </div>
        </div>
        <SN n="12" />
      </Slide>

      {/* ═══ 13 — CLOSE ═══ */}
      <Slide id="s13">
        <div className="pointer-events-none absolute top-[20%] left-1/2 -translate-x-1/2 h-[900px] w-[900px] rounded-full bg-[#e2863a]/[0.08] blur-[180px]" />

        <div className="relative z-10 flex h-full w-full flex-col items-center justify-center px-8 text-center lg:px-14">
          <p className="text-[clamp(1.2rem,2.5vw,1.8rem)] text-[#f2f2f7]/55">
            The world built oracles for prices and weather.
          </p>
          <p className="mt-4 text-[clamp(1.8rem,5vw,3.5rem)] font-medium leading-[1.1] tracking-tight text-[#f2f2f7]">
            Selantar is the oracle for{" "}
            <span className="text-[#e2863a]">human intention.</span>
          </p>

          <div className="mt-8 h-[2px] w-56 bg-gradient-to-r from-transparent via-[#e2863a] to-transparent" />

          <p className="mt-8 text-xl text-[#f2f2f7]">
            Contracts break. We fix the people.
          </p>

          <div className="mt-12 flex flex-col items-center gap-4">
            <span className="text-sm text-[#f2f2f7]/50">Built by Michsantozz</span>
            <div className="flex gap-6">
              <a href="https://selantar-hedera.vercel.app" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-sm text-[#f2f2f7]/55 hover:text-[#e2863a]">
                <Globe2 className="size-3.5" /> selantar-hedera.vercel.app
              </a>
              <a href="https://github.com/Michsantozz/selantar" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 font-mono text-sm text-[#f2f2f7]/55 hover:text-[#e2863a]">
                <svg className="size-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                Michsantozz/selantar
              </a>
            </div>
            <div className="mt-4 flex gap-3">
              {["AI & Agents ($40K)", "OpenClaw Bounty ($8K)"].map((t) => (
                <span key={t} className="rounded border border-[#e2863a]/25 bg-[#e2863a]/8 px-3 py-1.5 font-mono text-[11px] text-[#e2863a]">{t}</span>
              ))}
            </div>
          </div>
        </div>
        <SN n="13" />
      </Slide>

      {/* ═══ 14 — DISCLAIMER ═══ */}
      <Slide id="s14">
        <div className="relative z-10 flex h-full w-full items-center justify-center px-8 lg:px-14">
          <div className="max-w-2xl">
            <span className="inline-block border-l-2 border-[#e2863a] pl-3 text-[11px] font-medium uppercase tracking-[0.25em] text-[#e2863a] mb-8">
              Note on Demo Video
            </span>

            <div className="rounded-xl border border-[#2c2c2e] bg-[#0a0a0a] p-8">
              <p className="text-base leading-relaxed text-[#f2f2f7]/70">
                The demo video references <strong className="text-[#f2f2f7]">Base Sepolia</strong> — the original testnet during development.
              </p>
              <p className="mt-4 text-base leading-relaxed text-[#f2f2f7]/70">
                Selantar has been <strong className="text-[#f2f2f7]">fully migrated to Hedera Testnet</strong> with 3 native services (EVM + HCS + HTS).
              </p>
              <div className="mt-5 h-[2px] bg-gradient-to-r from-[#e2863a] to-transparent" />
              <p className="mt-5 text-base font-medium text-[#e2863a]">
                All transactions verified on HashScan.
              </p>
            </div>

            <p className="mt-12 text-center text-sm text-[#f2f2f7]/25">
              Selantar &middot; Hedera Hello Future Apex 2026
            </p>
          </div>
        </div>
        <SN n="14" />
      </Slide>

    </div>
  );
}
