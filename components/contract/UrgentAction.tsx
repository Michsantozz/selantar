'use client'

import { AlertCircle, CheckCircle2, Gavel } from 'lucide-react'
import { cn } from '@/lib/utils'

type UrgentState = 'review' | 'dispute' | 'clear'

interface UrgentActionProps {
  state: UrgentState
  label: string
  sublabel?: string
}

const stateConfig = {
  review: {
    bg: 'bg-accent/8',
    border: 'border-accent/20',
    text: 'text-accent',
    subtext: 'text-accent/70',
    icon: AlertCircle,
    pulse: 'animate-pulse-urgent',
  },
  dispute: {
    bg: 'bg-destructive/8',
    border: 'border-destructive/20',
    text: 'text-destructive',
    subtext: 'text-destructive/70',
    icon: Gavel,
    pulse: 'animate-pulse-urgent-red',
  },
  clear: {
    bg: 'bg-emerald/8',
    border: 'border-emerald/20',
    text: 'text-emerald',
    subtext: 'text-emerald/70',
    icon: CheckCircle2,
    pulse: '',
  },
}

export function UrgentAction({ state, label, sublabel }: UrgentActionProps) {
  const cfg = stateConfig[state]
  const Icon = cfg.icon

  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-4 h-full border-r border-border min-w-[220px]',
        cfg.bg,
        cfg.pulse
      )}
    >
      <Icon className={cn('size-3.5 shrink-0', cfg.text)} />
      <div className="min-w-0">
        <p className={cn('text-xs font-medium leading-none truncate', cfg.text)}>{label}</p>
        {sublabel && (
          <p className={cn('text-[10px] mt-0.5 leading-none', cfg.subtext)}>{sublabel}</p>
        )}
      </div>
    </div>
  )
}
