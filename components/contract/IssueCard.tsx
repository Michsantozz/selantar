'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

type IssueStatus = 'open' | 'resolved' | 'waiting'

interface IssueCardProps {
  title: string
  status: IssueStatus
  partyClaim: string
  otherPartyClaim: string
  otherPartyName: string
  claraFinding: string
  index?: number
}

const statusConfig: Record<IssueStatus, { label: string; dot: string; text: string; border: string }> = {
  open: {
    label: 'OPEN',
    dot: 'bg-destructive',
    text: 'text-destructive',
    border: 'border-destructive/20',
  },
  resolved: {
    label: 'RESOLVED',
    dot: 'bg-emerald',
    text: 'text-emerald',
    border: 'border-emerald/15',
  },
  waiting: {
    label: 'WAITING',
    dot: 'bg-accent',
    text: 'text-accent',
    border: 'border-accent/20',
  },
}

export function IssueCard({
  title,
  status,
  partyClaim,
  otherPartyClaim,
  otherPartyName,
  claraFinding,
  index = 0,
}: IssueCardProps) {
  const [expanded, setExpanded] = useState(status === 'open')
  const cfg = statusConfig[status]

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.15, duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
      className={cn('rounded-lg border bg-card', cfg.border)}
    >
      {/* Header */}
      <button
        className="flex items-center gap-2 w-full px-3 py-2.5 text-left"
        onClick={() => setExpanded((p) => !p)}
      >
        <span className={cn('size-1.5 rounded-full shrink-0', cfg.dot)} />
        <span className="text-xs font-medium text-foreground flex-1 truncate">{title}</span>
        <span className={cn('text-[9px] uppercase tracking-wider font-medium shrink-0', cfg.text)}>
          {cfg.label}
        </span>
      </button>

      {/* Expanded content */}
      {expanded && (
        <div className="px-3 pb-3 flex flex-col gap-2 border-t border-border/50">
          {/* Claims */}
          <div className="flex flex-col gap-1 mt-2">
            <div className="rounded-md bg-muted/60 px-2.5 py-1.5 text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">You:</span> &ldquo;{partyClaim}&rdquo;
            </div>
            <div className="rounded-md bg-muted/60 px-2.5 py-1.5 text-[10px] text-muted-foreground">
              <span className="font-medium text-foreground">{otherPartyName}:</span> &ldquo;{otherPartyClaim}&rdquo;
            </div>
          </div>

          {/* Clara's finding */}
          <div className="rounded-md border border-accent/15 bg-accent/5 px-2.5 py-2">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="size-1 rounded-full bg-accent" />
              <span className="text-[9px] uppercase tracking-wider font-medium text-accent">Clara</span>
            </div>
            <p className="text-[10px] text-foreground leading-relaxed">{claraFinding}</p>
          </div>

          {/* Quick reactions */}
          <div className="flex gap-1.5 flex-wrap">
            <button className="px-2 py-1 rounded-md text-[9px] border border-border text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors">
              Ok, that makes sense
            </button>
            <button className="px-2 py-1 rounded-md text-[9px] border border-border text-muted-foreground hover:text-foreground hover:border-border/60 transition-colors">
              I still disagree because...
            </button>
          </div>
        </div>
      )}
    </motion.div>
  )
}
