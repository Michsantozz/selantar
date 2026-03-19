"use client";

import Image from "next/image";
import { ArrowRight, DollarSign, Clock, Paperclip } from "lucide-react";
import { motion } from "framer-motion";
import { scenarios, type Scenario } from "@/lib/scenarios";

interface ScenarioSelectorProps {
  onSelect: (scenario: Scenario) => void;
}

/* Viewfinder corner brackets */
function ViewfinderCorners() {
  return (
    <>
      <span className="absolute left-2 top-2 size-3 border-l border-t border-foreground/15" />
      <span className="absolute right-2 top-2 size-3 border-r border-t border-foreground/15" />
      <span className="absolute left-2 bottom-2 size-3 border-l border-b border-foreground/15" />
      <span className="absolute right-2 bottom-2 size-3 border-r border-b border-foreground/15" />
    </>
  );
}

export function ScenarioSelector({ onSelect }: ScenarioSelectorProps) {
  const [featured, ...rest] = scenarios;

  return (
    <div className="mx-auto max-w-7xl px-4 py-16 lg:px-9 lg:py-20">
      {/* Section label */}
      <div className="flex items-center gap-2">
        <span className="size-2 rounded-full bg-primary" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Case files
        </span>
      </div>

      <h1 className="mt-5 text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-5xl">
        Pick a case. Watch it resolve.
      </h1>
      <p className="mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
        Real disputes, real evidence. Select a file and the AI mediator
        takes over live.
      </p>

      {/* Grid: featured left + 2 compact right */}
      <div className="mt-10 grid gap-4 lg:grid-cols-5">
        {/* Featured — 3 of 5 cols */}
        <motion.button
          onClick={() => onSelect(featured)}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
          className="group flex flex-col overflow-hidden rounded-md border border-border bg-card text-left transition-colors duration-200 hover:border-primary/25 lg:col-span-3 lg:row-span-2"
        >
          <div className="relative h-52 w-full shrink-0 overflow-hidden">
            <Image
              src={featured.visual.image}
              alt={featured.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 60vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-card via-card/30 via-30% to-transparent" />
            <ViewfinderCorners />
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              <span className="absolute left-1/2 top-0 h-3 w-px -translate-x-1/2 bg-foreground/8" />
              <span className="absolute left-0 top-1/2 h-px w-3 -translate-y-1/2 bg-foreground/8" />
            </div>
            <div className="absolute inset-x-0 top-0 flex items-center justify-between px-5 pt-4">
              <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                Case 01
              </span>
              <div className="flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
                <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">
                  Rec
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-1 flex-col p-5">
            <div className="flex items-baseline justify-between gap-2">
              <h3 className="text-base font-normal tracking-tight text-foreground">
                {featured.title}
              </h3>
              <span className="shrink-0 font-mono text-xs text-primary">
                {featured.escrow}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-muted-foreground">
              {featured.tagline}
            </p>

            {/* VS block */}
            <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-center rounded-sm border border-border bg-muted/30">
              <div className="px-2.5 py-2">
                <span className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground/60">
                  {featured.parties.client.role}
                </span>
                <p className="truncate font-mono text-[11px] text-foreground mt-0.5">
                  {featured.parties.client.name}
                </p>
              </div>
              <div className="flex h-full items-center border-x border-border px-2.5">
                <span className="text-[10px] font-bold uppercase text-primary">vs</span>
              </div>
              <div className="px-2.5 py-2 text-right">
                <span className="text-[8px] font-medium uppercase tracking-widest text-muted-foreground/60">
                  {featured.parties.developer.role}
                </span>
                <p className="truncate font-mono text-[11px] text-foreground mt-0.5">
                  {featured.parties.developer.name}
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs leading-relaxed text-muted-foreground line-clamp-3">
              {featured.dispute}
            </p>

            <div className="mt-auto" />

            <div className="mt-4 flex items-center justify-between">
              <div className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-wider text-muted-foreground/50">
                <span className="flex items-center gap-1">
                  <DollarSign className="size-2.5" />
                  {featured.contract.currency} {featured.contract.value}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1">
                  <Clock className="size-2.5" />
                  {featured.contract.duration}
                </span>
                <span className="text-border">·</span>
                <span className="flex items-center gap-1">
                  <Paperclip className="size-2.5" />
                  {featured.evidence.length}
                </span>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-foreground transition-colors group-hover:text-primary">
                Open
                <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
              </div>
            </div>
          </div>
        </motion.button>

        {/* Compact cards — 2 of 5 cols, stacked */}
        {rest.map((scenario, i) => (
          <motion.button
            key={scenario.id}
            onClick={() => onSelect(scenario)}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              delay: (i + 1) * 0.1,
              duration: 0.5,
              ease: [0, 0, 0.2, 1],
            }}
            className="group flex flex-col overflow-hidden rounded-md border border-border bg-card text-left transition-colors duration-200 hover:border-primary/25 lg:col-span-2"
          >
            {/* Compact image strip */}
            <div className="relative h-28 w-full shrink-0 overflow-hidden">
              <Image
                src={scenario.visual.image}
                alt={scenario.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 40vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-card via-card/40 via-30% to-transparent" />
              <ViewfinderCorners />
              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-4 pt-3">
                <span className="font-mono text-[10px] uppercase tracking-widest text-foreground/40">
                  Case {String(i + 2).padStart(2, "0")}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
                  <span className="font-mono text-[9px] uppercase tracking-widest text-foreground/40">
                    Rec
                  </span>
                </div>
              </div>
            </div>

            <div className="flex flex-1 flex-col p-4">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-normal tracking-tight text-foreground">
                  {scenario.title}
                </h3>
                <span className="shrink-0 font-mono text-xs text-primary">
                  {scenario.escrow}
                </span>
              </div>
              <p className="mt-0.5 text-[11px] text-muted-foreground">
                {scenario.tagline}
              </p>

              {/* Compact VS — inline */}
              <div className="mt-2 flex items-center gap-2 font-mono text-[10px]">
                <span className="text-foreground/70">{scenario.parties.client.name}</span>
                <span className="text-primary font-bold">vs</span>
                <span className="text-foreground/70">{scenario.parties.developer.name}</span>
              </div>

              <div className="mt-auto" />

              <div className="mt-3 flex items-center justify-between border-t border-border pt-3">
                <div className="flex items-center gap-2 font-mono text-[10px] text-muted-foreground/50">
                  <span className="flex items-center gap-1">
                    <DollarSign className="size-2.5" />
                    {scenario.contract.currency} {scenario.contract.value}
                  </span>
                  <span className="text-border">·</span>
                  <span className="flex items-center gap-1">
                    <Paperclip className="size-2.5" />
                    {scenario.evidence.length}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-foreground transition-colors group-hover:text-primary">
                  Open
                  <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                </div>
              </div>
            </div>
          </motion.button>
        ))}
      </div>

      {/* Helper */}
      <p className="mt-5 text-xs text-muted-foreground/60">
        Or{" "}
        <span className="text-foreground">describe your own dispute</span>{" "}
        directly in the mediation chat.
      </p>
    </div>
  );
}
