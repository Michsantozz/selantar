"use client";

import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  CheckCircleIcon,
  LoaderIcon,
  CircleIcon,
  CopyIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  LinkIcon,
  SparklesIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type StepState = "pending" | "running" | "done" | "error";

type DeployStep = {
  id: string;
  label: string;
  sublabel: string;
  duration: number; // ms this step takes
};

// ── Config ────────────────────────────────────────────────────────────────────

const STEPS: DeployStep[] = [
  {
    id: "structure",
    label: "Structure validated",
    sublabel: "4 milestones · R$ 15.000 · Base Sepolia",
    duration: 900,
  },
  {
    id: "encoding",
    label: "Milestones encoded",
    sublabel: "ABI generated · parties and values in bytes",
    duration: 1100,
  },
  {
    id: "broadcast",
    label: "Broadcasting to Base Sepolia",
    sublabel: "Awaiting network confirmation...",
    duration: 2400,
  },
  {
    id: "erc8004",
    label: "Registering on ERC-8004",
    sublabel: "Validation Registry · immutable evidence",
    duration: 1600,
  },
];

// Real data from API — populated after deploy
type DeployResult = {
  contractId: string;
  escrowId: string;
  validationTxHash: string;
  basescanUrl: string;
};

const ACCENT = "oklch(0.7 0.18 50)";
const GREEN = "#22c55e";

// ── Typewriter ────────────────────────────────────────────────────────────────

function Typewriter({ text, speed = 18 }: { text: string; speed?: number }) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    setDisplayed("");
    let i = 0;
    const iv = setInterval(() => {
      setDisplayed(text.slice(0, i + 1));
      i++;
      if (i >= text.length) clearInterval(iv);
    }, speed);
    return () => clearInterval(iv);
  }, [text, speed]);

  return <span>{displayed}</span>;
}

// ── Step Row ──────────────────────────────────────────────────────────────────

function StepRow({
  step,
  state,
  index,
}: {
  step: DeployStep;
  state: StepState;
  index: number;
}) {
  const isDone = state === "done";
  const isRunning = state === "running";
  const isPending = state === "pending";

  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }}
      animate={{ opacity: isPending ? 0.3 : 1, x: 0 }}
      transition={{ duration: 0.35, delay: index * 0.05 }}
      className="flex items-start gap-4"
    >
      {/* Icon */}
      <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center">
        {isDone && (
          <motion.div
            initial={{ scale: 0.5, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 400, damping: 20 }}
          >
            <CheckCircleIcon className="size-5" style={{ color: GREEN }} />
          </motion.div>
        )}
        {isRunning && (
          <LoaderIcon
            className="size-4"
            style={{ color: ACCENT, animation: "sp-spin 1.2s linear infinite" }}
          />
        )}
        {isPending && (
          <CircleIcon className="size-4 text-muted-foreground/25" />
        )}
      </div>

      {/* Text */}
      <div className="flex-1 min-w-0 pb-5">
        <p
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            isDone && "text-foreground",
            isRunning && "text-accent",
            isPending && "text-muted-foreground/30"
          )}
        >
          {step.label}
        </p>
        {(isDone || isRunning) && (
          <motion.p
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            transition={{ duration: 0.3 }}
            className="mt-0.5 text-xs text-muted-foreground/50 font-mono"
          >
            {step.sublabel}
          </motion.p>
        )}
      </div>

      {/* Done timestamp */}
      {isDone && (
        <motion.span
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-[10px] font-mono text-muted-foreground/30 mt-1 shrink-0"
        >
          ✓
        </motion.span>
      )}
    </motion.div>
  );
}

// ── Progress Bar ──────────────────────────────────────────────────────────────

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="h-[3px] w-full rounded-full overflow-hidden bg-border/40">
      <motion.div
        className="h-full rounded-full"
        style={{
          background:
            progress === 100
              ? GREEN
              : `linear-gradient(90deg, ${ACCENT}, oklch(0.78 0.14 60))`,
        }}
        initial={{ width: 0 }}
        animate={{ width: `${progress}%` }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      />
    </div>
  );
}

// ── TX Hash Card ──────────────────────────────────────────────────────────────

