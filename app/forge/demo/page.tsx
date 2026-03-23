"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { motion, AnimatePresence, useAnimation } from "framer-motion";
import { ArrowRight, Upload, LoaderIcon } from "lucide-react";
import { scenarios } from "@/lib/scenarios";
import { DotPattern } from "@/components/ui/dot-pattern";

/* ─── Scenario meta ─── */
const scenarioMeta: Record<string, { emoji: string }> = {
  "clinica-suasuna": { emoji: "🏥" },
  "ecommerce-quebrado": { emoji: "🛒" },
  "freelancer-fantasma": { emoji: "👻" },
};

const cardReveal = (delay: number) => ({
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.16, 1, 0.3, 1] as const },
});

/* ─── Demo stages ─── */
const STAGES = [
  {
    id: "overview",
    label: "Overview",
    cue: "/forge — 3 scenario cards visíveis",
    scale: 1,
    targetId: null as string | null,
  },
  {
    id: "scenarios",
    label: "Live Scenarios",
    cue: "Three real cases, real money, real people",
    scale: 1.55,
    targetId: "dcam-war-card",
  },
  {
    id: "suasuna",
    label: "Suasuna Clinic",
    cue: "R$15,000 — a clinic, a developer, and a deal that went sideways",
    scale: 2.9,
    targetId: "dcam-suasuna-card",
  },
] as const;

