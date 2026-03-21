"use client";

import { motion, AnimatePresence } from "motion/react";
import { FileText, X, Shield, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/lib/scenarios";

interface OriginalContractModalProps {
  open: boolean;
  onClose: () => void;
  scenario?: Scenario | null;
}

export function OriginalContractModal({
  open,
  onClose,
  scenario,
}: OriginalContractModalProps) {
  const clientName = scenario?.parties.client.name ?? "Client";
  const clientRole = scenario?.parties.client.role ?? "Client";
  const devName = scenario?.parties.developer.name ?? "Developer";
  const devRole = scenario?.parties.developer.role ?? "Developer";
  const contractScope = scenario?.contract.scope ?? "Service Agreement";
  const currency = scenario?.contract.currency ?? "USD";
  const duration = scenario?.contract.duration ?? "N/A";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-md border border-border bg-muted/20 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground z-10"
            >
              <X className="size-4" />
            </button>

            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-lg border border-primary/20 bg-primary/[0.06]">
                  <FileText className="size-5 text-primary" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-foreground/40 block">
                    Original Contract
                  </span>
                  <h2 className="text-xl font-normal tracking-tight text-foreground">
                    Service Agreement #SLT-{scenario?.id.slice(0, 4).toUpperCase() ?? "0000"}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-foreground/50">{contractScope}</p>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-foreground/30">
                <span>February 12, 2026</span>
                <span>{duration}</span>
              </div>
            </div>

            {/* Parties */}
            <div className="px-8 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background p-3.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary block mb-1.5">
                    Client
                  </span>
                  <p className="text-sm font-medium text-foreground">{clientName}</p>
                  <p className="text-xs text-foreground/50">{clientRole}</p>
                </div>
                <div className="rounded-md border border-primary/15 bg-primary/[0.02] p-3.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary block mb-1.5">
                    Contractor
                  </span>
                  <p className="text-sm font-medium text-foreground">{devName}</p>
                  <p className="text-xs text-foreground/50">{devRole}</p>
                </div>
              </div>
            </div>

            {/* Scope & Phases */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Scope of Work
              </span>
              <p className="text-sm leading-relaxed text-foreground/70 mb-4">
                {scenario?.dispute
                  ? `${contractScope}. ${scenario.dispute}`
                  : contractScope}
              </p>

              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Payment Schedule
              </span>
              <div className="space-y-2">
                {scenario?.evidence ? (
                  // Generate phase cards from evidence count (generic)
                  <>
                    <PhaseCard
                      id="§1"
                      title="Phase 1 — Discovery & Planning"
                      amount={`${currency} ${Math.round(parseFloat(scenario.contract.value.replace(/,/g, "")) * 0.2).toLocaleString()}`}
                      description="Requirements gathering, wireframes, architecture."
                      status="done"
                    />
                    <PhaseCard
                      id="§2"
                      title="Phase 2 — Build & Delivery"
                      amount={`${currency} ${Math.round(parseFloat(scenario.contract.value.replace(/,/g, "")) * 0.3).toLocaleString()}`}
                      description="Core development, testing, integration."
                      status="done"
                    />
                    <PhaseCard
                      id="§3"
                      title="Phase 3 — Final Delivery"
                      amount={`${currency} ${Math.round(parseFloat(scenario.contract.value.replace(/,/g, "")) * 0.5).toLocaleString()}`}
                      description="Final integration, deployment, go-live."
                      status="disputed"
                    />
                  </>
                ) : (
                  <p className="text-xs text-muted-foreground/40">
                    No phase details available.
                  </p>
                )}
              </div>
            </div>

            {/* Terms */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Terms
              </span>
              <div className="space-y-2 text-xs leading-relaxed text-foreground/50">
                <p>
                  All payments held in escrow and released upon phase approval by
                  client.
                </p>
                <p>
                  Client must provide necessary access credentials within 5
                  business days of each phase start.
                </p>
                <p>
                  Disputes resolved via Selantar AI mediation. Settlement executed
                  on-chain.
                </p>
              </div>
            </div>

            {/* On-chain Signatures */}
            <div className="px-8 pt-5 pb-8">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                On-Chain Signatures
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3.5">
                  <span className="text-xs text-foreground/40 block mb-1.5">
                    Client
                  </span>
                  <p
                    className="text-lg font-medium italic text-foreground/80"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {clientName
                      .split(" ")
                      .map((n, i) => (i === 0 ? n.charAt(0) + "." : " " + n))
                      .join("")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="size-3 text-emerald" />
                    <span className="text-xs text-emerald/70">Signed on-chain</span>
                  </div>
                  <p className="text-xs font-mono text-foreground/25 mt-1">
                    0x8a4F...c91E · Feb 12, 2026
                  </p>
                </div>

                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3.5">
                  <span className="text-xs text-foreground/40 block mb-1.5">
                    Contractor
                  </span>
                  <p
                    className="text-lg font-medium italic text-foreground/80"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {devName.split(" ")[0]?.charAt(0) ?? ""}
                    {". "}
                    {devName.split(" ").slice(1).join(" ") || devName}
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircle className="size-3 text-emerald" />
                    <span className="text-xs text-emerald/70">Signed on-chain</span>
                  </div>
                  <p className="text-xs font-mono text-foreground/25 mt-1">
                    0x3777...7db4 · Feb 12, 2026
                  </p>
                </div>
              </div>

              {/* TX proof */}
              <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-muted/10 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <Shield className="size-3.5 text-primary" />
                  <span className="text-xs text-foreground/50">
                    Verified on Base Sepolia
                  </span>
                </div>
                <span className="text-xs font-mono text-primary/50">
                  TX: 0xb5d3...01e86
                </span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function PhaseCard({
  id,
  title,
  amount,
  description,
  status,
}: {
  id: string;
  title: string;
  amount: string;
  description: string;
  status: "done" | "disputed" | "pending";
}) {
  return (
    <div
      className={cn(
        "rounded-md border p-3",
        status === "done" && "border-emerald/15 bg-emerald/[0.03]",
        status === "disputed" && "border-primary/15 bg-primary/[0.03]",
        status === "pending" && "border-border bg-muted/10"
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "text-sm font-mono font-medium",
              status === "done" && "text-emerald",
              status === "disputed" && "text-primary",
              status === "pending" && "text-muted-foreground"
            )}
          >
            {id}
          </span>
          <span className="text-sm font-medium text-foreground/80">{title}</span>
        </div>
        <span
          className={cn(
            "text-sm font-mono",
            status === "done" && "text-emerald",
            status === "disputed" && "text-primary",
            status === "pending" && "text-muted-foreground/40"
          )}
        >
          {amount}
        </span>
      </div>
      <p className="text-xs text-foreground/50 mt-1">{description}</p>
    </div>
  );
}
