"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  LoaderIcon,
  CircleDotIcon,
  CircleIcon,
  FileTextIcon,
  UsersIcon,
  ShieldCheckIcon,
  CopyIcon,
  ArrowRightIcon,
} from "lucide-react";
import type { DeployPlan } from "@/lib/schemas/contract-parse";

// --- Types ---

type StepStatus = "done" | "current" | "pending";

type Step = {
  label: string;
  status: StepStatus;
  detail?: string;
};

type Party = {
  name: string;
  role: string;
  wallet: string;
};

type MilestoneSummary = {
  name: string;
  value: string;
  deadline: string;
  color: string;
};

// --- Demo data ---

const MILESTONE_COLORS = ["bg-accent", "bg-emerald", "bg-accent/60", "bg-muted-foreground/30"];

const DEFAULT_DEPLOY_PLAN: DeployPlan = {
  steps: [
    { label: "Contract Uploaded", status: "done", detail: "contract-v2.pdf" },
    { label: "AI Risk Audit", status: "done", detail: "5 clauses reviewed, 2 accepted" },
    { label: "Milestones Configured", status: "done", detail: "4 milestones, $3,800 total" },
    { label: "Escrow Funding", status: "current", detail: "Awaiting wallet confirmation" },
    { label: "Deploy to Chain", status: "pending" },
  ],
  parties: [
    { name: "Dr. Suasuna", role: "Client", wallet: "0x1a2B...9f4E" },
    { name: "Matheus", role: "Developer", wallet: "0x7c3D...2bA1" },
  ],
  milestoneSummary: [
    { name: "M1 Design", value: "R$ 3.000", deadline: "Apr 1" },
    { name: "M2 Frontend", value: "R$ 4.500", deadline: "Apr 15" },
    { name: "M3 Backend", value: "R$ 4.000", deadline: "Apr 28" },
    { name: "M4 Deploy", value: "R$ 3.500", deadline: "May 10" },
  ],
  escrowTotal: "R$ 15.000",
  network: "Base Sepolia",
  standard: "ERC-8004",
};

// --- Sub-components ---

