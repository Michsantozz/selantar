"use client";

import { Badge } from "@/components/ui/badge";

export function EvidencePanel() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-5">
        <span className="size-2 rounded-full bg-accent" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Evidence
        </span>
      </div>

      <div className="flex items-center gap-2 mb-4">
        <Badge
          variant="outline"
          className="border-destructive/30 bg-destructive/10 text-destructive text-[10px] uppercase tracking-wider"
        >
          SLA Breach
        </Badge>
        <span className="text-xs text-muted-foreground/60">
          WhatsApp — +48h no reply
        </span>
      </div>

      {/* Chat bubbles */}
      <div className="space-y-3">
        {/* Patient message */}
        <div className="flex flex-col items-start">
          <div className="rounded-lg rounded-tl-sm border border-border bg-muted/30 px-4 py-3 max-w-[85%]">
            <p className="text-sm text-foreground leading-relaxed">
              Hi! I was referred to this WhatsApp number to book an appointment.
              I've been waiting 2 days. Is anyone there?
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 ml-1">
            <span className="text-[10px] font-mono text-muted-foreground/40">
              Mon · 09:12
            </span>
            <span className="text-[10px] text-muted-foreground/30">
              delivered ✓✓
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/50 ml-1 mt-0.5">
            Triaged Patient
          </span>
        </div>

        {/* Divider */}
        <div className="flex items-center gap-3 py-1">
          <div className="flex-1 h-px bg-destructive/20" />
          <span className="text-[10px] font-mono text-destructive/60 uppercase tracking-wider">
            51h gap
          </span>
          <div className="flex-1 h-px bg-destructive/20" />
        </div>

        {/* No reply indicator */}
        <div className="flex flex-col items-end">
          <div className="rounded-lg rounded-tr-sm border border-destructive/20 bg-destructive/5 px-4 py-3 max-w-[85%]">
            <p className="text-sm text-muted-foreground leading-relaxed">
              No reply after 51h. SLA breached. Patient churn confirmed.
            </p>
          </div>
          <div className="flex items-center gap-2 mt-1 mr-1">
            <span className="text-[10px] font-mono text-muted-foreground/40">
              Wed · 09:12
            </span>
            <span className="text-[10px] text-destructive/60">
              unanswered ✗
            </span>
          </div>
          <span className="text-[10px] text-muted-foreground/50 mr-1 mt-0.5">
            Human Reception
          </span>
        </div>
      </div>

      {/* Sentinel summary */}
      <div className="mt-5 rounded-lg border border-border bg-muted/20 p-3">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="size-1.5 rounded-full bg-destructive" />
          <span className="text-[10px] font-medium uppercase tracking-wider text-destructive">
            Sentinel Analysis
          </span>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">
          3 triaged patients received no response within the contracted 24h SLA window.
          Average response delay: 51 hours. This constitutes a material breach of Section 4.2
          (Response Time Guarantees).
        </p>
      </div>
    </div>
  );
}
