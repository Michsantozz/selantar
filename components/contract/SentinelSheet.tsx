'use client'

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
  ShieldCheckIcon,
  CheckCircleIcon,
  FileTextIcon,
  GitBranchIcon,
  MessageCircleIcon,
  WalletIcon,
  CalendarIcon,
  CheckIcon,
  ClockIcon,
  SparklesIcon,
  XIcon,
  ArrowRightIcon,
  LoaderIcon,
} from 'lucide-react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'

// ── Colors (from design system) ──────────────────────────────────────────────

const ACCENT = 'oklch(0.72 0.17 55)'
const GREEN  = 'oklch(0.72 0.17 162)'
const RED    = 'oklch(0.62 0.22 25)'
const YELLOW = '#eab308'
const MUTED  = '#3f3f46'
const VIOLET = '#8b5cf6'

// ── Icon map ─────────────────────────────────────────────────────────────────

const actionIcons = {
  github:    GitBranchIcon,
  whatsapp:  MessageCircleIcon,
  escrow:    WalletIcon,
  calendar:  CalendarIcon,
}

const actionColors: Record<string, string> = {
  github:   VIOLET,
  whatsapp: '#25D366',
  escrow:   GREEN,
  calendar: ACCENT,
}

// ── Status config ─────────────────────────────────────────────────────────────

type ActionStatus = 'pending' | 'suggested' | 'approved' | 'sent' | 'waiting' | 'accepted' | 'declined'

const statusConfig: Record<ActionStatus, { label: string; color: string; icon: typeof CheckIcon }> = {
  pending:   { label: '',           color: MUTED,   icon: ClockIcon },
  suggested: { label: 'Suggestion', color: ACCENT,  icon: SparklesIcon },
  approved:  { label: 'Approved',   color: GREEN,   icon: CheckIcon },
  sent:      { label: 'Sent',       color: '#3b82f6', icon: ArrowRightIcon },
  waiting:   { label: 'Waiting',    color: YELLOW,  icon: ClockIcon },
  accepted:  { label: 'Accepted',   color: GREEN,   icon: CheckCircleIcon },
  declined:  { label: 'Declined',   color: RED,     icon: XIcon },
}

// ── Node Components ───────────────────────────────────────────────────────────

