'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { ApprovalStepper } from './ApprovalStepper'
import { ClaraInsight } from './ClaraInsight'
import { FeedbackInput } from './FeedbackInput'
import { DisputePanel } from './DisputePanel'
import { cn } from '@/lib/utils'

interface MilestoneCardProps {
  milestoneName: string
  milestoneValue: number
  state: 'review' | 'dispute'
  onApprove?: () => void
  onDispute?: () => void
  claraInsight: string
  timeoutPercent: number
  timeoutLabel: string
  attachments: { files: number; evidence: number; messages: number; txs: number }
  issues: Array<{
    id: string
    title: string
    status: 'open' | 'resolved' | 'waiting'
    partyClaim: string
    otherPartyClaim: string
    claraFinding: string
  }>
  otherPartyName: string
  providerName: string
  clientName: string
  totalValue: number
  initialSplitPercent: number
  leftParty: { name: string; initial: string; signed: boolean }
  rightParty: { name: string; initial: string; signed: boolean }
}

const REVIEW_STEPS = [
  { label: 'Delivered', status: 'done' as const },
  { label: 'AI reviewed', status: 'done' as const },
  { label: 'Your review', status: 'active' as const },
  { label: 'Payment', status: 'pending' as const },
]

export function MilestoneCard({
  milestoneName,
  milestoneValue,
  state,
  onApprove,
  onDispute,
  claraInsight,
  timeoutPercent,
  timeoutLabel,
  attachments,
  issues,
  otherPartyName,
  providerName,
  clientName,
  totalValue,
  initialSplitPercent,
  leftParty,
  rightParty,
}: MilestoneCardProps) {
  const isDispute = state === 'dispute'

  return (
    <div
      className={cn(
        'rounded-xl border-2 bg-card transition-all duration-300',
        isDispute
          ? 'border-destructive/35 animate-pulse-border-red'
          : 'border-accent/35 animate-pulse-border'
      )}
    >
      {/* ── Header ── */}
      <div className="flex items-center gap-3 px-4 py-2.5 border-b border-border/50">
        <div className="flex items-center gap-2">
          <span className={cn('size-1.5 rounded-full shrink-0', isDispute ? 'bg-destructive' : 'bg-accent')} />
          <span className={cn('text-[10px] uppercase tracking-wider font-medium', isDispute ? 'text-destructive' : 'text-accent')}>
            {isDispute ? 'Dispute' : 'Review'}
          </span>
          <span className="text-border/80 text-xs">—</span>
          <span className="text-sm font-medium text-foreground">{milestoneName}</span>
          <span className="text-xs font-mono text-muted-foreground">${milestoneValue.toLocaleString('en-US')}</span>
        </div>

        {!isDispute && (
          <div className="flex gap-2 ml-auto">
            <Button size="sm" variant="outline"
              className="h-6 px-3 text-[10px] uppercase tracking-wider border-emerald/30 bg-emerald/5 text-emerald hover:bg-emerald/10"
              onClick={onApprove}>
              Approve
            </Button>
            <Button size="sm" variant="outline"
              className="h-6 px-3 text-[10px] uppercase tracking-wider border-destructive/30 bg-destructive/5 text-destructive hover:bg-destructive/10"
              onClick={onDispute}>
              Dispute
            </Button>
          </div>
        )}
      </div>

      {/* ── Body ── */}
      <div className="p-4">
        <AnimatePresence mode="wait">
          {isDispute ? (
            <motion.div key="dispute"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}>
              <DisputePanel
                issues={issues}
                otherPartyName={otherPartyName}
                providerName={providerName}
                clientName={clientName}
                totalValue={totalValue}
                initialSplitPercent={initialSplitPercent}
                leftParty={leftParty}
                rightParty={rightParty}
              />
            </motion.div>
          ) : (
            <motion.div key="review"
              initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
              className="flex flex-col gap-3">

              {/* Approval stepper */}
              <ApprovalStepper steps={REVIEW_STEPS} />

              {/* Two-column layout: Clara + meta left, feedback right */}
              <div className="grid grid-cols-2 gap-4">
                {/* Left — Clara insight + meta */}
                <div className="flex flex-col gap-3">
                  <ClaraInsight text={claraInsight} />
                </div>

                {/* Right — feedback + timeout */}
                <div className="flex flex-col gap-3">
                  <FeedbackInput />

                  {/* Timeout */}
                  <div className="flex items-center gap-2">
                    <div className="flex-1">
                      <Progress value={timeoutPercent} className="h-1 bg-muted" />
                    </div>
                    <span className={cn('text-[10px] font-mono shrink-0',
                      timeoutPercent > 75 ? 'text-destructive' : timeoutPercent > 50 ? 'text-accent' : 'text-emerald')}>
                      {timeoutLabel} remaining
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
