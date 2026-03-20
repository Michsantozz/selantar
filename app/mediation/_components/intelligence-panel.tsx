"use client";

import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  AlertTriangle,
} from "lucide-react";
import type { Scenario } from "@/lib/scenarios";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface IntelligencePanelProps {
  scenario?: Scenario;
}

export function IntelligencePanel({ scenario }: IntelligencePanelProps) {
  const clientName = scenario?.parties.client.name ?? "Client";
  const devName = scenario?.parties.developer.name ?? "Developer";

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Contract Progress — visual phase tracker */}
      <div className="rounded-xl border border-border bg-card p-5">
        <Collapsible defaultOpen>
          <CollapsibleTrigger className="flex w-full items-center gap-2">
            <span className="size-2 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contract Progress
            </span>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-3">
              {/* Phase 1 */}
              <div className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10">
                  <CheckCircle className="size-3 text-emerald" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    Phase 1 — Discovery & Planning
                  </p>
                  <p className="text-[10px] font-mono text-emerald">
                    100 USDC Released
                  </p>
                </div>
              </div>

              {/* Phase 2 */}
              <div className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-emerald/30 bg-emerald/10">
                  <CheckCircle className="size-3 text-emerald" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    Phase 2 — AI Build & Training
                  </p>
                  <p className="text-[10px] font-mono text-emerald">
                    150 USDC Released
                  </p>
                </div>
              </div>

              {/* Phase 3 — in dispute */}
              <div className="flex items-center gap-3">
                <div className="flex size-6 shrink-0 items-center justify-center rounded-full border border-primary/30 bg-primary/10">
                  <AlertTriangle className="size-3 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-foreground">
                    Phase 3 — Calendar Integration
                  </p>
                  <div className="flex items-center gap-1.5">
                    <Badge
                      variant="outline"
                      className="text-[9px] h-4 px-1 border-primary/20 text-primary/70"
                    >
                      In Mediation
                    </Badge>
                    <span className="text-[10px] font-mono text-primary">
                      → 20% off
                    </span>
                  </div>
                </div>
              </div>

              {/* Escrow bar */}
              <div className="pt-3 border-t border-border">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                    Escrow
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground/40">
                    500 total
                  </span>
                </div>
                <div className="h-2 w-full rounded-full overflow-hidden bg-muted/50 border border-border">
                  <div className="flex h-full">
                    <div
                      className="bg-emerald h-full"
                      style={{ width: "50%" }}
                    />
                    <div
                      className="bg-primary/60 h-full"
                      style={{ width: "50%" }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-between mt-1">
                  <span className="text-[10px] text-emerald font-mono">
                    250 released
                  </span>
                  <span className="text-[10px] text-primary font-mono">
                    250 locked
                  </span>
                </div>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>
      </div>

      {/* Evidence — colored items */}
      <div className="rounded-xl border border-border bg-card p-5 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Evidence
          </span>
        </div>

        <div className="space-y-2">
          {scenario ? (
            scenario.evidence.map((item, i) => (
              <EvidenceItem key={i} text={item} status="verified" />
            ))
          ) : (
            <>
              <EvidenceItem
                text="Calendar link sent: Tuesday 09:14am"
                status="verified"
              />
              <EvidenceItem
                text="AI model: fully trained & tested"
                status="verified"
              />
              <EvidenceItem
                text="Front desk: did not follow up on message"
                status="breach"
              />
              <EvidenceItem
                text="Phases 1 & 2: completed successfully ✓"
                status="verified"
              />
              <EvidenceItem
                text="POST /schedule returning 503 in production"
                status="breach"
              />
              <EvidenceItem
                text="3 triaged patients — 51h avg response (SLA: 24h)"
                status="breach"
              />
            </>
          )}
        </div>
      </div>

      {/* ERC-8004 Status */}
      <div className="rounded-xl border border-primary/20 bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-primary/70">
            Settlement Status
          </span>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {devName}
            </span>
            <span className="text-sm font-mono text-foreground">
              200 USDC
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              {clientName}
            </span>
            <span className="text-sm font-mono text-foreground">
              50 USDC
            </span>
          </div>
          <div className="h-px bg-border my-1" />
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground/60">Split</span>
            <span className="text-[11px] font-mono text-primary">
              80 / 20
            </span>
          </div>
        </div>

        <Badge
          variant="outline"
          className="mt-3 w-full justify-center border-emerald/30 bg-emerald/10 text-emerald text-[10px] uppercase tracking-wider py-1"
        >
          <CheckCircle className="size-3 mr-1.5" />
          Confirmed on-chain
        </Badge>
      </div>
    </div>
  );
}

function EvidenceItem({
  text,
  status,
}: {
  text: string;
  status: "verified" | "breach";
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${
        status === "verified"
          ? "border-border bg-muted/10"
          : "border-destructive/20 bg-destructive/[0.04]"
      }`}
    >
      <div
        className={`flex size-5 shrink-0 items-center justify-center rounded mt-0.5 ${
          status === "verified" ? "bg-emerald/10" : "bg-destructive/10"
        }`}
      >
        {status === "verified" ? (
          <CheckCircle className="size-3 text-emerald" />
        ) : (
          <AlertTriangle className="size-3 text-destructive" />
        )}
      </div>
      <p
        className={`text-[11px] leading-relaxed ${
          status === "verified"
            ? "text-muted-foreground"
            : "text-destructive/80"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
