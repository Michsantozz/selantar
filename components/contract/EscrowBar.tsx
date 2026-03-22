'use client'

import { cn } from '@/lib/utils'

interface EscrowSegment {
  label: string
  amount: number
  color: 'paid' | 'review' | 'locked'
}

interface EscrowBarProps {
  segments: EscrowSegment[]
  total: number
}

const colorMap = {
  paid: { bar: 'bg-emerald', text: 'text-emerald' },
  review: { bar: 'bg-accent', text: 'text-accent' },
  locked: { bar: 'bg-muted-foreground/30', text: 'text-muted-foreground' },
}

export function EscrowBar({ segments, total }: EscrowBarProps) {
  return (
    <div className="flex flex-col justify-center gap-1.5 px-4 flex-1 min-w-0">
      {/* Bar */}
      <div className="flex h-1 rounded-full overflow-hidden gap-px bg-border">
        {segments.map((seg, i) => {
          const pct = (seg.amount / total) * 100
          return (
            <div
              key={i}
              className={cn('h-full transition-all', colorMap[seg.color].bar)}
              style={{ width: `${pct}%` }}
            />
          )
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center gap-4">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <span className={cn('size-1.5 rounded-full shrink-0', colorMap[seg.color].bar)} />
            <span className={cn('text-[10px] font-mono', colorMap[seg.color].text)}>
              ${seg.amount.toLocaleString('en-US')} {seg.label}
            </span>
          </div>
        ))}
        <span className="ml-auto text-[10px] font-mono text-muted-foreground">
          ${total.toLocaleString('en-US')} total
        </span>
      </div>
    </div>
  )
}
