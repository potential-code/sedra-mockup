import { useLocation } from '@tanstack/react-router'
import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

/**
 * Soft fade-in when the route changes (state-change feedback). Enter only, no exit phase:
 * a delayed exit/remount would move keyboard and screen-reader focus after the page loads.
 * Off with reduced motion.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const reduce = useReducedMotion()
  const { pathname } = useLocation()
  if (reduce) return <>{children}</>
  return (
    <motion.div
      key={pathname}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
    >
      {children}
    </motion.div>
  )
}
