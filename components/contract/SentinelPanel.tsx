'use client'

import { useState, useEffect } from 'react'
import { registerDemoAction } from '@/lib/demo-actions'

async function sendTelegram(text: string) {
  try {
    await fetch('/api/sentinel-notify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    })
  } catch {
    // silently fail
  }
}
import {
  ReactFlow,
  Background,
  Handle,
  Position,
  type Node,
  type Edge,
  type NodeProps,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import {
  FileTextIcon,
  ShieldCheckIcon,
  CheckCircleIcon,
  GitBranchIcon,
  MessageCircleIcon,
  WalletIcon,
  EyeIcon,
  SparklesIcon,
  LoaderIcon,
  ClockIcon,
  MaximizeIcon,
  MinimizeIcon,
  XIcon,
  ScaleIcon,
} from 'lucide-react'

// ── Colors (exact match sentinel-plan) ───────────────────────────────────────

const ACCENT = 'oklch(0.7 0.18 50)'
const GREEN = '#22c55e'
const YELLOW = '#eab308'
const MUTED = '#3f3f46'
const VIOLET = '#8b5cf6'
const CLARA = '#f472b6'

// ── Action Node (same style as sentinel-plan ActionNode) ─────────────────────

type ActionStatus = 'done' | 'active' | 'waiting' | 'upcoming'

const statusStyles: Record<ActionStatus, { label: string; color: string; icon: typeof CheckCircleIcon; animate?: boolean }> = {
  done:     { label: 'Completed', color: GREEN,  icon: CheckCircleIcon },
  active:   { label: 'Active',    color: ACCENT, icon: LoaderIcon, animate: true },
  waiting:  { label: 'Waiting',   color: YELLOW, icon: ClockIcon, animate: true },
  upcoming: { label: 'Pending',   color: MUTED,  icon: ClockIcon },
}

type ActionData = {
  label: string
  description: string
  icon: string
  status: ActionStatus
  agent: 'sentinel' | 'clara'
  detail?: string
}

const iconMap: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  shield: ShieldCheckIcon,
  github: GitBranchIcon,
  whatsapp: MessageCircleIcon,
  escrow: WalletIcon,
  monitor: EyeIcon,
  spark: SparklesIcon,
  check: CheckCircleIcon,
  clock: ClockIcon,
  scale: ScaleIcon,
  file: FileTextIcon,
}

const iconColors: Record<string, string> = {
  shield: ACCENT,
  github: VIOLET,
  whatsapp: '#25D366',
  escrow: GREEN,
  monitor: ACCENT,
  spark: ACCENT,
  check: GREEN,
  clock: YELLOW,
  scale: CLARA,
  file: ACCENT,
}

const agentMeta = {
  sentinel: { color: ACCENT, initial: 'S', name: 'Sentinel' },
  clara:    { color: CLARA,  initial: 'C', name: 'Clara' },
}

function ActionNode({ data }: NodeProps<Node<ActionData>>) {
  const status = data.status as ActionStatus
  const st = statusStyles[status]
  const Icon = iconMap[data.icon as string] ?? ShieldCheckIcon
  const actionColor = iconColors[data.icon as string] ?? ACCENT
  const ag = agentMeta[data.agent as 'sentinel' | 'clara']
  const isUpcoming = status === 'upcoming'
  const StatusIcon = st.icon

  return (
    <div
      className="flex flex-col rounded-xl border backdrop-blur-sm overflow-hidden"
      style={{
        width: 260,
        borderColor: isUpcoming ? `${MUTED}40` : `${st.color}40`,
        background: isUpcoming ? 'oklch(0.11 0.005 50 / 0.6)' : `${st.color}04`,
        boxShadow: !isUpcoming ? `0 0 24px ${st.color}10` : undefined,
        opacity: isUpcoming ? 0.4 : 1,
        transition: 'all 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
      }}
    >
      <Handle type="target" position={Position.Left} id="l"
        style={{ background: actionColor, border: 'none', width: 8, height: 8 }} />
      <Handle type="target" position={Position.Top}
        style={{ background: actionColor, border: 'none', width: 8, height: 8, top: -4 }} />

      {/* Header */}
      <div
        className="flex items-center gap-2.5 px-3.5 py-2.5"
        style={{
          borderBottom: `1px solid ${isUpcoming ? `${MUTED}20` : `${st.color}15`}`,
          background: isUpcoming ? `${MUTED}06` : `${actionColor}06`,
        }}
      >
        {/* Action icon */}
        <div
          className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: `${actionColor}15`, border: `1px solid ${actionColor}25` }}
        >
          <Icon className="size-3" style={{ color: actionColor }} />
        </div>

        <p className="text-[12px] font-semibold text-foreground/90 flex-1 truncate">
          {data.label}
        </p>

        {/* Status badge */}
        {!isUpcoming && (
          <div
            className="flex items-center gap-1 rounded-full px-2 py-0.5"
            style={{
              background: `${st.color}12`,
              border: `1px solid ${st.color}25`,
              animation: st.animate ? 'sp-pulse 2s ease-in-out infinite' : undefined,
            }}
          >
            <StatusIcon className="size-2.5" style={{
              color: st.color,
              animation: st.animate && status === 'active' ? 'sp-spin 1.5s linear infinite' : undefined,
            }} />
            <span className="text-[8px] font-bold uppercase tracking-wider" style={{ color: st.color }}>
              {st.label}
            </span>
          </div>
        )}
      </div>

      {/* Body */}
      <div className="flex flex-col gap-2 px-3.5 py-2.5">
        <p className="text-[10px] leading-relaxed text-muted-foreground/70">
          {data.description}
        </p>

        {/* Agent tag + detail meta */}
        <div className="flex flex-wrap gap-1.5">
          {/* Agent badge */}
          <span
            className="flex items-center gap-1 rounded-full px-2 py-0.5 text-[8px] font-bold uppercase tracking-wider"
            style={{ color: ag.color, background: `${ag.color}10`, border: `1px solid ${ag.color}20` }}
          >
            <span
              className="flex size-3 items-center justify-center rounded-full text-[6px] font-black"
              style={{ background: `${ag.color}25`, color: ag.color }}
            >
              {ag.initial}
            </span>
            {ag.name}
          </span>

          {/* Detail */}
          {data.detail && (
            <span
              className="rounded-full px-2 py-0.5 text-[8px] font-medium text-muted-foreground/50"
              style={{ background: `${MUTED}15`, border: `1px solid ${MUTED}25` }}
            >
              {data.detail}
            </span>
          )}
        </div>
      </div>

      <Handle type="source" position={Position.Right} id="r"
        style={{ background: actionColor, border: 'none', width: 8, height: 8 }} />
      <Handle type="source" position={Position.Bottom}
        style={{ background: actionColor, border: 'none', width: 8, height: 8, bottom: -4 }} />
    </div>
  )
}

