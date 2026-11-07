import type { Unit } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { CheckCircle2, Circle, CircleDot } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import { getUnitProgress, isUnitComplete, useLearner } from '@/store/actions'

/** Compact course outline (brief §3: desktop shows the same sequence with an outline). */
export function UnitOutline({
  units,
  currentId,
  onNavigate,
}: {
  units: Unit[]
  currentId: string
  onNavigate?: () => void
}) {
  const { t } = useTranslation('unit')
  const { l } = useLocalized()
  const learner = useLearner()

  return (
    <ol className="m-0 flex list-none flex-col gap-1 p-0">
      {units.map((u) => {
        const p = getUnitProgress(learner, u.id)
        const complete = isUnitComplete(p)
        const started = !complete && (p.watchedOrRead || p.checkReviewed)
        const Icon = complete ? CheckCircle2 : started ? CircleDot : Circle
        const status = complete
          ? t('outline.complete')
          : started
            ? t('outline.inProgress')
            : t('outline.notStarted')
        const current = u.id === currentId
        return (
          <li key={u.id}>
            <Link
              to="/courses/$courseId/units/$unitId"
              params={{ courseId: u.courseId, unitId: u.id }}
              onClick={onNavigate}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'flex min-h-12 items-start gap-3 rounded-xl px-3 py-2 text-base text-ink hover:bg-sedra-pale-50',
                current && 'bg-sedra-pale-100 font-semibold',
              )}
            >
              <Icon
                aria-hidden="true"
                className={cn('mt-0.5 size-5 shrink-0', complete && 'text-success')}
              />
              <span className="flex-1">
                <span className="block">
                  {u.order}. {l(u.title)}
                </span>
                <span className="block text-sm font-normal text-ink-soft">{status}</span>
              </span>
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
