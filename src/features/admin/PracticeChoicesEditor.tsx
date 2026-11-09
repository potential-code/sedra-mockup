import { Circle, Plus, Square, Trash2 } from 'lucide-react'
import { useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Practice answer choices, edited like a multiple-choice question: one input per choice, Add and
 * Remove, and a clear One answer (radio) / Several answers (checkboxes) switch. Stored as one
 * choice per line in the `practice_choices` field, so the data shape does not change.
 */
export function PracticeChoicesEditor({
  value,
  onChange,
  multiple,
  onMultipleChange,
  dir,
}: {
  value: string
  onChange: (v: string) => void
  multiple: 'yes' | 'no'
  onMultipleChange: (v: 'yes' | 'no') => void
  dir: 'ltr' | 'rtl'
}) {
  const { t } = useTranslation('admin')
  const listRef = useRef<HTMLOListElement>(null)
  const choices = value === '' ? [] : value.split('\n')
  const Marker = multiple === 'yes' ? Square : Circle

  const write = (next: string[]) => onChange(next.join('\n'))
  const focusRow = (i: number) =>
    requestAnimationFrame(() => listRef.current?.querySelectorAll('input')[i]?.focus())

  return (
    <div className="flex flex-col gap-5">
      <fieldset className="m-0 flex flex-col gap-3 border-0 p-0" aria-describedby="pc-hint">
        <legend className="mb-1 p-0 font-semibold text-ink">
          {t('editor.fields.practice_choices')}
        </legend>
        <p id="pc-hint" className="m-0 text-sm text-ink-soft">
          {t('editor.practiceChoicesHint')}
        </p>
        {choices.length > 0 ? (
          <ol ref={listRef} className="m-0 flex list-none flex-col gap-2 p-0">
            {choices.map((c, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: rows are positional choices
              <li key={i} className="flex max-w-none items-center gap-3">
                <Marker aria-hidden="true" className="size-6 shrink-0 text-sedra-green" />
                <label className="sr-only" htmlFor={`pc-${i}`}>
                  {t('editor.choiceN', { n: i + 1 })}
                </label>
                <input
                  id={`pc-${i}`}
                  value={c}
                  dir={dir}
                  placeholder={t('editor.choiceN', { n: i + 1 })}
                  onChange={(e) => write(choices.map((x, j) => (j === i ? e.target.value : x)))}
                  className="min-h-12 min-w-0 flex-1 rounded-xl border-2 border-input bg-white px-4 text-base text-ink focus-visible:border-sedra-green"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    write(choices.filter((_, j) => j !== i))
                    focusRow(Math.max(0, i - 1))
                  }}
                  aria-label={t('editor.removeChoiceN', { n: i + 1 })}
                >
                  <Trash2 aria-hidden="true" />
                  <span className="hidden sm:inline">{t('common.remove')}</span>
                </Button>
              </li>
            ))}
          </ol>
        ) : (
          <p className="m-0 rounded-xl border border-dashed border-border bg-sedra-pale-50 p-3 text-base text-ink-soft">
            {t('editor.noChoices')}
          </p>
        )}
        <Button
          type="button"
          variant="outline"
          className="self-start"
          onClick={() => {
            write([...choices, ''])
            focusRow(choices.length)
          }}
        >
          <Plus aria-hidden="true" />
          {t('editor.addChoice')}
        </Button>
      </fieldset>

      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-1 p-0 font-semibold text-ink">
          {t('editor.fields.practice_multiple')}
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {(
            [
              ['no', Circle, t('editor.practiceOne'), t('editor.practiceOneHint')],
              ['yes', Square, t('editor.practiceMany'), t('editor.practiceManyHint')],
            ] as const
          ).map(([v, Icon, label, hint]) => (
            <label
              key={v}
              className={cn(
                'flex min-h-14 cursor-pointer items-start gap-3 rounded-2xl border-2 bg-white p-3 transition-colors',
                'has-[:checked]:border-sedra-green has-[:checked]:bg-sedra-pale-50 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sedra-green',
                'border-border hover:border-sedra-mid',
              )}
            >
              <input
                type="radio"
                name="practice-multiple"
                value={v}
                checked={multiple === v}
                onChange={() => onMultipleChange(v)}
                className="mt-1 size-5 shrink-0 accent-sedra-green"
              />
              <span className="grid gap-0.5">
                <span className="flex items-center gap-2 font-semibold text-ink">
                  <Icon aria-hidden="true" className="size-5 text-sedra-green" />
                  {label}
                </span>
                <span className="text-sm text-ink-soft">{hint}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  )
}
