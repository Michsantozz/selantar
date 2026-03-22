'use client'

import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: React.ReactNode
}

export function PageTransition({ children }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5, ease: [0, 0, 0.2, 1] }}
      className="flex flex-col"
      style={{ height: '100dvh' }}
    >
      {children}
    </motion.div>
  )
}

export function StaggerContainer({ children, className, delay = 0 }: {
  children: React.ReactNode
  className?: string
  delay?: number
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0, 0, 0.2, 1] }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
