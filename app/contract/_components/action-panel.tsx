"use client";

import { Clock, Split, Zap } from "lucide-react";

interface ActionOption {
  number: string;
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
  buttonLabel: string;
  topLabel: string;
  bottomLabel: string;
  variant: "default" | "accent" | "destructive";
}

const actions: ActionOption[] = [
  {
    number: "01",
    icon: Clock,
    title: "Give Them More Time",
    description:
      "72 extra hours to fix the calendar and clean up the prompts. Sentinel keeps watching.",
    buttonLabel: "Grant +72h Extension",
    topLabel: "No fee",
    bottomLabel: "Low risk",
    variant: "default",
  },
  {
    number: "02",
    icon: Split,
    title: "Split The Escrow",
    description:
      "Pay 100 USDC for what was actually delivered. Hold 150 until the bugs are squashed and confirmed.",
    buttonLabel: "Propose Split 100 / 150",
    topLabel: "100 USDC",
    bottomLabel: "150 held",
    variant: "accent",
  },
  {
    number: "03",
    icon: Zap,
    title: "Demand Proof. Now.",
    description:
      "24 hours to prove delivery. Silence triggers automatic mediation. Clock starts now.",
    buttonLabel: "Send On-Chain Notice",
    topLabel: "Deadline: 24h",
    bottomLabel: "Auto-escalate",
    variant: "destructive",
  },
];

const variantStyles = {
  default: {
    card: "border-border hover:border-muted-foreground/20",
    button: "border-border bg-secondary text-secondary-foreground hover:bg-muted",
    badge: "text-muted-foreground",
  },
  accent: {
    card: "border-primary/20 hover:border-primary/40",
    button: "border-primary/30 bg-primary/10 text-primary hover:bg-primary/20",
    badge: "text-primary",
  },
  destructive: {
    card: "border-destructive/20 hover:border-destructive/40",
    button: "border-destructive/30 bg-destructive/10 text-destructive hover:bg-destructive/20",
    badge: "text-destructive",
  },
};

export function ActionPanel() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="size-2 rounded-full bg-accent" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Your Move
        </span>
      </div>
      <p className="text-xs text-muted-foreground/60 mb-6 ml-4">
        Phase 3 is in trouble. Pick your play before this escalates to formal mediation.
      </p>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {actions.map((action) => {
          const styles = variantStyles[action.variant];
          return (
            <div
              key={action.number}
              className={`rounded-xl border bg-card p-5 transition-colors ${styles.card}`}
            >
              {/* Top labels */}
              <div className="flex items-center justify-between mb-4">
                <span className="font-mono text-xs text-muted-foreground/40">
                  {action.number}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[10px] font-mono ${styles.badge}`}>
                    {action.topLabel}
                  </span>
                  <span className="text-muted-foreground/20">·</span>
                  <span className={`text-[10px] font-mono ${styles.badge}`}>
                    {action.bottomLabel}
                  </span>
                </div>
              </div>

              {/* Icon + title */}
              <div className="flex items-center gap-2.5 mb-2">
                <action.icon className="size-4 text-muted-foreground" />
                <h3 className="text-base font-normal text-foreground">
                  {action.title}
                </h3>
              </div>

              <p className="text-xs text-muted-foreground leading-relaxed mb-5">
                {action.description}
              </p>

              <button
                className={`w-full rounded-md border px-4 py-2.5 text-xs font-medium uppercase tracking-wider transition-colors ${styles.button}`}
              >
                {action.buttonLabel}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
