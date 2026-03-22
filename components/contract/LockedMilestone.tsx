'use client'

import { Lock } from 'lucide-react'

interface LockedMilestoneProps {
  name: string
  value: number
  dependsOn: string
  opacity?: number
}

export function LockedMilestone({ name, value, dependsOn, opacity = 0.4 }: LockedMilestoneProps) {
  return (
    <div
      className="flex items-center gap-3 px-4 py-2.5 rounded-lg border border-border/50 bg-card/30"
      style={{ opacity }}
    >
      <Lock className="size-3 text-muted-foreground shrink-0" />
      <span className="text-xs text-muted-foreground flex-1 truncate">{name}</span>
      <span className="text-[10px] text-muted-foreground/60 shrink-0">waiting for {dependsOn}</span>
      <span className="text-xs font-mono text-muted-foreground/60 shrink-0">${value.toLocaleString('en-US')}</span>
    </div>
  )
}
