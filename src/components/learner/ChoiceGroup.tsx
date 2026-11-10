import { useId } from 'react'
import { cn } from '@/lib/utils'

export interface Choice<T extends string> {
  value: T
  label: string
  hint?: string
  /** Set lang on a label written in the other language (brief §4: lang on mixed text). */
  lang?: string
}

/**
 * Radio group with a question legend and large targets (brief §3: 48px, 8px gaps, radio groups
 * have question legends). Native radios: arrow keys move, Space selects; the selected option
 * shows a check icon and thicker border, not colour alone.
 */
export function ChoiceGroup<T extends string>({
  legend,
  hint,
  name,
  value,
  choices,
  onChange,
  error,
  errorId,
  className,
  columns = 'auto',
  firstId,
}: {
  legend: string
  hint?: string
  name: string
  value: T | undefined
  choices: Choice<T>[]
  onChange: (v: T) => void
  error?: string
  errorId?: string
  className?: string
  columns?: 'auto' | 'stack'
  /** id for the first radio, so an error summary can move focus to the group. */
  firstId?: string
}) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errId = error ? (errorId ?? `${id}-error`) : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(' ') || undefined
  return (
    <fieldset
      className={cn('m-0 grid min-w-0 gap-3 border-0 p-0', className)}
      aria-describedby={describedBy}
    >
      <legend className="mb-1 p-0 text-xl font-bold text-sedra-green">{legend}</legend>
      {hint ? (
        <p id={hintId} className="m-0 text-base text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={errId} className="m-0 font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <div
        className={cn(
          'grid grid-cols-1 gap-2',
          columns === 'auto' && 'sm:grid-cols-[repeat(auto-fit,minmax(12rem,1fr))]',
        )}
      >
        {choices.map((c, i) => {
          const checked = value === c.value
          return (
            <label
              key={c.value}
              className={cn(
                'flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 bg-white px-3 py-2 text-ink sm:px-4',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                checked
                  ? 'border-sedra-green bg-sedra-pale-50'
                  : 'border-border hover:bg-sedra-pale-50',
                error && !checked && 'border-destructive',
              )}
            >
              <input
                id={i === 0 ? firstId : undefined}
                type="radio"
                name={name}
                value={c.value}
                checked={checked}
                onChange={() => onChange(c.value)}
                className="size-5 shrink-0 accent-sedra-green focus-visible:outline-none"
                aria-invalid={error ? true : undefined}
              />
              <span className="grid min-w-0 flex-1">
                <span className="font-semibold" lang={c.lang}>
                  {c.label}
                </span>
                {c.hint ? <span className="text-base text-ink-soft">{c.hint}</span> : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}
