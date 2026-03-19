"use client";

import { motion } from "framer-motion";
import { ContractHeader } from "./_components/contract-header";
import { FinancialDashboard } from "./_components/financial-dashboard";
import { MilestoneTimeline } from "./_components/milestone-timeline";
import { SentinelFeed } from "./_components/sentinel-feed";
import { EvidencePanel } from "./_components/evidence-panel";
import { ActionPanel } from "./_components/action-panel";
import { ResolutionPanel } from "./_components/resolution-panel";

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.45, ease: [0.4, 0, 0.2, 1] as const },
  }),
};

export default function ContractPage() {
  return (
    <div className="relative min-h-screen">
      {/* Ambient glows */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 top-20 h-[600px] w-[600px] rounded-full bg-primary/3 blur-[160px]" />
        <div className="absolute -right-40 bottom-40 h-[500px] w-[500px] rounded-full bg-primary/2 blur-[140px]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-6 lg:px-9">
        {/* Section label */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] as const }}
          className="mb-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <span className="size-2 rounded-full bg-accent" />
            <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Contract
            </span>
          </div>
          <ContractHeader />
        </motion.div>

        {/* Financial Dashboard */}
        <motion.div
          custom={0}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <FinancialDashboard />
        </motion.div>

        {/* Milestone Timeline */}
        <motion.div
          custom={1}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <MilestoneTimeline />
        </motion.div>

        {/* Sentinel Feed + Evidence — 2 columns */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 mb-6">
          <motion.div
            custom={2}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <SentinelFeed />
          </motion.div>
          <motion.div
            custom={3}
            variants={fadeUp}
            initial="hidden"
            animate="visible"
          >
            <EvidencePanel />
          </motion.div>
        </div>

        {/* Action Panel — Your Move */}
        <motion.div
          custom={4}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-6"
        >
          <ActionPanel />
        </motion.div>

        {/* Resolution — Close / Mediation */}
        <motion.div
          custom={5}
          variants={fadeUp}
          initial="hidden"
          animate="visible"
          className="mb-12"
        >
          <ResolutionPanel />
        </motion.div>
      </div>
    </div>
  );
}