// ── Node types ───────────────────────────────────────────────────────────────

const nodeTypes = { action: ActionNode }

// ── Layout — horizontal, two parallel tracks ─────────────────────────────────
//
//                    ┌─ [GitHub] ──→ [WhatsApp] ──→ [Escrow]     ← Sentinel
//  [Contrato] ──→ ──┤                   ↓
//                    │              [Prazo M2]
//                    │
//                    └─ [Revisão] ──→ [Evidências] ──→ [Veredito] ← Clara
//                         ↓
//                    [Issue Mobile]

const G = 300      // horizontal gap
const SY = 0       // Sentinel row Y
const CY = 190     // Clara row Y
const START_X = 0

function buildNodes(firing: boolean): Node[] {
  return [
  // ── Start ──
  { id: 'contract', type: 'action', position: { x: START_X, y: 85 },
    data: {
      label: 'Active Contract',
      description: 'Dr. Suasuna Site · R$ 3,800 · 4 milestones · M2 under review',
      icon: 'file', status: 'active', agent: 'sentinel',
      detail: 'M2 · Frontend',
    } },

  // ── Sentinel track (top) ──
  { id: 's-github', type: 'action', position: { x: START_X + G, y: SY },
    data: {
      label: 'GitHub Monitor',
      description: 'Last commit by Matheus on 03/19. Repo active, no changes since delivery.',
      icon: 'github', status: 'done', agent: 'sentinel',
      detail: 'commit 19/03',
    } },

  { id: 's-whatsapp', type: 'action', position: { x: START_X + G * 2, y: SY },
    data: {
      label: 'Follow-up WhatsApp',
      description: 'Message sent to Dr. Suasuna requesting M2 review. No response for 2h.',
      icon: 'whatsapp', status: 'waiting', agent: 'sentinel',
      detail: 'Dr. Suasuna',
    } },

  { id: 's-escrow', type: 'action', position: { x: START_X + G * 3, y: SY },
    data: {
      label: 'Escrow $1.200',
      description: 'M2 value locked. Release conditional on client approval. Timeout: Apr 05.',
      icon: 'escrow', status: 'waiting', agent: 'sentinel',
      detail: 'timeout Apr 05',
    } },

  // Sentinel branch down: deadline (pushed right to avoid Clara row)
  { id: 's-deadline', type: 'action', position: { x: START_X + G * 3 + 140, y: SY + 95 },
    data: {
      label: 'M2 Deadline',
      description: 'Client review deadline. If expired, escrow releases automatically to Matheus.',
      icon: 'clock', status: 'active', agent: 'sentinel',
      detail: 'Apr 05 · 5 days',
    } },

  // ── Clara track (bottom) ──
  { id: 'c-review', type: 'action', position: { x: START_X + G, y: CY },
    data: {
      label: 'M2 Review',
      description: '3 of 4 requirements met. Mobile item did not appear in Matheus\'s commits.',
      icon: 'scale', status: 'active', agent: 'clara',
      detail: '3/4 requirements',
    } },

  { id: 'c-evidence', type: 'action', position: { x: START_X + G * 2, y: CY },
    data: {
      label: 'Evidence Analysis',
      description: 'Comparing repo commits with contract clauses and approved Figma.',
      icon: 'monitor', status: 'active', agent: 'clara',
      detail: 'commits × contract',
    } },

  { id: 'c-verdict', type: 'action', position: { x: START_X + G * 3, y: CY },
    data: {
      label: 'Verdict',
      description: 'Final decision on M2. Awaiting client response and analysis completion.',
      icon: 'spark', status: 'upcoming', agent: 'clara',
    } },

  // Clara branch down: issue
  { id: 'c-issue', type: 'action', position: { x: START_X + G, y: CY + 170 },
    data: {
      label: 'Issue: Mobile',
      description: 'Clause 3.2 mentions "responsive interface" without specifying milestone. Real ambiguity.',
      icon: 'scale', status: 'waiting', agent: 'clara',
      detail: 'clause 3.2',
    } },

  // s-whatsapp override when firing
  ...(firing ? [{
    id: 's-whatsapp', type: 'action', position: { x: START_X + G * 2, y: SY },
    data: {
      label: 'Follow-up WhatsApp',
      description: '⌛ Sentinel digitando mensagem para Dr. Suasuna...',
      icon: 'whatsapp', status: 'active' as ActionStatus, agent: 'sentinel' as const,
      detail: 'ao vivo agora',
    }
  }] : [{
    id: 's-whatsapp', type: 'action', position: { x: START_X + G * 2, y: SY },
    data: {
      label: 'Follow-up WhatsApp',
      description: '✓ Mensagem enviada. Dr. Suasuna notificado sobre M2.',
      icon: 'whatsapp', status: 'done' as ActionStatus, agent: 'sentinel' as const,
      detail: 'enviado',
    }
  }]),
  ]
}

