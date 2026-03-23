'use client'

import { motion, AnimatePresence } from 'motion/react'
import { FileTextIcon, XIcon, ShieldIcon, CheckCircleIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ContractModalProps {
  open: boolean
  onClose: () => void
}

export function ContractModal({ open, onClose }: ContractModalProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose()
          }}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.97 }}
            transition={{ duration: 0.4, ease: [0, 0, 0.2, 1] }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-lg border border-border bg-card"
          >
            {/* Close */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-md border border-border bg-muted/20 text-muted-foreground/50 transition-colors hover:bg-muted hover:text-foreground z-10"
            >
              <XIcon className="size-4" />
            </button>

            {/* Header */}
            <div className="p-8 pb-0">
              <div className="flex items-center gap-3 mb-2">
                <div className="flex size-10 items-center justify-center rounded-lg border border-accent/20 bg-accent/6">
                  <FileTextIcon className="size-5 text-accent" />
                </div>
                <div>
                  <span className="text-xs uppercase tracking-wider text-foreground/40 block">
                    Original Contract
                  </span>
                  <h2 className="text-xl font-normal tracking-tight text-foreground">
                    Service Agreement #SLT-4201
                  </h2>
                </div>
              </div>
              <p className="text-sm text-foreground/50">
                Custom CRM for Suasuna Clinic
              </p>
              <div className="flex items-center gap-4 mt-2 text-xs font-mono text-foreground/30">
                <span>February 12, 2026</span>
                <span>90 days</span>
              </div>
            </div>

            {/* Parties */}
            <div className="px-8 pt-5">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-border bg-background p-3.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent block mb-1.5">
                    Client
                  </span>
                  <p className="text-sm font-medium text-foreground">Dr. Ernani Suasuna</p>
                  <p className="text-xs text-foreground/50">Suasuna Clinic</p>
                </div>
                <div className="rounded-md border border-accent/15 bg-accent/[0.02] p-3.5">
                  <span className="text-xs font-medium uppercase tracking-wider text-accent block mb-1.5">
                    Contractor
                  </span>
                  <p className="text-sm font-medium text-foreground">Michael Santos</p>
                  <p className="text-xs text-foreground/50">ULTRASELF</p>
                </div>
              </div>
            </div>

            {/* Scope */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Scope of Work
              </span>
              <p className="text-sm leading-relaxed text-foreground/70">
                Design, develop, and deploy a custom AI-powered CRM system for patient booking,
                appointment management, and calendar integration for the Suasuna Clinic.
              </p>
            </div>

            {/* Payment Schedule */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Payment Schedule
              </span>
              <div className="space-y-2">
                <PhaseCard id="§1" title="Discovery & Planning" amount="100 USDC"
                  description="Requirements gathering, wireframes, architecture. Due: 30 days." status="done" />
                <PhaseCard id="§2" title="AI Build & Training" amount="150 USDC"
                  description="AI model training, patient flow automation, testing. Due: 60 days." status="done" />
                <PhaseCard id="§3" title="Calendar Integration" amount="250 USDC"
                  description="Google Calendar sync, WhatsApp notifications, go-live. Due: 90 days." status="disputed" />
              </div>
            </div>

            {/* Terms */}
            <div className="px-8 pt-5">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                Terms
              </span>
              <div className="space-y-2 text-xs leading-relaxed text-foreground/50">
                <p>All payments held in escrow and released upon phase approval by client.</p>
                <p>Client must provide necessary access credentials within 5 business days of each phase start.</p>
                <p>Disputes resolved via Selantar AI mediation. Settlement executed on-chain.</p>
              </div>
            </div>

            {/* On-chain Signatures */}
            <div className="px-8 pt-5 pb-8">
              <span className="text-xs font-medium uppercase tracking-wider text-foreground/40 block mb-2.5">
                On-Chain Signatures
              </span>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3.5">
                  <span className="text-xs text-foreground/40 block mb-1.5">Client</span>
                  <p className="text-lg font-medium italic text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                    Dr. E. Suasuna
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircleIcon className="size-3 text-emerald" />
                    <span className="text-xs text-emerald/70">Signed on-chain</span>
                  </div>
                  <p className="text-xs font-mono text-foreground/25 mt-1">
                    0x8a4F...c91E · Feb 12, 2026
                  </p>
                </div>

                <div className="rounded-md border border-emerald/20 bg-emerald/[0.03] p-3.5">
                  <span className="text-xs text-foreground/40 block mb-1.5">Contractor</span>
                  <p className="text-lg font-medium italic text-foreground/80" style={{ fontFamily: 'Georgia, serif' }}>
                    M. Santos
                  </p>
                  <div className="flex items-center gap-1.5 mt-2">
                    <CheckCircleIcon className="size-3 text-emerald" />
                    <span className="text-xs text-emerald/70">Signed on-chain</span>
                  </div>
                  <p className="text-xs font-mono text-foreground/25 mt-1">
                    0x3777...7db4 · Feb 12, 2026
                  </p>
                </div>
              </div>

              {/* TX proof */}
              <div className="mt-3 flex items-center justify-between rounded-md border border-border bg-muted/10 px-3.5 py-2.5">
                <div className="flex items-center gap-2">
                  <ShieldIcon className="size-3.5 text-accent" />
                  <span className="text-xs text-foreground/50">Verified on Hedera Testnet</span>
                </div>
                <span className="text-xs font-mono text-accent/50">TX: 0xb5d3...01e86</span>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function PhaseCard({ id, title, amount, description, status }: {
  id: string
  title: string
  amount: string
  description: string
  status: 'done' | 'disputed' | 'pending'
}) {
  return (
    <div className={cn(
      'rounded-md border p-3',
      status === 'done' && 'border-emerald/15 bg-emerald/[0.03]',
      status === 'disputed' && 'border-accent/15 bg-accent/[0.03]',
      status === 'pending' && 'border-border bg-muted/10',
    )}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className={cn(
            'text-sm font-mono font-medium',
            status === 'done' && 'text-emerald',
            status === 'disputed' && 'text-accent',
            status === 'pending' && 'text-muted-foreground',
          )}>
            {id}
          </span>
          <span className="text-sm font-medium text-foreground/80">{title}</span>
        </div>
        <span className={cn(
          'text-sm font-mono',
          status === 'done' && 'text-emerald',
          status === 'disputed' && 'text-accent',
          status === 'pending' && 'text-muted-foreground/40',
        )}>
          {amount}
        </span>
      </div>
      <p className="text-xs text-foreground/50 mt-1">{description}</p>
    </div>
  )
}
