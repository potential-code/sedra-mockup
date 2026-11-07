import type { KnowledgeCheck as Check, OptionId } from '@shared/types'
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  HandHelping,
  Lightbulb,
  RotateCcw,
  Undo2,
} from 'lucide-react'
import { useEffect, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
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

  return (
    <form onSubmit={submit} noValidate className="flex flex-col gap-4">
      {error && (
        <div
          ref={summaryRef}
          tabIndex={-1}
          className="rounded-2xl border-2 border-destructive bg-white p-4"
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
        <legend id={legendId} className="mb-3 p-0 text-xl font-bold text-ink">
          {l(check.question)}
        </legend>
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
                'flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white px-4 py-3 text-lg',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-ink has-[:focus-visible]:outline-offset-2',
                checked ? 'border-sedra-green bg-sedra-pale-50' : 'border-input',
              )}
            >
              <input
                ref={i === 0 ? firstRadioRef : undefined}
                id={`${ids}-${o.id}`}
                type="radio"
                name={`${ids}-q`}
                value={o.id}
                checked={checked}
                onChange={() => select(o.id)}
                className="size-6 shrink-0 accent-sedra-green focus-visible:outline-none"
              />
              <span aria-hidden="true" className="font-bold text-sedra-green">
                {o.id}.
              </span>
              <span className="flex-1">{l(o.text)}</span>
              {checked && (
                <span className="text-base font-semibold text-sedra-green">
                  {t('check.yourChoice')}
                </span>
              )}
            </label>
          )
        })}
      </fieldset>

      <Button type="submit" size="lg" className="self-start">
        {t('common:checkAnswer')}
      </Button>

      {outcome === 'correct' && (
        <div className="flex items-start gap-3 rounded-2xl border-2 border-success bg-success-soft p-4">
          <CheckCircle2 aria-hidden="true" className="mt-1 size-6 shrink-0 text-success" />
          <div>
            <h3 className="m-0 text-lg text-success">{t('check.correctTitle')}</h3>
            <p className="m-0 mt-1">{l(check.feedbackCorrect)}</p>
          </div>
        </div>
      )}

      {outcome === 'incorrect' && (
        <div className="flex flex-col gap-3 rounded-2xl border-2 border-notice bg-notice-soft p-4">
          <div className="flex items-start gap-3">
            <Lightbulb aria-hidden="true" className="mt-1 size-6 shrink-0 text-notice" />
            <div>
              <h3 className="m-0 text-lg text-notice">{t('check.hintTitle')}</h3>
              <p className="m-0 mt-1">{l(check.feedbackRetry)}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
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
            <div ref={supportRef} tabIndex={-1} className="rounded-xl border bg-white p-4">
              <h4 id={`${ids}-support`} className="m-0 text-base font-bold text-ink">
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
        </div>
      )}
    </form>
  )
}