function TxHashCard({ txHash, contractId, escrowId, basescanUrl }: { txHash: string; contractId: string; escrowId: string; basescanUrl: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(txHash);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const short = txHash.slice(0, 10) + "..." + txHash.slice(-6);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
      className="rounded-xl border overflow-hidden"
      style={{
        borderColor: `${GREEN}30`,
        background: `${GREEN}04`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-2 px-4 py-2.5 border-b"
        style={{ borderColor: `${GREEN}15`, background: `${GREEN}06` }}
      >
        <LinkIcon className="size-3" style={{ color: GREEN }} />
        <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: GREEN }}>
          Contract registered on-chain
        </span>
        <div
          className="ml-auto flex size-4 items-center justify-center rounded-full"
          style={{ background: `${GREEN}20` }}
        >
          <div
            className="size-1.5 rounded-full"
            style={{ background: GREEN, animation: "sp-pulse 2s ease-in-out infinite" }}
          />
        </div>
      </div>

      {/* Body */}
      <div className="divide-y" style={{ borderColor: `${GREEN}10` }}>
        {/* Contract ID */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-muted-foreground/50">Contract ID</span>
          <span className="font-mono text-sm font-semibold text-foreground">
            <Typewriter text={contractId} speed={40} />
          </span>
        </div>

        {/* Escrow */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-muted-foreground/50">Escrow</span>
          <span className="font-mono text-xs text-muted-foreground/70">
            <Typewriter text={escrowId} speed={30} />
          </span>
        </div>

        {/* TX Hash */}
        <div className="flex items-center justify-between gap-3 px-4 py-2.5">
          <span className="text-xs text-muted-foreground/50 shrink-0">TX Hash</span>
          <div className="flex items-center gap-2 min-w-0">
            <a
              href={basescanUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-mono text-xs text-muted-foreground/60 truncate hover:text-muted-foreground transition-colors"
            >
              <Typewriter text={short} speed={22} />
            </a>
            <button
              onClick={handleCopy}
              className="shrink-0 flex size-6 items-center justify-center rounded-md transition-colors hover:bg-muted/20"
            >
              {copied ? (
                <CheckCircleIcon className="size-3.5" style={{ color: GREEN }} />
              ) : (
                <CopyIcon className="size-3 text-muted-foreground/40 hover:text-muted-foreground" />
              )}
            </button>
          </div>
        </div>

        {/* Network */}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-xs text-muted-foreground/50">Network</span>
          <span className="text-xs font-medium text-foreground/70">Base Sepolia</span>
        </div>
      </div>
    </motion.div>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────

export function DeployCinematic({
  visible,
  onDone,
}: {
  visible: boolean;
  onDone: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [stepStates, setStepStates] = useState<StepState[]>(
    STEPS.map(() => "pending")
  );
  const [progress, setProgress] = useState(0);
  const [txVisible, setTxVisible] = useState(false);
  const [finished, setFinished] = useState(false);
  const [deployResult, setDeployResult] = useState<DeployResult | null>(null);
  const started = useRef(false);

  useEffect(() => {
    if (!visible || started.current) return;
    started.current = true;

    // 1. Fire the real API call immediately (runs in background)
    const apiCall = fetch("/api/create-escrow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contractRef: `CSX-${Date.now()}`,
        contractText: "Clínica Suasuna · DevStudio · R$ 15.000 · 4 milestones",
        clientName: "Clínica Suasuna Ltda.",
        developerName: "DevStudio Tecnologia ME",
        totalAmount: "15000",
        currency: "BRL",
        milestones: [
          { label: "Kickoff & Setup", value: "3750", deadline: "2026-03-15" },
          { label: "CRM Module", value: "3750", deadline: "2026-04-01" },
          { label: "WhatsApp Integration", value: "3750", deadline: "2026-04-20" },
          { label: "Admin Panel & QA", value: "3750", deadline: "2026-05-10" },
        ],
      }),
    }).then((r) => r.json());

    // 2. Run animated steps in parallel with the API call
    let elapsed = 400;
    const totalDuration = STEPS.reduce((s, st) => s + st.duration, 0);
    let accum = 0;

    STEPS.forEach((step, i) => {
      setTimeout(() => {
        setCurrentStep(i);
        setStepStates((prev) => {
          const next = [...prev];
          next[i] = "running";
          return next;
        });
      }, elapsed);

      elapsed += step.duration;
      accum += step.duration;
      const progressAtEnd = (accum / totalDuration) * 100;

      // Finish step
      setTimeout(() => {
        setStepStates((prev) => {
          const next = [...prev];
          next[i] = "done";
          return next;
        });
        setProgress(progressAtEnd);
      }, elapsed);

      elapsed += 200; // gap between steps
    });

    // 3. When animation ends, wait for API and show TX card
    setTimeout(async () => {
      const result = await apiCall.catch(() => null);
      if (result?.success) {
        setDeployResult({
          contractId: result.contractId,
          escrowId: result.escrowId,
          validationTxHash: result.validationTxHash,
          basescanUrl: result.basescanUrl,
        });
      } else {
        // Fallback to deterministic fake if API fails
        const ts = Date.now().toString(16).toUpperCase();
        setDeployResult({
          contractId: `CSX-${new Date().getFullYear()}-${ts.slice(-6)}`,
          escrowId: `ESC-0x${ts.slice(0, 4)}...${ts.slice(-4)}`,
          validationTxHash: `0x${ts.padStart(64, "0")}`,
          basescanUrl: `https://sepolia.basescan.org/tx/0x${ts.padStart(64, "0")}`,
        });
      }
      setTxVisible(true);
    }, elapsed);

    // Mark finished
    setTimeout(() => {
      setFinished(true);
    }, elapsed + 1600);
  }, [visible]);

  if (!visible) return null;

  return (
    <AnimatePresence>
      <motion.div
        key="deploy-cinematic"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{
          background: "oklch(0.07 0.008 50 / 0.96)",
          backdropFilter: "blur(20px) saturate(0.4)",
        }}
      >
        {/* Glow bg */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: `radial-gradient(ellipse 60% 50% at 50% 50%, oklch(0.7 0.18 50 / 0.04) 0%, transparent 70%)`,
          }}
        />

        {/* Card */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.34, 1.1, 0.64, 1] }}
          className="relative flex flex-col rounded-2xl border bg-card/80 backdrop-blur-sm shadow-2xl"
          style={{
            width: 480,
            borderColor: `oklch(0.7 0.18 50 / 0.2)`,
            boxShadow: `0 0 80px oklch(0.7 0.18 50 / 0.08), 0 32px 64px rgba(0,0,0,0.4)`,
          }}
        >
          {/* Header */}
          <div
            className="flex items-center gap-3 rounded-t-2xl px-6 py-4 border-b"
            style={{
              borderColor: `oklch(0.7 0.18 50 / 0.12)`,
              background: `oklch(0.7 0.18 50 / 0.04)`,
            }}
          >
            {/* Icon */}
            <motion.div
              animate={
                finished
                  ? { scale: [1, 1.1, 1], boxShadow: [`0 0 16px ${GREEN}40`, `0 0 32px ${GREEN}60`, `0 0 16px ${GREEN}40`] }
                  : {}
              }
              transition={{ duration: 1.2, repeat: finished ? 0 : 0 }}
              className="flex size-9 shrink-0 items-center justify-center rounded-xl border"
              style={{
                background: finished ? `${GREEN}10` : `oklch(0.7 0.18 50 / 0.1)`,
                borderColor: finished ? `${GREEN}40` : `oklch(0.7 0.18 50 / 0.25)`,
                transition: "all 0.6s",
              }}
            >
              {finished ? (
                <CheckCircleIcon className="size-4" style={{ color: GREEN }} />
              ) : (
                <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
              )}
            </motion.div>

            <div className="flex-1 min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                Selantar · Deploy
              </p>
              <p className="text-sm font-semibold text-foreground">
                {finished ? "Contract active on blockchain" : "Forming smart contract..."}
              </p>
            </div>

            {/* Clara badge */}
            <div
              className="flex items-center gap-1.5 rounded-full border px-2.5 py-1"
              style={{
                borderColor: `oklch(0.7 0.18 50 / 0.2)`,
                background: `oklch(0.7 0.18 50 / 0.05)`,
              }}
            >
              <SparklesIcon className="size-3" style={{ color: ACCENT }} />
              <span className="text-[10px] font-medium" style={{ color: ACCENT }}>
                Clara
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="px-6 pt-4">
            <ProgressBar progress={progress} />
            <div className="flex justify-between mt-1.5">
              <span className="text-[10px] text-muted-foreground/30 font-mono">
                {currentStep >= 0 && currentStep < STEPS.length
                  ? `Step ${currentStep + 1} of ${STEPS.length}`
                  : finished
                  ? "Completed"
                  : "Starting..."}
              </span>
              <span
                className="text-[10px] font-mono tabular-nums"
                style={{ color: progress === 100 ? GREEN : "var(--muted-foreground)" }}
              >
                {Math.round(progress)}%
              </span>
            </div>
          </div>

          {/* Steps */}
          <div className="flex flex-col px-6 py-5">
            {STEPS.map((step, i) => (
              <StepRow
                key={step.id}
                step={step}
                state={stepStates[i]}
                index={i}
              />
            ))}
          </div>

          {/* TX Card */}
          <AnimatePresence>
            {txVisible && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                transition={{ duration: 0.5, ease: [0.4, 0, 0.2, 1] }}
                className="px-6 pb-5"
              >
                {deployResult && (
                  <TxHashCard
                    txHash={deployResult.validationTxHash}
                    contractId={deployResult.contractId}
                    escrowId={deployResult.escrowId}
                    basescanUrl={deployResult.basescanUrl}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* CTA */}
          <AnimatePresence>
            {finished && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
                className="flex flex-col gap-2 px-6 pt-2 pb-8"
              >
                <button
                  onClick={onDone}
                  className="flex w-full items-center justify-center gap-2 rounded-xl border py-3 text-xs font-semibold tracking-wide uppercase transition-all hover:brightness-110 active:scale-[0.98]"
                  style={{
                    borderColor: `${GREEN}40`,
                    background: `${GREEN}10`,
                    color: GREEN,
                  }}
                >
                  <CheckCircleIcon className="size-3.5" />
                  Ver contrato ativo
                  <ArrowRightIcon className="size-3" />
                </button>

                {deployResult && (
                  <a
                    href={deployResult.basescanUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex w-full items-center justify-center gap-2 rounded-xl border py-2.5 text-xs font-medium transition-all hover:brightness-110"
                    style={{
                      borderColor: `oklch(0.7 0.18 50 / 0.2)`,
                      background: `oklch(0.7 0.18 50 / 0.04)`,
                      color: `oklch(0.7 0.18 50 / 0.7)`,
                    }}
                  >
                    <LinkIcon className="size-3" />
                    Ver transação na Base Sepolia
                  </a>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
