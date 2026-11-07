import {
  AlertTriangle,
  CircleCheck,
  CircleDashed,
  Clock,
  FlaskConical,
  Info,
  type LucideIcon,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** Page heading block: the only h1 on each admin page. */
export function AdminPageHeader({
  title,
  intro,
  children,
}: {
  title: string
  intro?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="mb-6 flex flex-col gap-3">
      <h1 className="m-0 text-3xl">{title}</h1>
      {intro ? <p className="m-0 text-ink-soft">{intro}</p> : null}
      {children}
    </header>
  )
}

/** Visible "Demo" / "Illustrative demo data" tag. Icon + text, never colour alone. */
export function DemoTag({ label, className }: { label?: string; className?: string }) {
  const { t } = useTranslation('admin')
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full border border-sedra-brown bg-notice-soft px-3 py-1 text-sm font-semibold text-notice',
        className,
      )}
    >
      <FlaskConical aria-hidden="true" className="size-4 shrink-0" />
      {label ?? t('common.demo')}
    </span>
  )
}

export type StatusTone = 'done' | 'pending' | 'warning' | 'info' | 'neutral'

const TONES: Record<StatusTone, { icon: LucideIcon; cls: string }> = {
  done: { icon: CircleCheck, cls: 'bg-success-soft text-success' },
  pending: { icon: Clock, cls: 'bg-notice-soft text-notice' },
  warning: { icon: AlertTriangle, cls: 'bg-notice-soft text-notice' },
  info: { icon: Info, cls: 'bg-info-soft text-info' },
  neutral: { icon: CircleDashed, cls: 'bg-sedra-pale-50 text-ink' },
}

/** Status shown as icon + text (brief §3: never colour alone). */
export function StatusLabel({
  tone,
  children,
  className,
}: {
  tone: StatusTone
  children: ReactNode
  className?: string
}) {
  const { icon: Icon, cls } = TONES[tone]
  return (
    <span
      className={cn(
        'inline-flex items-start gap-1.5 rounded-lg px-2 py-0.5 text-sm font-semibold',
        cls,
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </span>
  )
}

/** Notice panel for simulated-integration disclosures. */
export function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-2 rounded-xl border border-border bg-info-soft p-4 text-ink',
        className,
      )}
    >
      <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-info" />
      <div className="min-w-0 [&_p]:m-0">{children}</div>
    </div>
  )
}

/**
 * Keyboard-scrollable wrapper so wide tables stay readable at 320 px without page scroll.
 * Focusable (tabIndex 0) with a label, so keyboard users can scroll it with arrow keys.
 */
export function TableRegion({ label, children }: { label: string; children: ReactNode }) {
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
      tabIndex={0}
      className="w-full max-w-full overflow-x-auto rounded-xl border bg-white"
    >
      {children}
    </section>
  )
}

export const thCls = 'px-3 py-3 text-start align-bottom text-sm font-semibold text-ink'
export const tdCls = 'px-3 py-3 align-top text-base'
export const captionCls = 'px-3 pt-3 pb-1 text-start text-sm text-ink-soft'

/** Native select with a visible label: simple, keyboard and screen-reader friendly. */
export function SelectField({
  id,
  label,
  value,
  onChange,
  options,
  hint,
  error,
  code,
  className,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  options: { value: string; label: string }[]
  code?: string
  hint?: string
  error?: string
  className?: string
}) {
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
        {code ? <FieldCode code={code} /> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="m-0 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-describedby={describedBy || undefined}
        aria-invalid={error ? true : undefined}
        className="min-h-12 w-full rounded-xl border-2 border-input bg-white px-3 text-base text-ink aria-invalid:border-destructive"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  )
}

export function FieldError({ id, children }: { id: string; children: ReactNode }) {
  return (
    <p id={id} className="m-0 flex items-start gap-1.5 text-sm font-semibold text-destructive">
      <AlertTriangle aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
      <span>{children}</span>
    </p>
  )
}

const inputCls =
  'w-full rounded-xl border-2 border-input bg-white px-3 text-base text-ink aria-invalid:border-destructive read-only:bg-sedra-pale-50'

/** Labelled text input / textarea with hint and inline error (brief §3 Errors). */
export function TextField({
  id,
  label,
  value,
  onChange,
  hint,
  error,
  multiline,
  rows = 3,
  type = 'text',
  dir,
  code,
  readOnly,
  required,
  inputMode,
  className,
}: {
  id: string
  label: string
  value: string
  onChange?: (v: string) => void
  hint?: string
  error?: string
  multiline?: boolean
  rows?: number
  type?: string
  dir?: 'ltr' | 'rtl' | 'auto'
  /** Field name from the brief's content schema, shown beside the label. */
  code?: string
  readOnly?: boolean
  required?: boolean
  inputMode?: 'numeric' | 'url' | 'text'
  className?: string
}) {
  const { t } = useTranslation('admin')
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ')
  const common = {
    id,
    value,
    readOnly,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': error ? true : undefined,
    'aria-required': required || undefined,
    dir,
    onChange: (e: { target: { value: string } }) => onChange?.(e.target.value),
  }
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="font-semibold text-ink">
        {label}
        {required ? (
          <span className="font-normal text-ink-soft"> ({t('common.required')})</span>
        ) : null}
        {code ? <FieldCode code={code} /> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="m-0 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      {multiline ? (
        <textarea
          {...common}
          rows={rows}
          className={cn(inputCls, 'min-h-24 py-2 leading-relaxed')}
        />
      ) : (
        <input {...common} type={type} inputMode={inputMode} className={cn(inputCls, 'min-h-12')} />
      )}
      {error ? <FieldError id={`${id}-error`}>{error}</FieldError> : null}
    </div>
  )
}

/** Schema field name (brief §9 content editor fields), decorative next to the label. */
export function FieldCode({ code }: { code: string }) {
  return (
    <code
      aria-hidden="true"
      className="ltr-isolate ms-2 rounded bg-sedra-pale-50 px-1.5 py-0.5 text-xs font-normal text-ink-soft [overflow-wrap:anywhere]"
    >
      {code}
    </code>
  )
}
