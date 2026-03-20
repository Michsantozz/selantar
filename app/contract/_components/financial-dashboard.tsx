"use client";

export function FinancialDashboard() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <span className="size-2 rounded-full bg-accent" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Financial Dashboard
        </span>
      </div>

      {/* Metrics grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Contract Value
          </span>
          <p className="mt-1.5 text-2xl font-normal tracking-tight text-foreground font-mono">
            $4,800
          </p>
          <span className="text-[11px] text-muted-foreground/60 font-mono">
            Setup + $400/mo recurring
          </span>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Smart Escrow
          </span>
          <p className="mt-1.5 text-2xl font-normal tracking-tight text-foreground font-mono">
            500 USDC
          </p>
          <span className="text-[11px] text-muted-foreground/60 font-mono">
            On-chain · Base · 0x4f3a...c91b
          </span>
        </div>

        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Phases
          </span>
          <p className="mt-1.5 text-2xl font-normal tracking-tight text-foreground font-mono">
            2 / 3
          </p>
          <span className="text-[11px] text-muted-foreground/60">
            Completed · 1 in dispute
          </span>
        </div>
      </div>

      {/* Escrow allocation bar */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground uppercase tracking-wider">
            Escrow Allocation
          </span>
          <span className="font-mono text-xs text-muted-foreground/60">
            500 USDC total
          </span>
        </div>
        <div className="h-3 w-full rounded-full overflow-hidden bg-muted/50 border border-border">
          {/* Phase 1: 100 = 20% */}
          {/* Phase 2: 150 = 30% */}
          {/* Phase 3: 250 = 50% (at risk) */}
          <div className="flex h-full">
            <div
              className="bg-emerald h-full"
              style={{ width: "20%" }}
              title="Phase 1 — 100 USDC Released"
            />
            <div
              className="bg-emerald/70 h-full"
              style={{ width: "30%" }}
              title="Phase 2 — 150 USDC Released"
            />
            <div
              className="bg-destructive/60 h-full animate-pulse"
              style={{ width: "50%" }}
              title="Phase 3 — 250 USDC At Risk"
            />
          </div>
        </div>
        <div className="flex items-center justify-between mt-2 text-[11px]">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-emerald" />
              <span className="text-muted-foreground">250 Released</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="size-2 rounded-full bg-destructive/60" />
              <span className="text-muted-foreground">250 At Risk</span>
            </div>
          </div>
          <span className="font-mono text-muted-foreground/50">Phases 1 & 2 · Phase 3</span>
        </div>
      </div>
    </div>
  );
}
