"use client";

import { Badge } from "@/components/ui/badge";
import {
  Shield,
  Star,
  FileCheck,
  Zap,
  ExternalLink,
  Activity,
} from "lucide-react";

interface OnChainPanelProps {
  toolParts: Array<{
    type: string;
    state: string;
    output?: unknown;
    messageId: string;
  }>;
}

const registries = [
  {
    key: "identity",
    label: "Identity Registry",
    icon: Shield,
    address: "0x8004A818...BD9e",
    description: "Registro do agente",
  },
  {
    key: "reputation",
    label: "Reputation Registry",
    icon: Star,
    address: "0x8004B663...8713",
    description: "Feedback on-chain",
  },
  {
    key: "validation",
    label: "Validation Registry",
    icon: FileCheck,
    address: "0x8004A818...BD9e",
    description: "Evidencia verificavel",
  },
];

export function OnChainPanel({ toolParts }: OnChainPanelProps) {
  // Extract on-chain transactions from tool outputs
  const txParts = toolParts.filter(
    (p) =>
      p.state === "output-available" &&
      (p.type === "tool-executeSettlement" ||
        p.type === "tool-postFeedback" ||
        p.type === "tool-registerVerdict")
  );

  const txs = txParts.map((p) => {
    const output = p.output as Record<string, unknown> | undefined;
    return {
      type: p.type.replace("tool-", ""),
      txHash: (output?.txHash as string) ?? "",
      status: (output?.status as string) ?? "pending",
      chain: (output?.chain as string) ?? "Base Sepolia",
    };
  });

  return (
    <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Activity className="size-3.5 text-primary" />
          <span className="text-xs font-medium uppercase tracking-wider">
            On-Chain
          </span>
        </div>
        <Badge
          variant="secondary"
          className="text-[10px] font-mono h-5 px-1.5 gap-1"
        >
          <span className="size-1.5 rounded-full bg-emerald" />
          ERC-8004
        </Badge>
      </div>

      {/* Registries */}
      <div className="flex-1 overflow-auto p-3 space-y-2">
        <div className="grid grid-cols-3 gap-2">
          {registries.map((reg) => {
            const Icon = reg.icon;
            return (
              <div
                key={reg.key}
                className="group rounded-lg border border-border/50 bg-secondary/20 p-3 transition-colors hover:border-primary/20 hover:bg-secondary/40"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex size-6 items-center justify-center rounded-md bg-primary/8">
                    <Icon className="size-3 text-primary/70" />
                  </div>
                </div>
                <div className="text-[11px] font-medium leading-tight mb-0.5">
                  {reg.label}
                </div>
                <div className="text-[10px] text-muted-foreground/60 font-mono truncate">
                  {reg.address}
                </div>
              </div>
            );
          })}
        </div>

        {/* Transactions */}
        <div className="mt-3">
          <div className="flex items-center gap-2 mb-2">
            <Zap className="size-3 text-primary/60" />
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider">
              Transacoes
            </span>
          </div>

          {txs.length === 0 ? (
            <div className="rounded-lg border border-dashed border-border/50 p-4 text-center">
              <p className="text-[11px] text-muted-foreground/40">
                Nenhuma transacao registrada
              </p>
            </div>
          ) : (
            <div className="space-y-1.5">
              {txs.map((tx, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-lg border border-border/30 bg-secondary/10 px-3 py-2"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="size-1.5 shrink-0 rounded-full bg-emerald" />
                    <span className="text-[11px] font-medium truncate">
                      {tx.type}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {tx.txHash && (
                      <span className="text-[10px] font-mono text-muted-foreground/50 hidden sm:inline">
                        {tx.txHash.slice(0, 6)}...{tx.txHash.slice(-4)}
                      </span>
                    )}
                    <Badge
                      variant="secondary"
                      className="text-[9px] h-4 px-1"
                    >
                      {tx.status}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
