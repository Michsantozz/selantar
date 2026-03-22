'use client'

import { cn } from '@/lib/utils'
import {
  AlertCircleIcon,
  TriangleAlertIcon,
  CheckIcon,
} from 'lucide-react'

type UrgentState = 'review' | 'dispute' | 'clear'

interface EscrowSegment {
  label: string
  amount: number
  color: 'paid' | 'review' | 'locked' | 'dispute' | 'progress'
}

interface MilestoneFlow {
  id: string
  label: string
  value: number
  status: 'paid' | 'active' | 'dispute' | 'locked'
}

interface TopStripProps {
  urgentState: UrgentState
  urgentLabel: string
  urgentSublabel?: string
  urgentMetric?: string
  urgentMetricSub?: string
  escrowSegments: EscrowSegment[]
  escrowTotal: number
  milestones: MilestoneFlow[]
  demoState?: 'review' | 'dispute'
  onDemoChange?: (state: 'review' | 'dispute') => void
}

// ── Escrow segment colors ──

const segColor: Record<string, { bar: string; dot: string; amount: string }> = {
  paid:     { bar: 'bg-emerald',             dot: 'bg-emerald',             amount: 'text-emerald' },
  review:   { bar: 'bg-accent',              dot: 'bg-accent',              amount: 'text-accent' },
  dispute:  { bar: 'bg-destructive',          dot: 'bg-destructive',          amount: 'text-destructive' },
  progress: { bar: 'bg-accent',              dot: 'bg-accent',              amount: 'text-accent' },
  locked:   { bar: 'bg-muted-foreground/20', dot: 'bg-muted-foreground/30', amount: 'text-muted-foreground' },
}

// ── Urgent state config ──

const urgConfig = {
  review:  { Icon: AlertCircleIcon,    iconBg: 'bg-accent/8',      iconColor: 'text-accent',      titleColor: 'text-accent',      subColor: 'text-accent/45',      metricColor: 'text-accent',      metricSubColor: 'text-accent/40',      escrowDot: 'bg-accent' },
  dispute: { Icon: TriangleAlertIcon,  iconBg: 'bg-destructive/8', iconColor: 'text-destructive',  titleColor: 'text-destructive',  subColor: 'text-destructive/45', metricColor: 'text-destructive',  metricSubColor: 'text-destructive/40', escrowDot: 'bg-destructive' },
  clear:   { Icon: CheckIcon,          iconBg: 'bg-emerald/6',     iconColor: 'text-emerald',      titleColor: 'text-emerald',      subColor: 'text-emerald/40',     metricColor: 'text-emerald',      metricSubColor: 'text-emerald/40',     escrowDot: 'bg-emerald' },
}

// ── Milestone pill colors ──

const pillStyle: Record<string, string> = {
  paid:    'bg-emerald/8 border-emerald/15 text-emerald',
  active:  'bg-accent/8 border-accent/15 text-accent',
  dispute: 'bg-destructive/8 border-destructive/15 text-destructive',
  locked:  'bg-transparent border-border text-muted-foreground',
}

