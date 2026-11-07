import type { KnowledgeCheck as Check, OptionId } from '@shared/types'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  Check as CheckIcon,
  HandHelping,
  Lightbulb,
  RotateCcw,
  Undo2,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'

export type CheckOutcome = 'correct' | 'incorrect'

interface Props {
  check: Check
  /** Saved selection (retained after an incorrect answer). */
  initialSelected?: OptionId
  /** Show the last saved feedback when the learner returns to a reviewed check. */
  initialOutcome?: CheckOutcome
  /** Learner pressed Check answer with an option selected. */
  onReview: (selected: OptionId, outcome: CheckOutcome) => void
  /** Selection changed but not yet checked (used for the leave prompt). */
  onDraftChange?: (selected: OptionId | undefined, unchecked: boolean) => void
  /** Hint actions. Replay is omitted when no video is available. */
  onReplay?: () => void
  onReadLesson: () => void
  /** Rendered under the "Continue with support" message (e.g. a help link). */
  supportExtra?: React.ReactNode
}

/**
 * One untimed question (brief §3 Checks): unlimited attempts, no points, the selection is kept
 * after a wrong answer, feedback uses icon + text (never colour alone) and is announced once.
 */
export function KnowledgeCheck({
  check,
  initialSelected,
  initialOutcome,
  onReview,
  onDraftChange,
  onReplay,
  onReadLesson,
  supportExtra,
}: Props) {
  const { t } = useTranslation('unit')
  const { l } = useLocalized()
  const [selected, setSelected] = useState<OptionId | undefined>(initialSelected)
  const [outcome, setOutcome] = useState<CheckOutcome | undefined>(initialOutcome)
  const [error, setError] = useState(false)
  const [support, setSupport] = useState(false)
  const [attempt, setAttempt] = useState(0)
  const reduce = useReducedMotion()
  const ids = useId()
  const summaryRef = useRef<HTMLDivElement>(null)
  const supportRef = useRef<HTMLDivElement>(null)
  const firstRadioRef = useRef<HTMLInputElement>(null)
  const legendId = `${ids}-legend`
  const errorId = `${ids}-error`

  useEffect(() => {
    if (support) supportRef.current?.focus()
  }, [support])

  function select(id: OptionId) {
    setSelected(id)
    setError(false)
    setSupport(false)
    // Changing the answer hides old feedback; the next Check answer gives new feedback.
    setOutcome(undefined)
    onDraftChange?.(id, true)
  }

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!selected) {
      setError(true)
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    const result: CheckOutcome = selected === check.correct ? 'correct' : 'incorrect'
    setOutcome(result)
    setAttempt((a) => a + 1)
    setSupport(false)
    onReview(selected, result)
    onDraftChange?.(selected, false)
    const text = result === 'correct' ? l(check.feedbackCorrect) : l(check.feedbackRetry)
    // One polite announcement; no "wrong"/"failed" wording.
    // Focus stays on Check answer; the live region reads the feedback once.
    announce(text)
  }

  function tryAgain() {
    setOutcome(undefined)
    setSupport(false)
    const target =
      document.querySelector<HTMLInputElement>(`input[name="${ids}-q"]:checked`) ??
      firstRadioRef.current
    target?.focus()
  }

  const correctOption = check.options.find((o) => o.id === check.correct)
  const spring = { type: 'spring', stiffness: 260, damping: 24 } as const

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-5">
      {error && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          className="rounded-2xl border-2 border-destructive bg-white p-4 shadow-sm"
        >
          <h3 id={`${ids}-summary-title`} className="m-0 flex items-center gap-2 text-lg">
            <AlertCircle aria-hidden="true" className="size-5 text-destructive" />
            {t('check.errorSummaryTitle')}
          </h3>
          <ul className="m-0 mt-2 ps-6">
            <li>
              <a
                href={`#${ids}-A`}
                className="font-semibold text-sedra-green underline"
                onClick={(e) => {
                  e.preventDefault()
                  firstRadioRef.current?.focus()
                }}
              >
                {t('check.errorChoose')}
              </a>
            </li>
          </ul>
        </div>
      )}

      <fieldset
        className="m-0 flex flex-col gap-3 border-0 p-0"
        aria-describedby={error ? errorId : undefined}
        aria-invalid={error || undefined}
      >
        <legend id={legendId} className="mb-1 p-0 text-2xl font-bold leading-snug text-ink">
          {l(check.question)}
        </legend>
        <p className="m-0 mb-1 text-base text-ink-soft">{t('check.pick')}</p>
        {error && (
          <p id={errorId} className="m-0 flex items-start gap-2 font-semibold text-destructive">
            <AlertCircle aria-hidden="true" className="mt-1 size-5 shrink-0" />
            {t('check.errorChoose')}
          </p>
        )}
        {check.options.map((o, i) => {
          const checked = selected === o.id
          return (
            <label
              key={o.id}
              htmlFor={`${ids}-${o.id}`}
              className={cn(
                'group relative flex min-h-16 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-3 py-3 text-lg shadow-sm transition-[transform,box-shadow,border-color,background-color] duration-200 sm:px-4',
                'hover:border-sedra-green hover:shadow-md',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                checked ? 'border-sedra-green bg-sedra-pale-50 shadow-md' : 'border-border',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'hidden size-11 shrink-0 items-center justify-center rounded-xl text-lg font-bold transition-colors @xs:flex',
                  checked
                    ? 'bg-sedra-green text-white'
                    : 'bg-sedra-pale-100 text-sedra-green group-hover:bg-sedra-pale',
                )}
              >
                {o.id}
              </span>
              <span className="min-w-0 flex-1 font-medium">{l(o.text)}</span>
              {checked && (
                <span className="hidden shrink-0 rounded-full bg-white px-2.5 py-0.5 text-sm font-semibold text-sedra-green ring-1 ring-sedra-green min-[26rem]:inline">
                  {t('check.yourChoice')}
                </span>
              )}
              <input
                ref={i === 0 ? firstRadioRef : undefined}
                id={`${ids}-${o.id}`}
                type="radio"
                name={`${ids}-q`}
                value={o.id}
                checked={checked}
                onChange={() => select(o.id)}
                className={cn(
                  'grid size-7 shrink-0 cursor-pointer appearance-none place-content-center rounded-full border-2 bg-white transition-colors focus-visible:outline-none',
                  "before:size-3.5 before:scale-0 before:rounded-full before:bg-white before:transition-transform before:content-['']",
                  'checked:border-sedra-green checked:bg-sedra-green checked:before:scale-100',
                  checked ? 'border-sedra-green' : 'border-input',
                )}
              />
            </label>
          )
        })}
      </fieldset>

      <Button type="submit" size="lg" className="self-start shadow-md">
        <CheckCircle2 aria-hidden="true" />
        {t('common:checkAnswer')}
      </Button>

      {outcome === 'correct' && (
        <motion.div
          key={`ok-${attempt}`}
          initial={reduce ? false : { opacity: 0, y: 12, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={spring}
          className="flex flex-col items-start gap-3 rounded-3xl border-2 border-success bg-success-soft p-3 shadow-md @md:flex-row @md:gap-4 @md:p-5"
        >
          <motion.span
            aria-hidden="true"
            initial={reduce ? false : { scale: 0, rotate: -45 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ type: 'spring', stiffness: 320, damping: 14, delay: reduce ? 0 : 0.12 }}
            className="flex size-14 shrink-0 items-center justify-center rounded-full bg-success text-white shadow-md"
          >
            <CheckIcon className="size-8" strokeWidth={3} />
          </motion.span>
          <div className="min-w-0">
            <h3 className="m-0 text-2xl text-success">{t('check.correctTitle')}</h3>
            <p className="m-0 mt-1 text-lg">{l(check.feedbackCorrect)}</p>
          </div>
        </motion.div>
      )}

      {outcome === 'incorrect' && (
        <motion.div
          key={`hint-${attempt}`}
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={spring}
          className="flex flex-col gap-4 rounded-3xl border-2 border-notice/40 bg-notice-soft p-3 shadow-md @md:p-5"
        >
          <div className="flex flex-col items-start gap-3 @md:flex-row @md:gap-4">
            <span
              aria-hidden="true"
              className="flex size-14 shrink-0 items-center justify-center rounded-full bg-white text-notice shadow-sm ring-2 ring-notice/30"
            >
              <Lightbulb className="size-7" />
            </span>
            <div className="min-w-0">
              <h3 className="m-0 text-2xl text-notice">{t('check.hintTitle')}</h3>
              <p className="m-0 mt-1 text-lg">{l(check.feedbackRetry)}</p>
            </div>
          </div>
          <div className="grid gap-2 @xl:grid-cols-2">
            {onReplay && (
              <Button type="button" variant="outline" onClick={onReplay}>
                <RotateCcw aria-hidden="true" />
                {t('common:replay')}
              </Button>
            )}
            <Button type="button" variant="outline" onClick={onReadLesson}>
              <BookOpen aria-hidden="true" />
              {t('check.readLesson')}
            </Button>
            <Button type="button" variant="outline" onClick={tryAgain}>
              <Undo2 aria-hidden="true" />
              {t('common:tryAgain')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setSupport(true)}>
              <HandHelping aria-hidden="true" />
              {t('check.continueWithSupport')}
            </Button>
          </div>
          {support && correctOption && (
            <div
              ref={supportRef}
              tabIndex={-1}
              className="rounded-2xl border bg-white p-4 shadow-sm"
            >
              <h4 id={`${ids}-support`} className="m-0 text-lg font-bold text-ink">
                {t('check.supportTitle')}
              </h4>
              <p className="m-0 mt-1">
                {t('check.supportAnswer', {
                  id: correctOption.id,
                  text: l(correctOption.text),
                })}
              </p>
              <p className="m-0 mt-1">{t('check.supportBody')}</p>
              {supportExtra}
            </div>
          )}
        </motion.div>
      )}
    </form>
  )
}