const EDGES: Edge[] = [
  // Fork from contract to both tracks
  { id: 'f-s', source: 'contract', sourceHandle: 'r', target: 's-github', targetHandle: 'l',
    type: 'smoothstep',
    style: { stroke: `${ACCENT}45`, strokeWidth: 2 } },
  { id: 'f-c', source: 'contract', sourceHandle: 'r', target: 'c-review', targetHandle: 'l',
    type: 'smoothstep',
    style: { stroke: `${CLARA}45`, strokeWidth: 2 } },

  // Sentinel track
  { id: 's1', source: 's-github', sourceHandle: 'r', target: 's-whatsapp', targetHandle: 'l',
    type: 'smoothstep',
    style: { stroke: `${GREEN}40`, strokeWidth: 2 } },
  { id: 's2', source: 's-whatsapp', sourceHandle: 'r', target: 's-escrow', targetHandle: 'l',
    type: 'smoothstep', animated: true,
    style: { stroke: `${YELLOW}45`, strokeWidth: 2 } },

  // Sentinel branch
  { id: 's-b', source: 's-escrow', target: 's-deadline',
    type: 'smoothstep', animated: true,
    style: { stroke: `${ACCENT}40`, strokeWidth: 1.5, strokeDasharray: '5 3' } },

  // Clara track
  { id: 'c1', source: 'c-review', sourceHandle: 'r', target: 'c-evidence', targetHandle: 'l',
    type: 'smoothstep', animated: true,
    style: { stroke: `${CLARA}45`, strokeWidth: 2 } },
  { id: 'c2', source: 'c-evidence', sourceHandle: 'r', target: 'c-verdict', targetHandle: 'l',
    type: 'smoothstep',
    style: { stroke: `${MUTED}35`, strokeWidth: 1.5, strokeDasharray: '4 3' } },

  // Clara branch
  { id: 'c-b', source: 'c-review', target: 'c-issue',
    type: 'smoothstep', animated: true,
    style: { stroke: `${YELLOW}40`, strokeWidth: 1.5, strokeDasharray: '5 3' } },
]

