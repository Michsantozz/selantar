"use client";

/**
 * DEMO STATIC — Mediation Suasuna
 * Página isolada com a cena completa hardcoded.
 * Não usa agente, não faz API calls — tudo fixo para a pitch demo.
 * Rota: /forge/demo/mediation
 */

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  CheckCircle,
  AlertTriangle,
  Lock,
  FileText,
  X,
  Calendar,
  Link2,
  Clock,
  ShieldCheck,
  Shield,
  User,
  Building,
  Scale,
  ExternalLink,
  Gavel,
  Brain,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { registerDemoAction } from "@/lib/demo-actions";

/* ─── Static data ─── */

const SETTLEMENT = {
  clientAmount: "3,000",
  developerAmount: "12,000",
  clientPercentage: 20,
  developerPercentage: 80,
  reasoning:
    "Both parties share responsibility. Secretary failed to respond to access requests; developer failed to escalate through alternative channels. 20% discount reflects shared accountability while preserving the business relationship.",
};

const CONTRACT_REF = "#SLT-CLIN-A";

const EVIDENCE = [
  { text: "WhatsApp: 5 messages requesting CRM credentials — no reply", status: "verified" as const },
  { text: "CRM audit: dev account never activated (blocked since day 41)", status: "verified" as const },
  { text: "Phase 1 & 2 delivered on time — all milestones approved", status: "verified" as const },
  { text: "No escalation attempt by dev after day 44 (3-day silence)", status: "warning" as const },
  { text: "Complaint filed day 62 — 21 days after block started", status: "breach" as const },
];

const CHAT_MESSAGES = [
  {
    id: "client-1",
    role: "user" as const,
    name: "Dr. Suasuna",
    text: `I paid R$30,000 and the system STILL can't schedule appointments. My patients are going to the clinic down the street. It's been 60 days — I want my money back. All of it.`,
  },
  {
    id: "clara-1",
    role: "assistant" as const,
    name: "Clara",
    tools: ["WhatsApp audit", "CRM scan"],
    text: `Five messages asking for access credentials. Zero reply. The developer wasn't slacking — they were locked out.`,
  },
  {
    id: "clara-2",
    role: "assistant" as const,
    name: "Clara",
    text: `Doctor Suasuna, when was the last time you personally checked on this project?`,
    highlight: "He goes quiet. He knows. Handed it off and never looked back.",
  },
  {
    id: "clara-3",
    role: "assistant" as const,
    name: "Clara",
    text: `And ULTRASELF — when the emails stopped coming back, what else did you try?`,
    highlight: "Five emails into the void. Could have picked up the phone.",
  },
  {
    id: "clara-4",
    role: "assistant" as const,
    name: "Clara",
    text: `Every day this stays offline, doctor loses patients, developer loses reputation. The only winner is the clinic down the street. So — one question: what would it take to get this live by Thursday?`,
  },
  {
    id: "dev-1",
    role: "user" as const,
    name: "Matheus",
    text: `Give me the credentials and forty-eight hours.`,
  },
  {
    id: "client-2",
    role: "user" as const,
    name: "Dr. Suasuna",
    text: `A discount. If it's not working by Thursday, my nephew is a lawyer.`,
  },
  {
    id: "clara-5",
    role: "assistant" as const,
    name: "Clara",
    tools: ["Settlement proposal", "Verdict registration"],
    txHash: "0x9f7c501eaa544a56144e9018f1f0d49182943e7c84500efd751571b4c85b1b52",
    text: `Twenty percent. Nobody imposed that number — they built it. I just held the space. Escrow locked until patients can actually book. Sealed on-chain.`,
    badge: "Settlement sealed",
  },
];

const TIMELINE = [
  { label: "Contract signed", date: "Feb 12", status: "done" as const },
  { label: "Phase 1 — Discovery", date: "Feb 28", status: "done" as const, usdc: "R$15k" },
  { label: "Phase 2 — Build", date: "Mar 10", status: "done" as const, usdc: "R$15k" },
  { label: "Phase 3 — Delivery", date: "Mar 15", status: "disputed" as const, usdc: "R$15k" },
  { label: "Dispute filed", date: "Mar 15", status: "active" as const },
  { label: "Settlement", date: "Mar 22", status: "done" as const },
];

