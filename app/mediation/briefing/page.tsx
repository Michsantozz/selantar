"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { scenarios, type Scenario } from "@/lib/scenarios";
import { motion } from "framer-motion";
import Image from "next/image";
import { ArrowRight, Swords, AlertTriangle } from "lucide-react";

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
      { image: "/scenes/deal.jpg", when: "Day 1", title: "The Contract", text: "Doctor hires dev for a CRM. R$45k, 3 phases, 90 days. Escrow locked.", mood: "neutral" },
      { image: "/scenes/success.jpg", when: "Day 56", title: "Trust Earned", text: "Phase 1 & 2 ship on time. Doctor approves both. Money flows.", mood: "good" },
      { image: "/scenes/blocked.jpg", when: "Day 57", title: "The Wall", text: "Phase 3 needs CRM access. Secretary ignores 5 emails over 3 weeks.", mood: "warning" },
      { image: "/scenes/explosion.jpg", when: "Day 62", title: "The Explosion", text: "Doctor erupts. Never knew the secretary blocked the dev.", mood: "danger" },
      { image: "/scenes/deadlock.jpg", when: "Now", title: "Deadlock", text: "R$15k frozen. Both sides have a point. No human can untangle this.", mood: "conflict" },
    ];
  }
  if (scenario.id === "ecommerce-quebrado") {
    return [
      { image: "/scenes/deal.jpg", when: "Day 1", title: "The Contract", text: "ShopFlex hires CodeCraft for payments. $12k, 30 days. Escrow locked.", mood: "neutral" },
      { image: "/scenes/success.jpg", when: "Day 15", title: "Ahead", text: "70% done, tests green. Ahead of schedule. Everyone is confident.", mood: "good" },
      { image: "/scenes/explosion.jpg", when: "Day 16", title: "The Bomb", text: "Payment API ships v4.0 with breaking changes. 40% destroyed overnight.", mood: "danger" },
      { image: "/scenes/blocked.jpg", when: "Day 17", title: "The Standoff", text: "Client won't extend deadline. Dev can't control third-party APIs.", mood: "warning" },
      { image: "/scenes/deadlock.jpg", when: "Now", title: "Deadlock", text: "$12k locked. Force majeure, no clause. Who absorbs the cost?", mood: "conflict" },
    ];
  }
  return [
    { image: "/scenes/deal.jpg", when: "Day 1", title: "The Contract", text: "StartupAI hires @ghostdev for a dashboard. $8k, 4 sprints, 8 weeks.", mood: "neutral" },
    { image: "/scenes/success.jpg", when: "Day 42", title: "Clean Run", text: "3 sprints ship clean. Auth, charts, export — all approved by CTO.", mood: "good" },
    { image: "/scenes/blocked.jpg", when: "Day 43", title: "Vanished", text: "@ghostdev goes silent. 12 follow-ups. All read. None answered.", mood: "danger" },
    { image: "/scenes/explosion.jpg", when: "Day 57", title: "The Crisis", text: "Investor demo in 3 weeks. Can't ship 75% of a product.", mood: "warning" },
    { image: "/scenes/deadlock.jpg", when: "Now", title: "Deadlock", text: "75% done and functional. But can't ship. Is full refund justice?", mood: "conflict" },
  ];
}

/* ─── Mood visuals ─── */
const moodBorderColor: Record<string, string> = {
  neutral: "border-border",
  good: "border-emerald/15",
  warning: "border-primary/15",
  danger: "border-destructive/15",
  conflict: "border-primary/30",
};

const moodWhenColor: Record<string, string> = {
  neutral: "text-muted-foreground/20",
  good: "text-emerald/30",
  warning: "text-primary/30",
  danger: "text-destructive/30",
  conflict: "text-primary/50",
};

const moodTitleColor: Record<string, string> = {
  neutral: "text-foreground/55",
  good: "text-foreground/65",
  warning: "text-foreground/70",
  danger: "text-foreground/75",
  conflict: "text-foreground/90",
};

const moodDotColor: Record<string, string> = {
  neutral: "bg-muted-foreground/15 border-muted-foreground/20",
  good: "bg-emerald/20 border-emerald/30",
  warning: "bg-primary/20 border-primary/30",
  danger: "bg-destructive/20 border-destructive/30",
  conflict: "bg-primary/30 border-primary/50",
};

