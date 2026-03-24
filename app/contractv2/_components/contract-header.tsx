"use client";

import { CalendarIcon, MapPinIcon, AlertTriangleIcon, ScaleIcon, BanknoteIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const contract = {
  subject: "Development of a medical scheduling system with CRM module, WhatsApp integration and administrative panel for patient management at Suasuna Clinic.",
  parties: [
    {
      role: "Client",
      name: "Suasuna Clinic Ltd.",
      cnpj: "12.345.678/0001-90",
      representative: "Dr. Ernani Suassuna",
      city: "Recife, PE",
      initials: "CS",
    },
    {
      role: "Developer",
      name: "DevStudio Technology ME",
      cnpj: "98.765.432/0001-11",
      representative: "Matheus Oliveira",
      city: "São Paulo, SP",
      initials: "DV",
    },
  ],
  payment: { total: "R$ 15.000", terms: "4 payments per milestone" },
  timeline: { start: "03/01/2026", end: "05/10/2026", duration: 70, elapsed: 21 },
  jurisdiction: "Recife – PE",
  risks: 2,
};

export function ContractHeader() {
  const pct = Math.round((contract.timeline.elapsed / contract.timeline.duration) * 100);

  return (
    <div className="border-b border-border">

      {/* Subject — full-width with left label */}
      <div className="flex items-baseline gap-5 px-8 py-3.5 border-b border-border">
        <span className="shrink-0 text-[10px] uppercase tracking-[0.15em] text-muted-foreground/50 font-medium">Subject</span>
        <p className="text-[13px] text-foreground/70 leading-relaxed">{contract.subject}</p>
      </div>

      {/* Data strip — asymmetric widths for visual interest */}
      <div className="grid divide-x divide-border" style={{ gridTemplateColumns: "1.1fr 1.1fr 0.7fr 1fr 0.8fr" }}>

        {/* Client */}
        <div className="px-6 py-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium mb-2.5">Client</p>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.45_0.12_250/12%)] text-[11px] font-semibold text-[oklch(0.7_0.1_250)] tracking-wide">
              {contract.parties[0].initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{contract.parties[0].name}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{contract.parties[0].representative}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-4 text-[11px] text-muted-foreground/40">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-2.5" />
              {contract.parties[0].city}
            </span>
            <span className="font-mono text-[10px]">{contract.parties[0].cnpj}</span>
          </div>
        </div>

        {/* Developer */}
        <div className="px-6 py-4">
          <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium mb-2.5">Developer</p>
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[oklch(0.50_0.12_300/12%)] text-[11px] font-semibold text-[oklch(0.7_0.1_300)] tracking-wide">
              {contract.parties[1].initials}
            </div>
            <div className="min-w-0">
              <p className="text-[13px] font-semibold text-foreground leading-tight truncate">{contract.parties[1].name}</p>
              <p className="text-[11px] text-muted-foreground/70 mt-0.5">{contract.parties[1].representative}</p>
            </div>
          </div>
          <div className="mt-2.5 flex items-center gap-4 text-[11px] text-muted-foreground/40">
            <span className="flex items-center gap-1">
              <MapPinIcon className="size-2.5" />
              {contract.parties[1].city}
            </span>
            <span className="font-mono text-[10px]">{contract.parties[1].cnpj}</span>
          </div>
        </div>

        {/* Payment — tighter column, big number emphasis */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <BanknoteIcon className="size-2.5 text-muted-foreground/30" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium">Total Value</p>
          </div>
          <p className="font-mono text-xl font-bold text-foreground tracking-tight leading-none">{contract.payment.total}</p>
          <p className="text-[11px] text-muted-foreground/50 mt-2">{contract.payment.terms}</p>
        </div>

        {/* Timeline — progress feel */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <CalendarIcon className="size-2.5 text-muted-foreground/30" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium">Deadline</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-mono text-[13px] text-foreground">{contract.timeline.start}</span>
            <span className="text-muted-foreground/25 text-xs">—</span>
            <span className="font-mono text-[13px] text-foreground">{contract.timeline.end}</span>
          </div>
          <div className="mt-3 relative">
            <div className="h-[2px] w-full rounded-full bg-border" />
            <div
              className="absolute top-0 left-0 h-[2px] rounded-full bg-accent transition-all"
              style={{ width: `${pct}%` }}
            />
            {/* Progress marker */}
            <div
              className="absolute -top-[3px] size-2 rounded-full bg-accent ring-2 ring-background transition-all"
              style={{ left: `${pct}%`, transform: "translateX(-50%)" }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground/40 mt-2 tabular-nums">{contract.timeline.elapsed} of {contract.timeline.duration} days</p>
        </div>

        {/* Jurisdiction + Risk flag */}
        <div className="px-6 py-4">
          <div className="flex items-center gap-1.5 mb-2.5">
            <ScaleIcon className="size-2.5 text-muted-foreground/30" />
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground/40 font-medium">Jurisdiction</p>
          </div>
          <p className="text-[13px] font-medium text-foreground">{contract.jurisdiction}</p>
          <div className="mt-3 flex items-center gap-2 rounded-md border border-destructive/15 bg-destructive/[0.04] px-2.5 py-1.5">
            <AlertTriangleIcon className="size-3 shrink-0 text-destructive/80" />
            <p className="text-[11px] text-destructive/90 font-medium">{contract.risks} high-risk clauses</p>
          </div>
        </div>

      </div>
    </div>
  );
}