/* ─── Sub-components ─── */

function ToolSteps({ tools, txHash }: { tools: string[]; txHash?: string }) {
  return (
    <div className="mb-2 rounded-md border border-border bg-muted/10 px-3 py-2">
      <div className="flex items-center gap-3">
        {tools.map((t) => (
          <div key={t} className="flex items-center gap-1.5">
            <CheckCircle className="size-3 text-emerald/60 shrink-0" />
            <span className="text-[10px] text-muted-foreground/60">{t}</span>
          </div>
        ))}
      </div>
      {txHash && (
        <div className="flex items-center gap-2 mt-1.5 pt-1.5 border-t border-border">
          <span className="text-[9px] font-mono text-muted-foreground/30">
            {txHash.slice(0, 14)}...{txHash.slice(-4)}
          </span>
          <a
            href={`https://hashscan.io/testnet/transaction/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-[9px] font-mono text-primary hover:underline"
          >
            BaseScan <ExternalLink className="size-2.5" />
          </a>
        </div>
      )}
    </div>
  );
}

/* ─── Settlement Modal ─── */

function DemoSettlementModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const terms = [
    {
      id: "§1", title: "48-Hour Extension", icon: Calendar,
      accent: "text-primary", border: "border-primary/20",
      text: "ULTRASELF has 48 hours to deliver a working booking system. Clock starts at signature.",
    },
    {
      id: "§2", title: "20% Discount", icon: Link2,
      accent: "text-emerald", border: "border-emerald/20",
      text: "Developer receives BRL 12,000 (80%). Client receives BRL 3,000 (20%) discount for shared delay.",
    },
    {
      id: "§3", title: "Escrow Protection", icon: Clock,
      accent: "text-primary", border: "border-primary/20",
      text: "Remaining R$12,000 releases only when booking system is live and verified. Failure returns all funds.",
    },
    {
      id: "§4", title: "Mutual Release", icon: ShieldCheck,
      accent: "text-foreground/60", border: "border-border",
      text: "Both parties waive further claims. This amendment supersedes all prior disputes.",
    },
  ];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            id="med-settlement-modal"
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card"
          >
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
                  <span className="text-xs uppercase tracking-wider text-primary/60 block">Contract Amendment</span>
                  <h2 className="text-xl font-normal tracking-tight text-foreground">Amendment {CONTRACT_REF}</h2>
                </div>
              </div>
              <p className="text-sm text-foreground/50">CRM for medical clinic — Dispute resolution</p>
            </div>

            {/* Parties */}
            <div className="px-8 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background p-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-destructive/70 block mb-1">Client</span>
                  <p className="text-sm font-medium text-foreground">Dr. Suasuna</p>
                  <p className="text-xs text-foreground/50">Clinic owner</p>
                </div>
                <div className="rounded-md border border-primary/15 bg-primary/[0.02] p-3">
                  <span className="text-xs font-medium uppercase tracking-wider text-primary block mb-1">Contractor</span>
                  <p className="text-sm font-medium text-foreground">ULTRASELF</p>
                  <p className="text-xs text-foreground/50">AI agency</p>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-2 rounded-md border border-border bg-muted/10 px-3 py-1.5">
                <Shield className="size-3.5 text-primary" />
                <span className="text-xs text-foreground/50">Mediated by</span>
                <span className="text-xs font-medium text-primary">Selantar AI</span>
              </div>
            </div>

            {/* Terms */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2">Amendment Terms</span>
              <div className="space-y-2">
                {terms.map((term, i) => {
                  const Icon = term.icon;
                  return (
                    <motion.div
                      key={term.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + 0.1 * i, duration: 0.4 }}
                      className={cn("rounded-md border bg-background p-3", term.border)}
                    >
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className={cn("text-sm font-mono font-medium", term.accent)}>{term.id}</span>
                        <Icon className={cn("size-3.5", term.accent)} />
                        <span className={cn("text-xs font-medium", term.accent)}>{term.title}</span>
                      </div>
                      <p className="text-xs leading-relaxed text-foreground/70">{term.text}</p>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Rationale */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2">Mediator Rationale</span>
              <div className="rounded-md border border-border bg-muted/10 p-3">
                <p className="text-xs leading-relaxed text-foreground/60">{SETTLEMENT.reasoning}</p>
              </div>
            </div>

            {/* Signatures */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2">Digital Signatures</span>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3">
                  <span className="text-xs text-foreground/40 block mb-1">Client</span>
                  <p className="text-base font-medium italic text-foreground/80" style={{ fontFamily: "Georgia, serif" }}>Dr. Suasuna</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle className="size-3 text-emerald" />
                    <span className="text-[10px] text-emerald/70">Signed · March 22, 2026</span>
                  </div>
                </div>
                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3">
                  <span className="text-xs text-foreground/40 block mb-1">Contractor</span>
                  <p className="text-base font-medium italic text-foreground/80" style={{ fontFamily: "Georgia, serif" }}>ULTRASELF</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <CheckCircle className="size-3 text-emerald" />
                    <span className="text-[10px] text-emerald/70">Signed · March 22, 2026</span>
                  </div>
                  <p className="text-[10px] font-mono text-foreground/25 mt-0.5">0x1a2b...3c4d</p>
                </div>
              </div>
            </div>

            {/* Sealed */}
            <div className="px-8 pt-4 pb-6">
              <div className="w-full rounded-md border border-emerald/30 bg-emerald/10 py-3 flex items-center justify-center gap-3 text-sm font-medium uppercase tracking-wider text-emerald">
                <CheckCircle className="size-4" />
                Sealed & Recorded On-Chain
                <Lock className="size-3.5" />
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */

export default function DemoMediationPage() {
  const [showModal, setShowModal] = useState(false);

  const openModal = useCallback(() => setShowModal(true), []);

  useEffect(() => {
    registerDemoAction("med-start", () => {});
    registerDemoAction("med-review-settlement", openModal);
    registerDemoAction("med-close-settlement", () => setShowModal(false));
  }, [openModal]);

  return (
    <div className="relative min-h-screen bg-background">
      <div className="relative mx-auto max-w-[1600px] px-4 py-4 lg:px-6">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
          className="mb-3 flex items-center justify-between"
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="size-2 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">Live Mediation</span>
            </div>
            <div className="h-4 w-px bg-border" />
            <span className="text-xs text-muted-foreground/50 font-mono">The Suasuna Clinic</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="rounded-md border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">ERC-8004</span>
            <div className="flex items-center gap-1.5">
              <span className="size-1.5 rounded-full bg-primary animate-subtle-pulse" />
              <span className="text-[11px] font-mono text-muted-foreground/50">Hedera Testnet</span>
            </div>
          </div>
        </motion.div>

        {/* 3-Panel Grid */}
        <div className="grid h-[calc(100vh-9rem)] grid-cols-1 gap-3 lg:grid-cols-12">

          {/* ── Left: Case Info ── */}
          <motion.div
            id="med-case-info"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0, duration: 0.4 }}
            className="lg:col-span-3 min-h-0 overflow-y-auto"
          >
            <div className="flex h-full flex-col gap-2.5">
              {/* Developer */}
              <div className="rounded-lg border border-primary/25 bg-primary/[0.03] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.08]">
                    <User className="size-3.5 text-primary" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-foreground">ULTRASELF</p>
                      <span className="rounded border border-primary/25 bg-primary/10 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wider text-primary">You</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground/60">AI agency</p>
                  </div>
                </div>
              </div>

              {/* Client */}
              <div className="rounded-lg border border-border p-3">
                <div className="flex items-center gap-3">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-border bg-muted/[0.3]">
                    <Building className="size-3.5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">Dr. Suasuna</p>
                    <p className="text-[10px] text-muted-foreground/60">Clinic owner — complainant</p>
                  </div>
                </div>
              </div>

              {/* Contract */}
              <div className="rounded-lg border border-border p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-2">Contract</p>
                <div className="space-y-1 text-xs">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/50">Value</span>
                    <span className="font-mono text-foreground">BRL 45,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/50">Escrow</span>
                    <span className="font-mono text-foreground">R$15,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground/50">Duration</span>
                    <span className="font-mono text-foreground">90 days</span>
                  </div>
                </div>
                <button
                  onClick={() => setShowModal(true)}
                  className="mt-2.5 flex items-center gap-1.5 text-[10px] text-primary hover:underline"
                >
                  <FileText className="size-3" />
                  View settlement
                </button>
              </div>

              {/* Dispute */}
              <div className="rounded-lg border border-destructive/15 bg-destructive/[0.02] p-3">
                <p className="text-[10px] font-medium uppercase tracking-wider text-destructive/60 mb-1">Dispute</p>
                <p className="text-[11px] text-foreground/60 leading-relaxed">
                  Phase 3 stalled. Secretary ignored 5 credential requests for 3 weeks. Doctor filed complaint on day 62.
                </p>
              </div>
            </div>
          </motion.div>

          {/* ── Center: Chat ── */}
          <motion.div
            id="med-chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06, duration: 0.4 }}
            className="lg:col-span-6 min-h-0"
          >
            <div className="flex h-full flex-col rounded-xl border border-border bg-card overflow-hidden">
              {/* Chat header */}
              <div className="flex items-center gap-2 border-b border-border px-4 py-2.5">
                <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.06]">
                  <Scale className="size-3.5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">Clara</p>
                  <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Mediator</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5">
                  <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse" />
                  <span className="text-[10px] font-mono text-emerald/60">Resolved</span>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {CHAT_MESSAGES.map((msg) => (
                  <div key={msg.id} className="flex gap-2.5">
                    <div className={cn(
                      "flex size-6 shrink-0 items-center justify-center rounded-full text-[9px] font-medium mt-0.5",
                      msg.role === "assistant" && "bg-primary/10 text-primary border border-primary/20",
                      msg.name === "Dr. Suasuna" && "bg-muted/40 text-muted-foreground border border-border",
                      msg.name === "Matheus" && "bg-emerald/10 text-emerald border border-emerald/20",
                    )}>
                      {msg.name === "Dr. Suasuna" ? "S" : msg.name === "Matheus" ? "M" : "C"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-xs font-medium text-foreground">{msg.name}</span>
                        <span className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">
                          {msg.name === "Dr. Suasuna" ? "Client" : msg.name === "Matheus" ? "Developer" : "Mediator"}
                        </span>
                      </div>

                      {msg.role === "assistant" && msg.tools && (
                        <ToolSteps tools={msg.tools} txHash={msg.txHash} />
                      )}

                      {/* Highlight callout — strategic insight */}
                      {"highlight" in msg && msg.highlight && (
                        <div className="mb-1.5 flex items-center gap-2 rounded-md border border-amber-500/20 bg-amber-500/[0.06] px-2.5 py-1.5">
                          <AlertTriangle className="size-3 shrink-0 text-amber-500" />
                          <span className="text-[11px] font-medium text-amber-400/90">{msg.highlight}</span>
                        </div>
                      )}

                      <div className={cn(
                        "rounded-lg px-3 py-2 text-[13px] leading-relaxed",
                        msg.role === "assistant" && "bg-primary/[0.04] text-foreground/90 border border-primary/10",
                        msg.name === "Dr. Suasuna" && "bg-muted/20 text-foreground/80 border border-border",
                        msg.name === "Matheus" && "bg-emerald/[0.04] text-foreground/80 border border-emerald/15",
                      )}>
                        {msg.text}
                      </div>

                      {msg.badge && (
                        <div className="mt-1.5 flex items-center gap-2">
                          <span className="inline-flex items-center gap-1.5 rounded-md border border-primary/20 bg-primary/[0.06] px-2 py-0.5 text-[10px] font-medium text-primary">
                            <CheckCircle className="size-2.5" />
                            {msg.badge}
                          </span>
                          <button
                            onClick={() => setShowModal(true)}
                            className="inline-flex items-center gap-1.5 rounded-md border border-border bg-muted/10 px-2 py-0.5 text-[10px] font-medium text-foreground/60 hover:text-foreground transition-colors"
                          >
                            Review
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {/* Settled footer */}
              <div className="border-t border-border px-4 py-2.5 bg-emerald/[0.02]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="size-3.5 text-emerald" />
                    <span className="text-[11px] text-emerald/70 font-medium">Settled on-chain</span>
                  </div>
                  <span className="text-[10px] font-mono text-muted-foreground/30">Mar 22, 2026</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* ── Right: Intelligence ── */}
          <motion.div
            id="med-intelligence"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.12, duration: 0.4 }}
            className="lg:col-span-3 min-h-0 overflow-y-auto"
          >
            <div className="flex h-full flex-col gap-2.5">
              {/* Escrow */}
              <div className="rounded-lg border border-primary/15 bg-primary/[0.02] p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="flex size-7 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.08]">
                      <Lock className="size-3 text-primary" />
                    </div>
                    <div>
                      <span className="text-xs font-medium text-foreground">Escrow</span>
                      <span className="text-[10px] text-foreground/40 block leading-tight">Phase 3</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-mono font-normal tracking-tight text-foreground">15,000</span>
                    <span className="text-[10px] font-mono text-foreground/40 ml-0.5">BRL</span>
                  </div>
                </div>
                <div className="relative h-2 w-full rounded-md overflow-hidden bg-muted/20 border border-border">
                  <div className="absolute inset-y-0 left-0 bg-emerald/60 rounded-md w-full" />
                </div>
                <div className="flex items-center gap-1.5 mt-1">
                  <CheckCircle className="size-2.5 text-emerald/60" />
                  <span className="text-[10px] text-emerald/70">Released</span>
                </div>
              </div>

              {/* Timeline */}
              <div className="rounded-lg border border-border bg-card p-3">
                <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Progress</span>
                <div className="mt-2 space-y-0">
                  {TIMELINE.map((step, i) => {
                    const isLast = i === TIMELINE.length - 1;
                    return (
                      <div key={i} className="flex gap-2">
                        <div className="flex flex-col items-center">
                          <div className={cn(
                            "flex size-4 shrink-0 items-center justify-center rounded-full border",
                            step.status === "done" && "border-emerald/30 bg-emerald/10",
                            step.status === "disputed" && "border-destructive/30 bg-destructive/10",
                            step.status === "active" && "border-primary/30 bg-primary/10",
                          )}>
                            {step.status === "done" && <CheckCircle className="size-2 text-emerald" />}
                            {step.status === "disputed" && <AlertTriangle className="size-2 text-destructive" />}
                            {step.status === "active" && <Gavel className="size-2 text-primary" />}
                          </div>
                          {!isLast && (
                            <div className={cn("w-px flex-1 min-h-[8px]", step.status === "done" ? "bg-emerald/20" : "bg-border")} />
                          )}
                        </div>
                        <div className="pb-1.5 min-w-0 flex-1">
                          <div className="flex items-center justify-between">
                            <p className={cn(
                              "text-[10px] leading-tight",
                              step.status === "active" && "font-medium text-primary",
                              step.status === "disputed" && "font-medium text-destructive",
                              (step.status === "done") && "text-foreground/70"
                            )}>{step.label}</p>
                            {step.usdc && (
                              <span className={cn(
                                "text-[10px] font-mono shrink-0",
                                step.status === "done" && "text-emerald/50",
                                step.status === "disputed" && "text-primary/50"
                              )}>{step.usdc}</span>
                            )}
                          </div>
                          <p className="text-[9px] text-muted-foreground/40">{step.date}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Evidence */}
              <div id="med-evidence" className="rounded-xl border border-border bg-card p-4 flex-1">
                <div className="flex items-center gap-2 mb-3">
                  <span className="size-2 rounded-full bg-accent" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Evidence</span>
                </div>
                <div className="space-y-1.5">
                  {EVIDENCE.map((item, i) => (
                    <div
                      key={i}
                      className={cn(
                        "flex items-center gap-2 rounded-md border px-2.5 py-1.5",
                        item.status === "verified" && "border-border bg-muted/10",
                        item.status === "warning" && "border-amber-500/20 bg-amber-500/[0.04]",
                        item.status === "breach" && "border-destructive/20 bg-destructive/[0.04]",
                      )}
                    >
                      <div className={cn(
                        "flex size-4 shrink-0 items-center justify-center rounded",
                        item.status === "verified" && "bg-emerald/10",
                        item.status === "warning" && "bg-amber-500/10",
                        item.status === "breach" && "bg-destructive/10",
                      )}>
                        {item.status === "verified" && <CheckCircle className="size-2.5 text-emerald" />}
                        {item.status === "warning" && <AlertTriangle className="size-2.5 text-amber-500" />}
                        {item.status === "breach" && <AlertTriangle className="size-2.5 text-destructive" />}
                      </div>
                      <p className={cn(
                        "text-[10px] leading-snug",
                        item.status === "verified" && "text-muted-foreground",
                        item.status === "warning" && "text-amber-400/80",
                        item.status === "breach" && "text-destructive/80",
                      )}>{item.text}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Strategic Read */}
              <div id="med-strategy" className="rounded-xl border border-amber-500/15 bg-amber-500/[0.02] p-4">
                <div className="flex items-center gap-2 mb-2.5">
                  <Brain className="size-3.5 text-amber-500/70" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-amber-500/70">Strategic Read</span>
                </div>
                <div className="space-y-2">
                  {[
                    { move: "Protect the secretary", why: "Attack her → she creates internal friction → doctor doubles down defending her → deal dies" },
                    { move: "Make the dev own it", why: "Admitting fault = credibility. The discount becomes a gesture, not a defeat" },
                    { move: "Give the doctor a win", why: "He needs a dignified exit. R$3k back + a deadline = a story he can tell as a victory" },
                  ].map((s, i) => (
                    <div key={i} className="rounded-md border border-amber-500/10 bg-amber-500/[0.03] px-2.5 py-2">
                      <p className="text-[11px] font-medium text-amber-400/90">{s.move}</p>
                      <p className="text-[10px] text-foreground/50 leading-snug mt-0.5">{s.why}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Settlement Status */}
              <div id="med-settlement-status" className="rounded-xl border border-emerald/20 bg-card p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="size-2 rounded-full bg-emerald" />
                  <span className="text-[10px] font-medium uppercase tracking-wider text-emerald/70">Settlement</span>
                </div>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">ULTRASELF</span>
                    <span className="text-xs font-mono text-foreground">BRL 12,000</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground">Dr. Suasuna</span>
                    <span className="text-xs font-mono text-foreground">BRL 3,000</span>
                  </div>
                  <div className="h-px bg-border" />
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] text-muted-foreground/60">Split</span>
                    <span className="text-[10px] font-mono text-emerald">80 / 20</span>
                  </div>
                </div>
                <div className="mt-2.5 flex items-center gap-1.5 w-full justify-center rounded-md border border-emerald/30 bg-emerald/10 py-1.5">
                  <CheckCircle className="size-3 text-emerald" />
                  <span className="text-[9px] uppercase tracking-wider text-emerald font-medium">Confirmed on-chain</span>
                </div>
                {/* TX */}
                <div className="mt-2 pt-2 border-t border-border space-y-1">
                  {["Settlement", "Verdict"].map((label) => (
                    <div key={label} className="flex items-center justify-between">
                      <span className="text-[9px] text-muted-foreground/60">{label}</span>
                      <a
                        href="https://hashscan.io/testnet/transaction/0x9f7c501eaa544a56144e9018f1f0d49182943e7c84500efd751571b4c85b1b52"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[9px] font-mono text-primary hover:underline"
                      >
                        BaseScan <ExternalLink className="size-2" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Settlement Modal */}
      <DemoSettlementModal open={showModal} onClose={() => setShowModal(false)} />

    </div>
  );
}
