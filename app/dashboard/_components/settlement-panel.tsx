"use client";

import { Badge } from "@/components/ui/badge";
import {
  Handshake,
  Zap,
  FileCheck,
  Star,
  ArrowRight,
  TrendingUp,
} from "lucide-react";

interface SettlementPanelProps {
  data: Array<{
    type: string;
    output: Record<string, unknown>;
  }>;
}

export function SettlementPanel({ data }: SettlementPanelProps) {
  const proposal = data.find((d) => d.type === "proposeSettlement");
  const execution = data.find((d) => d.type === "executeSettlement");
  const verdict = data.find((d) => d.type === "registerVerdict");
  const feedback = data.find((d) => d.type === "postFeedback");

  const proposalData = proposal?.output as {
    proposal?: {
      clientAmount?: string;
      developerAmount?: string;
      clientPercentage?: number;
    };
    reasoning?: string;
  } | undefined;

  // Pipeline steps
  const steps = [
    { key: "proposeSettlement", label: "Proposta", icon: Handshake, done: !!proposal },
    { key: "executeSettlement", label: "Execucao", icon: Zap, done: !!execution },
    { key: "postFeedback", label: "Feedback", icon: Star, done: !!feedback },
    { key: "registerVerdict", label: "Veredito", icon: FileCheck, done: !!verdict },
  ];

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <TrendingUp className="size-3.5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider">
            Settlement
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-3 space-y-3">
        {/* Pipeline Progress */}
        <div className="flex items-center gap-1">
          {steps.map((step, i) => {
            const Icon = step.icon;
            return (
              <div key={step.key} className="flex items-center gap-1">
                <div
                  className={`flex size-7 items-center justify-center rounded-lg transition-colors ${
                    step.done
                      ? "bg-primary/10"
                      : "bg-secondary/30"
                  }`}
                  title={step.label}
                >
                  <Icon
                    className={`size-3 ${
                      step.done
                        ? "text-primary"
                        : "text-muted-foreground/30"
                    }`}
                  />
                </div>
                {i < steps.length - 1 && (
                  <ArrowRight
                    className={`size-2.5 ${
                      step.done
                        ? "text-primary/40"
                        : "text-muted-foreground/15"
                    }`}
                  />
                )}
              </div>
            );
          })}
        </div>

        {/* Settlement Amounts */}
        {proposalData?.proposal ? (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-primary/5 border border-primary/10 px-3 py-2.5">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  Cliente
                </span>
                <div className="text-lg font-medium text-primary font-mono mt-0.5">
                  ${proposalData.proposal.clientAmount}
                </div>
                <span className="text-[10px] text-muted-foreground/40 font-mono">
                  {proposalData.proposal.clientPercentage}%
                </span>
              </div>
              <div className="rounded-lg bg-secondary/30 border border-border/30 px-3 py-2.5">
                <span className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">
                  Dev
                </span>
                <div className="text-lg font-medium font-mono mt-0.5">
                  ${proposalData.proposal.developerAmount}
                </div>
                <span className="text-[10px] text-muted-foreground/40 font-mono">
                  {100 - (proposalData.proposal.clientPercentage ?? 0)}%
                </span>
              </div>
            </div>

            {proposalData.reasoning && (
              <p className="text-[11px] leading-relaxed text-muted-foreground/60 line-clamp-3">
                {proposalData.reasoning}
              </p>
            )}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-border/50 p-4 text-center">
            <Handshake className="size-5 mx-auto mb-2 text-muted-foreground/20" />
            <p className="text-[11px] text-muted-foreground/40">
              Aguardando proposta de settlement
            </p>
          </div>
        )}

        {/* Execution status */}
        {execution && (
          <div className="rounded-lg border border-emerald/20 bg-emerald/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <Zap className="size-3 text-emerald" />
              <span className="text-[11px] font-medium text-emerald">
                Settlement executado
              </span>
            </div>
            {(() => {
              const txHash = (execution.output as Record<string, unknown>)?.txHash;
              if (!txHash) return null;
              return (
                <span className="text-[10px] font-mono text-muted-foreground/40 mt-1 block">
                  TX: {String(txHash).slice(0, 10)}...
                </span>
              );
            })()}
          </div>
        )}

        {/* Verdict status */}
        {verdict && (
          <div className="rounded-lg border border-primary/20 bg-primary/5 px-3 py-2">
            <div className="flex items-center gap-2">
              <FileCheck className="size-3 text-primary" />
              <span className="text-[11px] font-medium text-primary">
                Veredito registrado
              </span>
            </div>
            <Badge variant="secondary" className="text-[9px] h-4 mt-1">
              ERC-8004 Validation
            </Badge>
          </div>
        )}
      </div>
    </div>
  );
}
