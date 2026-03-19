"use client";

import { CheckCircle, AlertTriangle, Lock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Milestone {
  phase: number;
  title: string;
  description: string;
  sentinelNote: string;
  status: "completed" | "alert";
  amount: string;
  date: string;
  txLabel: string;
}

const milestones: Milestone[] = [
  {
    phase: 1,
    title: "Blueprint & Sign-Off",
    description:
      "Mapped out the entire patient journey, built the knowledge base from scratch, and got the client's green light on the architecture.",
    sentinelNote: "Sentinel verified delivery. Funds released automatically.",
    status: "completed",
    amount: "100 $SURGE",
    date: "05 Mar · 09:00",
    txLabel: "TX: 0x4f3a...c91b",
  },
  {
    phase: 2,
    title: "Build, Train & Test",
    description:
      "Receptionist AI and Clinical Assistant trained on real clinic data. Deployed to staging. Webhook flows stress-tested. Client approved after 3-day trial.",
    sentinelNote: "Staging logs confirmed full pass. Auto-released.",
    status: "completed",
    amount: "150 $SURGE",
    date: "14 Mar · 14:22",
    txLabel: "IPFS: QmRjt7...3yeo",
  },
  {
    phase: 3,
    title: "Go-Live & Stabilization",
    description:
      "Production went sideways. Calendar API returning 503 errors. AI answering insurance questions to private-pay patients. Front desk ignoring triaged leads for 48h+.",
    sentinelNote: "",
    status: "alert",
    amount: "250 $SURGE",
    date: "20 Mar · Expired 2 days ago",
    txLabel: "",
  },
];

export function MilestoneTimeline() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      {/* Section label */}
      <div className="flex items-center gap-2 mb-1">
        <span className="size-2 rounded-full bg-accent" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Milestone Timeline
        </span>
      </div>
      <p className="text-xs text-muted-foreground/60 mb-6 ml-4">
        The Sentinel verifies each delivery before unlocking the next payment.
      </p>

      <div className="space-y-0">
        {milestones.map((m, i) => (
          <div key={m.phase} className="relative flex gap-4">
            {/* Timeline line */}
            <div className="flex flex-col items-center">
              <div
                className={`flex size-8 shrink-0 items-center justify-center rounded-full border ${
                  m.status === "completed"
                    ? "border-emerald/30 bg-emerald/10"
                    : "border-destructive/30 bg-destructive/10"
                }`}
              >
                {m.status === "completed" ? (
                  <CheckCircle className="size-4 text-emerald" />
                ) : (
                  <AlertTriangle className="size-4 text-destructive" />
                )}
              </div>
              {i < milestones.length - 1 && (
                <div className="w-px flex-1 bg-border my-1" />
              )}
            </div>

            {/* Content */}
            <div className="pb-6 flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-muted-foreground/60">
                  Phase {m.phase}
                </span>
                <Badge
                  variant="outline"
                  className={`text-[10px] h-5 px-1.5 uppercase tracking-wider ${
                    m.status === "completed"
                      ? "border-emerald/30 text-emerald"
                      : "border-destructive/30 text-destructive"
                  }`}
                >
                  {m.status === "completed" ? "Completed" : "Alert"}
                </Badge>
              </div>

              <h3 className="text-base font-normal text-foreground mb-1.5">
                {m.title}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-3">
                {m.description}
              </p>

              {m.sentinelNote && (
                <p className="text-xs text-muted-foreground/60 italic mb-3">
                  {m.sentinelNote}
                </p>
              )}

              <div className="flex items-center gap-3">
                <div
                  className={`inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 ${
                    m.status === "completed"
                      ? "border-emerald/20 bg-emerald/5"
                      : "border-destructive/20 bg-destructive/5"
                  }`}
                >
                  {m.status === "completed" ? (
                    <CheckCircle className="size-3 text-emerald" />
                  ) : (
                    <Lock className="size-3 text-destructive" />
                  )}
                  <span
                    className={`text-xs font-mono ${
                      m.status === "completed"
                        ? "text-emerald"
                        : "text-destructive"
                    }`}
                  >
                    {m.status === "completed"
                      ? `${m.amount} Released`
                      : `${m.amount} At Risk`}
                  </span>
                </div>

                <span className="text-[11px] font-mono text-muted-foreground/40">
                  {m.date}
                </span>
                {m.txLabel && (
                  <span className="text-[11px] font-mono text-muted-foreground/30">
                    {m.txLabel}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
