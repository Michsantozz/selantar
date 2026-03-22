'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DualApprovalProps {
  leftParty: { name: string; initial: string; signed: boolean }
  rightParty: { name: string; initial: string; signed: boolean }
  onAccept?: () => void
  onCounter?: () => void
  viewerIsLeft?: boolean
}

export function DualApproval({
  leftParty,
  rightParty,
  onAccept,
  onCounter,
  viewerIsLeft = false,
}: DualApprovalProps) {
  const [leftSigned, setLeftSigned] = useState(leftParty.signed)
  const [rightSigned, setRightSigned] = useState(rightParty.signed)

  const bothSigned = leftSigned && rightSigned

  function handleAccept() {
    if (viewerIsLeft) setLeftSigned(true)
    else setRightSigned(true)
    onAccept?.()
  }

  const statusMsg = bothSigned
    ? 'Ambos aceitaram — settlement executando on-chain'
    : leftSigned
    ? `${leftParty.name} aceitou — aguardando ${rightParty.name}`
    : rightSigned
    ? `${rightParty.name} aceitou — aguardando ${leftParty.name}`
    : 'Nenhuma parte assinou ainda'

  return (
    <div className="flex flex-col items-center gap-3">
      {/* Circles + Connector */}
      <div className="flex items-center gap-2">
        {/* Left circle */}
        <div
          className={cn(
            'size-9 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500',
            leftSigned
              ? 'border-emerald bg-emerald/10 text-emerald'
              : 'border-dashed border-border text-muted-foreground'
          )}
        >
          {leftParty.initial}
        </div>

        {/* Connector — two halves */}
        <div className="flex w-14 h-px">
          <div
            className={cn(
              'w-1/2 h-full transition-colors duration-500',
              leftSigned ? 'bg-emerald' : 'bg-border'
            )}
          />
          <div
            className={cn(
              'w-1/2 h-full transition-colors duration-500',
              rightSigned ? 'bg-emerald' : 'bg-border'
            )}
          />
        </div>

        {/* Right circle */}
        <div
          className={cn(
            'size-9 rounded-full border-2 flex items-center justify-center text-sm font-medium transition-all duration-500',
            rightSigned
              ? 'border-emerald bg-emerald/10 text-emerald'
              : viewerIsLeft
              ? 'border-dashed border-accent/50 text-accent/70'
              : 'border-dashed border-border text-muted-foreground'
          )}
        >
          {rightParty.initial}
        </div>
      </div>

      {/* Status message */}
      <p
        className={cn(
          'text-[10px] text-center',
          bothSigned ? 'text-emerald font-medium' : 'text-muted-foreground'
        )}
      >
        {statusMsg}
      </p>

      {/* Actions */}
      {!bothSigned && (
        <div className="flex gap-2">
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] uppercase tracking-wider border-emerald/30 bg-emerald/5 text-emerald hover:bg-emerald/10 hover:border-emerald/50"
            onClick={handleAccept}
          >
            Aceitar settlement
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-7 text-[10px] uppercase tracking-wider"
            onClick={onCounter}
          >
            Contra-proposta
          </Button>
        </div>
      )}
    </div>
  )
}
