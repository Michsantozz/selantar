"use client";

import { AlertTriangle, User, Building } from "lucide-react";
import type { Scenario } from "@/lib/scenarios";

interface CaseInfoPanelProps {
  scenario?: Scenario;
}

export function CaseInfoPanel({ scenario }: CaseInfoPanelProps) {
  const escrowValue = scenario?.escrow ?? "250 $SURGE";
  const clientName = scenario?.parties.client.name ?? "Client";
  const clientRole = scenario?.parties.client.role ?? "Client";
  const devName = scenario?.parties.developer.name ?? "Developer";
  const devRole = scenario?.parties.developer.role ?? "Developer";
  const contractValue = scenario
    ? `${scenario.contract.currency} ${scenario.contract.value}`
    : "500 total";
  const contractScope = scenario?.contract.scope ?? "Contract scope";
  const contractDuration = scenario?.contract.duration ?? "N/A";

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Escrow Card */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            In Escrow
          </span>
        </div>
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-3xl font-normal tracking-tight text-foreground font-mono">
            {escrowValue}
          </span>
        </div>
        <p className="text-[11px] text-muted-foreground/60">
          Held in Smart Escrow · {contractDuration}
        </p>
      </div>

      {/* Parties */}
      <div className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Parties
          </span>
        </div>

        <div className="space-y-3">
          {/* Client */}
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Building className="size-3.5 text-primary" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-normal text-foreground truncate">
                  {clientName}
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  {clientRole}
                </p>
              </div>
            </div>
            {scenario && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-2">
                Frustrated with delayed launch. Invested in earlier phases. Open to fast resolution if fair.
              </p>
            )}
          </div>

          {/* Developer */}
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="flex items-center gap-3">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-secondary">
                <User className="size-3.5 text-muted-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-normal text-foreground truncate">
                  {devName}
                </p>
                <p className="text-[11px] text-muted-foreground/60">
                  {devRole}
                </p>
              </div>
            </div>
            {scenario && (
              <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground border-t border-border pt-2">
                Technical work completed. Blocked on client-side access. Sent requests — unread by team.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Contract Details */}
      <div className="rounded-xl border border-border bg-card p-5 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Contract
          </span>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Scope</span>
            <span className="text-xs text-foreground max-w-[60%] text-right">
              {contractScope}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Value</span>
            <span className="text-xs font-mono text-foreground">
              {contractValue}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">Duration</span>
            <span className="text-xs font-mono text-foreground">
              {contractDuration}
            </span>
          </div>
        </div>

        {/* Dispute summary */}
        {scenario && (
          <div className="mt-4 pt-3 border-t border-border">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="size-3 text-primary" />
              <span className="text-[10px] font-medium uppercase tracking-wider text-primary/70">
                Dispute
              </span>
            </div>
            <p className="text-[11px] leading-relaxed text-muted-foreground">
              {scenario.dispute}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
