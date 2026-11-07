import type { UnitProgress, UnitStep } from '@shared/types'
import { CheckCircle2, Circle, CircleDashed } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

const STEPS: UnitStep[] = ['media', 'check', 'practice']

/**
 * Unit steps and progress indicator in one: Watch or read ✓ / Check reviewed ✓ /
 * Practice (optional). Icon + text, never colour alone. Every step can be opened at any time.
 */
export function StepNav({
  step,
  progress,
  onStep,
}: {
  step: UnitStep
  progress: UnitProgress
  onStep: (s: UnitStep) => void
}) {
  const { t } = useTranslation('unit')

  function status(s: UnitStep): { done: boolean; text: string } {
    if (s === 'media')
      return {
        done: progress.watchedOrRead,
        text: progress.watchedOrRead ? t('steps.done') : t('steps.notYet'),
      }
    if (s === 'check')
      return {
        done: progress.checkReviewed,
        text: progress.checkReviewed ? t('steps.reviewed') : t('steps.notYet'),
      }
    return {
      done: !!progress.practice,
      text: progress.practice ? t(`practice.status.${progress.practice}`) : t('steps.optional'),
    }
  }

  return (
    <nav aria-label={t('steps.label')}>
      <ol className="m-0 grid list-none grid-cols-1 gap-2 p-0 min-[25rem]:grid-cols-3">
        {STEPS.map((s, i) => {
          const st = status(s)
          const Icon = st.done ? CheckCircle2 : s === 'practice' ? CircleDashed : Circle
          const current = s === step
          return (
            <li key={s} className="min-w-0">
              <button
                type="button"
                onClick={() => onStep(s)}
                aria-current={current ? 'step' : undefined}
                className={cn(
                  'flex h-full min-h-14 w-full flex-col items-start gap-0.5 rounded-xl border-2 px-2 py-2 text-start text-ink break-words sm:px-3',
                  current
                    ? 'border-sedra-green bg-sedra-pale-100'
                    : 'border-border bg-white hover:bg-sedra-pale-50',
                )}
              >
                <span className="flex items-center gap-1.5 text-base font-semibold leading-tight">
                  <Icon
                    aria-hidden="true"
                    className={cn('size-5 shrink-0', st.done && 'text-success')}
                  />
                  <span>
                    <span className="sr-only">{i + 1}. </span>
                    {t(`steps.${s}`)}
                  </span>
                </span>
                <span className="text-sm text-ink-soft">{st.text}</span>
              </button>
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
