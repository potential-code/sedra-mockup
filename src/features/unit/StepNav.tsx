import type { UnitProgress, UnitStep } from '@shared/types'
import { Check, Clapperboard, type LucideIcon, MessageCircleQuestion, Sparkles } from 'lucide-react'
import { motion } from 'motion/react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { cn } from '@/lib/utils'

const STEPS: UnitStep[] = ['media', 'check', 'practice']
const ICONS: Record<UnitStep, LucideIcon> = {
  media: Clapperboard,
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

  // Fill reaches the Question node once watch/read is done, and the Practice node once the
  // question is reviewed. Illustration only: the text status under each node carries meaning.
  const fill = progress.checkReviewed ? 1 : progress.watchedOrRead ? 0.5 : 0

  return (
    <nav aria-label={t('steps.label')}>
      <div className="relative">
        {/* Track behind the nodes, from the centre of the first node to the centre of the last. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-[16.66%] top-[1.625rem] h-1.5 rounded-full bg-sedra-pale-100"
        >
          <motion.span
            className="block h-full rounded-full bg-sedra-mid ltr:origin-left rtl:origin-right"
            initial={false}
            animate={{ scaleX: fill }}
            transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }}
          />
        </div>
        <ol className="relative m-0 grid list-none grid-cols-3 gap-1 p-0">
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
                      'relative flex size-11 shrink-0 items-center justify-center rounded-full border-2 transition-[transform,background-color] duration-300',
                      current
                        ? 'scale-110 border-sedra-green bg-sedra-green text-white shadow-md'
                        : st.done
                          ? 'border-success bg-success-soft text-success'
                          : 'border-border bg-white text-ink-soft group-hover:-translate-y-0.5 group-hover:border-sedra-green group-hover:text-sedra-green',
                    )}
                  >
                    <Icon className="size-5" strokeWidth={st.done ? 3 : 2} />
                    {current && st.done && (
                      <span className="absolute -end-1 -top-1 flex size-5 items-center justify-center rounded-full bg-white text-success ring-2 ring-success">
                        <Check className="size-3" strokeWidth={3} />
                      </span>
                    )}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-tight @md:text-base',
                      current ? 'font-bold text-sedra-green' : 'font-semibold',
                    )}
                  >
                    <span className="sr-only">{i + 1}. </span>
                    {t(`steps.${s}`)}
                  </span>
                  <span
                    className={cn(
                      'text-sm leading-tight',
                      st.done ? 'font-semibold text-success' : 'text-ink-soft',
                    )}
                  >
                    {st.text}
                  </span>
                </button>
              </li>
            )
          })}
        </ol>
      </div>
    </nav>
  )
}
