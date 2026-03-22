export default function Loading() {
  return (
    <div className="flex items-center justify-center bg-background" style={{ height: '100dvh' }}>
      <div className="flex flex-col items-center gap-3">
        <div className="size-5 rounded-full border-2 border-accent/30 border-t-accent animate-spin" />
        <span className="text-xs text-muted-foreground">Loading...</span>
      </div>
    </div>
  )
}
