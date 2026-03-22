'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'

interface ContractNavProps {
  contractName: string
  clientName: string
  providerName: string
  status?: 'active' | 'dispute' | 'idle'
}

const statusMap = {
  active:  { text: 'Active',  dot: 'bg-accent',      navDot: 'bg-accent' },
  dispute: { text: 'Dispute', dot: 'bg-destructive',  navDot: 'bg-destructive' },
  idle:    { text: 'Active',  dot: 'bg-emerald',      navDot: 'bg-emerald' },
}

export function ContractNav({ contractName, clientName, providerName, status = 'active' }: ContractNavProps) {
  const st = statusMap[status]

  return (
    <header className="flex items-center h-[52px] px-6 gap-4 border-b border-border bg-card">
      {/* Back */}
      <Link
        href="/"
        className="group flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        <svg viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="size-3.5">
          <path d="M8.5 3L4.5 7L8.5 11" />
        </svg>
        <span className="text-[13px] uppercase tracking-wider">Selantar</span>
      </Link>

      {/* Separator */}
      <div className="w-px h-5 bg-border shrink-0" />

      {/* Contract */}
      <div className="flex items-center gap-2 min-w-0 flex-1">
        <span className={cn('size-1.5 rounded-full shrink-0', st.navDot)} />
        <span className="text-sm text-foreground truncate">{contractName}</span>
        <span className="text-[13px] text-muted-foreground shrink-0">{clientName} / {providerName}</span>
      </div>

      {/* Right */}
      <div className="flex items-center gap-5 shrink-0">
        <Link href="/" className="text-xs font-medium uppercase tracking-wider text-muted-foreground hover:text-foreground transition-colors">
          My contracts
        </Link>
        <div className="flex items-center gap-1.5">
          <span className={cn('size-[5px] rounded-full shrink-0', st.dot)} />
          <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{st.text}</span>
        </div>
      </div>
    </header>
  )
}
