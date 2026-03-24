"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  CheckCircleIcon,
  LoaderIcon,
  CircleDotIcon,
  CircleIcon,
  UsersIcon,
  ShieldCheckIcon,
  CopyIcon,
  ArrowRightIcon,
} from "lucide-react";

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

const steps: Step[] = [
  { label: "Contract Uploaded", status: "done", detail: "contract-v2.pdf" },
  { label: "AI Risk Audit", status: "done", detail: "5 clauses reviewed, 2 accepted" },
  { label: "Milestones Configured", status: "done", detail: "4 milestones, $3,800 total" },
  { label: "Escrow Funding", status: "current", detail: "Awaiting wallet confirmation" },
  { label: "Deploy to Chain", status: "pending" },
];

const parties: Party[] = [
  { name: "Dr. Suasuna", role: "Client", wallet: "0x1a2B...9f4E" },
  { name: "Matheus", role: "Developer", wallet: "0x7c3D...2bA1" },
];

const milestoneSummary: MilestoneSummary[] = [
  { name: "M1 Design", value: "R$ 3.000", deadline: "Apr 1", color: "bg-accent" },
  { name: "M2 Frontend", value: "R$ 4.500", deadline: "Apr 15", color: "bg-emerald" },
  { name: "M3 Backend", value: "R$ 4.000", deadline: "Apr 28", color: "bg-accent/60" },
  { name: "M4 Deploy", value: "R$ 3.500", deadline: "May 10", color: "bg-muted-foreground/30" },
];

// --- Sub-components ---

function DeployStepper({ steps: s }: { steps: Step[] }) {
  return (
    <div className="flex flex-col gap-0">
      {s.map((step, i) => {
        const isLast = i === s.length - 1;
        return (
          <div key={step.label} className="flex gap-2.5">
            {/* Icon + line */}
            <div className="flex flex-col items-center">
              {step.status === "done" && (
                <CheckCircleIcon className="size-5 shrink-0 text-emerald/70" />
              )}
              {step.status === "current" && (
                <CircleDotIcon className="size-5 shrink-0 text-accent" />
              )}
              {step.status === "pending" && (
                <CircleIcon className="size-5 shrink-0 text-muted-foreground/20" />
              )}
              {!isLast && (
                <div
                  className={cn(
                    "w-px flex-1",
                    step.status === "done" ? "bg-emerald/20" : "bg-border/50"
                  )}
                  style={{ minHeight: 20 }}
                />
              )}
            </div>

            {/* Content */}
            <div className={cn("pb-4", isLast && "pb-0")}>
              <p
                className={cn(
                  "text-[13px] leading-tight",
                  step.status === "current"
                    ? "font-medium text-accent"
                    : step.status === "done"
                      ? "text-foreground/80"
                      : "text-muted-foreground/30"
                )}
              >
                {step.label}
              </p>
              {step.detail && (
                <p className="mt-0.5 text-[11px] text-muted-foreground/40">
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

function PartiesCard({ parties: p }: { parties: Party[] }) {
  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/60">
        <UsersIcon className="size-3 text-muted-foreground/25" />
        <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/35">
          Parties
        </span>
      </div>

      <div className="divide-y divide-border/50">
        {p.map((party) => (
          <div key={party.name} className="flex items-center justify-between px-4 py-2.5">
            <div>
              <p className="text-[13px] font-medium text-foreground">{party.name}</p>
              <p className="text-[10px] text-muted-foreground/40">{party.role}</p>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-mono text-[10px] text-muted-foreground/35">
                {party.wallet}
              </span>
              <button
                type="button"
                className="rounded p-0.5 text-muted-foreground/20 transition-colors hover:text-muted-foreground/60"
              >
                <CopyIcon className="size-2.5" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// --- Exported ---

export function DeployReview() {
  const [deploying, setDeploying] = useState(false)
  const router = useRouter()

  const handleDeploy = () => {
    setDeploying(true)
    setTimeout(() => router.push("/contract/sentinel-plan"), 1800)
  }

  return (
    <div className="flex h-full flex-col overflow-hidden">
      <div className="flex-1 overflow-auto p-4">
        <div className="flex flex-col gap-4">
          {/* Progress stepper */}
          <DeployStepper steps={steps} />

          {/* Parties */}
          <PartiesCard parties={parties} />

          {/* Clara insight — subtle, text-first */}
          <div className="rounded-lg border border-accent/10 bg-accent/[0.02] px-4 py-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="size-[5px] rounded-full bg-accent/60" />
              <span className="text-[10px] font-semibold text-accent/70 uppercase tracking-[0.1em]">Clara</span>
            </div>
            <p className="text-[12px] leading-relaxed text-muted-foreground/60">
              I found 2 high-risk clauses and 2 medium-risk ones.
              I recommend reviewing before publishing. Milestones
              were extracted automatically — please verify values and dates.
            </p>
          </div>

          {/* Escrow preview */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center justify-between px-4 py-2.5 border-b border-border/60">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/35">
                Escrow Preview
              </span>
            </div>
            {/* Bar */}
            <div className="px-4 pt-3">
              <div className="flex h-[3px] rounded-full overflow-hidden gap-[1px]">
                <div className="h-full rounded-full bg-accent" style={{ width: '20%' }} />
                <div className="h-full rounded-full bg-emerald" style={{ width: '30%' }} />
                <div className="h-full rounded-full bg-accent/60" style={{ width: '27%' }} />
                <div className="h-full rounded-full bg-muted-foreground/30" style={{ width: '23%' }} />
              </div>
            </div>
            {/* Milestone amounts */}
            <div className="divide-y divide-border/40 mt-2.5">
              {milestoneSummary.map((m) => (
                <div key={m.name} className="flex items-center justify-between px-4 py-2">
                  <span className="text-[12px] text-foreground/70">{m.name}</span>
                  <span className="font-mono text-[12px] font-semibold text-accent/80 tabular-nums">{m.value}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-between border-t border-border px-4 py-2.5">
              <span className="text-[12px] font-medium text-foreground/80">Total in escrow</span>
              <span className="font-mono text-[14px] font-bold text-foreground tabular-nums">R$ 15.000</span>
            </div>
          </div>

          {/* On-chain info */}
          <div className="rounded-lg border border-border overflow-hidden">
            <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-border/60">
              <span className="text-[9px] font-semibold uppercase tracking-[0.2em] text-muted-foreground/35">
                On-Chain
              </span>
            </div>
            <div className="divide-y divide-border/40">
              {[
                { label: "Network", value: "Hedera Testnet" },
                { label: "Standard", value: "ERC-8004" },
                { label: "Timeout", value: "7 days per milestone" },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between px-4 py-2">
                  <span className="text-[11px] text-muted-foreground/40">{label}</span>
                  <span className="text-[12px] font-medium text-foreground/80">{value}</span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Fixed bottom CTA */}
      <div className="shrink-0 border-t border-border p-4">
        <button
          type="button"
          onClick={handleDeploy}
          disabled={deploying}
          className={cn(
            "flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-[10px] font-semibold uppercase tracking-[0.12em] transition-all",
            deploying
              ? "border border-border bg-card text-muted-foreground cursor-not-allowed"
              : "bg-accent/10 border border-accent/20 text-accent hover:bg-accent/15 hover:border-accent/30 active:scale-[0.99]"
          )}
        >
          {deploying ? (
            <>
              <LoaderIcon className="size-3 animate-spin" />
              Publishing contract...
            </>
          ) : (
            <>
              <ShieldCheckIcon className="size-3" />
              Publish and configure Sentinel
              <ArrowRightIcon className="size-2.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
