"use client";

import { useState } from "react";
import {
  ShieldAlertIcon,
  ShieldCheckIcon,
  ChevronDownIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// --- Types ---

type Severity = "high" | "medium" | "low";

type RiskItem = {
  id: string;
  clause: string;
  title: string;
  description: string;
  severity: Severity;
  originalText: string;
  suggestion: string;
  accepted: boolean | null; // null = not decided
};

// --- Config ---

const severityConfig: Record<
  Severity,
  { badge: string; dot: string; label: string; icon: React.ReactNode }
> = {
  high: {
    badge: "border-destructive/20 bg-destructive/[0.06] text-destructive",
    dot: "bg-destructive",
    label: "High Risk",
    icon: <ShieldAlertIcon className="size-3" />,
  },
  medium: {
    badge: "border-accent/20 bg-accent/[0.06] text-accent",
    dot: "bg-accent",
    label: "Medium",
    icon: <ShieldAlertIcon className="size-3" />,
  },
  low: {
    badge: "border-emerald/20 bg-emerald/[0.06] text-emerald",
    dot: "bg-emerald",
    label: "Low",
    icon: <ShieldCheckIcon className="size-3" />,
  },
};

// --- Demo data ---

const initialRisks: RiskItem[] = [
  {
    id: "r1",
    clause: "Clause 3.2",
    title: "Vague deliverable definition",
    description:
      '"Frontend completo incluindo mobile" — no clear acceptance criteria for mobile responsiveness. This could lead to disputes about what constitutes a complete delivery.',
    severity: "high",
    originalText:
      "The Developer shall deliver the complete frontend including mobile by the agreed date.",
    suggestion:
      'Replace with: "The Developer shall deliver the responsive frontend (desktop, tablet and mobile), tested in Chrome, Safari and Firefox, with Lighthouse mobile score ≥ 80."',
    accepted: null,
  },
  {
    id: "r2",
    clause: "Clause 5.1",
    title: "Missing payment timeline",
    description:
      "No specified timeframe for client review and payment release after milestone delivery. Developer could wait indefinitely.",
    severity: "high",
    originalText:
      "Payment shall be released upon Client approval.",
    suggestion:
      'Add: "The Client shall have 5 business days to review. If no response is given, payment will be released automatically."',
    accepted: null,
  },
  {
    id: "r3",
    clause: "Clause 7.3",
    title: "Ambiguous IP transfer timing",
    description:
      "IP ownership transfer is mentioned but not tied to a specific milestone or payment event.",
    severity: "medium",
    originalText:
      "Intellectual property shall be transferred to the Client at the end of the project.",
    suggestion:
      'Specify: "IP for each milestone shall be transferred to the Client upon confirmation of the corresponding escrow payment."',
    accepted: true,
  },
  {
    id: "r4",
    clause: "Clause 2.1",
    title: "Scope change process undefined",
    description:
      "No formal process for handling scope changes. Changes could be made verbally without record.",
    severity: "medium",
    originalText:
      "Scope changes may be agreed upon between the parties.",
    suggestion:
      'Add: "Scope changes must be formalized via Amendment in Selantar with dual approval, adjusting values and deadlines as needed."',
    accepted: null,
  },
  {
    id: "r5",
    clause: "Clause 9.1",
    title: "Governing law specified",
    description:
      "Contract correctly specifies Brazilian law as governing law. No issues found.",
    severity: "low",
    originalText:
      "This contract is governed by the laws of the Federative Republic of Brazil.",
    suggestion: "No changes needed. Clause is well-defined.",
    accepted: true,
  },
];

// --- Sub-components ---

function RiskCard({
  risk,
  onToggle,
}: {
  risk: RiskItem;
  onToggle: (id: string, accepted: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[risk.severity];

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        risk.accepted === true && "border-emerald/15 bg-emerald/[0.02]",
        risk.accepted === false && "border-destructive/15 bg-destructive/[0.02]",
        risk.accepted === null && "border-border bg-transparent"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-4 py-3.5 text-left"
      >
        {/* Severity dot */}
        <span className={cn("mt-[7px] size-2 shrink-0 rounded-full", cfg.dot)} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-[13px] font-medium leading-snug text-foreground">
            {risk.title}
          </p>
          <div className="mt-1.5 flex flex-wrap items-center gap-2">
            <span className="font-mono text-[10px] text-muted-foreground/40">
              {risk.clause}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.1em]",
                cfg.badge
              )}
            >
              {cfg.icon}
              {cfg.label}
            </span>

            {/* Decision badge */}
            {risk.accepted === true && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-emerald/80 uppercase tracking-wider">
                <CheckIcon className="size-2.5" />
                Accepted
              </span>
            )}
            {risk.accepted === false && (
              <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-destructive/80 uppercase tracking-wider">
                <XIcon className="size-2.5" />
                Rejected
              </span>
            )}
          </div>
        </div>

        <ChevronDownIcon
          className={cn(
            "mt-1 size-3.5 shrink-0 text-muted-foreground/30 transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border/50 px-4 py-4 ml-5">
          {/* Description */}
          <p className="text-[13px] leading-relaxed text-muted-foreground/80">
            {risk.description}
          </p>

          {/* Original clause */}
          <div className="mt-4 rounded-md border border-border/60 bg-muted/[0.08] px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/35 mb-1.5">
              Original Clause
            </p>
            <p className="font-mono text-[12px] leading-relaxed text-muted-foreground/70">
              &ldquo;{risk.originalText}&rdquo;
            </p>
          </div>

          {/* Clara suggestion */}
          <div className="mt-2.5 rounded-md border border-accent/15 bg-accent/[0.03] px-4 py-3">
            <p className="text-[9px] font-semibold uppercase tracking-[0.2em] text-accent/70 mb-1.5">
              Clara&apos;s Suggestion
            </p>
            <p className="text-[12px] leading-relaxed text-muted-foreground/80">
              {risk.suggestion}
            </p>
          </div>

          {/* Accept / Reject toggles */}
          <div className="mt-4 flex items-center gap-2">
            <button
              type="button"
              onClick={() => onToggle(risk.id, true)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                risk.accepted === true
                  ? "border-emerald/25 bg-emerald/8 text-emerald"
                  : "border-border bg-transparent text-muted-foreground/50 hover:border-emerald/20 hover:text-emerald"
              )}
            >
              <CheckIcon className="size-3" />
              Accept
            </button>
            <button
              type="button"
              onClick={() => onToggle(risk.id, false)}
              className={cn(
                "flex items-center gap-1.5 rounded-md border px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.1em] transition-colors",
                risk.accepted === false
                  ? "border-destructive/25 bg-destructive/8 text-destructive"
                  : "border-border bg-transparent text-muted-foreground/50 hover:border-destructive/20 hover:text-destructive"
              )}
            >
              <XIcon className="size-3" />
              Keep Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Summary bar ---

function RiskSummary({ risks }: { risks: RiskItem[] }) {
  const total = risks.length;
  const accepted = risks.filter((r) => r.accepted === true).length;
  const rejected = risks.filter((r) => r.accepted === false).length;
  const pending = risks.filter((r) => r.accepted === null).length;
  const high = risks.filter((r) => r.severity === "high").length;
  const medium = risks.filter((r) => r.severity === "medium").length;
  const low = risks.filter((r) => r.severity === "low").length;

  return (
    <div className="rounded-lg border border-border bg-card/40 p-4">
      {/* Severity counts */}
      <div className="flex items-center gap-4">
        {[
          { count: high, color: "bg-destructive", label: "high" },
          { count: medium, color: "bg-accent", label: "medium" },
          { count: low, color: "bg-emerald", label: "low" },
        ].map(({ count, color, label }) => (
          <div key={label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", color)} />
            <span className="tabular-nums text-[13px] font-semibold text-foreground">{count}</span>
            <span className="text-[11px] text-muted-foreground/50">{label}</span>
          </div>
        ))}
      </div>

      {/* Decision counts */}
      <div className="mt-3 flex items-center gap-3 text-[11px]">
        <span className="tabular-nums text-emerald/80 font-medium">{accepted} accepted</span>
        <span className="text-destructive/80 tabular-nums font-medium">{rejected} rejected</span>
        <span className="text-muted-foreground/40 tabular-nums">{pending} pending</span>
      </div>

      {/* Progress bar */}
      <div className="mt-3 flex h-[3px] overflow-hidden rounded-full bg-muted/40">
        {accepted > 0 && (
          <div
            className="h-full bg-emerald/70 transition-all duration-500"
            style={{ width: `${(accepted / total) * 100}%` }}
          />
        )}
        {rejected > 0 && (
          <div
            className="h-full bg-destructive/70 transition-all duration-500"
            style={{ width: `${(rejected / total) * 100}%` }}
          />
        )}
      </div>
      <p className="mt-2 text-[10px] text-muted-foreground/35 tabular-nums">
        {total - pending} of {total} clauses reviewed
      </p>
    </div>
  );
}

// --- Exported ---

export function RiskReview() {
  const [risks, setRisks] = useState<RiskItem[]>(initialRisks);

  const handleToggle = (id: string, accepted: boolean) => {
    setRisks((prev) =>
      prev.map((r) =>
        r.id === id
          ? { ...r, accepted: r.accepted === accepted ? null : accepted }
          : r
      )
    );
  };

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-2.5">
          <RiskSummary risks={risks} />
          {risks.map((r) => (
            <RiskCard key={r.id} risk={r} onToggle={handleToggle} />
          ))}
        </div>
      </div>
    </div>
  );
}
