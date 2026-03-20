"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { scenarios, type Scenario } from "@/lib/scenarios";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, ArrowLeft, Swords, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";
import { DotPattern } from "@/components/ui/dot-pattern";

/* ─── Scene data ─── */
interface Scene {
  image: string;
  when: string;
  title: string;
  text: string;
  mood: "neutral" | "good" | "warning" | "danger" | "conflict";
}

function getScenes(scenario: Scenario): Scene[] {
  if (scenario.id === "clinica-suasuna") {
    return [
      { image: "/scenes/deal.jpg", when: "Day 1", title: "The Contract", text: "Dr. Suasuna hires ULTRASELF to build a clinic CRM. R$45k contract split into 3 phases, escrow locked per phase.", mood: "neutral" },
      { image: "/scenes/success.jpg", when: "Day 56", title: "Trust Earned", text: "Phases 1 and 2 delivered on time and approved by the doctor. R$30k released without issues. Full trust.", mood: "good" },
      { image: "/scenes/blocked.jpg", when: "Day 57", title: "The Wall", text: "Phase 3 requires access to the clinic's CRM. The secretary ignores 5 emails from the dev over 3 weeks. The project stalls.", mood: "warning" },
      { image: "/scenes/explosion.jpg", when: "Day 62", title: "The Explosion", text: "The doctor erupts. He never knew the secretary blocked the dev. Accuses ULTRASELF of delays and demands a refund.", mood: "danger" },
      { image: "/scenes/deadlock.jpg", when: "Now", title: "Deadlock", text: "R$15k frozen in escrow. The dev was blocked, but the doctor never knew. Both sides have a point. No human can untangle this.", mood: "conflict" },
    ];
  }
  if (scenario.id === "ecommerce-quebrado") {
    return [
      { image: "/scenes/deal.jpg", when: "Day 1", title: "The Contract", text: "ShopFlex hires CodeCraft to integrate Stripe payments. $12k contract, 30-day deadline. Full escrow locked.", mood: "neutral" },
      { image: "/scenes/success.jpg", when: "Day 15", title: "Ahead of Schedule", text: "70% complete, all tests passing. CodeCraft is ahead of schedule. Everyone is confident this ships early.", mood: "good" },
      { image: "/scenes/explosion.jpg", when: "Day 16", title: "The Bomb", text: "Stripe releases API v4.0 with breaking changes overnight. 40% of CodeCraft's integration is destroyed.", mood: "danger" },
      { image: "/scenes/blocked.jpg", when: "Day 17", title: "The Standoff", text: "ShopFlex refuses to extend the deadline. CodeCraft can't control what Stripe does. Nobody budges.", mood: "warning" },
      { image: "/scenes/deadlock.jpg", when: "Now", title: "Deadlock", text: "$12k locked. An external API broke the project. The contract has no force majeure clause. Who pays?", mood: "conflict" },
    ];
  }
  return [
    { image: "/scenes/deal.jpg", when: "Day 1", title: "The Contract", text: "StartupAI hires @ghostdev for an analytics dashboard. $8k, 4 sprints, 8 weeks. Escrow locked.", mood: "neutral" },
    { image: "/scenes/success.jpg", when: "Day 42", title: "Clean Run", text: "3 of 4 sprints ship clean. Auth, charts, export — all approved by the CTO. Only the admin panel remains.", mood: "good" },
    { image: "/scenes/blocked.jpg", when: "Day 43", title: "Vanished", text: "@ghostdev goes completely silent. 12 messages sent over 2 weeks. All read. None answered. No explanation.", mood: "danger" },
    { image: "/scenes/explosion.jpg", when: "Day 57", title: "The Crisis", text: "Investor demo in 3 weeks. StartupAI can't launch with 75% of a product. They need someone else to finish.", mood: "warning" },
    { image: "/scenes/deadlock.jpg", when: "Now", title: "Deadlock", text: "75% is done and works. But it can't ship without Sprint 4. Is a full refund fair for functional code?", mood: "conflict" },
  ];
}

/* ─── Mood visuals ─── */
const moodBorder: Record<string, string> = {
  neutral: "border-border",
  good: "border-emerald/15",
  warning: "border-primary/15",
  danger: "border-destructive/15",
  conflict: "border-primary/30",
};

const moodDot: Record<string, string> = {
  neutral: "bg-muted-foreground/40",
  good: "bg-emerald",
  warning: "bg-primary",
  danger: "bg-destructive",
  conflict: "bg-primary",
};

const moodLabelColor: Record<string, string> = {
  neutral: "text-muted-foreground",
  good: "text-emerald",
  warning: "text-primary",
  danger: "text-destructive",
  conflict: "text-primary",
};

