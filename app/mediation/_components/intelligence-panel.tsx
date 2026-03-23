"use client";

import { useMemo, useEffect, useRef, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { isToolUIPart } from "ai";
import type { UIMessage } from "ai";
import {
  CheckCircle,
  AlertTriangle,
  Loader2,
  ExternalLink,
  ShieldCheck,
  Lock,
  Gavel,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { requestExecutionPermissions } from "@/lib/delegation/erc7715";
import type { Scenario } from "@/lib/scenarios";

interface IntelligencePanelProps {
  scenario?: Scenario;
  messages?: UIMessage[];
}

// Extract tool outputs from messages
function extractToolOutputs(messages: UIMessage[]) {
  let settlement: { clientAmount?: string; developerAmount?: string; split?: Record<string, number>; rationale?: string } | null = null;
  let execution: { status?: string; method?: string; txHash?: string; userOpHash?: string; explorer?: string; delegationScope?: string } | null = null;
  let feedback: { status?: string; txHash?: string; explorer?: string } | null = null;
  let verdict: { status?: string; txHash?: string; explorer?: string } | null = null;
  let isSettling = false;
  let isPostingFeedback = false;
  let isRegisteringVerdict = false;

  for (const msg of messages) {
    if (msg.role !== "assistant") continue;
    for (const part of msg.parts) {
      if (!isToolUIPart(part)) continue;
      const toolName = part.type.replace("tool-", "");
      const state = part.state;
      const output = state === "output-available" ? (part.output as Record<string, unknown> | null) : null;

      if (toolName === "proposeSettlement") {
        if (output) {
          settlement = {
            clientAmount: output.clientAmount as string | undefined,
            developerAmount: output.developerAmount as string | undefined,
            split: output.proposedSplit as Record<string, number> | undefined,
            rationale: output.rationale as string | undefined,
          };
        }
      }

      if (toolName === "executeSettlement") {
        if (state === "input-available" || state === "input-streaming") {
          isSettling = true;
        }
        if (output) {
          isSettling = false;
          execution = {
            status: output.status as string | undefined,
            method: output.method as string | undefined,
            txHash: (output.txHash ?? output.userOpHash) as string | undefined,
            userOpHash: output.userOpHash as string | undefined,
            explorer: output.explorer as string | undefined,
            delegationScope: output.delegationScope as string | undefined,
          };
        }
      }

      if (toolName === "postFeedback") {
        if (state === "input-available" || state === "input-streaming") {
          isPostingFeedback = true;
        }
        if (output) {
          isPostingFeedback = false;
          feedback = {
            status: output.status as string | undefined,
            txHash: (output.txHash ?? output.feedbackTxHash) as string | undefined,
            explorer: output.explorer as string | undefined,
          };
        }
      }

      if (toolName === "registerVerdict") {
        if (state === "input-available" || state === "input-streaming") {
          isRegisteringVerdict = true;
        }
        if (output) {
          isRegisteringVerdict = false;
          verdict = {
            status: output.status as string | undefined,
            txHash: (output.txHash ?? output.validationTxHash) as string | undefined,
            explorer: output.explorer as string | undefined,
          };
        }
      }
    }
  }

  return { settlement, execution, feedback, verdict, isSettling, isPostingFeedback, isRegisteringVerdict };
}

const AGENT_ADDRESS = "0xe765f43E8B7065729E54E563D4215727154decC9" as const;

export function IntelligencePanel({ scenario, messages = [] }: IntelligencePanelProps) {
  const clientName = scenario?.parties.client.name ?? "Client";
  const devName = scenario?.parties.developer.name ?? "Developer";
  const [erc7715Approved, setErc7715Approved] = useState(false);
  const erc7715TriggeredRef = useRef(false);

  const { settlement, execution, feedback, verdict, isSettling, isPostingFeedback, isRegisteringVerdict } = useMemo(
    () => extractToolOutputs(messages),
    [messages]
  );

  // When executeSettlement starts, open MetaMask ERC-7715 popup for approval
  useEffect(() => {
    if (!isSettling || erc7715TriggeredRef.current) return;
    erc7715TriggeredRef.current = true;

    const eth = (window as unknown as { ethereum?: { request: (a: { method: string }) => Promise<string[]> } }).ethereum;
    if (!eth) return;

    (async () => {
      try {
        const accounts = await eth.request({ method: "eth_accounts" });
        const wallet = accounts?.[0];
        if (!wallet) return;

        await requestExecutionPermissions({
          clientAddress: wallet as `0x${string}`,
          agentAddress: AGENT_ADDRESS,
          expirySeconds: 300,
        });
        setErc7715Approved(true);
      } catch (err) {
        console.warn("ERC-7715 settlement approval skipped:", err);
      }
    })();
  }, [isSettling]);

  // Derive settlement display values from real tool output
  const hasSettlement = !!settlement;
  const hasExecution = !!execution;
  const splitEntries = settlement?.split ? Object.entries(settlement.split) : null;
  const devPct = splitEntries?.find(([k]) => k.toLowerCase().includes("dev"))?.[1];
  const clientPct = splitEntries?.find(([k]) => !k.toLowerCase().includes("dev"))?.[1];
  const devAmount = settlement?.developerAmount;
  const clientAmount = settlement?.clientAmount;

  // Build timeline steps dynamically
  const timeline = [
    { label: "Contract signed", date: "Feb 12", status: "done" as const, usdc: null, summary: `${scenario?.contract.scope ?? "Contract"}, ${scenario?.contract.duration ?? ""}` },
    { label: "Phase 1 — Discovery", date: "Feb 28", status: "done" as const, usdc: "100 USDC", summary: "Completed and approved" },
    { label: "Phase 2 — Build", date: "Mar 10", status: "done" as const, usdc: "150 USDC", summary: "Delivered and approved" },
    { label: "Phase 3 — Final Delivery", date: "Mar 15", status: (hasExecution ? "done" : "disputed") as "done" | "disputed" | "active" | "pending", usdc: "250 USDC", summary: scenario?.dispute?.slice(0, 60) ?? "In dispute" },
    { label: "Dispute filed", date: "Mar 15", status: "active" as const, usdc: null, summary: "Client claims delivery delays" },
    { label: "Settlement", date: hasExecution ? "Mar 20" : "—", status: (hasExecution ? "done" : hasSettlement ? "active" : "pending") as "done" | "disputed" | "active" | "pending", usdc: null, summary: hasExecution ? "Settled on-chain" : hasSettlement ? "Awaiting signatures" : "Awaiting mediation outcome" },
  ];

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Escrow Card — V2 style */}
      <div className="rounded-lg border border-primary/15 bg-primary/[0.02] p-3">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-md border border-primary/20 bg-primary/[0.08]">
              <Lock className="size-3.5 text-primary" />
            </div>
            <div>
              <span className="text-xs font-medium text-foreground">Escrow</span>
              <span className="text-xs text-foreground/40 block">Phase 3 — in dispute</span>
            </div>
          </div>
          <div className="text-right">
            <span className="text-xl font-mono font-normal tracking-tight text-foreground leading-none">
              {scenario?.escrow?.replace(/[^\d,]/g, "") ?? "250"}
            </span>
            <span className="text-xs font-mono text-foreground/40 ml-0.5">
              {scenario?.contract.currency === "BRL" ? "BRL" : "USDC"}
            </span>
          </div>
        </div>

        {/* Bar */}
        <div className="relative h-2.5 w-full rounded-md overflow-hidden bg-muted/20 border border-border">
          <div
            className="absolute inset-y-0 left-0 bg-emerald/60 rounded-l-md transition-all duration-700"
            style={{ width: hasExecution ? "100%" : "50%" }}
          />
          {!hasExecution && (
            <div
              className="absolute inset-y-0 right-0 bg-primary/50 rounded-r-md animate-subtle-pulse"
              style={{ width: "50%" }}
            />
          )}
        </div>

        <div className="flex items-center justify-between mt-1.5">
          <div className="flex items-center gap-1.5">
            <CheckCircle className="size-3 text-emerald/60" />
            <span className="text-xs text-emerald/70">
              {hasExecution ? "All released" : "250 released"}
            </span>
          </div>
          {!hasExecution && (
            <div className="flex items-center gap-1.5">
              <Lock className="size-3 text-primary/60" />
              <span className="text-xs text-primary/70">250 locked</span>
            </div>
          )}
        </div>
      </div>

      {/* Contract Progress — detailed timeline */}
      <div className="rounded-lg border border-border bg-card p-3">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          Contract Progress
        </span>

        <div className="mt-2.5 space-y-0">
          {timeline.map((step, i) => {
            const isLast = i === timeline.length - 1;
            return (
              <div key={i} className="flex gap-2">
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border",
                      step.status === "done" && "border-emerald/30 bg-emerald/10",
                      step.status === "disputed" && "border-destructive/30 bg-destructive/10",
                      step.status === "active" && "border-primary/30 bg-primary/10",
                      step.status === "pending" && "border-border bg-muted/20"
                    )}
                  >
                    {step.status === "done" && <CheckCircle className="size-2.5 text-emerald" />}
                    {step.status === "disputed" && <AlertTriangle className="size-2.5 text-destructive" />}
                    {step.status === "active" && <Gavel className="size-2.5 text-primary" />}
                    {step.status === "pending" && <Circle className="size-2.5 text-muted-foreground/30" />}
                  </div>
                  {!isLast && (
                    <div
                      className={cn(
                        "w-px flex-1 min-h-[12px]",
                        step.status === "done" ? "bg-emerald/20" : "bg-border"
                      )}
                    />
                  )}
                </div>
                <div className="pb-2 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p
                      className={cn(
                        "text-xs leading-tight",
                        step.status === "active" && "font-medium text-primary",
                        step.status === "disputed" && "font-medium text-destructive",
                        step.status === "done" && "text-foreground",
                        step.status === "pending" && "text-foreground"
                      )}
                    >
                      {step.label}
                    </p>
                    {step.usdc && (
                      <span
                        className={cn(
                          "text-xs font-mono shrink-0",
                          step.status === "done" && "text-emerald/60",
                          step.status === "disputed" && "text-primary/60",
                          step.status === "active" && "text-primary/60",
                          step.status === "pending" && "text-muted-foreground/40"
                        )}
                      >
                        {step.usdc}
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground/40">{step.date}</p>
                  {step.summary && (
                    <p
                      className={cn(
                        "text-xs leading-snug mt-0.5",
                        step.status === "disputed" && "text-destructive/60",
                        step.status === "active" && "text-primary/60",
                        step.status === "pending" && "text-muted-foreground/30",
                        step.status === "done" && "text-foreground/40"
                      )}
                    >
                      {step.summary}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Evidence — colored items */}
      <div id="med-evidence" className="rounded-xl border border-border bg-card p-5 flex-1">
        <div className="flex items-center gap-2 mb-4">
          <span className="size-2 rounded-full bg-accent" />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Evidence
          </span>
        </div>

        <div className="space-y-2">
          {scenario ? (
            scenario.evidence.map((item, i) => (
              <EvidenceItem key={i} text={item} status="verified" />
            ))
          ) : (
            <>
              <EvidenceItem text="Calendar link sent: Tuesday 09:14am" status="verified" />
              <EvidenceItem text="AI model: fully trained & tested" status="verified" />
              <EvidenceItem text="Front desk: did not follow up on message" status="breach" />
              <EvidenceItem text="Phases 1 & 2: completed successfully" status="verified" />
            </>
          )}
        </div>
      </div>

      {/* Settlement Status — dynamic from tool outputs */}
      <div id="med-settlement-status" className="rounded-xl border border-primary/20 bg-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <span className="size-2 rounded-full bg-primary" />
          <span className="text-xs font-medium uppercase tracking-wider text-primary/70">
            Settlement Status
          </span>
        </div>

        {hasSettlement ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{devName}</span>
              <span className="text-sm font-mono text-foreground">
                {devAmount ? `${devAmount}` : devPct != null ? `${devPct}%` : "—"}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground">{clientName}</span>
              <span className="text-sm font-mono text-foreground">
                {clientAmount ? `${clientAmount}` : clientPct != null ? `${clientPct}%` : "—"}
              </span>
            </div>
            {splitEntries && (
              <>
                <div className="h-px bg-border my-1" />
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-muted-foreground/60">Split</span>
                  <span className="text-[11px] font-mono text-primary">
                    {devPct ?? "?"} / {clientPct ?? "?"}
                  </span>
                </div>
              </>
            )}
          </div>
        ) : (
          <p className="text-[11px] text-muted-foreground/40 text-center py-2">
            Awaiting settlement proposal...
          </p>
        )}

        {/* Status badge — reacts to execution state */}
        {isSettling ? (
          <Badge
            variant="outline"
            className="mt-3 w-full justify-center border-primary/30 bg-primary/10 text-primary text-[10px] uppercase tracking-wider py-1"
          >
            <Loader2 className="size-3 mr-1.5 animate-spin" />
            {erc7715Approved ? "ERC-7715 approved — executing..." : "Executing on-chain..."}
          </Badge>
        ) : hasExecution ? (
          <>
            <Badge
              variant="outline"
              className="mt-3 w-full justify-center border-emerald/30 bg-emerald/10 text-emerald text-[10px] uppercase tracking-wider py-1"
            >
              <CheckCircle className="size-3 mr-1.5" />
              Confirmed on-chain
            </Badge>
            {erc7715Approved && (
              <div className="mt-1.5 flex items-center justify-center gap-1.5 text-[9px] text-primary/60">
                <ShieldCheck className="size-3" />
                <span className="font-mono">ERC-7715 authorized</span>
              </div>
            )}
          </>
        ) : hasSettlement ? (
          <Badge
            variant="outline"
            className="mt-3 w-full justify-center border-primary/20 bg-primary/5 text-primary/70 text-[10px] uppercase tracking-wider py-1"
          >
            Proposed — awaiting execution
          </Badge>
        ) : null}

        {/* On-chain TX links */}
        {(execution?.explorer || feedback?.explorer || verdict?.explorer) && (
          <div className="mt-3 pt-3 border-t border-border space-y-1.5">
            {execution?.explorer && (
              <TxLink label="Settlement" href={execution.explorer} method={execution.method} />
            )}
            {feedback?.explorer && (
              <TxLink label="Reputation" href={feedback.explorer} />
            )}
            {verdict?.explorer && (
              <TxLink label="Verdict" href={verdict.explorer} />
            )}
          </div>
        )}

        {/* Loading states for ERC-8004 */}
        {(isPostingFeedback || isRegisteringVerdict) && (
          <div className="mt-2 flex items-center gap-2 text-[10px] text-muted-foreground/50">
            <Loader2 className="size-3 animate-spin text-primary/50" />
            {isPostingFeedback ? "Posting reputation..." : "Registering verdict..."}
          </div>
        )}
      </div>
    </div>
  );
}

function TxLink({ label, href, method }: { label: string; href: string; method?: string }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] text-muted-foreground/60">{label}</span>
        {method === "delegation" && (
          <span className="rounded border border-primary/20 bg-primary/10 px-1 py-0.5 text-[8px] font-mono text-primary">
            delegation
          </span>
        )}
      </div>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1 text-[10px] font-mono text-primary hover:underline"
      >
        BaseScan
        <ExternalLink className="size-2.5" />
      </a>
    </div>
  );
}

function EvidenceItem({
  text,
  status,
}: {
  text: string;
  status: "verified" | "breach";
}) {
  return (
    <div
      className={`flex items-start gap-2.5 rounded-md border px-3 py-2 ${
        status === "verified"
          ? "border-border bg-muted/10"
          : "border-destructive/20 bg-destructive/[0.04]"
      }`}
    >
      <div
        className={`flex size-5 shrink-0 items-center justify-center rounded mt-0.5 ${
          status === "verified" ? "bg-emerald/10" : "bg-destructive/10"
        }`}
      >
        {status === "verified" ? (
          <CheckCircle className="size-3 text-emerald" />
        ) : (
          <AlertTriangle className="size-3 text-destructive" />
        )}
      </div>
      <p
        className={`text-[11px] leading-relaxed ${
          status === "verified"
            ? "text-muted-foreground"
            : "text-destructive/80"
        }`}
      >
        {text}
      </p>
    </div>
  );
}
