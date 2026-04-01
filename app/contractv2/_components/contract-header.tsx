"use client";

import { CalendarIcon, MapPinIcon, AlertTriangleIcon, ScaleIcon, BanknoteIcon } from "lucide-react";
import type { ContractHeader as ContractHeaderData } from "@/lib/schemas/contract-parse";

const DEFAULT_DATA: ContractHeaderData = {
  subject: "Development of a patient management CRM system with scheduling module, electronic health records, and billing for Suasuna Clinic.",
  parties: [
    {
      role: "Client",
      name: "Suasuna Clinic Ltd",
      identifier: "EIN 12-3456789",
      representative: "Dr. Ernani Suasuna, Clinical Director",
      city: "Recife, PE",
      initials: "SC",
    },
    {
      role: "Developer",
      name: "DevStudio Technology LLC",
      identifier: "EIN 98-7654321",
      representative: "Michael Santos, Technical Director",
      city: "Recife, PE",
      initials: "DT",
    },
  ],
  payment: { total: "$15,000", terms: "4 payments per milestone" },
  timeline: { start: "2026-01-15", end: "2026-03-26", durationDays: 70 },
  jurisdiction: "Courts of Recife, PE, Brazil",
};

const DEFAULT_RISKS_COUNT = 2;

function ContractHeaderSkeleton() {
  return (
    <div className="border-b border-border animate-pulse">
      <div className="px-8 py-4 bg-muted/10 border-b border-border">
        <div className="h-4 w-3/4 rounded bg-muted" />
      </div>
      <div className="grid grid-cols-5 divide-x divide-border">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="px-6 py-5 space-y-3">
            <div className="h-3 w-16 rounded bg-muted" />
            <div className="h-5 w-24 rounded bg-muted" />
            <div className="h-3 w-20 rounded bg-muted" />
          </div>
        ))}
      </div>
    </div>
  );
}

interface ContractHeaderProps {
  data?: ContractHeaderData | null;
  risksCount?: number;
  loading?: boolean;
}

export function ContractHeader({ data, risksCount, loading }: ContractHeaderProps = {}) {
  const contract = data ?? DEFAULT_DATA;
  const risks = risksCount ?? DEFAULT_RISKS_COUNT;
  const pct = contract.timeline.durationDays > 0
    ? Math.round((21 / contract.timeline.durationDays) * 100)
    : 0;

  if (loading || data === null) {
    return <ContractHeaderSkeleton />;
  }

  return (
    <div className="border-b border-border">

      {/* Subject matter — always visible, slightly different background */}
      <div className="flex items-start gap-4 px-8 py-4 bg-muted/10 border-b border-border">
        <span className="mt-0.5 shrink-0 text-[10px] uppercase tracking-widest text-muted-foreground whitespace-nowrap">Subject</span>
        <p className="text-sm text-foreground/80 leading-relaxed">{contract.subject}</p>
      </div>

      {/* Data grid — 5 cells with same height */}
      <div className="grid grid-cols-5 divide-x divide-border">

        {/* Client */}
        <div className="px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Client</p>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-blue-500/15 text-xs font-semibold text-blue-400">
              {contract.parties[0].initials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground leading-tight">{contract.parties[0].name}</p>
              <p className="text-xs text-muted-foreground">{contract.parties[0].representative}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <MapPinIcon className="size-3 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground/60">{contract.parties[0].city}</p>
          </div>
          <p className="text-xs font-mono text-muted-foreground/40 mt-1">{contract.parties[0].identifier}</p>
        </div>

        {/* Developer */}
        <div className="px-6 py-5">
          <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-3">Developer</p>
          <div className="flex items-center gap-2.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-500/15 text-xs font-semibold text-violet-400">
              {contract.parties[1].initials}
            </div>
            <div>
              <p className="text-sm font-medium text-foreground leading-tight">{contract.parties[1].name}</p>
              <p className="text-xs text-muted-foreground">{contract.parties[1].representative}</p>
            </div>
          </div>
          <div className="flex items-center gap-1 mt-2.5">
            <MapPinIcon className="size-3 text-muted-foreground/40" />
            <p className="text-xs text-muted-foreground/60">{contract.parties[1].city}</p>
          </div>
          <p className="text-xs font-mono text-muted-foreground/40 mt-1">{contract.parties[1].identifier}</p>
        </div>

        {/* Payment */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-3">
            <BanknoteIcon className="size-3 text-muted-foreground/50" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Total Value</p>
          </div>
          <p className="text-2xl font-mono font-semibold text-foreground tracking-tight">{contract.payment.total}</p>
          <p className="text-xs text-muted-foreground mt-1">{contract.payment.terms}</p>
        </div>

        {/* Timeline */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-3">
            <CalendarIcon className="size-3 text-muted-foreground/50" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Deadline</p>
          </div>
          <p className="text-sm font-mono text-foreground">
            {contract.timeline.start} <span className="text-muted-foreground/40">→</span> {contract.timeline.end}
          </p>
          <div className="mt-3 h-[3px] w-full rounded-full bg-border overflow-hidden">
            <div className="h-full rounded-full bg-accent transition-all" style={{ width: `${pct}%` }} />
          </div>
          <p className="text-xs text-muted-foreground mt-1.5">{contract.timeline.durationDays} calendar days</p>
        </div>

        {/* Jurisdiction + Risks */}
        <div className="px-6 py-5">
          <div className="flex items-center gap-1.5 mb-3">
            <ScaleIcon className="size-3 text-muted-foreground/50" />
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Jurisdiction</p>
          </div>
          <p className="text-sm text-foreground">{contract.jurisdiction}</p>
          <div className="mt-4 flex items-center gap-2 rounded-md border border-destructive/20 bg-destructive/5 px-3 py-2">
            <AlertTriangleIcon className="size-3.5 shrink-0 text-destructive" />
            <p className="text-xs text-destructive font-medium">{risks} high-risk clauses</p>
          </div>
        </div>

      </div>
    </div>
  );
}
