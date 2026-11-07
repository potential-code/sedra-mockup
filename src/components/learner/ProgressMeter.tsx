import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'
import { UNITS_PER_COURSE } from './learning'

const EASE = [0.16, 1, 0.3, 1] as const

/**
 * Decorative progress bar that fills from the inline start on first view. Static under reduced
 * motion. Always pair it with a text label: the bar alone never carries meaning (brief §3).
 */
export function ProgressBar({
  value,
  tone = 'default',
  className,
}: {
  /** 0..1 */
  value: number
  tone?: 'default' | 'inverse'
  className?: string
}) {
  const reduce = useReducedMotion()
  const v = Math.max(0, Math.min(1, value))
  const fill = tone === 'inverse' ? 'bg-white' : 'bg-linear-to-r from-sedra-green to-sedra-mid'
  return (
    <div
      aria-hidden="true"
      className={cn(
        'h-3 w-full overflow-hidden rounded-full',
        tone === 'inverse' ? 'bg-white/25' : 'bg-sedra-pale-100',
        className,
      )}
    >
      {reduce ? (
        <div
          className={cn('h-full origin-left rounded-full rtl:origin-right', fill)}
          style={{ transform: `scaleX(${v})` }}
        />
      ) : (
        <motion.div
          className={cn('h-full origin-left rounded-full rtl:origin-right', fill)}
          initial={{ scaleX: 0 }}
          animate={{ scaleX: v }}
          transition={{ duration: 0.9, delay: 0.15, ease: EASE }}
        />
      )}
    </div>
  )
}

/** "x of 8 units complete" as text first; the bar is decorative support. */
export function ProgressMeter({
  done,
  total = UNITS_PER_COURSE,
  tone = 'default',
  className,
}: {
  done: number
  total?: number
  tone?: 'default' | 'inverse'
  className?: string
}) {
  const { t } = useTranslation('learner')
  return (
    <div className={cn('grid grid-cols-1 gap-2', className)}>
      <p className={cn('m-0 font-semibold', tone === 'inverse' ? 'text-white' : 'text-ink')}>
        {t('shared.unitsComplete', { done, total })}
      </p>
      <ProgressBar value={total ? done / total : 0} tone={tone} />
    </div>
  )
}
