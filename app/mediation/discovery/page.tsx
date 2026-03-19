"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { Suspense, useState, useEffect, useCallback } from "react";
import { scenarios, type Scenario } from "@/lib/scenarios";
import { motion, AnimatePresence } from "framer-motion";
import {
  AlertTriangle,
  CheckCircle2,
  Search,
  FileText,
  MessageSquare,
  Scale,
  ArrowRight,
} from "lucide-react";
import { BorderBeam } from "@/components/ui/border-beam";

/* ─── Types ─── */
interface Finding {
  id: number;
  icon: typeof CheckCircle2;
  iconColor: string;
  text: React.ReactNode;
}

interface AdviceBlock {
  label: string;
  title: React.ReactNode;
  variant: "destructive" | "primary" | "emerald";
}

/* ─── Discovery data per scenario ─── */
function getDiscoveryData(scenario: Scenario) {
  const isClinica = scenario.id === "clinica-suasuna";
  const isEcommerce = scenario.id === "ecommerce-quebrado";

  return {
    caseNumber: `#VRD-${scenario.id.split("").reduce((a, c) => a + c.charCodeAt(0), 0) % 9000 + 1000}`,
    demand: {
      party: scenario.parties.client.name,
      action: isClinica
        ? "just hit the panic button. He wants to cancel the project and is demanding his full escrow back."
        : isEcommerce
          ? "is threatening to go public about the broken checkout. Full refund and compensation for lost sales."
          : "has gone silent after receiving the deliverables. The freelancer is demanding payment for 75% completion.",
      amount: `${scenario.contract.value} ${scenario.contract.currency}`,
      quote: isClinica
        ? `"The system doesn't work, my secretary can't access anything, and patients are complaining. I want my money back."`
        : isEcommerce
          ? `"The payment gateway breaks every 3 hours. We're losing $2,000/day in abandoned carts. This is unacceptable."`
          : `"I delivered 75% of the project. Radio silence for 2 weeks. I need to get paid for my work."`,
    },
    findings: [
      {
        id: 1,
        icon: AlertTriangle,
        iconColor: "text-primary",
        text: isClinica
          ? <>He's right about the calendar. Receptionists complaining for <strong className="text-foreground">14 hours</strong> the bot isn't syncing. We dropped the ball on the calendar integration.</>
          : isEcommerce
            ? <>The gateway API changelog confirms a breaking change on <strong className="text-foreground">March 3rd</strong>. The dev couldn't have predicted this. <strong className="text-foreground">40% of integrations</strong> broke industry-wide.</>
            : <>Git commits show consistent progress for <strong className="text-foreground">6 weeks</strong>. The 75% delivery claim is verified by commit history and staging.</>,
      },
      {
        id: 2,
        icon: CheckCircle2,
        iconColor: "text-emerald",
        text: isClinica
          ? <>You sent a request <strong className="text-foreground">3 days ago</strong>. The secretary never forwarded it. You didn't fail. <span className="underline decoration-primary/50">You were blocked.</span></>
          : isEcommerce
            ? <>Server logs show <strong className="text-foreground">99.7% uptime</strong> on all endpoints except the payment webhook. The core work is solid.</>
            : <>Last client login: <strong className="text-foreground">16 days ago</strong>. Zero feedback on the last 3 milestones. The client disappeared, not the freelancer.</>,
      },
      {
        id: 3,
        icon: CheckCircle2,
        iconColor: "text-emerald",
        text: isClinica
          ? <>The triage AI delivered. <strong className="text-foreground">142 leads qualified</strong>. His front desk averaged <strong className="text-foreground">51h</strong> to follow up — the bottleneck was never the bot.</>
          : isEcommerce
            ? <>Dev shipped a hotfix in <strong className="text-foreground">4 hours</strong>. Client's team took <strong className="text-foreground">72 hours</strong> to deploy it. Extended downtime was on them.</>
            : <>Freelancer sent <strong className="text-foreground">4 check-in messages</strong> over 14 days. All read, none replied. No "silence = approval" clause.</>,
      },
    ] as Finding[],
    advice: [
      {
        label: isClinica ? "Don't blame the secretary" : isEcommerce ? "Don't blame the API" : "Don't blame the silence",
        title: isClinica
          ? <>Go after her and the doctor defends her. You become the aggressor. Walk away with <strong className="text-foreground">zero</strong>.</>
          : isEcommerce
            ? <>External API changes are force majeure. Pointing fingers won't resolve the loss both parties feel.</>
            : <>Silence doesn't mean rejection. Budget freezes, team changes — don't assume the worst.</>,
        variant: "destructive" as const,
      },
      {
        label: "What you need to own",
        title: isClinica
          ? <>You should have escalated directly to the doctor when the secretary didn't respond. <strong className="text-foreground">Acknowledge that upfront.</strong></>
          : isEcommerce
            ? <>The <strong className="text-foreground">72-hour deploy delay</strong> is yours. Your ops team sat on a ready hotfix.</>
            : <>You went dark on milestone reviews. The freelancer can't iterate without feedback. <strong className="text-foreground">That's on you.</strong></>,
        variant: "primary" as const,
      },
      {
        label: "The offer that closes this",
        title: isClinica
          ? <>Propose a <span className="text-primary font-medium">48h window</span> to finish Phase 3 with a <span className="text-primary font-medium">20% discount</span>. You keep <strong className="text-foreground">200 $SURGE</strong>, the doctor gets a fair exit.</>
          : isEcommerce
            ? <>Split the migration cost <strong className="text-foreground">50/50</strong>. Dev fixes at half rate, client covers infrastructure.</>
            : <>Release <strong className="text-foreground">60% of escrow</strong> now for verified work. Final 15% on delivery within <strong className="text-foreground">14 days</strong>.</>,
        variant: "emerald" as const,
      },
    ] as AdviceBlock[],
    settlement: {
      devAmount: isClinica ? "200" : isEcommerce ? "8,000" : "4,800",
      clientRefund: isClinica ? "50" : isEcommerce ? "4,000" : "3,200",
      protocolFee: "0",
      devLabel: scenario.parties.developer.name,
      clientLabel: scenario.parties.client.name,
      devPct: isClinica ? "80%" : isEcommerce ? "67%" : "60%",
      clientPct: isClinica ? "20%" : isEcommerce ? "33%" : "40%",
      currency: scenario.contract.currency === "BRL" ? "$SURGE" : `$${scenario.contract.currency}`,
      action: isClinica
        ? "48h Extension + 20% Discount"
        : isEcommerce
          ? "50/50 Migration Split"
          : "60% Release + 14-Day Close",
    },
  };
}

