'use client'

import { useState } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const REACTIONS = ['Looks good, approved', 'Something is missing', "That's not what I asked for", 'I need more time']

export function FeedbackInput({ onSubmit }: { onSubmit?: (text: string) => void }) {
  const [value, setValue] = useState('')

  return (
    <div className="rounded-lg border border-border bg-card/60 px-3 py-2">
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="What do you think of this delivery? Write or choose below..."
        className="min-h-[28px] max-h-[60px] text-xs border-none focus-visible:ring-0 resize-none bg-transparent p-0 placeholder:text-muted-foreground/40 leading-snug"
      />
      <div className="flex gap-1 mt-1.5 flex-wrap">
        {REACTIONS.map((r) => (
          <button key={r} onClick={() => setValue(r)}
            className={cn(
              'px-2 py-0.5 rounded text-[9px] border transition-colors',
              value === r
                ? 'border-accent/40 bg-accent/8 text-accent'
                : 'border-border/60 text-muted-foreground hover:text-foreground'
            )}>
            {r}
          </button>
        ))}
      </div>
    </div>
  )
}