// ── Status ticker ────────────────────────────────────────────────────────────

const STATUS_LINES = [
  { text: 'Sentinel — monitorando M2', color: ACCENT },
  { text: 'Sentinel — WhatsApp sem resposta', color: YELLOW },
  { text: 'Clara — analisando evidências', color: CLARA },
  { text: 'Clara — issue mobile detectada', color: YELLOW },
  { text: 'Escrow $1.200 bloqueado', color: YELLOW },
]

// ── Component ────────────────────────────────────────────────────────────────

export function SentinelPanel() {
  const [statusIdx, setStatusIdx] = useState(0)
  const [expanded, setExpanded] = useState(false)
  const [firing, setFiring] = useState(false)

  useEffect(() => {
    const t = setInterval(() => setStatusIdx((p) => (p + 1) % STATUS_LINES.length), 3000)
    return () => clearInterval(t)
  }, [])

  useEffect(() => {
    // on mount — anima node s-whatsapp e dispara mensagem real
    const run = async () => {
      await new Promise((r) => setTimeout(r, 1200)) // pequeno delay para UI carregar
      setFiring(true)
      await sendTelegram(
        '✅ *Contrato ativo — Selantar*\nSite Clinica Suassuna · R$4.800 · 4 milestones\nSentinel monitorando. Qualquer movimento eu aviso.'
      )
      setFiring(false)
    }
    run()
  }, [])

  const cur = STATUS_LINES[statusIdx]

  const flowCanvas = (padding: number) => (
    <ReactFlow
      nodes={buildNodes(firing)}
      edges={EDGES}
      nodeTypes={nodeTypes}
      fitView
      fitViewOptions={{ padding }}
      panOnDrag
      zoomOnScroll
      nodesDraggable={false}
      nodesConnectable={false}
      elementsSelectable={false}
      minZoom={0.08}
      maxZoom={1.5}
      proOptions={{ hideAttribution: true }}
      style={{ background: 'transparent' }}
    >
      <Background color="#27272a" gap={28} size={1} />
    </ReactFlow>
  )

  const headerBar = (
    <div className="px-3 pt-3 pb-2 border-b border-border shrink-0">
      <div className="flex items-center gap-2">
        <div
          className="flex size-7 items-center justify-center rounded-xl"
          style={{
            background: `oklch(0.7 0.18 50 / 0.12)`,
            borderColor: `oklch(0.7 0.18 50 / 0.3)`,
            border: `1px solid oklch(0.7 0.18 50 / 0.3)`,
            boxShadow: `0 0 12px oklch(0.7 0.18 50 / 0.15)`,
          }}
        >
          <ShieldCheckIcon className="size-3.5" style={{ color: ACCENT }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold text-foreground tracking-tight">Agentes</p>
          <p className="text-[8px] text-muted-foreground/50 uppercase tracking-widest">sentinel + clara</p>
        </div>

        {/* Live badge */}
        <div
          className="flex items-center gap-1.5 rounded-full border px-2 py-0.5"
          style={{ borderColor: `oklch(0.7 0.18 50 / 0.2)`, background: `oklch(0.7 0.18 50 / 0.05)` }}
        >
          <div
            className="size-1.5 rounded-full"
            style={{ background: ACCENT, animation: 'sp-pulse 1s ease-in-out infinite' }}
          />
          <span className="text-[8px] font-medium" style={{ color: ACCENT }}>ao vivo</span>
        </div>

        {/* Expand */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex size-6 items-center justify-center rounded-md border transition-all hover:bg-muted/20"
          style={{ borderColor: `${MUTED}50` }}
        >
          {expanded
            ? <MinimizeIcon className="size-3 text-muted-foreground" />
            : <MaximizeIcon className="size-3 text-muted-foreground" />}
        </button>
      </div>

    </div>
  )

  const animations = (
    <style>{`
      @keyframes sp-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.3; }
      }
      @keyframes sp-spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
    `}</style>
  )

  // ── Expanded fullscreen ──
  if (expanded) {
    return (
      <>
        {/* Placeholder in panel */}
        <div className="flex flex-col h-full items-center justify-center gap-2">
          <ShieldCheckIcon className="size-5" style={{ color: MUTED, opacity: 0.3 }} />
          <p className="text-[10px] text-muted-foreground/40">Visão expandida</p>
          <button
            onClick={() => setExpanded(false)}
            className="text-[10px] font-medium px-3 py-1 rounded-lg border transition-all hover:bg-muted/20"
            style={{ borderColor: `oklch(0.7 0.18 50 / 0.3)`, color: ACCENT }}
          >
            Minimizar
          </button>
        </div>

        {/* Fullscreen overlay */}
        <div
          className="fixed inset-0 z-50 flex flex-col"
          style={{ background: 'oklch(0.08 0.01 50 / 0.97)', backdropFilter: 'blur(12px)' }}
        >
          {/* Top bar */}
          <div className="shrink-0 flex items-center justify-between px-5 py-3 border-b border-border">
            <div className="flex items-center gap-3">
              <div
                className="flex size-9 items-center justify-center rounded-xl"
                style={{
                  background: `oklch(0.7 0.18 50 / 0.12)`,
                  border: `1px solid oklch(0.7 0.18 50 / 0.3)`,
                  boxShadow: `0 0 16px oklch(0.7 0.18 50 / 0.2)`,
                }}
              >
                <ShieldCheckIcon className="size-4" style={{ color: ACCENT }} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">Agentes — Visão Expandida</p>
                <p className="text-[9px] text-muted-foreground/50 uppercase tracking-widest">
                  sentinel + clara · Site Dr. Suasuna · M2
                </p>
              </div>
            </div>

            {/* Ticker expanded */}
            <div
              className="flex items-center gap-2 rounded-full border px-3 py-1"
              style={{ borderColor: `${cur.color}20`, background: `${cur.color}05`, transition: 'all 0.5s' }}
            >
              <div className="size-1.5 rounded-full" style={{ background: cur.color, animation: 'sp-pulse 1s ease-in-out infinite' }} />
              <span className="text-[10px] font-medium" style={{ color: cur.color }}>{cur.text}</span>
            </div>

            <button
              onClick={() => setExpanded(false)}
              className="flex size-8 items-center justify-center rounded-lg border transition-all hover:bg-muted/20"
              style={{ borderColor: `${MUTED}50` }}
            >
              <XIcon className="size-4 text-muted-foreground" />
            </button>
          </div>

          <div className="flex-1 min-h-0">{flowCanvas(0.2)}</div>
          {animations}
        </div>
      </>
    )
  }

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {headerBar}
      <div className="flex-1 min-h-0">{flowCanvas(0.12)}</div>
      {animations}
    </div>
  )
}
