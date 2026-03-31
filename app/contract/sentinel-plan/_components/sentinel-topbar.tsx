import {
  ShieldCheckIcon,
  CheckCircleIcon,
  LoaderIcon,
  ArrowRightIcon,
} from "lucide-react";
import { ACCENT, GREEN, MUTED } from "./sentinel-constants";

interface SentinelTopbarProps {
  isRunning: boolean;
  progress: number;
  phase: string | null;
  approving: boolean;
  onApprove: () => void;
  approvedCount?: number;
}

export function SentinelTopbar({
  isRunning,
  progress,
  phase,
  approving,
  onApprove,
  approvedCount,
}: SentinelTopbarProps) {
  return (
    <div className="shrink-0 flex h-14 items-center gap-3 border-b border-border bg-card/50 px-6">
      <div
        className="flex size-9 items-center justify-center rounded-xl border"
        style={{
          background: isRunning ? `oklch(0.7 0.18 50 / 0.12)` : `oklch(0.7 0.18 50 / 0.08)`,
          borderColor: `oklch(0.7 0.18 50 / 0.3)`,
          boxShadow: isRunning ? `0 0 16px oklch(0.7 0.18 50 / 0.2)` : undefined,
          transition: "all 0.5s",
        }}
      >
        <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
      </div>
      <div className="min-w-0">
        <h1 className="text-sm font-semibold text-foreground tracking-tight">Sentinel</h1>
        <p className="text-[10px] text-muted-foreground/50 uppercase tracking-widest">
          Monitoring Plan
        </p>
      </div>

      <div className="ml-auto flex items-center gap-4">
        {isRunning && phase && (
          <div
            className="flex items-center gap-2 rounded-full border px-3 py-1"
            style={{ borderColor: `oklch(0.7 0.18 50 / 0.2)`, background: `oklch(0.7 0.18 50 / 0.05)` }}
          >
            <div className="size-1.5 rounded-full" style={{ background: ACCENT, animation: "sp-pulse 1s ease-in-out infinite" }} />
            <span className="text-[11px] text-accent font-medium">{phase}</span>
          </div>
        )}

        {progress > 0 && (
          <div className="flex items-center gap-2.5">
            <div className="h-1.5 w-28 overflow-hidden rounded-full" style={{ background: `${MUTED}30` }}>
              <div
                className="h-full rounded-full"
                style={{
                  width: `${progress}%`,
                  background: progress === 100 ? GREEN : `linear-gradient(90deg, ${ACCENT}, oklch(0.75 0.15 60))`,
                  transition: "width 0.7s cubic-bezier(0.4, 0, 0.2, 1)",
                }}
              />
            </div>
            <span className="text-[10px] font-mono tabular-nums" style={{ color: progress === 100 ? GREEN : MUTED }}>
              {Math.round(progress)}%
            </span>
          </div>
        )}

        {!isRunning && progress === 100 && (
          <>
            <div
              className="flex items-center gap-1.5 rounded-full border px-3 py-1"
              style={{ borderColor: `${GREEN}40`, background: `${GREEN}08` }}
            >
              <CheckCircleIcon className="size-3" style={{ color: GREEN }} />
              <span className="text-[11px] font-semibold" style={{ color: GREEN }}>{approvedCount ?? 5} actions approved</span>
            </div>

            <button
              onClick={onApprove}
              disabled={approving}
              className="flex items-center gap-2 rounded-xl border px-5 py-2 text-xs font-semibold transition-all disabled:opacity-50"
              style={{
                borderColor: `${GREEN}50`,
                background: `${GREEN}10`,
                color: GREEN,
              }}
            >
              {approving ? (
                <>
                  <LoaderIcon className="size-3" style={{ animation: "sp-spin 1.5s linear infinite" }} />
                  Activating...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="size-3" />
                  Approve plan and activate contract
                  <ArrowRightIcon className="size-3" />
                </>
              )}
            </button>
          </>
        )}

        {isRunning && (
          <button
            disabled
            className="flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-semibold opacity-30 cursor-not-allowed"
            style={{ borderColor: `${MUTED}60`, color: MUTED }}
          >
            <LoaderIcon className="size-3" style={{ animation: "sp-spin 1.5s linear infinite" }} />
            Planning...
          </button>
        )}
      </div>
    </div>
  );
}