function ContractNode({ data }: NodeProps) {
  const d = data as { title: string; client: string; provider: string; value: string; milestones: number }
  return (
    <div className="flex flex-col rounded-xl border overflow-hidden"
      style={{ width: 280, borderColor: `${ACCENT}50`, background: `oklch(0.72 0.17 55 / 0.04)` }}>
      <div className="flex items-center gap-2.5 px-3.5 py-2.5"
        style={{ background: `oklch(0.72 0.17 55 / 0.07)`, borderBottom: `1px solid oklch(0.72 0.17 55 / 0.1)` }}>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-md"
          style={{ background: `oklch(0.72 0.17 55 / 0.15)`, border: `1px solid oklch(0.72 0.17 55 / 0.25)` }}>
          <FileTextIcon className="size-3.5" style={{ color: ACCENT }} />
        </div>
        <div>
          <p className="text-[9px] uppercase tracking-widest font-medium" style={{ color: `${ACCENT}` }}>Active contract</p>
          <p className="text-[12px] font-medium text-foreground truncate">{d.title}</p>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 px-3.5 py-2.5">
        {[
          ['Client', d.client],
          ['Dev', d.provider],
          ['Value', d.value],
          ['Milestones', `${d.milestones} deliveries`],
        ].map(([k, v]) => (
          <div key={k}>
            <p className="text-[9px] text-muted-foreground/50 uppercase tracking-wider">{k}</p>
            <p className="text-[11px] font-medium text-foreground/80">{v}</p>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: ACCENT, border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

function AnalysisNode({ data }: NodeProps) {
  const d = data as { label: string; findings: string[]; status: 'pending' | 'running' | 'done' }
  const isDone = d.status === 'done'
  return (
    <div className="flex flex-col rounded-xl border overflow-hidden"
      style={{ width: 280, borderColor: isDone ? `${GREEN}40` : `${ACCENT}40`, background: isDone ? `oklch(0.72 0.17 162 / 0.04)` : `oklch(0.72 0.17 55 / 0.04)`, transition: 'all 0.4s' }}>
      <Handle type="target" position={Position.Left} style={{ background: isDone ? GREEN : ACCENT, border: 'none', width: 8, height: 8 }} />
      <div className="flex items-center gap-2.5 px-3.5 py-2.5"
        style={{ borderBottom: `1px solid ${isDone ? `${GREEN}15` : `${ACCENT}12`}`, background: isDone ? `${GREEN}06` : `${ACCENT}06` }}>
        <div className="flex size-6 shrink-0 items-center justify-center rounded-full"
          style={{ background: isDone ? `${GREEN}18` : `${ACCENT}15`, border: `1.5px solid ${isDone ? `${GREEN}35` : `${ACCENT}30`}` }}>
          {isDone
            ? <CheckCircleIcon className="size-3.5" style={{ color: GREEN }} />
            : <ShieldCheckIcon className="size-3.5" style={{ color: ACCENT }} />}
        </div>
        <p className="text-[12px] font-medium text-foreground">{d.label}</p>
      </div>
      <div className="flex flex-col gap-1 px-3.5 py-2.5">
        {d.findings.map((f: string, i: number) => (
          <div key={i} className="flex items-start gap-2">
            <CheckCircleIcon className="size-3 mt-0.5 shrink-0" style={{ color: isDone ? GREEN : MUTED, opacity: isDone ? 0.8 : 0.35 }} />
            <p className="text-[10px] leading-snug" style={{ color: isDone ? 'var(--foreground)' : MUTED, opacity: isDone ? 0.7 : 0.5 }}>{f}</p>
          </div>
        ))}
      </div>
      <Handle type="source" position={Position.Right} style={{ background: isDone ? GREEN : ACCENT, border: 'none', width: 8, height: 8 }} />
    </div>
  )
}

function ActionNode({ data }: NodeProps) {
  const d = data as { label: string; description: string; icon: keyof typeof actionIcons; status: ActionStatus; sentTo?: string; timestamp?: string }
  const Icon = actionIcons[d.icon]
  const st = statusConfig[d.status]
  const color = actionColors[d.icon]
  const isPending = d.status === 'pending'
  const StatusIcon = st.icon

  return (
    <div className="flex flex-col rounded-xl border overflow-hidden"
      style={{ width: 240, borderColor: isPending ? `${MUTED}40` : `${st.color}40`, background: isPending ? 'oklch(0.11 0.005 50 / 0.6)' : `${st.color}05`, opacity: isPending ? 0.5 : 1, transition: 'all 0.4s' }}>
      <Handle type="target" position={Position.Top} style={{ background: color, border: 'none', width: 6, height: 6, top: -3 }} />
      <div className="flex items-center gap-2 px-3 py-2"
        style={{ borderBottom: `1px solid ${isPending ? `${MUTED}20` : `${st.color}15`}`, background: `${color}06` }}>
        <div className="flex size-5 shrink-0 items-center justify-center rounded-md"
          style={{ background: `${color}18`, border: `1px solid ${color}30` }}>
          <Icon className="size-3" style={{ color }} />
        </div>
        <p className="text-[11px] font-medium text-foreground flex-1 truncate">{d.label}</p>
        {d.status !== 'pending' && (
          <div className="flex items-center gap-1">
            <StatusIcon className="size-2.5" style={{ color: st.color }} />
            <span className="text-[9px] uppercase tracking-wider font-medium" style={{ color: st.color }}>{st.label}</span>
          </div>
        )}
      </div>
      <div className="px-3 py-2">
        <p className="text-[10px] text-muted-foreground leading-snug">{d.description}</p>
        {d.sentTo && (
          <p className="text-[9px] mt-1" style={{ color: st.color }}>→ {d.sentTo}</p>
        )}
        {d.timestamp && (
          <p className="text-[9px] text-muted-foreground/50 mt-0.5">{d.timestamp}</p>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} style={{ background: color, border: 'none', width: 6, height: 6, bottom: -3 }} />
    </div>
  )
}

function SentinelSayNode({ data }: NodeProps) {
  const d = data as { text: string }
  return (
    <div className="flex items-start gap-2.5 rounded-xl border p-3"
      style={{ width: 260, borderColor: `oklch(0.72 0.17 55 / 0.3)`, background: `oklch(0.72 0.17 55 / 0.04)` }}>
      <Handle type="target" position={Position.Top} style={{ background: ACCENT, border: 'none', width: 6, height: 6, top: -3 }} />
      <div className="flex size-5 shrink-0 items-center justify-center rounded-full mt-0.5"
        style={{ background: `oklch(0.72 0.17 55 / 0.15)`, border: `1px solid oklch(0.72 0.17 55 / 0.25)` }}>
        <SparklesIcon className="size-3" style={{ color: ACCENT }} />
      </div>
      <p className="text-[10px] leading-relaxed" style={{ color: `oklch(0.75 0.14 55)` }}>{d.text}</p>
    </div>
  )
}

// ── Node types ────────────────────────────────────────────────────────────────

const nodeTypes = {
  contract: ContractNode,
  analysis: AnalysisNode,
  action: ActionNode,
  sentinel: SentinelSayNode,
}

// ── Demo nodes for Dr. Suasuna / Matheus M2 review state ──────────────────────

const NODES: Node[] = [
  // Contract
  { id: 'contract', type: 'contract', position: { x: 0, y: 0 },
    data: { title: 'Site Dr. Suasuna', client: 'Dr. Suasuna', provider: 'Matheus', value: '$3,800', milestones: 4 } },

  // Analysis
  { id: 'analysis', type: 'analysis', position: { x: 360, y: 0 },
    data: {
      label: 'Sentinel — M2 under review',
      status: 'done',
      findings: [
        'M2 Frontend delivered by Matheus on 03/19',
        'Dr. Suasuna has not responded yet (2h)',
        'Responsive mobile missing from commits',
        'Review deadline: Apr 05 — 5 days remaining',
        'Escrow $1,200 locked awaiting approval',
      ],
    } },

  // Actions
  { id: 'act-whatsapp', type: 'action', position: { x: 100, y: 220 },
    data: { label: 'WhatsApp Reminder', description: 'SMS sent to Dr. Suasuna requesting frontend review.', icon: 'whatsapp', status: 'waiting', sentTo: 'Dr. Suasuna', timestamp: 'today 2h ago — no response' } },

  { id: 'act-github', type: 'action', position: { x: 380, y: 220 },
    data: { label: 'GitHub monitoring', description: 'Monitoring repository commits to validate future deliveries.', icon: 'github', status: 'accepted', sentTo: 'Matheus (dev)', timestamp: 'Mar 19 — access confirmed' } },

  { id: 'act-escrow', type: 'action', position: { x: 660, y: 220 },
    data: { label: 'Escrow M2 — $1,200', description: 'Value locked awaiting approval. Auto-release in 5 days.', icon: 'escrow', status: 'waiting', sentTo: 'Both parties', timestamp: 'expires Apr 05' } },

  { id: 'act-calendar', type: 'action', position: { x: 940, y: 220 },
    data: { label: 'Deadline Apr 5', description: 'Alert scheduled to remind both parties 24h before deadline.', icon: 'calendar', status: 'approved', timestamp: 'alert on Apr 04 09:00' } },

  // Sentinel say
  { id: 'sentinel-say', type: 'sentinel', position: { x: 360, y: 420 },
    data: { text: "Dr. Suasuna hasn't responded yet. I sent a reminder 2h ago. Deadline expires in 5 days — if no action, escrow goes automatically to Matheus." } },
]

const EDGES: Edge[] = [
  { id: 'e1', source: 'contract', target: 'analysis', type: 'smoothstep', style: { stroke: `${ACCENT}50`, strokeWidth: 1.5 } },
  { id: 'e2', source: 'analysis', target: 'act-whatsapp', type: 'smoothstep', style: { stroke: `${GREEN}40`, strokeWidth: 1 } },
  { id: 'e3', source: 'analysis', target: 'act-github', type: 'smoothstep', style: { stroke: `${GREEN}40`, strokeWidth: 1 } },
  { id: 'e4', source: 'analysis', target: 'act-escrow', type: 'smoothstep', style: { stroke: `${GREEN}40`, strokeWidth: 1 } },
  { id: 'e5', source: 'analysis', target: 'act-calendar', type: 'smoothstep', style: { stroke: `${GREEN}40`, strokeWidth: 1 } },
  { id: 'e6', source: 'analysis', target: 'sentinel-say', type: 'smoothstep', style: { stroke: `${ACCENT}30`, strokeWidth: 1, strokeDasharray: '4 3' } },
]

// ── Sheet component ───────────────────────────────────────────────────────────

interface SentinelSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SentinelSheet({ open, onOpenChange }: SentinelSheetProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-[75vw] max-w-none p-0 border-l border-border bg-background flex flex-col"
      >
        <SheetHeader className="px-5 py-3 border-b border-border shrink-0">
          <div className="flex items-center gap-2">
            <span className="size-1.5 rounded-full bg-emerald animate-subtle-pulse shrink-0" />
            <SheetTitle className="text-xs font-medium uppercase tracking-wider text-foreground">
              Plano Sentinel — Site Dr. Suasuna
            </SheetTitle>
            <span className="ml-auto text-[10px] text-muted-foreground uppercase tracking-wider">
              M2 em revisão · 5 dias restantes
            </span>
          </div>
        </SheetHeader>

        <div className="flex-1 min-h-0">
          <ReactFlow
            nodes={NODES}
            edges={EDGES}
            nodeTypes={nodeTypes}
            fitView
            fitViewOptions={{ padding: 0.15 }}
            panOnDrag
            zoomOnScroll
            nodesDraggable={false}
            elementsSelectable={false}
            proOptions={{ hideAttribution: true }}
            style={{ background: 'transparent' }}
          >
            <Background
              color="oklch(1 0 0 / 4%)"
              gap={24}
              size={1}
            />
          </ReactFlow>
        </div>
      </SheetContent>
    </Sheet>
  )
}
