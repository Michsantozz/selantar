'use client'

import { cn } from '@/lib/utils'

type StepStatus = 'done' | 'active' | 'pending'

interface Step {
  label: string
  status: StepStatus
}

export function ApprovalStepper({ steps }: { steps: Step[] }) {
  return (
    <div className="flex items-center">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <div key={i} className="flex items-center flex-1">
            <div className="flex items-center gap-1.5 shrink-0">
              <span className={cn('size-1.5 rounded-full transition-all',
                step.status === 'done' && 'bg-emerald',
                step.status === 'active' && 'bg-accent ring-2 ring-accent/20',
                step.status === 'pending' && 'bg-border'
              )} />
              <span className={cn('text-[9px] uppercase tracking-wider font-medium whitespace-nowrap',
                step.status === 'done' && 'text-emerald',
                step.status === 'active' && 'text-accent',
                step.status === 'pending' && 'text-muted-foreground/40'
              )}>
                {step.label}
              </span>
            </div>
            {!isLast && (
              <div className={cn('flex-1 h-px mx-2 transition-colors',
                step.status === 'done' ? 'bg-emerald/30' : 'bg-border/50'
              )} />
            )}
          </div>
        )
      })}
    </div>
  )
}
