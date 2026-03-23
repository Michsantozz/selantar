"use client";

import { useRef } from "react";
import { motion } from "framer-motion";
import {
  ArrowRight,
  MessageSquare,
  HardDrive,
  StickyNote,
  Zap,
  Send,
  Shield,
  Scale,
  FileText,
  Code2,
} from "lucide-react";
import { AnimatedBeam } from "@/components/ui/animated-beam";
import { OrbitingCircles } from "@/components/ui/orbiting-circles";
import { Globe } from "@/components/ui/globe";

/* ─── Beam Node ─── */

function Node({
  children,
  nodeRef,
  label,
  size = "sm",
}: {
  children: React.ReactNode;
  nodeRef: React.RefObject<HTMLDivElement | null>;
  label?: string;
  size?: "sm" | "lg";
}) {
  const dim = size === "lg" ? "size-14" : "size-10";
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        ref={nodeRef}
        className={`relative z-10 flex ${dim} items-center justify-center rounded-xl border border-border bg-card text-muted-foreground transition-colors`}
      >
        {children}
      </div>
      {label && (
        <span className="text-[9px] font-medium uppercase tracking-wider text-muted-foreground/70">
          {label}
        </span>
      )}
    </div>
  );
}

/* ─── Stat ─── */

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xl tracking-tight text-foreground lg:text-2xl">
        {value}
      </span>
      <span className="text-[11px] leading-tight text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

/* ─── Animations ─── */

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
};

const fadeUp = {
  hidden: { opacity: 0, y: 14 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0, 0, 0.2, 1] as const },
  },
};

/* ─── Page ─── */

