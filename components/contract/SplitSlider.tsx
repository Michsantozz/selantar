'use client'

import { useRef, useState, useCallback } from 'react'
import { cn } from '@/lib/utils'

interface SplitSliderProps {
  totalValue: number
  providerName: string
  clientName: string
  initialProviderPercent?: number
  onChange?: (percent: number) => void
}

export function SplitSlider({
  totalValue,
  providerName,
  clientName,
  initialProviderPercent = 85,
  onChange,
}: SplitSliderProps) {
  const [pct, setPct] = useState(initialProviderPercent)
  const containerRef = useRef<HTMLDivElement>(null)
  const isDragging = useRef(false)

  const updateFromEvent = useCallback(
    (clientX: number) => {
      if (!containerRef.current) return
      const rect = containerRef.current.getBoundingClientRect()
      const raw = ((clientX - rect.left) / rect.width) * 100
      const clamped = Math.min(100, Math.max(0, Math.round(raw)))
      setPct(clamped)
      onChange?.(clamped)
    },
    [onChange]
  )

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true
    updateFromEvent(e.clientX)

    const onMove = (ev: MouseEvent) => {
      if (isDragging.current) updateFromEvent(ev.clientX)
    }
    const onUp = () => {
      isDragging.current = false
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseup', onUp)
    }
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseup', onUp)
  }

  const providerAmount = Math.round((pct / 100) * totalValue)
  const clientAmount = totalValue - providerAmount

  return (
    <div className="flex flex-col gap-2">
      {/* Track */}
      <div
        ref={containerRef}
        className="relative h-8 rounded-lg border border-border bg-muted overflow-hidden cursor-grab active:cursor-grabbing select-none"
        onMouseDown={handleMouseDown}
      >
        {/* Provider fill */}
        <div
          className="absolute inset-y-0 left-0 bg-accent/15 border-r border-accent/40 flex items-center pl-3 transition-none"
          style={{ width: `${pct}%` }}
        >
          {pct > 20 && (
            <span className="text-[10px] font-mono font-medium text-accent truncate">
              {providerName} {pct}%
            </span>
          )}
        </div>

        {/* Client fill (right side) */}
        {pct < 80 && (
          <div className="absolute inset-y-0 right-0 flex items-center pr-3" style={{ width: `${100 - pct}%` }}>
            <span className="text-[10px] font-mono font-medium text-muted-foreground ml-auto truncate">
              {clientName} {100 - pct}%
            </span>
          </div>
        )}

        {/* Handle */}
        <div
          className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 size-5 rounded-full bg-background border-2 border-accent/60 shadow-sm cursor-grab active:cursor-grabbing transition-none"
          style={{ left: `${pct}%` }}
        />
      </div>

      {/* Labels */}
      <div className="flex justify-between">
        <div className="flex flex-col gap-0.5">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{providerName}</span>
          <span className="text-sm font-mono font-medium text-accent">
            ${providerAmount.toLocaleString('en-US')}
          </span>
        </div>
        <div className="flex flex-col gap-0.5 items-end">
          <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{clientName}</span>
          <span className="text-sm font-mono font-medium text-foreground">
            ${clientAmount.toLocaleString('en-US')}
          </span>
        </div>
      </div>
    </div>
  )
}
