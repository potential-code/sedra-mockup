import { CircleCheck, CircleDashed, CircleDot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { UnitStatus } from './learning'

const ICONS = { notStarted: CircleDashed, inProgress: CircleDot, complete: CircleCheck }

/**
 * Unit status as icon + text, never colour alone (brief §3). `size="sm"` is the compact chip for
 * cards and photo overlays; it keeps a solid fill so it stays readable on top of a photo.
 */
export function StatusLabel({
  status,
  className,
  size = 'default',
}: {
  status: UnitStatus
  className?: string
  size?: 'default' | 'sm'
}) {
  const { t } = useTranslation('learner')
  const Icon = ICONS[status]
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border font-semibold',
        size === 'sm' ? 'px-2.5 py-0.5 text-base' : 'px-3 py-1 text-base',
        status === 'complete' && 'border-success bg-success-soft text-success',
        status === 'inProgress' && 'border-info bg-info-soft text-info',
        status === 'notStarted' && 'border-border bg-white text-ink-soft',
        className,
      )}
    >
      <Icon aria-hidden="true" className={size === 'sm' ? 'size-4' : 'size-5'} />
      {t(`status.${status}`)}
    </span>
  )
}
