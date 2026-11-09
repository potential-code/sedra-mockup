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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

/* ---------- tints (icon circles, tiles). Text on every tint measures >= 4.5:1. ---------- */

export type Tint = 'green' | 'info' | 'notice' | 'brown' | 'success'

export const TINTS: Record<Tint, string> = {
  green: 'bg-sedra-pale-100 text-sedra-green',
  info: 'bg-info-soft text-info',
  notice: 'bg-notice-soft text-notice',
  brown: 'bg-[#f1ece0] text-[#5f5233]',
  success: 'bg-success-soft text-success',
}

/** Decorative tinted circle around an icon. The meaning is always in adjacent text. */
export function IconCircle({
  icon: Icon,
  tint = 'green',
  size = 'md',
  className,
}: {
  icon: LucideIcon
  tint?: Tint
  size?: 'sm' | 'md' | 'lg'
  className?: string
}) {
  const box = size === 'lg' ? 'size-14' : size === 'sm' ? 'size-9' : 'size-11'
  const ico = size === 'lg' ? 'size-7' : size === 'sm' ? 'size-4.5' : 'size-5.5'
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full',
        box,
        TINTS[tint],
        className,
      )}
    >
      <Icon className={ico} />
    </span>
  )
}

/**
 * Page heading band: the only h1 on each admin page (DESIGN.md "Page header" pattern).
 * Soft white hero with the tree motif, optional icon, tags, action and end-side photo on lg.
 */
export function AdminPageHeader({
  title,
  intro,
  children,
  icon,
  image,
  action,
  eyebrow,
}: {
  title: string
  intro?: ReactNode
  children?: ReactNode
  icon?: LucideIcon
  /** Decorative photo path relative to public/ (shown on lg only). */
  image?: string
  action?: ReactNode
  eyebrow?: ReactNode
}) {
  return (
    <header className="motif-tree mb-8 flex items-stretch gap-6 rounded-3xl bg-white p-5 shadow-md sm:p-7">
      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-center gap-3">
          {icon ? <IconCircle icon={icon} size="lg" /> : null}
          <div className="min-w-0">
            {eyebrow ? (
              <p className="m-0 text-sm font-semibold tracking-wide text-ink-soft uppercase">
                {eyebrow}
              </p>
            ) : null}
            <h1 className="m-0 text-3xl sm:text-4xl">{title}</h1>
          </div>
        </div>
        {intro ? <p className="m-0 text-ink-soft">{intro}</p> : null}
        {children ? <div className="flex flex-wrap items-center gap-2">{children}</div> : null}
        {action ? <div className="mt-1 flex flex-wrap gap-3">{action}</div> : null}
      </div>
      {image ? (
        <img
          src={asset(image)}
          alt=""
          width={320}
          height={200}
          className="hidden w-72 shrink-0 self-center rounded-2xl object-cover shadow-sm lg:block xl:w-80"
        />
      ) : null}
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
  done: { icon: CircleCheck, cls: 'bg-success-soft text-success border-success/25' },
  pending: { icon: Clock, cls: 'bg-notice-soft text-notice border-notice/25' },
  warning: { icon: AlertTriangle, cls: 'bg-notice-soft text-notice border-notice/30' },
  info: { icon: Info, cls: 'bg-info-soft text-info border-info/25' },
  neutral: { icon: CircleDashed, cls: 'bg-sedra-pale-50 text-ink border-border' },
}

/** Status chip: icon + text (brief §3: never colour alone). */
export function StatusLabel({
  tone,
  children,
  className,
  icon,
}: {
  tone: StatusTone
  children: ReactNode
  className?: string
  icon?: LucideIcon
}) {
  const { icon: ToneIcon, cls } = TONES[tone]
  const Icon = icon ?? ToneIcon
  return (
    <span
      className={cn(
        'inline-flex w-fit max-w-full items-start gap-1.5 rounded-full border px-3 py-1 text-sm leading-snug font-semibold',
        cls,
        className,
      )}
    >
      <Icon aria-hidden="true" className="mt-px size-4 shrink-0" />
      <span className="min-w-0">{children}</span>
    </span>
  )
}

/** Neutral tag chip (programme names, IDs). Text only, no status meaning. */
export function Chip({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <span
      className={cn(
        'inline-flex w-fit items-center gap-1.5 rounded-full bg-sedra-pale-100 px-3 py-1 text-sm font-semibold text-ink',
        className,
      )}
    >
      {children}
    </span>
  )
}

/** Notice panel for simulated-integration disclosures. */
export function Notice({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-2xl border border-info/20 bg-info-soft p-4 text-ink',
        className,
      )}
    >
      <IconCircle icon={Info} tint="info" size="sm" className="bg-white" />
      <div className="min-w-0 self-center [&_p]:m-0">{children}</div>
    </div>
  )
}

/** White elevated card section with an icon + heading row. */
export function Panel({
  id,
  title,
  icon,
  tint,
  aside,
  children,
  className,
  headingLevel = 2,
}: {
  id: string
  title: ReactNode
  icon?: LucideIcon
  tint?: Tint
  aside?: ReactNode
  children: ReactNode
  className?: string
  headingLevel?: 2 | 3
}) {
  const H = headingLevel === 2 ? 'h2' : 'h3'
  return (
    <section
      aria-labelledby={id}
      className={cn('flex min-w-0 flex-col gap-4 rounded-2xl bg-white p-5 shadow-md', className)}
    >
      <div className="flex flex-wrap items-center gap-3">
        {icon ? <IconCircle icon={icon} tint={tint} /> : null}
        <H id={id} className="m-0 min-w-0 flex-1 text-xl sm:text-2xl">
          {title}
        </H>
        {aside}
      </div>
      {children}
    </section>
  )
}