export default function PitchDeckPage() {
  const beamRef = useRef<HTMLDivElement>(null);

  // Left column
  const refMsg = useRef<HTMLDivElement>(null);
  const refCode = useRef<HTMLDivElement>(null);
  const refFiles = useRef<HTMLDivElement>(null);

  // Right column
  const refNotes = useRef<HTMLDivElement>(null);
  const refAuto = useRef<HTMLDivElement>(null);
  const refChat = useRef<HTMLDivElement>(null);

  // Center
  const refCenter = useRef<HTMLDivElement>(null);

  return (
    <div className="relative flex h-screen flex-col overflow-hidden bg-background">
      {/* ── Globe background ── */}
      <div className="pointer-events-none absolute inset-0 z-0 flex items-center justify-center">
        <div className="relative h-[110vh] w-[110vh] translate-x-[15%] translate-y-[-5%] opacity-[0.12]">
          <Globe
            config={{
              width: 800,
              height: 800,
              devicePixelRatio: 2,
              phi: 0,
              theta: 0.3,
              dark: 1,
              diffuse: 0.6,
              mapSamples: 16000,
              mapBrightness: 2,
              baseColor: [0.15, 0.14, 0.13],
              markerColor: [226 / 255, 134 / 255, 58 / 255],
              glowColor: [0.08, 0.07, 0.07],
              markers: [
                { location: [-23.5505, -46.6333], size: 0.12 },
                { location: [40.7128, -74.006], size: 0.1 },
                { location: [51.5074, -0.1278], size: 0.08 },
                { location: [35.6762, 139.6503], size: 0.07 },
                { location: [1.3521, 103.8198], size: 0.06 },
                { location: [19.076, 72.8777], size: 0.09 },
                { location: [-34.6037, -58.3816], size: 0.05 },
                { location: [48.8566, 2.3522], size: 0.06 },
              ],
            }}
          />
        </div>
      </div>

      {/* ── Ambient glows ── */}
      <div
        className="pointer-events-none absolute -left-[200px] -top-[200px] z-0 size-[700px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.17 55 / 8%) 0%, transparent 70%)",
        }}
      />
      <div
        className="pointer-events-none absolute -bottom-[200px] -right-[100px] z-0 size-[600px]"
        style={{
          background:
            "radial-gradient(circle, oklch(0.72 0.17 55 / 5%) 0%, transparent 70%)",
        }}
      />

      {/* ── Main content ── */}
      <main className="relative z-10 flex flex-1 items-center px-6 lg:px-12">
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-12 lg:grid-cols-[1fr_1fr] lg:gap-16">
          {/* ═══ LEFT ═══ */}
          <motion.div
            className="flex flex-col gap-7"
            variants={stagger}
            initial="hidden"
            animate="show"
          >
            {/* Label */}
            <motion.div
              variants={fadeUp}
              className="flex items-center gap-2"
            >
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground">
                Seed Round &middot; 2026
              </span>
            </motion.div>

            {/* Heading */}
            <motion.h1
              variants={fadeUp}
              className="max-w-[520px] text-[clamp(2.5rem,5.5vw,4.5rem)] font-normal leading-[0.95] tracking-tight text-foreground"
            >
              The oracle for
              <br />
              human intention.
            </motion.h1>

            {/* Stats */}
            <motion.div
              variants={fadeUp}
              className="flex items-start gap-6 lg:gap-8"
            >
              <Stat value="400M" label="small businesses" />
              <div className="mt-1 h-8 w-px bg-border" />
              <Stat value="$3.5T" label="lost to disputes / yr" />
              <div className="mt-1 h-8 w-px bg-border" />
              <Stat value="0" label="oracles built for this" />
            </motion.div>

            {/* Body */}
            <motion.p
              variants={fadeUp}
              className="max-w-lg text-sm leading-relaxed text-muted-foreground"
            >
              Nobody built the thing that sits in the middle. Selantar
              mediates, verifies, and seals commitments — where context
              already lives.
            </motion.p>

            {/* CTA */}
            <motion.div variants={fadeUp}>
              <a
                href="#"
                className="group inline-flex items-center gap-2 rounded-md border border-foreground/80 bg-foreground/90 px-5 py-2.5 text-xs font-medium uppercase tracking-wider text-background transition-all hover:bg-foreground"
              >
                30-min conversation
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </a>
            </motion.div>
          </motion.div>

          {/* ═══ RIGHT — Beam constellation ═══ */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.6,
              delay: 0.4,
              ease: [0, 0, 0.2, 1],
            }}
            className="relative flex items-center justify-center"
          >
            <div
              ref={beamRef}
              className="relative flex aspect-square w-full max-w-[440px] items-center justify-center"
            >
              {/* Orbiting circles — outer ring */}
              <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <OrbitingCircles
                  radius={155}
                  duration={60}
                  speed={0.4}
                  path
                  iconSize={22}
                >
                  <span className="flex size-5.5 items-center justify-center rounded-md border border-border/50 bg-card/80 text-muted-foreground/60">
                    <Shield className="size-2.5" />
                  </span>
                  <span className="flex size-5.5 items-center justify-center rounded-md border border-border/50 bg-card/80 text-muted-foreground/60">
                    <Scale className="size-2.5" />
                  </span>
                  <span className="flex size-5.5 items-center justify-center rounded-md border border-border/50 bg-card/80 text-muted-foreground/60">
                    <FileText className="size-2.5" />
                  </span>
                </OrbitingCircles>
              </div>

              {/* Beam nodes: 3 left → center → 3 right */}
              <div className="flex size-full flex-col items-stretch justify-between py-6">
                {/* Top row */}
                <div className="flex items-center justify-between px-4">
                  <Node nodeRef={refMsg} label="Messages">
                    <MessageSquare className="size-4" />
                  </Node>
                  <Node nodeRef={refNotes} label="Notes">
                    <StickyNote className="size-4" />
                  </Node>
                </div>

                {/* Middle row */}
                <div className="flex items-center justify-between px-4">
                  <Node nodeRef={refCode} label="Code">
                    <Code2 className="size-4" />
                  </Node>

                  {/* Center — Selantar */}
                  <div
                    ref={refCenter}
                    className="z-20 flex size-16 flex-col items-center justify-center rounded-xl border border-accent/20 bg-card shadow-[0_0_40px_-10px_oklch(0.72_0.17_55_/_20%)]"
                  >
                    <span className="text-lg font-normal tracking-tight text-accent">
                      S
                    </span>
                  </div>

                  <Node nodeRef={refAuto} label="Automation">
                    <Zap className="size-4" />
                  </Node>
                </div>

                {/* Bottom row */}
                <div className="flex items-center justify-between px-4">
                  <Node nodeRef={refFiles} label="Files">
                    <HardDrive className="size-4" />
                  </Node>
                  <Node nodeRef={refChat} label="Chat">
                    <Send className="size-4" />
                  </Node>
                </div>
              </div>

              {/* ── Beams: left → center ── */}
              <AnimatedBeam
                containerRef={beamRef}
                fromRef={refMsg}
                toRef={refCenter}
                curvature={-50}
                endYOffset={-6}
                pathColor="rgba(255,255,255,0.04)"
                pathWidth={1}
                gradientStartColor="#c87a38"
                gradientStopColor="#6b5a48"
              />
              <AnimatedBeam
                containerRef={beamRef}
                fromRef={refCode}
                toRef={refCenter}
                pathColor="rgba(255,255,255,0.04)"
                pathWidth={1}
                gradientStartColor="#c87a38"
                gradientStopColor="#6b5a48"
              />
              <AnimatedBeam
                containerRef={beamRef}
                fromRef={refFiles}
                toRef={refCenter}
                curvature={50}
                endYOffset={6}
                pathColor="rgba(255,255,255,0.04)"
                pathWidth={1}
                gradientStartColor="#c87a38"
                gradientStopColor="#6b5a48"
              />

              {/* ── Beams: center → right (reverse) ── */}
              <AnimatedBeam
                containerRef={beamRef}
                fromRef={refNotes}
                toRef={refCenter}
                curvature={-50}
                endYOffset={-6}
                reverse
                pathColor="rgba(255,255,255,0.04)"
                pathWidth={1}
                gradientStartColor="#6b5a48"
                gradientStopColor="#c87a38"
              />
              <AnimatedBeam
                containerRef={beamRef}
                fromRef={refAuto}
                toRef={refCenter}
                reverse
                pathColor="rgba(255,255,255,0.04)"
                pathWidth={1}
                gradientStartColor="#6b5a48"
                gradientStopColor="#c87a38"
              />
              <AnimatedBeam
                containerRef={beamRef}
                fromRef={refChat}
                toRef={refCenter}
                curvature={50}
                endYOffset={6}
                reverse
                pathColor="rgba(255,255,255,0.04)"
                pathWidth={1}
                gradientStartColor="#6b5a48"
                gradientStopColor="#c87a38"
              />
            </div>
          </motion.div>
        </div>
      </main>

      {/* ── Footer ── */}
      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.7, duration: 0.4 }}
        className="relative z-10 flex items-center justify-between border-t border-border px-6 py-3.5 lg:px-12"
      >
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Selantar
        </span>

        {/* Pill */}
        <div className="flex items-center gap-2 rounded-md border border-border px-3 py-1.5">
          <span className="relative flex size-1.5">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-30" />
            <span className="relative inline-flex size-1.5 rounded-full bg-accent" />
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            Seed &middot; Phase I
          </span>
        </div>

        <span className="hidden text-[10px] uppercase tracking-wider text-muted-foreground sm:block">
          where commitments are sealed
        </span>
      </motion.footer>
    </div>
  );
}
