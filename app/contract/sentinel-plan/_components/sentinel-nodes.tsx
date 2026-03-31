import {
  Handle,
  Position,
  type Node,
  type NodeProps,
} from "@xyflow/react";
import {
  FileTextIcon,
  CheckCircleIcon,
  LoaderIcon,
  ShieldCheckIcon,
  ClockIcon,
  MessageCircleIcon,
  CalendarIcon,
  SparklesIcon,
  CheckIcon,
  XIcon,
} from "lucide-react";
import {
  ACCENT,
  GREEN,
  RED,
  YELLOW,
  MUTED,
  actionIcons,
  statusConfig,
  colorMap,
  type ActionStatus,
  type ContractNodeData,
  type AnalysisNodeData,
  type ActionNodeData,
  type MilestoneNodeData,
  type DateNodeData,
  type SentinelSayData,
} from "./sentinel-constants";

// ── Contract Node ───────────────────────────────────────────────────────────

function ContractNode({ data }: NodeProps<Node<ContractNodeData>>) {
  return (
    <div
      className="flex flex-col rounded-2xl border backdrop-blur-sm overflow-hidden"
      style={{
        width: 320,
        borderColor: `oklch(0.7 0.18 50 / 0.4)`,
        background: `oklch(0.7 0.18 50 / 0.04)`,
        boxShadow: `0 0 30px oklch(0.7 0.18 50 / 0.08)`,
      }}
    >
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3"
        style={{
          background: `oklch(0.7 0.18 50 / 0.08)`,
          borderBottom: `1px solid oklch(0.7 0.18 50 / 0.15)`,
        }}
      >
        <div
          className="flex size-8 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `oklch(0.7 0.18 50 / 0.15)`, border: `1px solid oklch(0.7 0.18 50 / 0.25)` }}
        >
          <FileTextIcon className="size-4" style={{ color: ACCENT }} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[10px] font-bold uppercase tracking-widest" style={{ color: `oklch(0.7 0.18 50 / 0.7)` }}>
            Contract Received
          </p>
          <p className="text-[13px] font-semibold text-foreground truncate">{data.title}</p>
        </div>
      </div>

      {/* Body */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-2 px-4 py-3">
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Client</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.parties.client}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Dev</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.parties.dev}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Value</p>
          <p className="text-[11px] font-bold" style={{ color: GREEN }}>{data.value}</p>
        </div>
        <div>
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Deadline</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.duration}</p>
        </div>
        <div className="col-span-2">
          <p className="text-[9px] text-muted-foreground/40 uppercase tracking-wider">Milestones</p>
          <p className="text-[11px] font-medium text-foreground/80">{data.milestones} deliverables mapped</p>
        </div>
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: ACCENT, border: "none", width: 10, height: 10, bottom: -5 }}
      />
    </div>
  );
}

// ── Analysis Node ───────────────────────────────────────────────────────────

