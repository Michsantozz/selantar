"use client";

import { MilestoneBuilder } from "./_components/milestone-builder";
import { RiskReview } from "./_components/risk-review";
import { DeployReview } from "./_components/deploy-review";

function SectionLabel({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="size-2 rounded-full bg-accent" />
      <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        {label}
      </span>
    </div>
  );
}

export default function SetupPage() {
  return (
    <div className="h-dvh w-dvw overflow-hidden grid grid-cols-3 bg-background">
      {/* 1 — Milestone Builder */}
      <div className="border-r border-border overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="shrink-0 px-4 py-3 border-b border-border bg-card">
            <SectionLabel label="Milestones" />
          </div>
          <div className="flex-1 overflow-hidden">
            <MilestoneBuilder />
          </div>
        </div>
      </div>

      {/* 2 — Placeholder */}
      <div className="border-r border-border overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="shrink-0 px-4 py-3 border-b border-border bg-card">
            <SectionLabel label="Risk Review" />
          </div>
          <div className="flex-1 overflow-hidden">
            <RiskReview />
          </div>
        </div>
      </div>

      {/* 3 — Placeholder */}
      <div className="overflow-hidden">
        <div className="h-full flex flex-col">
          <div className="shrink-0 px-4 py-3 border-b border-border bg-card">
            <SectionLabel label="Deploy Preview" />
          </div>
          <div className="flex-1 overflow-hidden">
            <DeployReview />
          </div>
        </div>
      </div>
    </div>
  );
}
