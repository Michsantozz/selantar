"use client";

import { Badge } from "@/components/ui/badge";

interface FeedEntry {
  time: string;
  text: string;
  severity: "info" | "warning" | "critical";
}

const entries: FeedEntry[] = [
  {
    time: "10:00",
    severity: "info",
    text: "Phase 3 audit kicked off. Watching the booking webhook, checking response times, and scanning AI conversations for accuracy.",
  },
  {
    time: "10:05",
    severity: "critical",
    text: "Calendar is down. POST /schedule throwing 503 — the scheduling node doesn't exist anymore. Routing everything to human reception as fallback.",
  },
  {
    time: "12:15",
    severity: "critical",
    text: "The AI is talking about insurance plans to private-pay patients. Knowledge base is wrong — this clinic doesn't take insurance. Prompt needs urgent fix.",
  },
  {
    time: "14:30",
    severity: "warning",
    text: "Front desk hasn't replied to 3 triaged patients in over 48 hours. Average delay: 51h. That's a direct SLA violation. Patients are ghosting.",
  },
  {
    time: "14:35",
    severity: "critical",
    text: "Both sides are in breach. Broken API on one end, ignored patients on the other. Escrow heading to dispute — mediation now available.",
  },
];

const severityStyles = {
  info: "border-border bg-muted/30",
  warning: "border-primary/20 bg-primary/5",
  critical: "border-destructive/20 bg-destructive/5",
};

const dotStyles = {
  info: "bg-muted-foreground",
  warning: "bg-primary",
  critical: "bg-destructive",
};

export function SentinelFeed() {
  return (
    <div className="rounded-xl border border-border bg-card p-6 h-full">
      {/* Section label */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Sentinel Live Feed
          </span>
        </div>
        <Badge
          variant="outline"
          className="border-primary/30 bg-primary/10 text-primary text-[10px] uppercase tracking-wider"
        >
          <span className="size-1.5 rounded-full bg-primary animate-pulse mr-1.5" />
          Live · Mar 10
        </Badge>
      </div>

      <p className="text-xs text-muted-foreground/60 mb-4">
        Real-time audit of Phase 3. The Sentinel caught what both sides missed.
      </p>

      <div className="space-y-3">
        {entries.map((entry, i) => (
          <div
            key={i}
            className={`rounded-lg border p-3 ${severityStyles[entry.severity]}`}
          >
            <div className="flex items-start gap-2.5">
              <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                <span
                  className={`size-1.5 rounded-full ${dotStyles[entry.severity]}`}
                />
                <span className="font-mono text-[11px] text-muted-foreground/50">
                  {entry.time}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {entry.text}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