/* ─── ParseCard ─── */
function ParseCard() {
  const [demoLoading, setDemoLoading] = useState(false);
  const router = useRouter();

  const handleDemo = () => {
    setDemoLoading(true);
    setTimeout(() => router.push("/contractv2"), 1500);
  };

  return (
    <motion.div
      {...cardReveal(0.15)}
      className="group flex h-full flex-col rounded-xl border border-border bg-card transition-colors duration-500 hover:border-primary/15"
    >
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

      <div className="flex flex-1 flex-col px-7 pt-8 pb-7">
        <div className="mb-8">
          <h3 className="text-[1.65rem] font-normal tracking-tight leading-[1.15] text-foreground">
            Drop a contract. 📄
            <br />
            <span className="text-muted-foreground/60">Watch Sentinel tear it apart.</span>
          </h3>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground/50 max-w-[360px]">
            Upload any PDF. The AI hunts loopholes, flags vague terms, and scores every clause for
            risk before you sign.
          </p>
        </div>

        <div className="relative cursor-not-allowed rounded-lg border border-dashed border-border/30 bg-muted/[0.02] px-6 py-8 text-center">
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/50">
            <span className="size-1.5 rounded-full bg-muted-foreground/30" />
            Coming Soon
          </span>
          <div className="mx-auto mb-4 flex size-11 items-center justify-center rounded-lg bg-muted/20 opacity-30">
            <Upload className="size-[18px] text-muted-foreground/40" />
          </div>
          <p className="text-sm text-muted-foreground/25">Drag & drop your contract PDF</p>
          <p className="mt-1.5 text-[11px] text-muted-foreground/15">
            PDF only · Max 10 MB · Private & encrypted
          </p>
        </div>

        <div className="my-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-border/50" />
          <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/30">or</span>
          <div className="h-px flex-1 bg-border/50" />
        </div>

        <button
          onClick={handleDemo}
          disabled={demoLoading}
          className="group/demo flex flex-col items-center gap-3 rounded-lg border border-primary/15 bg-primary/[0.03] px-6 py-6 text-center transition-all duration-500 hover:border-primary/30 hover:bg-primary/[0.06] active:scale-[0.99] disabled:pointer-events-none w-full"
        >
          <AnimatePresence mode="wait">
            {demoLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center gap-3 py-2"
              >
                <LoaderIcon className="size-5 text-primary animate-spin" />
                <p className="text-sm text-primary">Loading demo contract...</p>
                <div className="h-1 w-32 rounded-full bg-border overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-primary"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: 1.4, ease: "easeInOut" }}
                  />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="idle"
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-center gap-3"
              >
                <div className="flex items-center gap-2.5">
                  <span className="size-2 rounded-full bg-primary animate-subtle-pulse" />
                  <span className="text-sm font-medium text-foreground">No contract? No problem.</span>
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground/50">
                  Load a sample SaaS contract and watch the AI tear it apart in real time.
                </p>
                <span className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-wider text-primary/70 group-hover/demo:text-primary">
                  Try Demo
                  <ArrowRight className="size-3" />
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </button>

        <div className="flex-1" />

        <div className="mt-8">
          <div className="relative flex w-full cursor-not-allowed items-center justify-center gap-2.5 rounded-md border border-border/30 bg-muted/[0.03] py-3 text-[13px] font-medium uppercase tracking-[0.12em] text-foreground/20">
            Analyze a Contract
            <span className="rounded-full border border-border/60 bg-card px-2.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-muted-foreground/40">
              Coming Soon
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── WarCard (com IDs de câmera) ─── */
function WarCard() {
  return (
    <motion.div
      id="dcam-war-card"
      {...cardReveal(0.25)}
      className="flex h-full flex-col rounded-xl border border-border bg-card transition-colors duration-500 hover:border-primary/12"
    >
      <div className="flex items-center justify-between px-7 py-5">
        <div className="flex items-center gap-2.5">
          <span className="size-[6px] rounded-full bg-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Skip the Setup
          </span>
        </div>
        <span className="text-[11px] uppercase tracking-[0.15em] text-muted-foreground/25">
          02 — Live Scenarios
        </span>
      </div>

      <div className="h-px bg-border" />

      <div className="px-7 pt-5 pb-3">
        <p className="text-sm leading-relaxed text-muted-foreground/50">
          Jump straight into a real dispute. Pick a scenario below and watch Selantar mediate from
          evidence to settlement — fully autonomous.
        </p>
      </div>

      <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 pb-4">
        {scenarios.map((scenario, i) => {
          const meta = scenarioMeta[scenario.id];
          const isSuasuna = scenario.id === "clinica-suasuna";
          return (
            <Link
              key={scenario.id}
              id={isSuasuna ? "dcam-suasuna-card" : undefined}
              href={`/mediation/briefing?scenario=${scenario.id}`}
              className="group/sc flex flex-col overflow-hidden rounded-lg border border-border bg-background transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:border-primary/25 hover:shadow-[0_4px_24px_oklch(0.72_0.17_55/0.04)]"
            >
              <div className="relative h-24 w-full shrink-0 overflow-hidden">
                <Image
                  src={scenario.visual.image}
                  alt={scenario.title}
                  fill
                  className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover/sc:scale-[1.04]"
                  sizes="(max-width: 1024px) 100vw, 30vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/30 via-30% to-transparent" />
                <span className="absolute left-2 top-2 size-3 border-l border-t border-foreground/12" />
                <span className="absolute right-2 top-2 size-3 border-r border-t border-foreground/12" />
                <span className="absolute left-2 bottom-2 size-3 border-l border-b border-foreground/12" />
                <span className="absolute right-2 bottom-2 size-3 border-r border-b border-foreground/12" />
                <div className="absolute inset-x-0 top-0 flex items-center px-4 pt-3">
                  <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                    Case {String(i + 1).padStart(2, "0")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-1.5 px-4 pb-4 pt-3">
                <div className="flex items-start justify-between gap-3">
                  <h4 className="flex items-center gap-1.5 text-[13px] font-medium leading-snug tracking-tight text-foreground transition-colors duration-300 group-hover/sc:text-primary">
                    <span>{meta?.emoji}</span>
                    {scenario.title}
                  </h4>
                  <span className="shrink-0 font-mono text-[12px] tabular-nums text-primary">
                    {scenario.escrow}
                  </span>
                </div>
                <p className="text-[11px] leading-snug text-muted-foreground/40">{scenario.tagline}</p>
                <div className="mt-2 flex items-center justify-between border-t border-border/30 pt-2">
                  <div className="flex items-center gap-1.5 font-mono text-[10px]">
                    <span className="text-foreground/40">{scenario.parties.client.name}</span>
                    <span className="text-[9px] font-bold text-primary/50">VS</span>
                    <span className="text-foreground/40">{scenario.parties.developer.name}</span>
                  </div>
                  <span className="flex shrink-0 items-center gap-1 text-[10px] font-medium uppercase tracking-wider text-foreground/40 transition-colors duration-300 group-hover/sc:text-primary">
                    Open
                    <ArrowRight className="size-2.5" />
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   PAGE — Demo com controle de câmera
   ═══════════════════════════════════════════════ */
export default function ForgeDemoPage() {
  const [stageIndex, setStageIndex] = useState(0);
  const controls = useAnimation();
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Cache de posições capturado no mount (scale=1, sem transforms)
  const posCache = useRef<Record<string, { cx: number; cy: number }>>({});

  useEffect(() => {
    const capture = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;
      const wRect = wrapper.getBoundingClientRect();
      posCache.current["__wrapper"] = {
        cx: wRect.left + wRect.width / 2,
        cy: wRect.top + wRect.height / 2,
      };
      for (const id of ["dcam-war-card", "dcam-suasuna-card"]) {
        const el = document.getElementById(id);
        if (el) {
          const r = el.getBoundingClientRect();
          posCache.current[id] = { cx: r.left + r.width / 2, cy: r.top + r.height / 2 };
        }
      }
    };
    // Pequeno delay para garantir layout completo
    const t = setTimeout(capture, 100);
    window.addEventListener("resize", capture);
    return () => {
      clearTimeout(t);
      window.removeEventListener("resize", capture);
    };
  }, []);

  const goToStage = useCallback(
    async (index: number) => {
      const stage = STAGES[index];
      if (!stage) return;

      if (stage.scale === 1 || !stage.targetId) {
        setStageIndex(index);
        await controls.start({
          scale: 1,
          x: 0,
          y: 0,
          transition: { duration: 0.85, ease: [0.25, 0.1, 0.25, 1] },
        });
        return;
      }

      const wPos = posCache.current["__wrapper"];
      const tPos = posCache.current[stage.targetId];
      if (!wPos || !tPos) {
        setStageIndex(index);
        return;
      }

      // Fórmula: x = (wCx - tCx) * N para centralizar o alvo no wrapper
      const N = stage.scale;
      const x = (wPos.cx - tPos.cx) * N;
      const y = (wPos.cy - tPos.cy) * N;

      setStageIndex(index);
      await controls.start({
        scale: N,
        x,
        y,
        transition: { duration: 1.15, ease: [0.16, 1, 0.3, 1] },
      });
    },
    [controls]
  );

  const prev = useCallback(
    () => goToStage(Math.max(0, stageIndex - 1)),
    [goToStage, stageIndex]
  );
  const next = useCallback(
    () => goToStage(Math.min(STAGES.length - 1, stageIndex + 1)),
    [goToStage, stageIndex]
  );

  // ── Teclado ──
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === " ") { e.preventDefault(); next(); }
      if (e.key === "ArrowLeft") { e.preventDefault(); prev(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);


  const currentStage = STAGES[stageIndex];

  return (
    <div className="relative overflow-hidden" style={{ width: "100vw", height: "calc(100dvh - 65px)" }}>

      {/* ── Camera wrapper (tudo que escala) ── */}
      <motion.div
        ref={wrapperRef}
        animate={controls}
        style={{
          transformOrigin: "50% 50%",
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
        }}
      >
        <DotPattern
          width={24}
          height={24}
          cr={0.6}
          className="text-primary/[0.03] [mask-image:radial-gradient(800px_circle_at_25%_40%,white,transparent)]"
        />

        <div className="relative mx-auto flex h-full max-w-[1600px] gap-12 px-8 py-8 lg:px-12">
          {/* ─── Left: Title panel ─── */}
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
              Analyze a real contract and watch Sentinel hunt for risk — or jump into a live dispute
              and see the AI mediate under pressure.
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
                  <span className="text-[13px] leading-snug text-muted-foreground/35">{text}</span>
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

          {/* ─── Desktop: dois cards ─── */}
          <div className="hidden flex-1 gap-5 lg:flex">
            <div className="flex-1 min-w-0">
              <ParseCard />
            </div>
            <div className="flex-1 min-w-0">
              <WarCard />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Dots de câmera — apenas dentro do forge/demo, separados do DemoController */}
      <div className="pointer-events-none absolute bottom-5 right-24 z-50 flex items-center gap-1.5 opacity-20 transition-opacity duration-500 hover:opacity-70">
        {STAGES.map((stage, i) => (
          <button key={stage.id} onClick={() => goToStage(i)} className="pointer-events-auto">
            <motion.div
              animate={{ width: i === stageIndex ? 14 : 5 }}
              style={{ backgroundColor: i === stageIndex ? "oklch(0.72 0.17 55)" : "oklch(0.5 0 0)" }}
              transition={{ duration: 0.25 }}
              className="h-[5px] rounded-full"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
