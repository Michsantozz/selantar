"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  FileText,
  X,
  Calendar,
  Link2,
  Clock,
  ShieldCheck,
  Shield,
  Gavel,
  Lock,
  CheckCircle,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Scenario } from "@/lib/scenarios";

/* ─── Types ─── */

export interface SettlementData {
  clientAmount: string;
  developerAmount: string;
  clientPercentage: number;
  developerPercentage: number;
  reasoning: string;
  conditions: string[];
}

interface SettlementModalProps {
  open: boolean;
  onClose: () => void;
  onSeal: (signature: string) => void;
  scenario?: Scenario | null;
  settlement: SettlementData;
  wallet: string | null;
  onConnectWallet: () => void;
}

/* ─── Wallet helpers ─── */

async function requestWallet(): Promise<string | null> {
  const eth = (
    window as unknown as {
      ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<string[] | string>;
      };
    }
  ).ethereum;
  if (!eth) {
    alert("Install MetaMask to continue");
    return null;
  }
  try {
    const accounts = (await eth.request({ method: "eth_requestAccounts" })) as string[];
    return accounts[0] ?? null;
  } catch {
    return null;
  }
}

async function personalSign(message: string, address: string): Promise<string | null> {
  const eth = (
    window as unknown as {
      ethereum?: {
        request: (args: { method: string; params?: unknown[] }) => Promise<string>;
      };
    }
  ).ethereum;
  if (!eth) return null;
  try {
    const signature = await eth.request({
      method: "personal_sign",
      params: [message, address],
    });
    return signature;
  } catch {
    return null;
  }
}

/* ─── Build amendment terms from dynamic settlement data ─── */

function buildAmendmentTerms(settlement: SettlementData, scenario?: Scenario | null) {
  const currency = scenario?.contract.currency ?? "USD";
  const conditions = settlement.conditions;

  // Extract timeline condition if exists
  const timelineCondition = conditions.find(
    (c) =>
      c.toLowerCase().includes("extension") ||
      c.toLowerCase().includes("deadline") ||
      c.toLowerCase().includes("hour") ||
      c.toLowerCase().includes("day")
  );

  // Extract completion condition
  const completionCondition = conditions.find(
    (c) =>
      c.toLowerCase().includes("complet") ||
      c.toLowerCase().includes("deliver") ||
      c.toLowerCase().includes("deploy") ||
      c.toLowerCase().includes("finish")
  );

  // Remaining conditions
  const otherConditions = conditions.filter(
    (c) => c !== timelineCondition && c !== completionCondition
  );

  const terms = [];

  if (timelineCondition) {
    terms.push({
      id: `§${terms.length + 1}`,
      title: "Timeline Extension",
      icon: Calendar,
      accent: "text-primary" as const,
      accentBorder: "border-primary/20" as const,
      text: timelineCondition,
    });
  }

  terms.push({
    id: `§${terms.length + 1}`,
    title: "Payment Adjustment",
    icon: Link2,
    accent: "text-emerald" as const,
    accentBorder: "border-emerald/20" as const,
    text: `Developer receives ${currency} ${settlement.developerAmount} (${settlement.developerPercentage}%). Client receives ${currency} ${settlement.clientAmount} (${settlement.clientPercentage}%).`,
  });

  if (completionCondition) {
    terms.push({
      id: `§${terms.length + 1}`,
      title: "Completion Obligations",
      icon: Clock,
      accent: "text-primary" as const,
      accentBorder: "border-primary/20" as const,
      text: completionCondition,
    });
  }

  // Add remaining conditions as mutual release / other terms
  if (otherConditions.length > 0) {
    terms.push({
      id: `§${terms.length + 1}`,
      title: "Mutual Release",
      icon: ShieldCheck,
      accent: "text-foreground/60" as const,
      accentBorder: "border-border" as const,
      text: otherConditions.join(". "),
    });
  } else {
    terms.push({
      id: `§${terms.length + 1}`,
      title: "Mutual Release",
      icon: ShieldCheck,
      accent: "text-foreground/60" as const,
      accentBorder: "border-border" as const,
      text: "Both parties waive further claims related to this dispute. This amendment supersedes all prior disputes.",
    });
  }

  return terms;
}

/* ═══════════════════════════════════════════════
   SETTLEMENT MODAL
   ═══════════════════════════════════════════════ */

