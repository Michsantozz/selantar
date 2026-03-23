'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import { FileTextIcon, ArrowRightIcon } from 'lucide-react'
import { ContractModal } from './ContractModal'

type MilestoneStatus = 'paid' | 'active' | 'locked' | 'dispute'

interface SidebarMilestone {
  id: string
  name: string
  value: number
  status: MilestoneStatus
}

interface SidebarProps {
  milestones: SidebarMilestone[]
  activeMilestoneId: string
}

const statusDot: Record<MilestoneStatus, string> = {
  paid: 'bg-emerald',
  active: 'bg-accent',
  locked: 'bg-border',
  dispute: 'bg-destructive',
}

const statusLabel: Record<MilestoneStatus, string> = {
  paid: 'PAID',
  active: 'REVIEW',
  locked: 'LOCKED',
  dispute: 'DISPUTE',
}

const statusTextColor: Record<MilestoneStatus, string> = {
  paid: 'text-emerald',
  active: 'text-accent',
  locked: 'text-muted-foreground/40',
  dispute: 'text-destructive',
}

export function Sidebar({ milestones, activeMilestoneId }: SidebarProps) {
  const [contractOpen, setContractOpen] = useState(false)

  return (
    <div className="flex flex-col h-full bg-card/30 border-r border-border overflow-hidden">
      {/* Section label */}
      <div className="px-3 pt-4 pb-2 border-b border-border">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-accent shrink-0" />
          <span className="text-[10px] uppercase tracking-wider font-medium text-muted-foreground">
            Milestones
          </span>
        </div>
      </div>

      {/* Milestone stepper */}
      <div className="flex-1 px-3 py-3 flex flex-col gap-0">
        {milestones.map((m, i) => {
          const isActive = m.id === activeMilestoneId
          const isLast = i === milestones.length - 1
          return (
            <div key={m.id}>
              <div
                id={`cd-milestone-${m.id}`}
                className={cn(
                  'flex items-center gap-2 py-1.5 rounded px-1 -mx-1 transition-colors',
                  isActive && 'bg-accent/5'
                )}
              >
                <span className={cn('size-1.5 rounded-full shrink-0', statusDot[m.status])} />
                <span
                  className={cn(
                    'text-xs flex-1 min-w-0 truncate',
                    isActive ? 'font-medium text-foreground' : 'text-muted-foreground',
                    m.status === 'locked' && 'opacity-40'
                  )}
                >
                  {m.name}
                </span>
                <span
                  className={cn(
                    'text-[9px] uppercase tracking-wider font-medium shrink-0',
                    statusTextColor[m.status]
                  )}
                >
                  {statusLabel[m.status]}
                </span>
              </div>
              {!isLast && (
                <div className="ml-[5px] w-px h-3 bg-border" />
              )}
            </div>
          )
        })}
      </div>

      {/* View contract button */}
      <div className="border-t border-border px-3 pt-3 pb-4">
        <button
          onClick={() => setContractOpen(true)}
          className="group flex items-center gap-2.5 rounded-lg border border-border bg-card w-full px-3 py-2.5 transition-colors hover:border-accent/20 hover:bg-accent/3 text-left"
        >
          <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-accent/15 bg-accent/6">
            <FileTextIcon className="size-4 text-accent" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-medium text-foreground leading-tight">View full contract</p>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">
              3 phases · Payment · Terms
            </p>
          </div>
          <ArrowRightIcon className="size-3 text-muted-foreground/40 transition-transform group-hover:translate-x-0.5 group-hover:text-accent shrink-0" />
        </button>
      </div>

      {/* Contract modal */}
      <ContractModal open={contractOpen} onClose={() => setContractOpen(false)} />
    </div>
  )
}