function DeployStepper({ steps: s }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-0">
      {s.map((step, i) => {
        const isLast = i === s.length - 1;
        return (
          <div key={step.label} className="flex gap-3">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              {step.status === "done" && (
                <CheckCircleIcon className="size-6 shrink-0 text-emerald" />
              )}
              {step.status === "current" && (
                <CircleDotIcon className="size-6 shrink-0 text-accent" />
              )}
              {step.status === "pending" && (
                <CircleIcon className="size-6 shrink-0 text-muted-foreground/30" />
              )}
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1",
                    step.status === "done" ? "bg-emerald/30" : "bg-border"
                  )}
                  style={{ minHeight: 24 }}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-5", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-sm",
                  step.status === "current"
                    ? "font-medium text-accent"
                    : step.status === "done"
                      ? "text-foreground"
                      : "text-muted-foreground/50"
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-sm text-muted-foreground">
                  {step.detail}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function MiniTimeline({
  milestones,
}: {
  milestones: MilestoneSummary[];
}) {
  const total = milestones.reduce(
    (s, m) => s + parseInt(m.value.replace(/[^0-9]/g, "")),
    0
  );

  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <FileTextIcon className="size-4 text-muted-foreground/40" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Milestones
        </span>
        <span className="ml-auto font-mono text-sm font-medium text-foreground">
          ${total}
        </span>
      </div>

      <div className="divide-y divide-border">
        {milestones.map((m) => (
          <div key={m.name} className="flex items-center gap-3 px-5 py-3">
            <span className={cn("size-2.5 rounded-full", m.color)} />
            <span className="flex-1 text-sm text-foreground">{m.name}</span>
            <span className="font-mono text-sm text-muted-foreground">
              {m.value}
            </span>
            <span className="font-mono text-xs text-muted-foreground/50">
              {m.deadline}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PartiesCard({ parties: p }: { parties: Party[] }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <UsersIcon className="size-4 text-muted-foreground/40" />
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Parties
        </span>
      </div>

      <div className="divide-y divide-border">
        {p.map((party) => (
          <div key={party.name} className="flex items-center justify-between px-5 py-3">
            <div>
              <p className="text-sm font-medium text-foreground">{party.name}</p>
              <p className="text-xs text-muted-foreground">{party.role}</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs text-muted-foreground/60">
                {party.wallet}
              </span>
              <button
                type="button"
                className="rounded p-1 text-muted-foreground/30 transition-colors hover:text-muted-foreground"
              >
                <CopyIcon className="size-3" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Skeleton ---

function DeployReviewSkeleton() {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4 animate-pulse">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className="size-6 rounded-full bg-muted" />
              <div className="h-4 flex-1 rounded bg-muted" />
            </div>
          ))}
          <div className="rounded-lg border border-border bg-card p-4 space-y-3">
            <div className="h-4 w-32 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        </div>
      </div>
    </div>
  );
}

// --- Exported ---

interface DeployReviewProps {
  deployPlan?: DeployPlan | null;
  loading?: boolean;
}

export function DeployReview({ deployPlan, loading }: DeployReviewProps = {}) {
  const [deploying, setDeploying] = useState(false)
  const router = useRouter()

  if (loading) return <DeployReviewSkeleton />;

  const plan = deployPlan ?? DEFAULT_DEPLOY_PLAN;

  const milestonesWithColor: MilestoneSummary[] = plan.milestoneSummary.map((m, i) => ({
    ...m,
    color: MILESTONE_COLORS[i % MILESTONE_COLORS.length],
  }));

  const handleDeploy = () => {
    setDeploying(true)
    setTimeout(() => router.push("/contract/sentinel-plan"), 1800)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Progress stepper */}
          <DeployStepper steps={plan.steps as Step[]} />

          {/* Milestones summary */}
          <MiniTimeline milestones={milestonesWithColor} />

          {/* Parties */}
          <PartiesCard parties={plan.parties as Party[]} />

          {/* Clara insight */}
          <div className="rounded-lg border border-border bg-card px-5 py-4">
            <div className="flex items-center gap-1.5 mb-2">
              <span className="size-1.5 rounded-full bg-accent" />
              <span className="text-xs font-medium text-accent">Clara</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">
              I found 2 high-risk clauses and 2 medium-risk ones.
              I recommend reviewing before publishing. Milestones
              were extracted automatically — please verify values and dates.
            </p>
          </div>

          {/* Escrow preview */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center justify-between border-b border-border px-5 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Escrow Preview
              </span>
            </div>
            {/* Bar */}
            <div className="px-5 pt-3">
              <div className="flex h-[5px] rounded-full overflow-hidden gap-[2px] bg-border">
                {(() => {
                  const total = milestonesWithColor.reduce((s, ms) => s + parseInt(ms.value.replace(/[^0-9]/g, "")), 0);
                  return milestonesWithColor.map((m) => {
                    const w = total > 0 ? (parseInt(m.value.replace(/[^0-9]/g, "")) / total) * 100 : 0;
                    return <div key={m.name} className={cn("h-full rounded-full", m.color)} style={{ width: `${w}%` }} />;
                  });
                })()}
              </div>
            </div>
            {/* Milestone amounts */}
            <div className="divide-y divide-border mt-3">
              {milestonesWithColor.map((m) => (
                <div key={m.name} className="flex items-center justify-between px-5 py-2.5">
                  <span className="text-sm text-foreground">{m.name}</span>
                  <span className="font-mono text-sm font-medium text-accent">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border px-5 py-3">
              <span className="text-sm font-medium text-foreground">Total in escrow</span>
              <span className="font-mono text-base font-semibold text-foreground">{plan.escrowTotal}</span>
            </div>
          </div>

          {/* On-chain info */}
          <div className="rounded-lg border border-border bg-card">
            <div className="flex items-center gap-1.5 border-b border-border px-5 py-3">
              <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                On-Chain
              </span>
            </div>
            <div className="divide-y divide-border">
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-muted-foreground">Network</span>
                <span className="text-sm font-medium text-foreground">{plan.network}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-muted-foreground">Standard</span>
                <span className="text-sm font-medium text-foreground">{plan.standard}</span>
              </div>
              <div className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm text-muted-foreground">Timeout</span>
                <span className="text-sm font-medium text-foreground">7 days per milestone</span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="shrink-0 border-t border-border bg-card p-4">
        <button
          type="button"
          onClick={handleDeploy}
          disabled={deploying}
          className="flex w-full items-center justify-center gap-2 rounded-md border border-accent/30 bg-accent/8 py-3 text-xs font-medium uppercase tracking-wider text-accent transition-colors hover:bg-accent/15 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {deploying ? (
            <>
              <LoaderIcon className="size-3.5 animate-spin" />
              Publishing contract...
            </>
          ) : (
            <>
              <ShieldCheckIcon className="size-3.5" />
              Publish and configure Sentinel
              <ArrowRightIcon className="size-3" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