/* ═══════════════════════════════════════════ */
function BriefingContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenario");
  const scenario = scenarios.find((s) => s.id === scenarioId);

  if (!scenario) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-4">
        <AlertTriangle className="size-8 text-muted-foreground" />
        <p className="text-sm text-muted-foreground">No scenario selected.</p>
        <button
          onClick={() => router.push("/forge")}
          className="text-sm text-primary transition-colors hover:text-primary/80"
        >
          Back to Forge
        </button>
      </div>
    );
  }

  const scenes = getScenes(scenario);

  return (
    <div className="relative mx-auto flex h-full max-w-[1600px] flex-col px-6 lg:px-12">

      {/* ── Header (navigation only) ── */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
        className="flex shrink-0 items-center py-5"
      >
        <button
          onClick={() => router.push("/forge")}
          className="group flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" />
          Forge
        </button>

        <Separator orientation="vertical" className="mx-4 !h-4" />

        <div className="flex items-center gap-2">
          <span className="size-[6px] rounded-full bg-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Case Briefing
          </span>
        </div>
      </motion.div>

      <div className="h-px bg-border" />

      {/* ── Title ── */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
        className="shrink-0 pt-7 pb-5"
      >
        <h1 className="text-[1.75rem] font-normal tracking-tight text-foreground">
          {scenario.title}
        </h1>
        <p className="mt-1 text-sm leading-relaxed text-muted-foreground max-w-xl">
          {scenario.tagline}. {scenario.escrow} frozen in escrow. Read what happened, then mediate.
        </p>

        {/* Role badge */}
        <div className="mt-4 inline-flex items-center gap-2.5 rounded-md border border-primary/20 bg-primary/[0.04] px-3.5 py-2">
          <span className="text-base leading-none">🎮</span>
          <span className="text-xs text-muted-foreground">You play as</span>
          <span className="text-sm font-medium text-foreground">{scenario.parties.developer.name}</span>
          <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            {scenario.parties.developer.role}
          </span>
        </div>
      </motion.div>

      {/* ── Scene cards ── */}
      <div className="flex min-h-0 flex-1 flex-col justify-center gap-5">
        <div className="flex w-full items-stretch gap-3">
          {scenes.map((scene, i) => (
            <SceneCard key={scene.title} scene={scene} index={i} total={scenes.length} />
          ))}
        </div>

        {/* ── Flow line connecting the cards ── */}
        <div className="relative mx-4 flex items-center">
          {/* Base line */}
          <div className="absolute inset-x-0 h-px bg-border" />
          {/* Mood dots on the line */}
          <div className="relative flex w-full justify-between">
            {scenes.map((scene, i) => (
              <div key={i} className="flex flex-col items-center gap-1.5">
                <span className={cn("size-2 rounded-full", moodDot[scene.mood])} />
              </div>
            ))}
          </div>
        </div>

        {/* ── CTA row ── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65, duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
          className="flex items-center justify-end gap-4"
        >
          <span className="text-xs text-muted-foreground/50">
            Both sides have a point. The AI mediator decides.
          </span>
          <button
            onClick={() => router.push(`/mediation?scenario=${scenario.id}`)}
            className="hero-cta group flex items-center gap-2.5 rounded-md px-6 py-3 text-sm font-medium uppercase tracking-[0.12em] text-foreground transition-all duration-500 hover:scale-[1.02] active:scale-[0.98]"
          >
            <Swords className="size-4 text-primary" />
            Enter Mediation
            <ArrowRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1" />
          </button>
        </motion.div>
      </div>

      <div className="shrink-0 pb-4" />
    </div>
  );
}

/* ═══════════════════════════════════════════
   Scene Card
   ═══════════════════════════════════════════ */
function SceneCard({
  scene,
  index,
  total,
}: {
  scene: Scene;
  index: number;
  total: number;
}) {
  const isConflict = scene.mood === "conflict";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: 0.15 + index * 0.08,
        duration: 0.5,
        ease: [0.4, 0, 0.2, 1],
      }}
      className={cn(
        "group relative flex flex-1 flex-col overflow-hidden rounded-xl border bg-card transition-colors duration-500 hover:border-primary/15",
        moodBorder[scene.mood]
      )}
    >
      {/* Viewfinder corners */}
      <span className="absolute left-2.5 top-2.5 z-10 size-3 border-l border-t border-foreground/[0.06]" />
      <span className="absolute right-2.5 top-2.5 z-10 size-3 border-r border-t border-foreground/[0.06]" />
      <span className="absolute bottom-2.5 left-2.5 z-10 size-3 border-b border-l border-foreground/[0.06]" />
      <span className="absolute bottom-2.5 right-2.5 z-10 size-3 border-b border-r border-foreground/[0.06]" />

      {/* ── Card header ── */}
      <div className="flex items-center justify-between px-4 py-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("size-[5px] rounded-full", moodDot[scene.mood])} />
          <span className={cn("text-[11px] font-medium uppercase tracking-[0.12em]", moodLabelColor[scene.mood])}>
            {scene.when}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="font-mono text-[11px] text-muted-foreground/50">
            {String(index + 1).padStart(2, "0")}/{String(total).padStart(2, "0")}
          </span>
          {isConflict && (
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
              <span className="text-[11px] font-medium text-primary">
                Live
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="h-px bg-border" />

      {/* ── Image ── */}
      <div className="relative aspect-[16/10] w-full shrink-0 overflow-hidden">
        <Image
          src={scene.image}
          alt={scene.title}
          fill
          className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.03]"
          sizes="20vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-card via-card/20 via-30% to-transparent" />
      </div>

      {/* ── Text content ── */}
      <div className="flex flex-1 flex-col gap-1.5 px-4 pb-4 pt-3">
        <h3 className="text-sm font-medium tracking-tight text-foreground">
          {scene.title}
        </h3>
        <p className="text-[13px] leading-relaxed text-muted-foreground">
          {scene.text}
        </p>
      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════ */
export default function BriefingPage() {
  return (
    <div className="relative h-[calc(100dvh-65px)] overflow-hidden">
      <DotPattern
        width={24}
        height={24}
        cr={0.6}
        className="text-primary/[0.02] [mask-image:radial-gradient(900px_circle_at_50%_40%,white,transparent)]"
      />
      <Suspense
        fallback={
          <div className="flex h-full items-center justify-center">
            <div className="size-5 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          </div>
        }
      >
        <BriefingContent />
      </Suspense>
    </div>
  );
}
