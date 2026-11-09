import type { Unit } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { Check } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { getUnitProgress, isUnitComplete, useLearner } from '@/store/actions'

/**
 * Compact course outline (brief §3: desktop shows the same sequence with an outline), drawn as
 * a vertical progress path: numbered nodes, a tick + "Complete" text for finished units, and
 * the current unit highlighted. Status is always written out, never colour alone.
 */
export function UnitOutline({
  units,
  currentId,
  onNavigate,
  thumbnails = true,
}: {
  units: Unit[]
  currentId: string
  onNavigate?: () => void
  thumbnails?: boolean
}) {
  const { t } = useTranslation('unit')
  const { l } = useLocalized()
  const learner = useLearner()

  return (
    <ol className="m-0 flex list-none flex-col p-0">
      {units.map((u, i) => {
        const p = getUnitProgress(learner, u.id)
        const complete = isUnitComplete(p)
        const started = !complete && (p.watchedOrRead || p.checkReviewed)
        const status = complete
          ? t('outline.complete')
          : started
            ? t('outline.inProgress')
            : t('outline.notStarted')
        const current = u.id === currentId
        const nextUnit = units[i + 1]
        const nextDone = !!nextUnit && isUnitComplete(getUnitProgress(learner, nextUnit.id))
        return (
          <li key={u.id} className="relative max-w-none">
            {/* Path segment to the next node (decorative). */}
            {i < units.length - 1 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute start-[1.875rem] top-8 bottom-[-2rem] w-1 -translate-x-1/2 rounded-full rtl:translate-x-1/2',
                  complete && nextDone ? 'bg-sedra-mid' : complete ? 'bg-sedra-pale' : 'bg-border',
                )}
              />
            )}
            <Link
              to="/courses/$courseId/units/$unitId"
              params={{ courseId: u.courseId, unitId: u.id }}
              onClick={onNavigate}
              aria-current={current ? 'page' : undefined}
              className={cn(
                'relative flex min-h-12 items-center gap-3 rounded-2xl px-2 py-2 text-base text-ink transition-colors',
                current ? 'bg-sedra-pale-100 shadow-sm' : 'hover:bg-sedra-pale-50',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 ms-1 flex size-9 shrink-0 items-center justify-center rounded-full border-2 text-base font-bold',
                  current
                    ? 'border-sedra-green bg-sedra-green text-white ring-4 ring-sedra-pale'
                    : complete
                      ? 'border-success bg-success text-white'
                      : 'border-border bg-white text-ink-soft',
                )}
              >
                {complete && !current ? <Check className="size-5" strokeWidth={3} /> : u.order}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block leading-snug', current && 'font-bold text-sedra-green')}>
                  <span className="sr-only">{u.order}. </span>
                  {l(u.title)}
                </span>
                <span
                  className={cn(
                    'mt-0.5 flex items-center gap-1 text-base',
                    complete ? 'font-semibold text-success' : 'text-ink-soft',
                  )}
                >
                  {complete && <Check aria-hidden="true" className="size-4" strokeWidth={3} />}
                  {status}
                </span>
              </span>
              {thumbnails && (
                <img
                  src={asset(u.image)}
                  alt=""
                  width={64}
                  height={48}
                  loading="lazy"
                  className={cn(
                    'h-12 w-16 shrink-0 rounded-lg bg-sedra-pale-50 object-cover',
                    !current && 'opacity-90',
                  )}
                />
              )}
            </Link>
          </li>
        )
      })}
    </ol>
  )
}
