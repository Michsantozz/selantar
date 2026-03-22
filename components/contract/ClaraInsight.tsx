'use client'

export function ClaraInsight({ text }: { text: string }) {
  return (
    <div className="rounded-lg border border-accent/15 bg-accent/5 px-3 py-2.5">
      <div className="flex items-center gap-1.5 mb-1">
        <span className="size-1 rounded-full bg-accent shrink-0" />
        <span className="text-[9px] uppercase tracking-wider font-medium text-accent">Clara</span>
      </div>
      <p className="text-xs text-foreground leading-relaxed">{text}</p>
    </div>
  )
}