function AnalysisNode({ data }: NodeProps<Node<AnalysisNodeData>>) {
  const isDone = data.status === "done";
  const isRunning = data.status === "running";

  return (
    <div
      className="flex flex-col rounded-2xl border backdrop-blur-sm"
      style={{
        width: 320,
        borderColor: isDone ? `${GREEN}50` : isRunning ? ACCENT : `${MUTED}50`,
        background: isDone ? `${GREEN}04` : isRunning ? `oklch(0.7 0.18 50 / 0.04)` : `oklch(0.11 0.005 50 / 0.8)`,
        boxShadow: isRunning ? `0 0 30px oklch(0.7 0.18 50 / 0.1)` : undefined,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: isDone ? GREEN : ACCENT, border: "none", width: 10, height: 10, top: -5 }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-3 rounded-t-2xl px-4 py-3"
        style={{
          borderBottom: `1px solid ${isDone ? `${GREEN}15` : isRunning ? `oklch(0.7 0.18 50 / 0.12)` : `${MUTED}30`}`,
          background: isDone ? `${GREEN}06` : isRunning ? `oklch(0.7 0.18 50 / 0.06)` : `${MUTED}08`,
        }}
      >
        <div
          className="flex size-7 shrink-0 items-center justify-center rounded-full"
          style={{
            background: isDone ? `${GREEN}18` : `oklch(0.7 0.18 50 / 0.15)`,
            border: `1.5px solid ${isDone ? `${GREEN}35` : `oklch(0.7 0.18 50 / 0.3)`}`,
          }}
        >
          {isDone ? (
            <CheckCircleIcon className="size-3.5" style={{ color: GREEN }} />
          ) : isRunning ? (
            <LoaderIcon className="size-3.5" style={{ color: ACCENT, animation: "sp-spin 1.5s linear infinite" }} />
          ) : (
            <ShieldCheckIcon className="size-3.5" style={{ color: MUTED }} />
          )}
        </div>
        <p className="text-[13px] font-semibold text-foreground">{data.label}</p>
      </div>

      {/* Findings */}
      <div className="flex flex-col gap-1.5 px-4 py-3">
        {(data.findings as string[]).map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircleIcon
              className="size-3 mt-0.5 shrink-0"
              style={{
                color: isDone ? GREEN : isRunning && i < 2 ? ACCENT : MUTED,
                opacity: isDone || (isRunning && i < 2) ? 0.8 : 0.3,
                transition: "all 0.3s",
              }}
            />
            <p
              className="text-[11px] leading-relaxed"
              style={{
                color: isDone || (isRunning && i < 2) ? "var(--foreground)" : MUTED,
                opacity: isDone || (isRunning && i < 2) ? 0.7 : 0.4,
                transition: "all 0.3s",
              }}
            >
              {f}
            </p>
          </div>
        ))}
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: isDone ? GREEN : ACCENT, border: "none", width: 10, height: 10, bottom: -5 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="to-milestones"
        style={{ background: isDone ? GREEN : ACCENT, border: "none", width: 8, height: 8 }}
      />
    </div>
  );
}

// ── Action Node ─────────────────────────────────────────────────────────────

