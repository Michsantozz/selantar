"use client";

import { Badge } from "@/components/ui/badge";

export function ContractHeader() {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl lg:text-4xl font-normal tracking-tight text-foreground">
            Contract #8341
          </h1>
          <Badge
            variant="outline"
            className="border-primary/30 bg-primary/10 text-primary text-[10px] uppercase tracking-wider"
          >
            Base Sepolia
          </Badge>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed max-w-xl">
          Full-Stack AI for Suassuna Clinic — 24/7 Receptionist + Clinical Triage
        </p>
        <div className="flex items-center gap-2 mt-2">
          <span className="font-mono text-xs text-muted-foreground/60">
            ULTRASELF × Suassuna Clinic
          </span>
          <span className="text-muted-foreground/30">·</span>
          <span className="font-mono text-xs text-destructive">
            Expired 2 days ago
          </span>
          <span className="text-muted-foreground/30">·</span>
          <Badge
            variant="outline"
            className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] uppercase tracking-wider"
          >
            Active Dispute
          </Badge>
        </div>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
        <span className="font-mono text-[11px] text-muted-foreground/50">
          Block 8.341.229
        </span>
      </div>
    </div>
  );
}
