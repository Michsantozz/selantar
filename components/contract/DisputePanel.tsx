'use client'

import { IssueCard } from './IssueCard'
import { SplitSlider } from './SplitSlider'
import { DualApproval } from './DualApproval'

interface Issue {
  id: string
  title: string
  status: 'open' | 'resolved' | 'waiting'
  partyClaim: string
  otherPartyClaim: string
  claraFinding: string
}

interface DisputePanelProps {
  issues: Issue[]
  otherPartyName: string
  providerName: string
  clientName: string
  totalValue: number
  initialSplitPercent: number
  leftParty: { name: string; initial: string; signed: boolean }
  rightParty: { name: string; initial: string; signed: boolean }
}

export function DisputePanel({
  issues, otherPartyName, providerName, clientName,
  totalValue, initialSplitPercent, leftParty, rightParty,
}: DisputePanelProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Left — issues */}
      <div id="cd-issues" className="flex flex-col gap-2">
        <div className="flex items-center gap-2 mb-1">
          <span className="size-1.5 rounded-full bg-destructive shrink-0" />
          <span className="text-[9px] uppercase tracking-wider font-medium text-muted-foreground">
            Problemas — {issues.length}
          </span>
        </div>
        {issues.map((issue, i) => (
          <div key={issue.id} id={`cd-issue-${issue.id}`}>
            <IssueCard
              title={issue.title}
              status={issue.status}
              partyClaim={issue.partyClaim}
              otherPartyClaim={issue.otherPartyClaim}
              otherPartyName={otherPartyName}
              claraFinding={issue.claraFinding}
              index={i}
            />
          </div>
        ))}
      </div>

      {/* Right — settlement */}
      <div id="cd-settlement" className="flex flex-col gap-4">
        <div>
          <div className="flex items-center gap-2 mb-3">
            <span className="size-1.5 rounded-full bg-accent shrink-0" />
            <span className="text-[9px] uppercase tracking-wider font-medium text-muted-foreground">
              Settlement — rodada 1/3
            </span>
          </div>
          <SplitSlider
            totalValue={totalValue}
            providerName={providerName}
            clientName={clientName}
            initialProviderPercent={initialSplitPercent}
          />
        </div>

        <div className="border-t border-border/50 pt-4">
          <DualApproval
            leftParty={leftParty}
            rightParty={rightParty}
            viewerIsLeft={false}
          />
        </div>
      </div>
    </div>
  )
}
