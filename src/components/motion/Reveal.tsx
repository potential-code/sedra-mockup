import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Fade-and-rise on first view. Purpose: show reading order / hierarchy as a page loads.
 * Static (no motion at all) when the device or learner asks for reduced motion.
 */
export function Reveal({
  children,
  delay = 0,
  className,
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  className?: string
  as?: 'div' | 'section' | 'li' | 'article'
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  if (reduce) {
    const Static = as
    return <Static className={className}>{children}</Static>
  }
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.15 }}
      transition={{ duration: 0.55, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

/** Stagger helper: delay for the i-th item in a grid/list (capped so long lists don't drag). */
export function stagger(i: number, step = 0.06) {
  return Math.min(i, 8) * step
}
