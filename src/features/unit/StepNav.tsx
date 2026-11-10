import type { UnitProgress, UnitStep } from '@shared/types'
import {
  BookOpen,
  Check,
  Clapperboard,
  Lightbulb,
  type LucideIcon,
  MessageCircleQuestion,
  Sparkles,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

export const STEPS: UnitStep[] = ['media', 'summary', 'read', 'check', 'practice']
const ICONS: Record<UnitStep, LucideIcon> = {
  media: Clapperboard,
  summary: Lightbulb,
  read: BookOpen,
  check: MessageCircleQuestion,
  practice: Sparkles,
}

/**
 * Unit steps and progress indicator in one: a three-node progress path
 * (Watch or read / Question / Practice). Each node shows icon + text status, never colour
 * alone. Every step can be opened at any time. The track fill animates only to show progress,
 * and is static under reduced motion.
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
  const reduce = useReducedMotion()

  function status(s: UnitStep): { done: boolean; text: string } {
    if (s === 'media' || s === 'summary' || s === 'read') {
      const done = !!progress.seen?.includes(s)
      return { done, text: done ? t('steps.done') : t('steps.notYet') }
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

  // Fill reaches the last finished block. Illustration only: the text under each node carries meaning.
  const lastDone = STEPS.reduce((n, s, i) => (status(s).done ? i : n), -1)
  const fill = lastDone < 0 ? 0 : lastDone / (STEPS.length - 1)

  return (
    <nav aria-label={t('steps.label')} className="@container">
      <div className="relative">
        {/* Track behind the nodes, from the centre of the first node to the centre of the last. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[10%] top-[calc(min(1.125rem,5vw)+0.25rem-3px)] @lg:top-[1.625rem] h-1.5 rounded-full bg-sedra-pale-100"
        >
          <motion.span
            className="block h-full rounded-full bg-sedra-mid ltr:origin-left rtl:origin-right"
            initial={false}
            animate={{ scaleX: fill }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }}
          />
        </div>
        <ol className="relative m-0 grid list-none grid-cols-5 gap-1 p-0">
          {STEPS.map((s, i) => {
            const st = status(s)
            const Icon = st.done ? Check : ICONS[s]
            const current = s === step
            return (
              <li key={s} className="relative min-w-0 max-w-none">
                <button
                  type="button"
                  onClick={() => onStep(s)}
                  aria-current={current ? 'step' : undefined}
                  className={cn(
                    'group flex h-full min-h-12 w-full flex-col items-center gap-1 rounded-2xl px-1 pt-1 pb-2 text-center text-ink break-words',
                  )}
                >
                  <span
                    aria-hidden="true"
                    className={cn(
                      'relative flex size-[min(2.25rem,10vw)] shrink-0 items-center @lg:size-11 justify-center rounded-full border-2 transition-[transform,background-color] duration-300',
                      current
                        ? 'scale-110 border-sedra-green bg-sedra-green text-white shadow-md'
                        : st.done
                          ? 'border-success bg-success-soft text-success'
                          : 'border-border bg-white text-ink-soft group-hover:border-sedra-green group-hover:text-sedra-green',
                    )}
                  >
                    <Icon className="size-4 @lg:size-5" strokeWidth={st.done ? 3 : 2} />
                    {current && st.done && (
                      <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-success ring-2 ring-success">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'sr-only text-base leading-tight @2xl:not-sr-only',
                      current ? 'font-bold text-sedra-green' : 'font-semibold',
                    )}
                  >
                    <span className="sr-only">{i + 1}. </span>
                    {t(`steps.${s}`)}
                  </span>
                  <span
                    className={cn(
                      'sr-only text-base leading-tight @2xl:not-sr-only',
                      st.done ? 'font-semibold text-success' : 'text-ink-soft',
                    )}
                  >
                    <span className="sr-only">, </span>
                    {st.text}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
      {/* Narrow screens: the nodes alone, plus one line naming where you are. */}
      <p aria-hidden="true" className="m-0 mt-1 text-center text-base @2xl:hidden">
        <span className="font-bold text-sedra-green">{t(`steps.${step}`)}</span>
        <span className="text-ink-soft">
          {' '}
          · {t('steps.position', { n: STEPS.indexOf(step) + 1, total: STEPS.length })}
        </span>
      </p>
    </nav>
  )
}
