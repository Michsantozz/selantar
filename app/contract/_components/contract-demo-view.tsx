'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { ContractNav } from '@/components/contract/ContractNav'
import { TopStrip } from '@/components/contract/TopStrip'
import { Sidebar } from '@/components/contract/Sidebar'
import { MilestoneCard } from '@/components/contract/MilestoneCard'
import { LockedMilestone } from '@/components/contract/LockedMilestone'
import dynamic from 'next/dynamic'
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable'
import { GavelIcon } from 'lucide-react'
import { registerDemoAction } from '@/lib/demo-actions'

const SentinelPanel = dynamic(
  () => import('@/components/contract/SentinelPanel').then((m) => ({ default: m.SentinelPanel })),
  { ssr: false }
)

// ─── Demo Data ───────────────────────────────────────────────────────────────

const DEMO_MILESTONES_SIDEBAR = [
  { id: 'm1', name: 'M1 Design', value: 800, status: 'paid' as const },
  { id: 'm2', name: 'M2 Frontend', value: 1200, status: 'active' as const },
  { id: 'm3', name: 'M3 Backend', value: 800, status: 'locked' as const },
  { id: 'm4', name: 'M4 Deploy', value: 1000, status: 'locked' as const },
]

const DEMO_FLOW_REVIEW = [
  { id: 'm1', label: 'M1', value: 800, status: 'paid' as const },
  { id: 'm2', label: 'M2', value: 1200, status: 'active' as const },
  { id: 'm3', label: 'M3', value: 1600, status: 'locked' as const },
  { id: 'm4', label: 'M4', value: 1200, status: 'locked' as const },
]

const DEMO_FLOW_DISPUTE = [
  { id: 'm1', label: 'M1', value: 800, status: 'paid' as const },
  { id: 'm2', label: 'M2', value: 1200, status: 'dispute' as const },
  { id: 'm3', label: 'M3', value: 1600, status: 'locked' as const },
  { id: 'm4', label: 'M4', value: 1200, status: 'locked' as const },
]

const DEMO_ESCROW_REVIEW = [
  { label: 'paid', amount: 800, color: 'paid' as const },
  { label: 'in review', amount: 1200, color: 'review' as const },
  { label: 'locked', amount: 1800, color: 'locked' as const },
]

const DEMO_ESCROW_DISPUTE = [
  { label: 'paid', amount: 800, color: 'paid' as const },
  { label: 'in dispute', amount: 1200, color: 'dispute' as const },
  { label: 'locked', amount: 1800, color: 'locked' as const },
]

const DEMO_ISSUES = [
  {
    id: 'i1',
    title: 'Layout different from what was agreed',
    status: 'resolved' as const,
    partyClaim: 'The header looked different from the Figma we approved.',
    otherPartyClaim: 'I adjusted it based on the feedback from the last call.',
    claraFinding:
      'I compared the commits with the Figma sent on 03/03. The header adjustment is present in commit a4f91c. It seems there was a later alignment — item resolved.',
  },
  {
    id: 'i2',
    title: 'Mobile version missing',
    status: 'open' as const,
    partyClaim: 'We agreed the site would be responsive. It does not work on mobile.',
    otherPartyClaim: 'Mobile was planned for M4, not M2.',
    claraFinding:
      'In the contract, clause 3.2 mentions "responsive interface" without specifying in which milestone. This is a real ambiguity. I recommend formalizing: if mobile is moved to M4, it must be stated in an amendment signed by both parties.',
  },
  {
    id: 'i3',
    title: 'Color palette changed',
    status: 'waiting' as const,
    partyClaim: 'The colors ended up darker than agreed.',
    otherPartyClaim: 'I followed the style guide you sent on 10/03.',
    claraFinding:
      'Matheus has a style guide timestamped 10/03. Dr. Suasuna: do you recognize this document? If so, the colors are correct — if not, we need clarity on which version applies.',
  },
]

const DEMO_ACTIVITY = [
  { id: 'a1', timeAgo: 'now', type: 'clara' as const, description: 'Clara analyzing M2 delivery' },
  { id: 'a2', timeAgo: '2h', type: 'sentinel' as const, description: 'Sentinel sent SMS to Dr. Suasuna' },
  { id: 'a3', timeAgo: '1d', type: 'sentinel' as const, description: 'Reminder email sent' },
  { id: 'a4', timeAgo: '3d', type: 'clara' as const, description: 'Clara set deadline: Apr 5' },
  { id: 'a5', timeAgo: '5d', type: 'chain' as const, description: 'M1 paid: $800 → Matheus' },
  { id: 'a6', timeAgo: '15d', type: 'chain' as const, description: 'Escrow funded: $3,800' },
]

