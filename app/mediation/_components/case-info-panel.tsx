"use client";

import { User, Building, FileText, ArrowLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/lib/scenarios";

interface CaseInfoPanelProps {
  scenario?: Scenario;
  onViewContract?: () => void;
  wallet?: string | null;
}

export function CaseInfoPanel({ scenario, onViewContract, wallet }: CaseInfoPanelProps) {
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
      {/* Developer — YOU */}
      <div
        className={cn(
          "rounded-lg border p-3",
          wallet
            ? "border-emerald/20 bg-emerald/[0.02]"
            : "border-primary/25 bg-primary/[0.03]"
        )}
      >
        <div className="flex items-start gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.08]">
            <User className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium text-foreground">{devName}</p>
              <span className="rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-xs font-medium uppercase tracking-wider text-primary">
                You
              </span>
            </div>
            <p className="text-xs text-muted-foreground/60">{devRole} in this dispute</p>
          </div>
        </div>

        {wallet ? (
          <div className="mt-3 flex items-center gap-2 rounded-md bg-emerald/[0.06] px-2.5 py-1.5 border border-emerald/15">
            <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
            <span className="text-xs font-mono text-emerald/70">
              {wallet.slice(0, 6)}...{wallet.slice(-4)}
            </span>
          </div>
        ) : (
          <div className="mt-3 rounded-md border border-border bg-muted/10 px-2.5 py-1.5">
            <p className="text-xs text-muted-foreground/40">
              Wallet connects when signing the settlement
            </p>
          </div>
        )}
      </div>

      {/* Contract */}
      <div className="rounded-lg border border-border bg-card p-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Contract
        </span>
        <p className="text-sm text-foreground mt-2 mb-2.5">{contractScope}</p>

        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-md border border-border bg-background p-2.5 text-center">
            <span className="text-xs uppercase tracking-wider text-foreground/30 block mb-0.5">
              Value
            </span>
            <p className="font-mono text-base font-medium text-foreground">
              {contractValue}
            </p>
          </div>
          <div className="rounded-md border border-border bg-background p-2.5 text-center">
            <span className="text-xs uppercase tracking-wider text-foreground/30 block mb-0.5">
              Duration
            </span>
            <p className="font-mono text-base font-medium text-foreground">
              {contractDuration}
            </p>
          </div>
        </div>

        <div className="mt-2.5 pt-2.5 border-t border-border flex items-center gap-2.5">
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10">
            <Building className="size-3 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground">{clientName}</p>
            <p className="text-xs text-foreground/40">{clientRole}</p>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <span className="size-1 rounded-full bg-emerald" />
            <span className="text-xs font-mono text-emerald/50">0x8a4F...c91E</span>
          </div>
        </div>
      </div>

      {/* View Contract — standalone button */}
      {onViewContract && (
        <button
          onClick={onViewContract}
          className="group w-full rounded-lg border border-border bg-card p-3 transition-colors hover:border-primary/30 hover:bg-primary/[0.02]"
        >
          <div className="flex items-center gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.08] transition-colors group-hover:bg-primary/15">
              <FileText className="size-4 text-primary" />
            </div>
            <div className="text-left flex-1">
              <p className="text-sm font-medium text-foreground">View full contract</p>
              <p className="text-xs text-foreground/40">
                {scenario
                  ? `${scenario.evidence.length} evidence items · Payment schedule · Terms`
                  : "3 phases · Payment schedule · Terms"}
              </p>
            </div>
            <ArrowLeft className="size-3.5 text-muted-foreground/30 rotate-180 transition-transform group-hover:translate-x-0.5 group-hover:text-primary/50" />
          </div>
        </button>
      )}
    </div>
  );
}