/** Initials circle for fictional learners (decorative; the name is always shown as text). */
export function Avatar({
  name,
  size = 'md',
  className,
}: {
  name: string
  size?: 'md' | 'lg'
  className?: string
}) {
  const initials = name
    .replace(/[^\p{L}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase()
  // Deterministic tint per name so the table has gentle variety.
  const palette = [
    'bg-sedra-green text-white',
    'bg-sedra-green-800 text-white',
    'bg-sedra-pale-100 text-sedra-green',
    'bg-[#5f5233] text-white',
  ]
  const idx = [...name].reduce((s, c) => s + c.charCodeAt(0), 0) % palette.length
  return (
    <span
      aria-hidden="true"
      className={cn(
        'inline-flex shrink-0 items-center justify-center rounded-full font-bold ring-2 ring-white',
        size === 'lg' ? 'size-20 text-2xl' : 'size-11 text-base',
        palette[idx],
        className,
      )}
    >
      {initials}
    </span>
  )
}

/**
 * Small progress bar with its value as visible text (brief §3: never colour/shape alone).
 * The bar itself is decorative; the label carries the meaning.
 */
export function ProgressMini({
  value,
  max,
  label,
  className,
}: {
  value: number
  max: number
  label: ReactNode
  className?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <div className={cn('flex min-w-0 flex-col gap-1', className)}>
      <span className="text-sm leading-snug text-ink">{label}</span>
      <span
        aria-hidden="true"
        className="block h-2 w-full overflow-hidden rounded-full bg-sedra-pale-100"
      >
        <span
          className={cn(
            'block h-full rounded-full',
            value >= max ? 'bg-sedra-green' : 'bg-sedra-mid',
          )}
          style={{ inlineSize: `${pct}%` }}
        />
      </span>
    </div>
  )
}

/** Ring (donut) for one share. Decorative: the value is always printed in text nearby. */
export function Ring({
  value,
  max,
  size = 96,
  stroke = 10,
  children,
}: {
  value: number
  max: number
  size?: number
  stroke?: number
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const c = 2 * Math.PI * r
  const frac = max > 0 ? Math.min(1, value / max) : 0
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }}>
      <svg
        aria-hidden="true"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
        className="-rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-sedra-pale-100"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={`${c * frac} ${c}`}
          className="stroke-sedra-green"
        />
      </svg>
      {children ? (
        <span className="absolute inset-0 flex items-center justify-center">{children}</span>
      ) : null}
    </span>
  )
}

/**
 * Keyboard-scrollable wrapper so wide tables stay readable at 320 px without page scroll.
 * Focusable (tabIndex 0) with a label, so keyboard users can scroll it with arrow keys.
 * `maxHeight` turns on vertical scrolling so a sticky header stays visible.
 */
export function TableRegion({
  label,
  children,
  className,
}: {
  label: string
  children: ReactNode
  className?: string
}) {
  return (
    <section
      aria-label={label}
      // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
      tabIndex={0}
      className={cn(
        'w-full max-w-full overflow-x-auto rounded-2xl bg-white shadow-md ring-1 ring-border/60',
        className,
      )}
    >
      {children}
    </section>
  )
}

export const thCls = 'px-4 py-3 text-start align-bottom text-sm font-semibold text-ink'
export const tdCls = 'px-4 py-3 align-top text-base'
export const captionCls = 'px-4 pt-4 pb-2 text-start text-sm text-ink-soft'

/** Empty option values are not allowed by Radix Select, so '' maps to this sentinel. */
const EMPTY = '__none__'

/** Custom (Radix) select with a visible label: keyboard and screen-reader friendly. */
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
  icon: Icon,
  pill,
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
  /** Leading decorative icon inside the control. */
  icon?: LucideIcon
  /** Rounded pill style for filter bars. */
  pill?: boolean
}) {
  const lang = useTranslation().i18n.language
  const describedBy = [hint ? `${id}-hint` : '', error ? `${id}-error` : '']
    .filter(Boolean)
    .join(' ')
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className={cn('font-semibold text-ink', pill && 'text-sm')}>
        {label}
        {code ? <FieldCode code={code} /> : null}
      </label>
      {hint ? (
        <p id={`${id}-hint`} className="m-0 text-sm text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div className="relative">
        {Icon ? (
          <Icon
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 start-4 my-auto size-5 text-sedra-green"
          />
        ) : null}
        <Select
          value={value === '' ? EMPTY : value}
          onValueChange={(v) => onChange(v === EMPTY ? '' : v)}
          dir={lang === 'ar' ? 'rtl' : 'ltr'}
        >
          <SelectTrigger
            id={id}
            aria-describedby={describedBy || undefined}
            aria-invalid={error ? true : undefined}
            className={cn(
              pill ? 'rounded-full pe-4 font-semibold shadow-sm' : 'rounded-xl',
              Icon && 'ps-11',
            )}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {options.map((o) => (
              <SelectItem key={o.value} value={o.value === '' ? EMPTY : o.value}>
                {o.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
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
  'w-full rounded-xl border-2 border-input bg-white px-3 text-base text-ink transition-colors hover:border-sedra-green aria-invalid:border-destructive aria-invalid:bg-[#fdf3f2] read-only:border-border read-only:bg-sedra-pale-50 read-only:hover:border-border'

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
    <div className={cn('flex min-w-0 flex-col gap-1.5', className)}>
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
      className="ltr-isolate ms-2 rounded-md bg-sedra-pale-50 px-1.5 py-0.5 text-xs font-normal text-ink-soft [overflow-wrap:anywhere]"
    >
      {code}
    </code>
  )
}