const DEMO_SMS = [
  {
    id: 's1',
    content:
      'Hi Dr., Matheus has delivered the frontend. When you get a chance, take a look? Any questions, just let me know here.',
    sentAt: '2h ago',
    status: 'sent' as const,
  },
  {
    id: 's2',
    content: 'Just a reminder that the review deadline is April 5th. No rush, but wanted to keep it on your radar.',
    sentAt: '1d ago',
    status: 'read' as const,
  },
]

// ─── Component ───────────────────────────────────────────────────────────────

type PageState = 'review' | 'dispute'

export default function ContractDemoView() {
  const [demoState, setDemoState] = useState<PageState>('review')

  useEffect(() => {
    registerDemoAction("cd-dispute", () => setDemoState('dispute'))
  }, [])

  const urgentConfig =
    demoState === 'review'
      ? {
          state: 'review' as const,
          label: 'M2 delivered — your review',
          sublabel: 'Matheus submitted Frontend + CMS',
          metric: '5d 04h',
          metricSub: 'remaining',
          escrow: DEMO_ESCROW_REVIEW,
          flow: DEMO_FLOW_REVIEW,
        }
      : {
          state: 'dispute' as const,
          label: 'Active dispute — Clara mediating',
          sublabel: '3 issues identified, 1 resolved',
          metric: '01/03',
          metricSub: 'round',
          escrow: DEMO_ESCROW_DISPUTE,
          flow: DEMO_FLOW_DISPUTE,
        }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.6, ease: [0, 0, 0.2, 1] }}
      className="bg-background overflow-hidden"
      style={{
        display: 'grid',
        gridTemplateRows: 'auto auto 1fr',
        height: '100dvh',
      }}
    >
      {/* Nav */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1 }}
      >
      <ContractNav
        contractName="Site Dr. Suasuna"
        clientName="Dr. Suasuna"
        providerName="Matheus"
        status={demoState === 'dispute' ? 'dispute' : 'active'}
      />
      </motion.div>

      {/* Status strip */}
      <motion.div
        id="cd-escrow-bar"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.25 }}
      >
      <TopStrip
        urgentState={urgentConfig.state}
        urgentLabel={urgentConfig.label}
        urgentSublabel={urgentConfig.sublabel}
        urgentMetric={urgentConfig.metric}
        urgentMetricSub={urgentConfig.metricSub}
        escrowSegments={urgentConfig.escrow}
        escrowTotal={4800}
        milestones={urgentConfig.flow}
        demoState={demoState}
        onDemoChange={setDemoState}
      />
      </motion.div>

      {/* 3-column resizable — takes the 1fr row */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="overflow-hidden"
      >
      <ResizablePanelGroup direction="horizontal" className="overflow-hidden">

        {/* Sidebar */}
        <ResizablePanel defaultSize={14} minSize={10} maxSize={20}>
          <Sidebar
            milestones={DEMO_MILESTONES_SIDEBAR}
            activeMilestoneId="m2"
          />
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Center column */}
        <ResizablePanel defaultSize={32} minSize={20}>
          <div className="overflow-y-auto h-full px-5 py-5 flex flex-col gap-3">
            <div id="cd-m2-review">
            <MilestoneCard
              milestoneName="M2 Frontend"
              milestoneValue={1200}
              state={demoState}
              onDispute={() => setDemoState('dispute')}
              onApprove={() => {}}
              claraInsight="The delivery aligns with 3 of 4 requirements. The mobile item did not appear in the commits — it may have been planned for M4, worth confirming with Matheus."
              timeoutPercent={65}
              timeoutLabel="5 dias"
              attachments={{ files: 3, evidence: 2, messages: 5, txs: 1 }}
              issues={DEMO_ISSUES}
              otherPartyName="Matheus"
              providerName="Matheus"
              clientName="Dr. Suasuna"
              totalValue={1200}
              initialSplitPercent={85}
              leftParty={{ name: 'Matheus', initial: 'M', signed: true }}
              rightParty={{ name: 'Dr. Suasuna', initial: 'Dr', signed: false }}
            />
            </div>
            {/* CTA: go to mediation when dispute */}
            {demoState === 'dispute' && (
              <Link
                href="/mediation"
                className="flex items-center justify-center gap-2 rounded-lg border border-destructive/30 bg-destructive/6 px-4 py-3 text-sm font-medium text-destructive transition-colors hover:bg-destructive/10"
              >
                <GavelIcon className="size-4" />
                Go to mediation room
              </Link>
            )}

            <LockedMilestone name="M3 Backend" value={800} dependsOn="M2" opacity={0.4} />
            <LockedMilestone name="M4 Deploy" value={1000} dependsOn="M3" opacity={0.25} />
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        {/* Right column — Sentinel canvas */}
        <ResizablePanel defaultSize={54} minSize={35}>
          <div className="flex flex-col h-full bg-card/20">
            <SentinelPanel />
          </div>
        </ResizablePanel>

      </ResizablePanelGroup>
      </motion.div>
    </motion.div>
  )
}