export function TopStrip({
  urgentState,
  urgentLabel,
  urgentSublabel,
  urgentMetric,
  urgentMetricSub,
  escrowSegments,
  escrowTotal,
  milestones,
  demoState,
  onDemoChange,
}: TopStripProps) {
  const urg = urgConfig[urgentState]
  const urgBg = urgentState === 'review' ? 'bg-accent/4' : urgentState === 'dispute' ? 'bg-destructive/4' : 'bg-emerald/3'

  return (
    <div className="flex flex-col bg-card">
      {/* ── Row 1: Urgent + Escrow ── */}
      <div className="grid border-b border-border" style={{ gridTemplateColumns: '340px 1fr' }}>
        {/* Urgent left */}
        <div className={cn('flex items-center gap-3 px-6 py-3.5 border-r border-border', urgBg)}>
          {/* Icon */}
          <div className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', urg.iconBg)}>
            <urg.Icon className={cn('size-4', urg.iconColor)} />
          </div>

          {/* Text */}
          <div className="flex flex-col gap-0.5 min-w-0 flex-1">
            <p className={cn('text-[13px] font-medium leading-tight tracking-tight', urg.titleColor)}>
              {urgentLabel}
            </p>
            {urgentSublabel && (
              <p className={cn('text-xs leading-snug', urg.subColor)}>
                {urgentSublabel}
              </p>
            )}
          </div>

          {/* Metric */}
          {urgentMetric && (
            <div className="flex flex-col items-end shrink-0 ml-auto">
              <p className={cn('text-xl font-mono tracking-tight leading-none', urg.metricColor)}>
                {urgentMetric}
              </p>
              {urgentMetricSub && (
                <p className={cn('text-[10px] font-medium uppercase tracking-wider mt-0.5', urg.metricSubColor)}>
                  {urgentMetricSub}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Escrow right */}
        <div className="flex flex-col justify-center gap-2 px-6 py-3.5">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className={cn('size-[5px] rounded-full shrink-0', urg.escrowDot)} />
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                Escrow
              </span>
            </div>
            <span className="text-sm font-mono text-muted-foreground">
              R$ {escrowTotal.toLocaleString('en-US')}
            </span>
          </div>

          {/* Bar */}
          <div className="flex h-1 rounded-full overflow-hidden gap-[3px] bg-muted">
            {escrowSegments.map((seg, i) => {
              const pct = (seg.amount / escrowTotal) * 100
              const s = segColor[seg.color] ?? segColor.locked
              return (
                <div
                  key={i}
                  className={cn('h-full rounded-full', s.bar)}
                  style={{ width: `${pct}%` }}
                />
              )
            })}
          </div>

          {/* Legend */}
          <div className="flex items-center gap-5">
            {escrowSegments.map((seg, i) => {
              const s = segColor[seg.color] ?? segColor.locked
              return (
                <div key={i} className="flex items-center gap-1.5">
                  <span className={cn('size-[5px] rounded-full shrink-0', s.dot)} />
                  <span className={cn('text-xs font-mono', s.amount)}>
                    R$ {seg.amount.toLocaleString('en-US')}
                  </span>
                  <span className="text-[11px] text-muted-foreground">{seg.label}</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Row 2: Flow pills ── */}
      <div className="flex items-center gap-1.5 px-6 py-3.5 border-b border-border">
        {milestones.map((ms, i) => (
          <div key={ms.id} className="flex items-center gap-1.5">
            {i > 0 && <span className="text-xs text-muted-foreground/30 mx-0.5">&rarr;</span>}
            <span
              className={cn(
                'px-2.5 py-1 rounded-md text-[11px] font-medium font-mono tracking-wide border',
                pillStyle[ms.status]
              )}
            >
              {ms.label}
            </span>
          </div>
        ))}

        {/* Values on right */}
        <span className="ml-auto text-[11px] font-mono text-muted-foreground/30">
          {milestones.map((ms) => `R$ ${ms.value.toLocaleString('en-US')}`).join(' \u2192 ')}
        </span>

        {/* Demo toggle */}
        {demoState && onDemoChange && (
          <>
            <div className="w-px h-4 bg-border mx-2 shrink-0" />
            <span className="text-[9px] uppercase tracking-widest text-muted-foreground/30 mr-1">Demo</span>
            <button
              onClick={() => onDemoChange('review')}
              className={cn(
                'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border transition-colors',
                demoState === 'review'
                  ? 'border-accent/30 bg-accent/8 text-accent'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              Review
            </button>
            <button
              onClick={() => onDemoChange('dispute')}
              className={cn(
                'text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md border transition-colors',
                demoState === 'dispute'
                  ? 'border-destructive/30 bg-destructive/8 text-destructive'
                  : 'border-border text-muted-foreground hover:text-foreground'
              )}
            >
              Dispute
            </button>
          </>
        )}
      </div>
    </div>
  )
}
