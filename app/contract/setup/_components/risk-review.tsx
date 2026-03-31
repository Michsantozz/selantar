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
import type { RiskItem as RiskItemData, ClauseScore } from "@/lib/schemas/contract-parse";

// --- Types ---

type Severity = "high" | "medium" | "low";
type RiskDisplay = RiskItemData & { accepted: boolean | null };

// --- Config ---

const severityConfig: Record<
  Severity,
  { badge: string; dot: string; label: string; icon: React.ReactNode }
> = {
  high: {
    badge: "border-destructive/30 bg-destructive/10 text-destructive",
    dot: "bg-destructive",
    label: "High Risk",
    icon: <ShieldAlertIcon className="size-3" />,
  },
  medium: {
    badge: "border-accent/30 bg-accent/10 text-accent",
    dot: "bg-accent",
    label: "Medium",
    icon: <ShieldAlertIcon className="size-3" />,
  },
  low: {
    badge: "border-emerald/30 bg-emerald/10 text-emerald",
    dot: "bg-emerald",
    label: "Low",
    icon: <ShieldCheckIcon className="size-3" />,
  },
};

// --- Demo data ---

const INITIAL_RISKS: RiskItemData[] = [
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
  },
];

// --- Sub-components ---

function RiskCard({
  risk,
  onToggle,
}: {
  risk: RiskDisplay;
  onToggle: (id: string, accepted: boolean) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const cfg = severityConfig[risk.severity];

  return (
    <div
      className={cn(
        "rounded-lg border bg-card transition-all",
        risk.accepted === true && "border-emerald/20 opacity-70",
        risk.accepted === false && "border-destructive/20",
        risk.accepted === null && "border-border"
      )}
    >
      {/* Header */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="flex w-full items-start gap-3 px-5 py-4 text-left"
      >
        {/* Severity dot */}
        <span className={cn("mt-2 size-2.5 shrink-0 rounded-full", cfg.dot)} />

        {/* Content */}
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground">
            {risk.title}
          </p>
          <div className="mt-1.5 flex items-center gap-3">
            <span className="font-mono text-xs text-muted-foreground/60">
              {risk.clause}
            </span>
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[11px] font-medium uppercase tracking-wider",
                cfg.badge
              )}
            >
              {cfg.icon}
              {cfg.label}
            </span>

            {/* Decision badge */}
            {risk.accepted === true && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald">
                <CheckIcon className="size-3" />
                Accepted
              </span>
            )}
            {risk.accepted === false && (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-destructive">
                <XIcon className="size-3" />
                Rejected
              </span>
            )}
          </div>
        </div>

        <ChevronDownIcon
          className={cn(
            "mt-1.5 size-4 shrink-0 text-muted-foreground transition-transform",
            expanded && "rotate-180"
          )}
        />
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="border-t border-border px-5 py-4">
          {/* Description */}
          <p className="text-sm leading-relaxed text-muted-foreground">
            {risk.description}
          </p>

          {/* Original clause */}
          <div className="mt-4 rounded-md border border-border bg-muted/20 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/50">
              Original Clause
            </p>
            <p className="mt-1.5 font-mono text-sm leading-relaxed text-muted-foreground">
              &ldquo;{risk.originalText}&rdquo;
            </p>
          </div>

          {/* Clara suggestion */}
          <div className="mt-3 rounded-md border border-accent/20 bg-accent/5 px-4 py-3">
            <p className="text-[11px] font-medium uppercase tracking-wider text-accent">
              Clara&apos;s Suggestion
            </p>
            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
              {risk.suggestion}
            </p>
          </div>

          {/* Accept / Reject toggles */}
          <div className="mt-4 flex items-center gap-3">
            <button
              type="button"
              onClick={() => onToggle(risk.id, true)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors",
                risk.accepted === true
                  ? "border-emerald/30 bg-emerald/10 text-emerald"
                  : "border-border bg-transparent text-muted-foreground hover:border-emerald/30 hover:bg-emerald/5 hover:text-emerald"
              )}
            >
              <CheckIcon className="size-3.5" />
              Accept Suggestion
            </button>
            <button
              type="button"
              onClick={() => onToggle(risk.id, false)}
              className={cn(
                "flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium uppercase tracking-wider transition-colors",
                risk.accepted === false
                  ? "border-destructive/30 bg-destructive/10 text-destructive"
                  : "border-border bg-transparent text-muted-foreground hover:border-destructive/30 hover:bg-destructive/5 hover:text-destructive"
              )}
            >
              <XIcon className="size-3.5" />
              Keep Original
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// --- Summary bar ---

function RiskSummary({ risks }: { risks: RiskDisplay[] }) {
  const total = risks.length;
  const accepted = risks.filter((r) => r.accepted === true).length;
  const rejected = risks.filter((r) => r.accepted === false).length;
  const pending = risks.filter((r) => r.accepted === null).length;
  const high = risks.filter((r) => r.severity === "high").length;
  const medium = risks.filter((r) => r.severity === "medium").length;
  const low = risks.filter((r) => r.severity === "low").length;

  return (
    <div className="rounded-lg border border-border bg-card px-5 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-destructive" />
            <span className="text-sm text-muted-foreground">
              {high} high
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">
              {medium} medium
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full bg-emerald" />
            <span className="text-sm text-muted-foreground">
              {low} low
            </span>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <span className="text-emerald">{accepted} accepted</span>
          <span className="text-destructive">{rejected} rejected</span>
          <span className="text-muted-foreground">{pending} pending</span>
        </div>
      </div>

      {/* Progress */}
      <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-muted">
        {accepted > 0 && (
          <div
            className="h-full bg-emerald transition-all duration-300"
            style={{ width: `${(accepted / total) * 100}%` }}
          />
        )}
        {rejected > 0 && (
          <div
            className="h-full bg-destructive transition-all duration-300"
            style={{ width: `${(rejected / total) * 100}%` }}
          />
        )}
      </div>
      <p className="mt-2 text-xs text-muted-foreground/60">
        {total - pending} of {total} clauses reviewed
      </p>
    </div>
  );
}

// --- Skeleton ---

function RiskReviewSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3 animate-pulse">
          <div className="rounded-lg border border-border bg-card px-5 py-4 space-y-3">
            <div className="h-4 w-48 rounded bg-muted" />
            <div className="h-2 w-full rounded-full bg-muted" />
          </div>
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="rounded-lg border border-border bg-card px-5 py-4 space-y-2">
              <div className="h-4 w-40 rounded bg-muted" />
              <div className="h-3 w-24 rounded bg-muted" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- Exported ---

interface RiskReviewProps {
  risks?: RiskItemData[] | null;
  clauseScores?: ClauseScore[] | null;
  loading?: boolean;
}

export function RiskReview({ risks: propRisks, clauseScores, loading }: RiskReviewProps = {}) {
  const baseRisks = propRisks ?? INITIAL_RISKS;
  const [acceptedMap, setAcceptedMap] = useState<Record<string, boolean | null>>({});

  // Derive display risks with accepted state from map
  const risks: RiskDisplay[] = baseRisks.map((r) => ({
    ...r,
    accepted: acceptedMap[r.id] ?? null,
  }));

  const handleToggle = (id: string, accepted: boolean) => {
    setAcceptedMap((prev) => ({
      ...prev,
      [id]: prev[id] === accepted ? null : accepted,
    }));
  };

  if (loading) return <RiskReviewSkeleton />;

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-3">
          <RiskSummary risks={risks} />
          {risks.map((r) => (
            <RiskCard key={r.id} risk={r} onToggle={handleToggle} />
          ))}
        </div>
      </div>
    </div>
  );
}