export function SettlementModal({
  open,
  onClose,
  onSeal,
  scenario,
  settlement,
  wallet,
  onConnectWallet,
}: SettlementModalProps) {
  const [signing, setSigning] = useState(false);
  const [signed, setSigned] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [sealing, setSealing] = useState(false);

  const clientName = scenario?.parties.client.name ?? "Client";
  const devName = scenario?.parties.developer.name ?? "Developer";
  const contractScope = scenario?.contract.scope ?? "Dispute Resolution";
  const currency = scenario?.contract.currency ?? "USD";
  const contractRef = scenario
    ? `#SLT-${scenario.id.slice(0, 4).toUpperCase()}-A`
    : "#SLT-0000-A";

  const amendmentTerms = buildAmendmentTerms(settlement, scenario);

  const handleConnect = async () => {
    setConnecting(true);
    const addr = await requestWallet();
    if (addr) onConnectWallet();
    setConnecting(false);
  };

  const handleSign = async () => {
    if (!wallet) return;
    setSigning(true);

    const message = `I accept the Selantar settlement:
Contract: ${contractRef}
Client receives: ${currency} ${settlement.clientAmount}
Developer receives: ${currency} ${settlement.developerAmount}
Split: ${settlement.clientPercentage}/${settlement.developerPercentage}
Chain: Hedera Testnet (296)
Date: ${new Date().toISOString()}`;

    const signature = await personalSign(message, wallet);
    if (signature) {
      setSigned(true);
    }
    setSigning(false);
  };

  const handleSeal = async () => {
    if (!wallet || !signed) return;
    setSealing(true);

    const message = `I accept the Selantar settlement:
Contract: ${contractRef}
Client receives: ${currency} ${settlement.clientAmount}
Developer receives: ${currency} ${settlement.developerAmount}
Split: ${settlement.clientPercentage}/${settlement.developerPercentage}
Chain: Hedera Testnet (296)
Date: ${new Date().toISOString()}`;

    const signature = await personalSign(message, wallet);
    if (signature) {
      onSeal(signature);
    }
    setSealing(false);
  };

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
                  <span className="text-xs uppercase tracking-wider text-primary/60 block">
                    Contract Amendment
                  </span>
                  <h2 className="text-xl font-normal tracking-tight text-foreground">
                    Amendment {contractRef}
                  </h2>
                </div>
              </div>
              <p className="text-sm text-foreground/50">
                {contractScope} — Dispute resolution
              </p>

              {/* Meta */}
              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-foreground/30">
                <span>{new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}</span>
                <span>{contractRef.replace("-A", "")}</span>
              </div>
            </div>

            {/* Parties */}
            <div className="px-8 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background p-3.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-destructive/70 block mb-1.5">
                    Client
                  </span>
                  <p className="text-sm font-medium text-foreground">{clientName}</p>
                  <p className="text-xs text-foreground/50">
                    {scenario?.parties.client.role ?? "Client"}
                  </p>
                </div>
                <div className="rounded-md border border-primary/15 bg-primary/[0.02] p-3.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary block mb-1.5">
                    Contractor
                  </span>
                  <p className="text-sm font-medium text-foreground">{devName}</p>
                  <p className="text-xs text-foreground/50">
                    {scenario?.parties.developer.role ?? "Developer"}
                  </p>
                </div>
              </div>

              {/* Mediated by */}
              <div className="flex items-center gap-2 mt-2.5 rounded-md border border-border bg-muted/10 px-3.5 py-2">
                <Shield className="size-3.5 text-primary" />
                <span className="text-xs text-foreground/50">Mediated by</span>
                <span className="text-xs font-medium text-primary">Selantar AI</span>
              </div>
            </div>

            {/* Amendment Terms */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Amendment Terms
              </span>

              <div className="space-y-2.5">
                {amendmentTerms.map((term, i) => {
                  const TermIcon = term.icon;
                  return (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + 0.12 * i, duration: 0.4 }}
                      className={cn(
                        "rounded-md border bg-background p-3.5",
                        term.accentBorder
                      )}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn("text-sm font-mono font-medium", term.accent)}>
                          {term.id}
                        </span>
                        <TermIcon className={cn("size-4", term.accent)} />
                        <span className={cn("text-sm font-medium", term.accent)}>
                          {term.title}
                        </span>
                      </div>
                      <p className="text-[13px] leading-relaxed text-foreground/70">
                        {term.text}
                      </p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Reasoning */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Mediator Rationale
              </span>
              <div className="rounded-md border border-border bg-muted/10 p-3.5">
                <p className="text-[13px] leading-relaxed text-foreground/60">
                  {settlement.reasoning}
                </p>
              </div>
            </div>

            {/* Digital Signatures */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Digital Signatures
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Client signature — assumed signed (AI-mediated) */}
                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3.5">
                  <span className="text-xs text-foreground/40 block mb-1.5">Client</span>
                  <p
                    className="text-lg font-medium italic text-foreground/80"
                    style={{ fontFamily: "Georgia, serif" }}
                  >
                    {clientName.split(" ").map((n, i) => (i === 0 ? n.charAt(0) + "." : " " + n)).join("")}
                  </p>
                  <div className="flex items-center gap-1.5 mt-1.5">
                    <CheckCircle className="size-3 text-emerald" />
                    <span className="text-xs text-emerald/70">
                      Signed · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    </span>
                  </div>
                </div>

                {/* Contractor signature — you */}
                {wallet && signed ? (
                  <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3.5">
                    <span className="text-xs text-foreground/40 block mb-1.5">Contractor</span>
                    <p
                      className="text-lg font-medium italic text-foreground/80"
                      style={{ fontFamily: "Georgia, serif" }}
                    >
                      {devName.split(" ")[0]?.charAt(0) ?? ""}. {devName.split(" ").slice(1).join(" ") || devName}
                    </p>
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <CheckCircle className="size-3 text-emerald" />
                      <span className="text-xs text-emerald/70">
                        Signed · {new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                      </span>
                    </div>
                    <p className="text-xs font-mono text-foreground/25 mt-1">
                      {wallet.slice(0, 6)}...{wallet.slice(-4)}
                    </p>
                  </div>
                ) : wallet ? (
                  <div className="rounded-md border border-dashed border-primary/20 p-3.5">
                    <span className="text-xs text-foreground/40 block mb-1.5">Contractor</span>
                    <div className="flex items-center justify-center py-3">
                      <button
                        onClick={handleSign}
                        disabled={signing}
                        className="inline-flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {signing ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <span className="size-1.5 rounded-full border-2 border-primary" />
                        )}
                        {signing ? "Signing..." : "Sign with MetaMask"}
                      </button>
                    </div>
                    <p className="text-xs font-mono text-foreground/25 text-center">
                      {wallet.slice(0, 6)}...{wallet.slice(-4)}
                    </p>
                  </div>
                ) : (
                  <div className="rounded-md border border-dashed border-foreground/10 p-3.5">
                    <span className="text-xs text-foreground/40 block mb-1.5">Contractor</span>
                    <div className="flex items-center justify-center py-3">
                      <button
                        onClick={handleConnect}
                        disabled={connecting}
                        className="inline-flex items-center gap-2 text-xs font-medium text-primary transition-colors hover:text-primary/80"
                      >
                        {connecting ? (
                          <Loader2 className="size-3 animate-spin" />
                        ) : (
                          <span className="size-1.5 rounded-full border-2 border-primary" />
                        )}
                        {connecting ? "Connecting..." : "Connect wallet to sign"}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Seal button */}
            <div className="px-8 pt-4 pb-8">
              <button
                onClick={handleSeal}
                disabled={!wallet || !signed || sealing}
                className={cn(
                  "w-full rounded-md border py-3.5 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-wider transition-all",
                  wallet && signed
                    ? sealing
                      ? "border-primary/30 bg-primary/10 text-primary"
                      : "border-emerald/30 bg-emerald/10 text-emerald hover:bg-emerald/20"
                    : "border-border bg-muted/10 text-muted-foreground/30 cursor-not-allowed"
                )}
              >
                {sealing ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Sealing on-chain...
                  </>
                ) : (
                  <>
                    <Gavel className="size-4" />
                    {wallet && signed
                      ? "Seal & Record Contract On-Chain"
                      : !wallet
                        ? "Connect wallet to seal"
                        : "Sign the contract first"}
                    {wallet && signed && <Lock className="size-3.5" />}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
