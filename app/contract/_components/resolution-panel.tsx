"use client";

import { CheckCircle, Scale } from "lucide-react";

export function ResolutionPanel() {
  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Close the Deal */}
      <div className="rounded-xl border border-emerald/20 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <CheckCircle className="size-4 text-emerald" />
          <h3 className="text-base font-normal text-foreground">
            Close The Deal
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-2">
          Everything looks good? Release the full escrow and wrap this up.
        </p>
        <div className="text-xs text-muted-foreground/60 mb-5 space-y-1">
          <p className="font-mono">500 USDC goes straight to ULTRASELF</p>
          <p>All 3 phases · Released automatically on-chain</p>
        </div>

        <div className="flex items-center gap-3 mb-5">
          <span className="text-3xl font-normal font-mono text-emerald tracking-tight">
            500
          </span>
          <span className="text-xs text-muted-foreground/60 font-mono">
            USDC
          </span>
        </div>

        <button className="w-full rounded-md border border-emerald/30 bg-emerald/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-emerald transition-colors hover:bg-emerald/20">
          Confirm Delivery & Release Full Escrow
        </button>
      </div>

      {/* Mediation */}
      <div className="rounded-xl border border-destructive/20 bg-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Scale className="size-4 text-destructive" />
          <h3 className="text-base font-normal text-foreground">
            Something Went Wrong.
          </h3>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed mb-4">
          Sentinel caught missed deadlines and broken SLAs. Here&apos;s what happens next.
        </p>
        <div className="rounded-lg border border-border bg-muted/20 p-4 mb-5">
          <p className="text-xs text-muted-foreground leading-relaxed">
            One click opens a live <span className="text-primary font-medium">Selantar Mediation Room</span>.
            Both sides get notified, evidence is pulled automatically, and the AI facilitates
            until there&apos;s a deal.
          </p>
        </div>

        <div className="flex items-center gap-3 mb-5 text-xs text-muted-foreground/60">
          <span className="font-mono">
            Penalty: 15 USDC from the liable party
          </span>
          <span className="text-muted-foreground/20">·</span>
          <span className="font-mono">Case #VRD-8341</span>
        </div>

        <button className="w-full rounded-md border border-destructive/30 bg-destructive/10 px-4 py-2.5 text-xs font-medium uppercase tracking-wider text-destructive transition-colors hover:bg-destructive/20">
          Start Selantar Mediation
        </button>
      </div>
    </div>
  );
}