const moodLineColor: Record<string, string> = {
  neutral: "bg-muted-foreground/8",
  good: "bg-emerald/12",
  warning: "bg-primary/12",
  danger: "bg-destructive/12",
  conflict: "bg-primary/20",
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
        <AlertTriangle className="size-8 text-muted-foreground/20" />
        <p className="text-sm text-muted-foreground/40">No scenario selected.</p>
        <button onClick={() => router.push("/forge")} className="text-sm text-primary hover:text-primary/80 transition-colors">Back to Forge</button>
      </div>
    );
  }

  const scenes = getScenes(scenario);

  return (
    <div className="relative mx-auto flex h-full max-w-[1440px] flex-col justify-center px-8 lg:px-12">

      {/* ── Header ── */}
      <motion.div
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="flex items-center justify-between"
      >
        <div className="flex items-center gap-3">
          <span className="size-[6px] rounded-full bg-primary" />
          <span className="text-[11px] font-medium uppercase tracking-[0.15em] text-muted-foreground">
            Previously on
          </span>
          <span className="text-muted-foreground/10">·</span>
          <span className="text-sm text-foreground/50">{scenario.title}</span>
        </div>
        <span className="rounded-md border border-primary/25 bg-primary/8 px-2.5 py-1 font-mono text-[11px] text-primary">
          {scenario.escrow}
        </span>
      </motion.div>

      {/* ── Cards ── */}
      <div className="mt-10">
        <div className="flex gap-4 justify-center">
          {scenes.map((scene, i) => {
            const isConflict = scene.mood === "conflict";
            return (
              <motion.div
                key={scene.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 0.1 + i * 0.08,
                  duration: 0.6,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={`relative flex w-[255px] flex-col overflow-hidden rounded-xl border ${moodBorderColor[scene.mood]} bg-card transition-all duration-500 hover:translate-y-[-3px] hover:shadow-[0_8px_24px_rgba(0,0,0,0.3)]`}
              >
                {/* Image area */}
                <div className="relative h-[150px] w-full shrink-0 overflow-hidden">
                  <Image
                    src={scene.image}
                    alt={scene.title}
                    fill
                    className="object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                    sizes="255px"
                  />
                  {/* Viewfinder corners */}
                  <span className="absolute left-2.5 top-2.5 size-3 border-l border-t border-foreground/15" />
                  <span className="absolute right-2.5 top-2.5 size-3 border-r border-t border-foreground/15" />
                  <span className="absolute left-2.5 bottom-2.5 size-3 border-l border-b border-foreground/10" />
                  <span className="absolute right-2.5 bottom-2.5 size-3 border-r border-b border-foreground/10" />

                  {/* Scene number overlay */}
                  <div className="absolute left-3.5 top-3 flex items-center gap-2">
                    <span className="rounded bg-background/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-widest text-foreground/60 backdrop-blur-sm">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                  </div>

                  {/* When badge */}
                  <div className="absolute right-3.5 top-3">
                    <span className={`rounded bg-background/60 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider backdrop-blur-sm ${moodWhenColor[scene.mood]}`}>
                      {scene.when}
                    </span>
                  </div>

                  {/* Live indicator for conflict */}
                  {isConflict && (
                    <div className="absolute right-3 bottom-3 flex items-center gap-1.5 rounded bg-background/70 px-2 py-0.5 backdrop-blur-sm">
                      <span className="size-[5px] rounded-full bg-primary animate-subtle-pulse" />
                      <span className="font-mono text-[8px] uppercase text-primary/60">Live</span>
                    </div>
                  )}
                </div>

                {/* Text content — clear bg, no image overlap */}
                <div className="flex flex-1 flex-col px-5 pb-5 pt-4">
                  {/* Title */}
                  <h3 className={`text-base font-medium tracking-tight leading-snug ${moodTitleColor[scene.mood]}`}>
                    {scene.title}
                  </h3>

                  {/* Description */}
                  <p className={`mt-2.5 text-[12px] leading-[1.65] ${isConflict ? "text-muted-foreground/45" : "text-muted-foreground/28"}`}>
                    {scene.text}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* ── Timeline thread ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.6 }}
          className="mt-6 flex items-center justify-center px-12"
        >
          {scenes.map((scene, i) => (
            <div key={i} className="flex items-center">
              <div className={`size-2.5 rounded-full border-[1.5px] ${moodDotColor[scene.mood]} transition-colors duration-500`} />
              {i < scenes.length - 1 && (
                <div className={`h-[1.5px] w-[225px] ${moodLineColor[scenes[i + 1].mood]} transition-colors duration-500`} />
              )}
            </div>
          ))}
        </motion.div>
      </div>

      {/* ── Footer ── */}
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
        className="mt-10 flex items-center justify-between"
      >
        <div className="flex items-center gap-4 font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground/12">
          <span>{scenario.parties.client.name} vs {scenario.parties.developer.name}</span>
          <span>·</span>
          <span>{scenario.contract.currency} {scenario.contract.value}</span>
          <span>·</span>
          <span>{scenario.contract.duration}</span>
          <span>·</span>
          <span>{scenario.evidence.length} evidence</span>
        </div>

        <button
          onClick={() => router.push(`/mediation?scenario=${scenario.id}`)}
          className="hero-cta group flex items-center gap-3 rounded-md px-7 py-2.5 text-[12px] font-medium uppercase tracking-[0.12em] text-foreground transition-all duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] hover:scale-[1.02] active:scale-[0.98]"
        >
          <Swords className="size-3.5 text-primary/60" />
          Go to War
          <ArrowRight className="size-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" />
        </button>
      </motion.div>
    </div>
  );
}

export default function BriefingPage() {
  return (
    <div className="h-[calc(100dvh-65px)] overflow-hidden">
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
