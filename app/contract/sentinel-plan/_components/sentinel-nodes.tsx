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

/* ── Neutral dark palette (zero warm tint) ────────────────────────────── */
const N = {
  /** card surface */
  card: "hsl(0 0% 7.5%)",
  /** slightly elevated surface */
  elevated: "hsl(0 0% 9%)",
  /** header / muted surface */
  header: "hsl(0 0% 8.5%)",
  /** dividers inside cards */
  rule: "hsl(0 0% 13%)",
  /** card border — subtle */
  border: "hsl(0 0% 15%)",
  /** stronger border (active state) */
  borderStrong: "hsl(0 0% 20%)",
  /** text primary */
  fg: "hsl(0 0% 93%)",
  /** text secondary */
  fg2: "hsl(0 0% 62%)",
  /** text tertiary */
  fg3: "hsl(0 0% 42%)",
  /** text ghost */
  fg4: "hsl(0 0% 28%)",
};

/* ── Invisible handle ─────────────────────────────────────────────────── */
const H = { background: "transparent", border: "none", width: 6, height: 6, opacity: 0 };

/* ── Tint helper — returns a color at a given opacity hex suffix ─────── */
function tint(color: string | undefined, opacityHex: string) {
  if (!color) return `${MUTED}${opacityHex}`;
  if (color.startsWith("#")) return `${color}${opacityHex}`;
  if (color.startsWith("oklch")) {
    const val = parseInt(opacityHex, 16) / 255;
    return color.replace(")", ` / ${val.toFixed(2)})`);
  }
  return color;
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Contract Node                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */

function ContractNode({ data }: NodeProps<Node<ContractNodeData>>) {
  return (
    <div
      style={{
        width: 320,
        background: N.card,
        border: `1px solid ${N.border}`,
        borderRadius: 14,
        boxShadow: `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35)`,
        overflow: "hidden",
      }}
    >
      {/* Accent top edge */}
      <div style={{ height: 2, background: ACCENT, opacity: 0.5 }} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: `1px solid ${N.rule}`,
          background: N.header,
        }}
      >
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: tint(ACCENT, "10"),
            border: `1px solid ${tint(ACCENT, "20")}`,
          }}
        >
          <FileTextIcon style={{ width: 14, height: 14, color: ACCENT }} />
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p
            style={{
              fontSize: 9,
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.1em",
              color: N.fg3,
              margin: 0,
            }}
          >
            Contract
          </p>
          <p
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: N.fg,
              margin: 0,
              marginTop: 1,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            {data.title}
          </p>
        </div>
      </div>

      {/* Body grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "10px 20px",
          padding: "14px 16px",
        }}
      >
        {([
          { label: "Client", value: data.parties.client },
          { label: "Dev", value: data.parties.dev },
          { label: "Value", value: data.value, color: GREEN },
          { label: "Deadline", value: data.duration },
        ] as const).map((item) => (
          <div key={item.label}>
            <p style={{ fontSize: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: N.fg4, margin: 0 }}>
              {item.label}
            </p>
            <p style={{ fontSize: 11, fontWeight: 600, color: "color" in item && item.color ? item.color : N.fg2, margin: 0, marginTop: 2 }}>
              {item.value}
            </p>
          </div>
        ))}
        <div style={{ gridColumn: "1 / -1" }}>
          <p style={{ fontSize: 8, fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: N.fg4, margin: 0 }}>
            Milestones
          </p>
          <p style={{ fontSize: 11, fontWeight: 600, color: N.fg2, margin: 0, marginTop: 2 }}>
            {data.milestones} deliverables mapped
          </p>
        </div>
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...H, bottom: -3 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Analysis Node                                                        */
/* ═══════════════════════════════════════════════════════════════════════ */

function AnalysisNode({ data }: NodeProps<Node<AnalysisNodeData>>) {
  const isDone = data.status === "done";
  const isRunning = data.status === "running";
  const accentColor = isDone ? GREEN : ACCENT;

  return (
    <div
      style={{
        width: 320,
        background: N.card,
        border: `1px solid ${isDone ? tint(GREEN, "28") : isRunning ? tint(ACCENT, "20") : N.border}`,
        borderRadius: 14,
        boxShadow: isRunning
          ? `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35), 0 0 0 1px ${tint(ACCENT, "08")}`
          : `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35)`,
        overflow: "hidden",
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ ...H, top: -3 }} />

      {/* Accent top edge */}
      <div style={{ height: 2, background: accentColor, opacity: isDone ? 0.4 : isRunning ? 0.6 : 0.15 }} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          padding: "12px 16px",
          borderBottom: `1px solid ${N.rule}`,
          background: N.header,
        }}
      >
        <div
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: tint(accentColor, "0c"),
            border: `1px solid ${tint(accentColor, "1a")}`,
          }}
        >
          {isDone ? (
            <CheckCircleIcon style={{ width: 14, height: 14, color: GREEN }} />
          ) : isRunning ? (
            <LoaderIcon style={{ width: 14, height: 14, color: ACCENT, animation: "sp-spin 1.5s linear infinite" }} />
          ) : (
            <ShieldCheckIcon style={{ width: 14, height: 14, color: N.fg4 }} />
          )}
        </div>
        <p style={{ fontSize: 13, fontWeight: 600, color: N.fg, margin: 0 }}>
          {data.label}
        </p>
      </div>

      {/* Findings */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, padding: "12px 16px" }}>
        {(data.findings as string[]).map((f: string, i: number) => {
          const active = isDone || (isRunning && i < 2);
          return (
            <div
              key={i}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 10,
                opacity: active ? 1 : 0.3,
                transition: "opacity 0.4s ease",
              }}
            >
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  flexShrink: 0,
                  marginTop: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: active ? tint(accentColor, "0c") : "transparent",
                  border: `1px solid ${active ? tint(accentColor, "22") : N.rule}`,
                }}
              >
                <CheckCircleIcon style={{ width: 10, height: 10, color: active ? accentColor : N.fg4 }} />
              </div>
              <p style={{ fontSize: 10.5, lineHeight: 1.55, color: N.fg2, margin: 0 }}>
                {f}
              </p>
            </div>
          );
        })}
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...H, bottom: -3 }} />
      <Handle type="source" position={Position.Right} id="to-milestones" style={H} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Action Node                                                          */
