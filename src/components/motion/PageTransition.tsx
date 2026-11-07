import { useLocation } from '@tanstack/react-router'
import { AnimatePresence, motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/** Soft cross-fade between routes (state-change feedback). Off with reduced motion. */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const { pathname } = useLocation()
  if (reduce) return <>{children}</>
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
