'use client'

import { cn } from '@/lib/utils'

type EntryType = 'clara' | 'sentinel' | 'chain' | 'party'

interface TimelineEntry {
  id: string
  timeAgo: string
  type: EntryType
  description: string
}

interface ActivityFeedProps {
  entries: TimelineEntry[]
}

const dotColor: Record<EntryType, string> = {
  clara: 'bg-accent',
  sentinel: 'bg-emerald',
  chain: 'bg-muted-foreground/60',
  party: 'bg-foreground/40',
}

export function ActivityFeed({ entries }: ActivityFeedProps) {
  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="px-3 pt-4 pb-2 border-b border-border shrink-0">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent shrink-0" />
          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
            Atividade
          </span>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1 overflow-y-auto">
        {entries.map((entry, i) => (
          <div
            key={entry.id}
            className="flex items-start gap-2.5 px-3 py-2 border-b border-border/30 last:border-0"
          >
            <span className="text-[9px] font-mono text-muted-foreground/60 mt-0.5 min-w-[24px] shrink-0 text-right">
              {entry.timeAgo}
            </span>
            <span className={cn('size-1.5 rounded-full mt-1.5 shrink-0', dotColor[entry.type])} />
            <p className="text-[10px] text-muted-foreground leading-snug flex-1">
              {entry.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