function ActionNode({ data }: NodeProps<Node<ActionNodeData>>) {
  const icon = data.icon as keyof typeof actionIcons;
  const status = data.status as ActionStatus;
  const Icon = actionIcons[icon];
  const st = statusConfig[status];
  const isPending = status === "pending";
  const isSuggested = status === "suggested";
  const actionColor = colorMap[icon];

  return (
    <div
      className="flex flex-col rounded-xl border backdrop-blur-sm overflow-hidden"
      style={{
        width: 290,
        borderColor: isPending ? `${MUTED}40` : st.border,
        background: isPending ? "oklch(0.11 0.005 50 / 0.6)" : st.bg,
        boxShadow: isSuggested ? `0 0 24px ${actionColor}10` : undefined,
        opacity: status === "rejected" || status === "declined" ? 0.5 : isPending ? 0.4 : 1,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: isSuggested ? "sp-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: actionColor, border: "none", width: 8, height: 8, top: -4 }}
      />

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5"
        style={{
          borderBottom: `1px solid ${isPending ? `${MUTED}20` : `${st.color}15`}`,
          background: isPending ? `${MUTED}06` : `${actionColor}06`,
        }}
      >
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: `${actionColor}15`, border: `1px solid ${actionColor}25` }}
        >
          {Icon && <Icon className="size-3" style={{ color: actionColor }} />}
        </div>
        <p className="text-[12px] font-semibold text-foreground/90 flex-1 truncate">
          {data.label}
        </p>

        {/* Status badge */}
        {!isPending && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: `${st.color}12`,
              border: `1px solid ${st.color}25`,
              animation: st.animate ? "sp-pulse 2s ease-in-out infinite" : undefined,
            }}
          >
            <st.icon className="size-2.5" style={{ color: st.color }} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: st.color }}>
              {st.label}
            </span>
          </div>
        )}
      </div>

      {/* Timestamp bar */}
      {data.timestamp && !isPending && (
        <div className="flex items-center gap-1.5 px-3.5 py-1" style={{ background: `${st.color}04`, borderBottom: `1px solid ${st.color}08` }}>
          <ClockIcon className="size-2.5" style={{ color: `${st.color}80` }} />
          <span className="text-[9px] font-mono" style={{ color: `${st.color}90` }}>
            {data.timestamp}
          </span>
        </div>
      )}

      {/* Body */}
      <div className="flex flex-col gap-2 px-3.5 py-2.5">
        <p className="text-[10px] leading-relaxed text-muted-foreground/70">
          {data.description}
        </p>

        {/* Meta tags */}
        <div className="flex flex-wrap gap-1.5">
          {data.frequency && (
            <span
              className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-semibold uppercase tracking-wider"
              style={{ color: `${actionColor}cc`, background: `${actionColor}10`, border: `1px solid ${actionColor}20` }}
            >
              <ClockIcon className="size-2" />
              {data.frequency}
            </span>
          )}
          {data.target && (
            <span
              className="rounded-full px-2 py-0.5 text-[8px] font-medium text-muted-foreground/50"
              style={{ background: `${MUTED}15`, border: `1px solid ${MUTED}25` }}
            >
              {data.target}
            </span>
          )}
          {data.milestone && (
            <span
              className="rounded-full px-2 py-0.5 text-[8px] font-medium"
              style={{ color: ACCENT, background: `oklch(0.7 0.18 50 / 0.08)`, border: `1px solid oklch(0.7 0.18 50 / 0.2)` }}
            >
              {data.milestone}
            </span>
          )}
        </div>

        {/* Sent to indicator */}
        {data.sentTo && ["sent", "waiting", "accepted", "declined"].includes(status) && (
          <div
            className="flex items-center gap-2 rounded-lg border px-2.5 py-1.5 mt-0.5"
            style={{
              borderColor: `${st.color}20`,
              background: `${st.color}06`,
            }}
          >
            <MessageCircleIcon className="size-3 shrink-0" style={{ color: st.color }} />
            <div className="flex-1 min-w-0">
              <p className="text-[9px] text-muted-foreground/50">
                {status === "sent" ? "Sent to" : status === "waiting" ? "Awaiting response from" : status === "accepted" ? "Accepted by" : "Declined by"}
              </p>
              <p className="text-[10px] font-semibold truncate" style={{ color: st.color }}>
                {data.sentTo}
              </p>
            </div>
            {status === "waiting" && (
              <LoaderIcon className="size-3 shrink-0" style={{ color: YELLOW, animation: "sp-spin 2s linear infinite" }} />
            )}
          </div>
        )}

        {/* Action buttons (only when suggested) */}
        {isSuggested && (
          <div className="flex gap-2 mt-1">
            <button
              onClick={data.onApprove}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10px] font-semibold transition-all hover:brightness-125"
              style={{ borderColor: `${GREEN}40`, background: `${GREEN}10`, color: GREEN }}
            >
              <CheckIcon className="size-3" />
              Approve
            </button>
            <button
              onClick={data.onReject}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-1.5 text-[10px] font-semibold transition-all hover:brightness-125"
              style={{ borderColor: `${RED}30`, background: `${RED}08`, color: `${RED}cc` }}
            >
              <XIcon className="size-3" />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// ── Date Node ───────────────────────────────────────────────────────────────

function DateNode({ data }: NodeProps<Node<DateNodeData>>) {
  const isLate = data.isLate ?? false;
  const color = isLate ? RED : ACCENT;

  return (
    <div
      className="relative"
      style={{
        width: 120,
        animation: "sp-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      {/* Outer container — pill shape */}
      <div
        style={{
          borderRadius: 20,
          border: `2px solid ${color}`,
          background: `oklch(0.08 0.01 50)`,
          overflow: "hidden",
        }}
      >
        {/* Top accent strip — solid color bar */}
        <div style={{ height: 4, background: color }} />

        {/* Content */}
        <div className="flex items-center gap-2.5 px-3 py-2.5">
          {/* Calendar icon circle */}
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-full"
            style={{
              background: `${color}`,
              boxShadow: `0 0 16px ${color}40`,
            }}
          >
            <CalendarIcon className="size-4" style={{ color: "oklch(0.08 0.01 50)" }} />
          </div>

          {/* Date text */}
          <div>
            <p
              className="font-mono text-[22px] font-black leading-none tabular-nums tracking-tight"
              style={{ color: "var(--foreground)" }}
            >
              {data.day}
            </p>
            <p
              className="text-[11px] font-bold uppercase tracking-widest mt-0.5"
              style={{ color }}
            >
              {data.month}
            </p>
          </div>
        </div>
      </div>

      {/* Bottom connector — vertical line + dot */}
      <div className="flex flex-col items-center">
        <div style={{ width: 2, height: 12, background: `${color}40` }} />
        <div
          className="size-2 rounded-full"
          style={{
            background: color,
            boxShadow: `0 0 8px ${color}60`,
          }}
        />
      </div>

      <Handle
        type="source"
        position={Position.Bottom}
        style={{ background: color, border: "none", width: 0, height: 0, bottom: 0, opacity: 0 }}
      />
    </div>
  );
}

// ── Milestone Node ──────────────────────────────────────────────────────────

function MilestoneNode({ data }: NodeProps<Node<MilestoneNodeData>>) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-3"
      style={{
        width: 240,
        borderRadius: 16,
        border: `1.5px solid oklch(0.7 0.18 50 / 0.25)`,
        background: `oklch(0.1 0.005 50 / 0.85)`,
        boxShadow: `0 4px 20px oklch(0.7 0.18 50 / 0.04), inset 0 1px 0 oklch(0.7 0.18 50 / 0.06)`,
        animation: "sp-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Left}
        style={{ background: ACCENT, border: "none", width: 8, height: 8 }}
      />
      <Handle
        type="target"
        position={Position.Top}
        id="from-date"
        style={{ background: "transparent", border: "none", width: 0, height: 0, top: 0 }}
      />

      {/* Index badge */}
      <div
        className="flex size-8 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-black"
        style={{
          background: `oklch(0.7 0.18 50 / 0.1)`,
          color: ACCENT,
          border: `1.5px solid oklch(0.7 0.18 50 / 0.2)`,
          boxShadow: `0 0 12px oklch(0.7 0.18 50 / 0.08)`,
        }}
      >
        M{data.index}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-[12px] font-semibold text-foreground/85 truncate tracking-tight">
          {data.label}
        </p>
        <span
          className="font-mono text-[10px] font-bold tabular-nums"
          style={{ color: GREEN }}
        >
          {data.value}
        </span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        style={{ background: ACCENT, border: "none", width: 8, height: 8 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="actions"
        style={{ background: MUTED, border: "none", width: 8, height: 8, bottom: -4 }}
      />
    </div>
  );
}

// ── Sentinel Say Node ───────────────────────────────────────────────────────

function SentinelSayNode({ data }: NodeProps<Node<SentinelSayData>>) {
  return (
    <div
      className="flex items-start gap-2.5 rounded-xl border p-3.5 shadow-lg"
      style={{
        width: 280,
        borderColor: `oklch(0.7 0.18 50 / 0.35)`,
        background: `oklch(0.7 0.18 50 / 0.04)`,
        animation: "sp-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Handle
        type="target"
        position={Position.Top}
        style={{ background: ACCENT, border: "none", width: 8, height: 8, top: -4 }}
      />
      <div
        className="flex size-6 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{ background: `oklch(0.7 0.18 50 / 0.15)`, border: `1px solid oklch(0.7 0.18 50 / 0.25)` }}
      >
        <SparklesIcon className="size-3" style={{ color: ACCENT }} />
      </div>
      <p className="text-[11px] leading-relaxed font-medium" style={{ color: `oklch(0.75 0.14 55)` }}>
        {data.text}
      </p>
    </div>
  );
}

// ── Node Types Map ──────────────────────────────────────────────────────────

export const sentinelNodeTypes = {
  contract: ContractNode,
  analysis: AnalysisNode,
  action: ActionNode,
  date: DateNode,
  milestone: MilestoneNode,
  sentinel: SentinelSayNode,
};