/* ═══════════════════════════════════════════════════════════════════════ */

function ActionNode({ data }: NodeProps<Node<ActionNodeData>>) {
  const icon = data.icon as keyof typeof actionIcons;
  const status = data.status as ActionStatus;
  const Icon = actionIcons[icon];
  const st = statusConfig[status];
  const isPending = status === "pending";
  const isSuggested = status === "suggested";
  const isInactive = status === "rejected" || status === "declined";
  const actionColor = colorMap[icon];

  return (
    <div
      style={{
        width: 290,
        background: N.card,
        border: `1px solid ${isPending ? N.border : isInactive ? tint(st.color, "18") : tint(st.color, "28")}`,
        borderRadius: 14,
        boxShadow: `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35)`,
        overflow: "hidden",
        opacity: isInactive ? 0.45 : isPending ? 0.35 : 1,
        transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
        animation: isSuggested ? "sp-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)" : undefined,
      }}
    >
      <Handle type="target" position={Position.Top} style={{ ...H, top: -3 }} />

      {/* Accent top edge — action-colored */}
      <div style={{ height: 2, background: actionColor, opacity: isPending ? 0.15 : 0.45 }} />

      {/* Header */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          padding: "10px 14px",
          borderBottom: `1px solid ${N.rule}`,
          background: N.header,
        }}
      >
        <div
          style={{
            width: 24,
            height: 24,
            borderRadius: 7,
            flexShrink: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: tint(actionColor, "0c"),
            border: `1px solid ${tint(actionColor, "1a")}`,
          }}
        >
          {Icon && <Icon style={{ width: 12, height: 12, color: actionColor }} />}
        </div>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: N.fg,
            margin: 0,
            flex: 1,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.label}
        </p>

        {/* Status badge */}
        {!isPending && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              padding: "3px 8px",
              borderRadius: 999,
              background: tint(st.color, "0c"),
              border: `1px solid ${tint(st.color, "1a")}`,
              animation: st.animate ? "sp-pulse 2s ease-in-out infinite" : undefined,
            }}
          >
            <st.icon style={{ width: 10, height: 10, color: st.color }} />
            <span
              style={{
                fontSize: 8,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: st.color,
              }}
            >
              {st.label}
            </span>
          </div>
        )}
      </div>

      {/* Timestamp */}
      {data.timestamp && !isPending && (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 6,
            padding: "4px 14px",
            borderBottom: `1px solid ${N.rule}`,
            background: "hsl(0 0% 6.5%)",
          }}
        >
          <ClockIcon style={{ width: 10, height: 10, color: tint(st.color, "70") }} />
          <span style={{ fontSize: 9, fontFamily: "var(--font-mono, monospace)", color: tint(st.color, "88"), fontVariantNumeric: "tabular-nums" }}>
            {data.timestamp}
          </span>
        </div>
      )}

      {/* Body */}
      <div style={{ padding: "10px 14px", display: "flex", flexDirection: "column", gap: 8 }}>
        <p style={{ fontSize: 10, lineHeight: 1.6, color: N.fg3, margin: 0 }}>
          {data.description}
        </p>

        {/* Meta pills */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {data.frequency && (
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 8,
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: tint(actionColor, "bb"),
                background: tint(actionColor, "0a"),
                border: `1px solid ${tint(actionColor, "15")}`,
              }}
            >
              <ClockIcon style={{ width: 8, height: 8 }} />
              {data.frequency}
            </span>
          )}
          {data.target && (
            <span
              style={{
                display: "inline-flex",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 8,
                fontWeight: 500,
                color: N.fg3,
                background: "hsl(0 0% 11%)",
                border: `1px solid ${N.rule}`,
              }}
            >
              {data.target}
            </span>
          )}
          {data.milestone && (
            <span
              style={{
                display: "inline-flex",
                padding: "2px 8px",
                borderRadius: 999,
                fontSize: 8,
                fontWeight: 600,
                color: tint(ACCENT, "aa"),
                background: tint(ACCENT, "08"),
                border: `1px solid ${tint(ACCENT, "15")}`,
              }}
            >
              {data.milestone}
            </span>
          )}
        </div>

        {/* Sent to */}
        {data.sentTo && ["sent", "waiting", "accepted", "declined"].includes(status) && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "8px 10px",
              borderRadius: 10,
              background: "hsl(0 0% 9%)",
              border: `1px solid ${tint(st.color, "15")}`,
              marginTop: 2,
            }}
          >
            <MessageCircleIcon style={{ width: 12, height: 12, flexShrink: 0, color: tint(st.color, "88") }} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: 8, textTransform: "uppercase", letterSpacing: "0.1em", color: N.fg4, margin: 0 }}>
                {status === "sent" ? "Sent to" : status === "waiting" ? "Awaiting" : status === "accepted" ? "Accepted by" : "Declined by"}
              </p>
              <p
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: tint(st.color, "cc"),
                  margin: 0,
                  marginTop: 1,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
              >
                {data.sentTo}
              </p>
            </div>
            {status === "waiting" && (
              <LoaderIcon style={{ width: 12, height: 12, flexShrink: 0, color: YELLOW, animation: "sp-spin 2s linear infinite" }} />
            )}
          </div>
        )}

        {/* Approve / Reject buttons */}
        {isSuggested && (
          <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
            <button
              onClick={data.onApprove}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "7px 0",
                borderRadius: 9,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                color: GREEN,
                background: tint(GREEN, "0a"),
                border: `1px solid ${tint(GREEN, "22")}`,
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tint(GREEN, "14");
                e.currentTarget.style.borderColor = tint(GREEN, "35");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = tint(GREEN, "0a");
                e.currentTarget.style.borderColor = tint(GREEN, "22");
              }}
            >
              <CheckIcon style={{ width: 12, height: 12 }} />
              Approve
            </button>
            <button
              onClick={data.onReject}
              style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                padding: "7px 0",
                borderRadius: 9,
                fontSize: 10,
                fontWeight: 600,
                cursor: "pointer",
                color: tint(RED, "bb"),
                background: tint(RED, "08"),
                border: `1px solid ${tint(RED, "18")}`,
                transition: "background 0.15s, border-color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = tint(RED, "12");
                e.currentTarget.style.borderColor = tint(RED, "2a");
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = tint(RED, "08");
                e.currentTarget.style.borderColor = tint(RED, "18");
              }}
            >
              <XIcon style={{ width: 12, height: 12 }} />
              Reject
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Date Node                                                            */
/* ═══════════════════════════════════════════════════════════════════════ */

