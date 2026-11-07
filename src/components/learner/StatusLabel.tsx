import { CircleCheck, CircleDashed, CircleDot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'
import type { UnitStatus } from './learning'

const ICONS = { notStarted: CircleDashed, inProgress: CircleDot, complete: CircleCheck }

/** Unit status as icon + text, never colour alone (brief §3). */
export function StatusLabel({ status, className }: { status: UnitStatus; className?: string }) {
  const { t } = useTranslation('learner')
  const Icon = ICONS[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-base font-semibold',
        status === 'complete' && 'border-success bg-success-soft text-success',
        status === 'inProgress' && 'border-info bg-info-soft text-info',
        status === 'notStarted' && 'border-border bg-white text-ink-soft',
        className,
      )}
    >
      <Icon aria-hidden="true" className="size-5" />
      {t(`status.${status}`)}
    </span>
  )
}
