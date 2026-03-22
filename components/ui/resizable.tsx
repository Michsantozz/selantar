'use client'

import { GripVertical } from 'lucide-react'
import { Group, Panel, Separator } from 'react-resizable-panels'

import { cn } from '@/lib/utils'

const ResizablePanelGroup = ({
  className,
  direction = 'horizontal',
  ...props
}: React.ComponentProps<typeof Group> & { direction?: 'horizontal' | 'vertical' }) => (
  <Group
    orientation={direction}
    className={cn('w-full h-full', direction === 'vertical' && 'flex-col', className)}
    {...props}
  />
)

// In v4, numbers are treated as pixels. Convert numbers to "%" strings for backwards compatibility.
function toPercent(v: number | string | undefined): string | undefined {
  if (v === undefined) return undefined
  return typeof v === 'number' ? `${v}%` : v
}

const ResizablePanel = ({
  defaultSize,
  minSize,
  maxSize,
  ...props
}: React.ComponentProps<typeof Panel>) => (
  <Panel
    defaultSize={toPercent(defaultSize)}
    minSize={toPercent(minSize)}
    maxSize={toPercent(maxSize)}
    {...props}
  />
)

const ResizableHandle = ({
  withHandle,
  className,
  ...props
}: React.ComponentProps<typeof Separator> & { withHandle?: boolean }) => (
  <Separator
    className={cn(
      'relative flex w-px items-center justify-center bg-border',
      'hover:bg-accent/40 transition-colors',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-2 after:-translate-x-1/2',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring',
      className
    )}
    {...props}
  >
    {withHandle && (
      <div className="z-10 flex h-5 w-3 items-center justify-center rounded-sm border border-border bg-muted/80">
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
    )}
  </Separator>
)

export { ResizablePanelGroup, ResizablePanel, ResizableHandle }