function DateNode({ data }: NodeProps<Node<DateNodeData>>) {
  const isLate = data.isLate ?? false;
  const color = isLate ? RED : ACCENT;

  return (
    <div style={{ width: 120, animation: "sp-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)" }}>
      <div
        style={{
          borderRadius: 14,
          background: N.card,
          border: `1px solid ${tint(color, "35")}`,
          boxShadow: `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35)`,
          overflow: "hidden",
        }}
      >
        {/* Top accent strip */}
        <div style={{ height: 3, background: color, opacity: 0.7 }} />

        {/* Content */}
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 12px" }}>
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: 17,
              flexShrink: 0,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              background: color,
            }}
          >
            <CalendarIcon style={{ width: 14, height: 14, color: "hsl(0 0% 5%)" }} />
          </div>
          <div>
            <p
              style={{
                fontSize: 22,
                fontWeight: 900,
                lineHeight: 1,
                fontFamily: "var(--font-mono, monospace)",
                fontVariantNumeric: "tabular-nums",
                color: N.fg,
                margin: 0,
              }}
            >
              {data.day}
            </p>
            <p
              style={{
                fontSize: 10,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.14em",
                color,
                margin: 0,
                marginTop: 2,
              }}
            >
              {data.month}
            </p>
          </div>
        </div>
      </div>

      {/* Connector */}
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={{ width: 1, height: 12, background: tint(color, "40") }} />
        <div style={{ width: 5, height: 5, borderRadius: 3, background: color }} />
      </div>

      <Handle type="source" position={Position.Bottom} style={{ ...H, bottom: 0 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Milestone Node                                                       */
/* ═══════════════════════════════════════════════════════════════════════ */

function MilestoneNode({ data }: NodeProps<Node<MilestoneNodeData>>) {
  return (
    <div
      style={{
        width: 240,
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 16px",
        borderRadius: 14,
        background: N.card,
        border: `1px solid ${tint(ACCENT, "22")}`,
        boxShadow: `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35)`,
        animation: "sp-appear 0.4s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Handle type="target" position={Position.Left} style={H} />
      <Handle type="target" position={Position.Top} id="from-date" style={{ ...H, top: 0 }} />

      {/* Index badge */}
      <div
        style={{
          width: 32,
          height: 32,
          borderRadius: 16,
          flexShrink: 0,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "var(--font-mono, monospace)",
          fontSize: 11,
          fontWeight: 900,
          color: ACCENT,
          background: tint(ACCENT, "0c"),
          border: `1px solid ${tint(ACCENT, "1a")}`,
        }}
      >
        M{data.index}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 12,
            fontWeight: 600,
            color: N.fg2,
            margin: 0,
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {data.label}
        </p>
        <p
          style={{
            fontSize: 10,
            fontWeight: 700,
            fontFamily: "var(--font-mono, monospace)",
            fontVariantNumeric: "tabular-nums",
            color: GREEN,
            margin: 0,
            marginTop: 2,
          }}
        >
          {data.value}
        </p>
      </div>

      <Handle type="source" position={Position.Right} style={H} />
      <Handle type="source" position={Position.Bottom} id="actions" style={{ ...H, bottom: -3 }} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Sentinel Say Node                                                    */
/* ═══════════════════════════════════════════════════════════════════════ */

function SentinelSayNode({ data }: NodeProps<Node<SentinelSayData>>) {
  return (
    <div
      style={{
        width: 280,
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: 14,
        borderRadius: 14,
        background: N.card,
        border: `1px solid ${tint(ACCENT, "22")}`,
        boxShadow: `0 1px 3px hsl(0 0% 0% / 0.5), 0 8px 24px hsl(0 0% 0% / 0.35)`,
        animation: "sp-appear 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
      }}
    >
      <Handle type="target" position={Position.Top} style={{ ...H, top: -3 }} />
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 12,
          flexShrink: 0,
          marginTop: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: tint(ACCENT, "0c"),
          border: `1px solid ${tint(ACCENT, "1a")}`,
        }}
      >
        <SparklesIcon style={{ width: 11, height: 11, color: ACCENT }} />
      </div>
      <p style={{ fontSize: 11, lineHeight: 1.6, fontWeight: 500, color: N.fg2, margin: 0 }}>
        {data.text}
      </p>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════════════ */
/*  Export                                                               */
/* ═══════════════════════════════════════════════════════════════════════ */

export const sentinelNodeTypes = {
  contract: ContractNode,
  analysis: AnalysisNode,
  action: ActionNode,
  date: DateNode,
  milestone: MilestoneNode,
  sentinel: SentinelSayNode,
};
