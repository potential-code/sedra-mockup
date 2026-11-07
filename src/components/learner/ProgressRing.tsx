import { motion } from 'motion/react'
import type { ReactNode } from 'react'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

/**
 * Decorative progress ring that draws on first view (static under reduced motion). The ring is
 * aria-hidden; put the meaning in visible text (children or a nearby label), never the ring alone.
 */
export function ProgressRing({
  value,
  size = 96,
  stroke = 10,
  tone = 'default',
  className,
  children,
}: {
  /** 0..1 */
  value: number
  size?: number
  stroke?: number
  tone?: 'default' | 'inverse'
  className?: string
  /** Centre content, e.g. "1/8". */
  children?: ReactNode
}) {
  const reduce = useReducedMotion()
  const v = Math.max(0, Math.min(1, value))
  const r = (size - stroke) / 2
  const c = size / 2
  const track = tone === 'inverse' ? 'stroke-white/25' : 'stroke-sedra-pale-100'
  const bar = tone === 'inverse' ? 'stroke-white' : 'stroke-sedra-green'
  return (
    <div
      className={cn('relative inline-grid shrink-0 place-items-center', className)}
      style={{ width: size, height: size }}
    >
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90 rtl:-scale-y-100"
      >
        <circle cx={c} cy={c} r={r} fill="none" strokeWidth={stroke} className={track} />
        {v > 0 ? (
          reduce ? (
            <circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              pathLength={1}
              strokeDasharray={`${v} 1`}
              className={bar}
            />
          ) : (
            <motion.circle
              cx={c}
              cy={c}
              r={r}
              fill="none"
              strokeWidth={stroke}
              strokeLinecap="round"
              className={bar}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: v }}
              transition={{ duration: 1.1, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            />
          )
        ) : null}
      </svg>
      {children ? (
        <div className="absolute inset-0 grid place-items-center text-center leading-tight">
          {children}
        </div>
      ) : null}
    </div>
  )
}