/* ═══════════════════════════════════════════════
   TRIAGE LOADING ANIMATION
   ═══════════════════════════════════════════════ */
function TriageLoader({
  scenario,
  caseNumber,
  onComplete,
}: {
  scenario: Scenario;
  caseNumber: string;
  onComplete: () => void;
}) {
  const [step, setStep] = useState(0);

  const steps = [
    { icon: FileText, text: `Fetching contract ${caseNumber} from escrow network...` },
    { icon: Search, text: `Auditing ${scenario.parties.client.name}'s communications & access history...` },
    { icon: Scale, text: "Mapping intent, liability and dynamics with Selantar..." },
  ];

  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 1800),
      setTimeout(() => setStep(2), 3600),
      setTimeout(() => onComplete(), 5400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [onComplete]);

  return (
    <div className="flex h-[calc(100dvh-65px)] flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-start gap-8 w-full max-w-lg"
      >
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sentinel Agent
          </span>
        </div>

        <div>
          <h1 className="text-4xl font-normal tracking-tight text-foreground lg:text-5xl">
            Analyzing evidence.
          </h1>
          <p className="mt-3 font-mono text-sm text-muted-foreground/50">
            Case {caseNumber}
          </p>
        </div>

        <div className="flex w-full flex-col">
          {steps.map(({ icon: Icon, text }, i) => {
            const active = i <= step;
            const current = i === step;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: active ? 1 : 0.15, x: 0 }}
                transition={{ delay: i * 0.12, duration: 0.4 }}
                className={`flex items-start gap-3 py-3.5 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <div className="mt-0.5 shrink-0">
                  {i < step ? (
                    <CheckCircle2 className="size-4 text-emerald" />
                  ) : current ? (
                    <Icon className="size-4 text-primary animate-subtle-pulse" />
                  ) : (
                    <Icon className="size-4 text-muted-foreground/20" />
                  )}
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </motion.div>
            );
          })}
        </div>

        <div className="h-px w-full overflow-hidden bg-border">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: "0%" }}
            animate={{ width: `${((step + 1) / steps.length) * 100}%` }}
            transition={{ duration: 1.5, ease: "easeInOut" }}
          />
        </div>
      </motion.div>
    </div>
  );
}

/* ═══════════════════════════════════════════════
   DISCOVERY — 3-column layout
   Col 1: Situation overview
   Col 2: Here's what I found
   Col 3: My counsel + settlement + CTAs
   ═══════════════════════════════════════════════ */
function DiscoveryResult({
  scenario,
  data,
}: {
  scenario: Scenario;
  data: ReturnType<typeof getDiscoveryData>;
}) {
  const router = useRouter();

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="h-[calc(100dvh-65px)] overflow-hidden"
    >
      <div className="mx-auto grid h-full max-w-6xl grid-cols-1 lg:grid-cols-[320px_1fr_340px] px-4">

        {/* ═══ Col 1: The Situation ═══ */}
        <div className="flex flex-col border-r border-border px-8 py-10 lg:px-10 lg:py-12">

          {/* Label */}
          <div className="flex items-center gap-2 mb-8">
            <span className="size-2 rounded-full bg-primary" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Sentinel Agent
            </span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl font-normal tracking-tight leading-tight text-foreground lg:text-4xl lg:leading-tight">
            Hey. We've got a
            <br />
            <span className="font-display italic text-primary">situation.</span>
          </h1>

          {/* Body */}
          <p className="mt-5 text-sm leading-relaxed text-muted-foreground">
            <strong className="text-foreground">{data.demand.party}</strong>{" "}
            {data.demand.action}
          </p>

          {/* Amount */}
          <div className="mt-6">
            <span className="font-mono text-3xl font-medium tracking-tight text-foreground">
              {data.demand.amount}
            </span>
            <p className="mt-1 text-xs uppercase tracking-widest text-muted-foreground">
              Escrow at stake
            </p>
          </div>

          {/* Client quote */}
          <p className="mt-6 border-l-2 border-border pl-4 text-sm leading-relaxed italic text-muted-foreground">
            {data.demand.quote}
          </p>

          {/* Meta — bottom */}
          <div className="mt-auto flex items-center gap-3 pt-6">
            <span className="font-mono text-xs text-muted-foreground">{scenario.contract.duration}</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="font-mono text-xs text-destructive">Critical</span>
            <span className="text-muted-foreground/30">·</span>
            <span className="font-mono text-xs text-muted-foreground">{data.caseNumber}</span>
          </div>
        </div>

        {/* ═══ Col 2: Here's What I Found ═══ */}
        <div className="flex flex-col border-r border-border overflow-y-auto">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-border px-8 py-3.5">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                Here's what I found
              </span>
            </div>
            <span className="font-mono text-xs text-muted-foreground">
              {data.findings.length} verified
            </span>
          </div>

          {/* Findings */}
          <div className="flex-1 px-8 py-5">
            {data.findings.map((finding, i) => {
              const Icon = finding.icon;
              return (
                <motion.div
                  key={finding.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08, duration: 0.3 }}
                  className={`flex gap-3 py-4 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="flex shrink-0 items-start gap-2 pt-0.5">
                    <span className="font-mono text-xs tabular-nums text-muted-foreground">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <Icon className={`size-4 ${finding.iconColor}`} />
                  </div>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {finding.text}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* ═══ Col 3: My Counsel + Settlement + CTAs ═══ */}
        <div className="flex flex-col bg-card overflow-y-auto">
          {/* Header */}
          <div className="shrink-0 flex items-center justify-between border-b border-border px-8 py-3.5">
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full bg-primary" />
              <span className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
                My counsel
              </span>
            </div>
            <span className="text-xs text-muted-foreground">{scenario.title}</span>
          </div>

          {/* Counsel blocks */}
          <div className="flex-1 px-8 py-5">
            {data.advice.map((block, i) => (
              <motion.div
                key={block.label}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 + i * 0.06, duration: 0.3 }}
                className={`py-4 ${i > 0 ? "border-t border-border" : ""}`}
              >
                <span className="text-sm font-medium text-foreground">
                  {block.label}
                </span>
                <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                  {block.title}
                </p>
              </motion.div>
            ))}
          </div>

          {/* Settlement */}
          <div className="shrink-0 border-t border-border">
            <div className="flex">
              {[
                { amount: data.settlement.devAmount, label: data.settlement.devLabel, pct: data.settlement.devPct, color: "text-foreground" },
                { amount: data.settlement.clientRefund, label: "Refund", pct: data.settlement.clientPct, color: "text-primary" },
                { amount: data.settlement.protocolFee, label: "Protocol", pct: null, color: "text-muted-foreground" },
              ].map((item, i) => (
                <div key={item.label} className={`flex-1 px-6 py-3.5 ${i > 0 ? "border-l border-border" : ""}`}>
                  <p className={`font-mono text-lg font-medium tracking-tight ${item.color}`}>
                    {item.amount}
                    <span className="ml-1 text-[10px] font-normal uppercase tracking-wider text-muted-foreground">
                      {data.settlement.currency}
                    </span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.label}
                    {item.pct && <span className="ml-1 font-mono text-xs text-muted-foreground">{item.pct}</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* CTAs — side by side */}
            <div className="flex gap-3 border-t border-border px-6 py-4">
              <button
                onClick={() => router.push(`/mediation?scenario=${scenario.id}&mode=chat`)}
                className="flex items-center justify-center gap-2 rounded-md border border-border px-5 py-3 text-xs uppercase tracking-wider text-muted-foreground transition-colors hover:bg-muted/20 hover:text-foreground"
              >
                <MessageSquare className="size-3.5" />
                Talk first
              </button>
              <button
                onClick={() => router.push(`/mediation?scenario=${scenario.id}`)}
                className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-md bg-foreground px-5 py-3 text-sm font-medium uppercase tracking-wider text-background transition-colors hover:bg-foreground/90 active:scale-[0.99]"
              >
                {data.settlement.action}
                <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
                <BorderBeam
                  size={120}
                  duration={4}
                  colorFrom="oklch(0.72 0.17 55)"
                  colorTo="oklch(0.72 0.17 55 / 0%)"
                  borderWidth={2}
                />
              </button>
            </div>
          </div>
        </div>

      </div>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════ */
function DiscoveryContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const scenarioId = searchParams.get("scenario");
  const scenario = scenarios.find((s) => s.id === scenarioId);
  const [loading, setLoading] = useState(true);
  const handleComplete = useCallback(() => setLoading(false), []);

  if (!scenario) {
    return (
      <div className="flex h-[calc(100dvh-65px)] flex-col items-center justify-center gap-4 px-4">
        <AlertTriangle className="size-8 text-muted-foreground/40" />
        <p className="text-sm text-muted-foreground">No scenario selected.</p>
        <button
          onClick={() => router.push("/mediation")}
          className="text-sm text-primary transition-colors hover:text-primary/80"
        >
          Back to scenarios
        </button>
      </div>
    );
  }

  const data = getDiscoveryData(scenario);

  return (
    <AnimatePresence mode="wait">
      {loading ? (
        <TriageLoader key="loader" scenario={scenario} caseNumber={data.caseNumber} onComplete={handleComplete} />
      ) : (
        <DiscoveryResult key="result" scenario={scenario} data={data} />
      )}
    </AnimatePresence>
  );
}

export default function DiscoveryPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100dvh-65px)] items-center justify-center">
          <div className="size-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <DiscoveryContent />
    </Suspense>
  );
}
