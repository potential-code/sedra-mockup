import type { Prefs, TextSize } from '@shared/types'
import {
  Captions,
  Check,
  Contrast,
  Eye,
  Languages,
  LayoutGrid,
  type LucideIcon,
  Pause,
  Rows3,
  Smartphone,
  Sparkles,
  SunMedium,
  Volume2,
  Wind,
} from 'lucide-react'
import { type ReactNode, useId } from 'react'
import { useTranslation } from 'react-i18next'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import { cn } from '@/lib/utils'
import { setPrefs, usePrefs } from '@/store/actions'

interface Option<T extends string> {
  value: T
  label: string
  hint?: string
  lang?: string
  /** Visual on top of the card: an icon or a small glyph. Decorative. */
  visual: ReactNode
}

/**
 * Big segmented radio cards. Native radios (arrow keys move, Space selects) with a question
 * legend. Selected state = thick border + check badge + tint, never colour alone (brief §3).
 * Compact (side panel): always a horizontal row card, smaller visual, same semantics.
 */
function OptionCards<T extends string>({
  legend,
  hint,
  name,
  value,
  options,
  onChange,
  compact,
}: {
  legend: string
  hint?: string
  name: string
  value: T
  options: Option<T>[]
  onChange: (v: T) => void
  compact?: boolean
}) {
  const id = useId()
  return (
    <fieldset
      className="m-0 grid min-w-0 gap-3 border-0 p-0"
      aria-describedby={hint ? `${id}-hint` : undefined}
    >
      <legend className={cn('mb-1 p-0 font-bold text-ink', compact ? 'text-base' : 'text-lg')}>
        {legend}
      </legend>
      {hint ? (
        <p id={`${id}-hint`} className="m-0 text-base text-ink-soft">
          {hint}
        </p>
      ) : null}
      <div
        className={cn(
          'grid gap-2',
          compact
            ? // Narrow panel: options with hints or long labels stack; short ones sit side by side.
              options.some((o) => o.hint || o.label.length > 14)
              ? 'grid-cols-1'
              : 'grid-cols-[repeat(auto-fit,minmax(min(100%,8.5rem),1fr))]'
            : 'grid-cols-1 gap-3 sm:grid-cols-[repeat(auto-fit,minmax(9.5rem,1fr))]',
        )}
      >
        {options.map((o) => {
          const checked = value === o.value
          return (
            <label
              key={o.value}
              className={cn(
                'relative flex min-h-14 cursor-pointer items-center gap-3 rounded-2xl border-2 bg-white p-3 text-ink',
                !compact && 'sm:flex-col sm:items-start sm:p-4',
                'transition-[translate,scale,box-shadow,border-color,background-color] duration-200 ease-out active:scale-[0.98]',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                checked
                  ? 'border-sedra-green bg-sedra-pale-50 shadow-md'
                  : 'border-border hover:border-sedra-mid hover:shadow-md',
              )}
            >
              <input
                type="radio"
                name={name}
                value={o.value}
                checked={checked}
                onChange={() => onChange(o.value)}
                className="sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'grid shrink-0 place-items-center rounded-xl transition-colors',
                  compact ? 'size-9' : 'size-11',
                  checked ? 'bg-sedra-green text-white' : 'bg-sedra-pale-100 text-sedra-green',
                )}
              >
                {o.visual}
              </span>
              <span
                className={cn(
                  'grid min-w-0 flex-1 content-start gap-0.5 pe-8',
                  !compact && 'sm:pe-0',
                )}
              >
                <span className="font-semibold break-words" lang={o.lang}>
                  {o.label}
                </span>
                {o.hint ? <span className="text-base text-ink-soft">{o.hint}</span> : null}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'absolute top-1/2 end-3 grid size-7 -translate-y-1/2 place-items-center rounded-full border-2',
                  !compact && 'sm:top-3 sm:translate-y-0',
                  checked
                    ? 'border-sedra-green bg-sedra-green text-white'
                    : 'border-input bg-white text-transparent',
                )}
              >
                <Check aria-hidden="true" className="size-4" strokeWidth={3} />
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Large switch row: the whole row is the control (role=switch), with visible On/Off text. */
function SwitchRow({
  label,
  hint,
  icon: Icon,
  checked,
  onChange,
  compact,
}: {
  label: string
  hint?: string
  icon: LucideIcon
  checked: boolean
  onChange: (v: boolean) => void
  compact?: boolean
}) {
  const id = useId()
  const { t } = useTranslation('learner')
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-labelledby={`${id}-label`}
      aria-describedby={hint ? `${id}-hint` : undefined}
      onClick={() => onChange(!checked)}
      className={cn(
        'flex min-h-16 w-full flex-wrap items-center gap-3 rounded-2xl border-2 bg-white p-3 text-start',
        !compact && 'sm:p-4',
        'transition-[scale,border-color,background-color] duration-200 active:scale-[0.99]',
        checked ? 'border-sedra-green bg-sedra-pale-50' : 'border-border hover:border-sedra-mid',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'grid shrink-0 place-items-center rounded-xl transition-colors',
          compact ? 'size-9' : 'size-11',
          checked ? 'bg-sedra-green text-white' : 'bg-sedra-pale-100 text-sedra-green',
        )}
      >
        <Icon className={compact ? 'size-5' : 'size-6'} />
      </span>
      <span className="grid min-w-0 flex-1 basis-40 gap-0.5">
        <span
          id={`${id}-label`}
          className={cn('font-bold text-ink', compact ? 'text-base' : 'text-lg')}
        >
          {label}
        </span>
        {hint ? (
          <span id={`${id}-hint`} className="text-base text-ink-soft">
            {hint}
          </span>
        ) : null}
      </span>
      <span aria-hidden="true" className="ms-auto flex shrink-0 items-center gap-2">
        <span className="min-w-[3ch] text-end font-semibold text-ink">
          {checked ? t('prefs.on') : t('prefs.off')}
        </span>
        <span
          className={cn(
            'flex h-8 w-14 items-center rounded-full border-2 p-0.5 transition-colors',
            checked ? 'border-sedra-green bg-sedra-green' : 'border-input bg-sedra-pale-100',
          )}
        >
          <span
            className={cn(
              'grid size-6 place-items-center rounded-full bg-white shadow-sm transition-[translate] duration-200 ease-out',
              checked && 'translate-x-6 rtl:-translate-x-6',
            )}
          >
            {checked ? <Check className="size-4 text-sedra-green" strokeWidth={3} /> : null}
          </span>
        </span>
      </span>
    </button>
  )
}

/** Full page: white card section with h2 and a reveal. Compact: plain group with an h3. */
function Section({
  title,
  icon: Icon,
  delay,
  compact,
  children,
}: {
  title: string
  icon: LucideIcon
  delay: number
  compact?: boolean
  children: ReactNode
}) {
  const id = useId()
  if (compact) {
    return (
      <section aria-labelledby={id} className="grid min-w-0 gap-4">
        <h3 id={id} className="m-0 flex items-center gap-2 text-lg text-sedra-green">
          <Icon aria-hidden="true" className="size-5 shrink-0" />
          <span className="min-w-0 break-words">{title}</span>
        </h3>
        {children}
      </section>
    )
  }
  return (
    <Reveal delay={delay}>
      <section
        aria-labelledby={id}
        className="grid min-w-0 grid-cols-1 gap-6 rounded-3xl bg-white p-4 shadow-md sm:p-5 md:p-7"
      >
        <div className="flex items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green"
          >
            <Icon className="size-6" />
          </span>
          <h2 id={id} className="m-0 min-w-0 text-2xl">
            {title}
          </h2>
        </div>
        {children}
      </section>
    </Reveal>
  )
}

/** "A" glyph at three sizes, as the visual for text size options. */
function Glyph({ size, children, lang }: { size: string; children: ReactNode; lang?: string }) {
  return (
    <span lang={lang} className={cn('font-bold leading-none', size)}>
      {children}
    </span>
  )
}

/**
 * The one set of preference controls (brief §2, §3), shared by the Preferences page and the
 * Preferences side panel. Every change writes through setPrefs, so it applies live and persists.
 */
export function PreferenceControls({ compact = false }: { compact?: boolean }) {
  const { t } = useTranslation('learner')
  const prefs = usePrefs()
  // Unique radio group names so the page and the panel never share a native radio group.
  const uid = useId()
  const name = (n: string) => `${n}-${uid}`

  function change(patch: Partial<Prefs>) {
    setPrefs(patch)
    // Language change re-renders in the new language; announce in that language next frame.
    requestAnimationFrame(() => announce(t('prefs.saved', { lng: patch.lang ?? prefs.lang })))
  }

  const iconSize = compact ? 'size-5' : 'size-6'

  return (
    <div
      className={cn(
        'grid grid-cols-1 items-start [&>*]:min-w-0',
        compact ? 'gap-8' : 'gap-6 xl:grid-cols-2',
      )}
    >
      <Section
        title={t('prefs.sectionReading')}
        icon={Languages}
        delay={stagger(0)}
        compact={compact}
      >
        <OptionCards
          compact={compact}
          legend={t('prefs.language')}
          name={name('lang')}
          value={prefs.lang}
          onChange={(lang) => change({ lang })}
          options={[
            {
              value: 'en',
              label: 'English',
              lang: 'en',
              visual: <Glyph size="text-base">EN</Glyph>,
            },
            {
              value: 'ar',
              label: 'العربية',
              lang: 'ar',
              visual: (
                <Glyph size="text-xl" lang="ar">
                  ع
                </Glyph>
              ),
            },
          ]}
        />
        <OptionCards
          compact={compact}
          legend={t('prefs.view')}
          name={name('view')}
          value={prefs.view}
          onChange={(view) => change({ view })}
          options={[
            {
              value: 'standard',
              label: t('prefs.viewStandard'),
              hint: t('prefs.viewStandardHint'),
              visual: <LayoutGrid className={iconSize} />,
            },
            {
              value: 'simplified',
              label: t('prefs.viewSimplified'),
              hint: t('prefs.viewSimplifiedHint'),
              visual: <Rows3 className={iconSize} />,
            },
          ]}
        />
      </Section>

      <Section title={t('prefs.sectionSeeing')} icon={Eye} delay={stagger(1)} compact={compact}>
        <OptionCards
          compact={compact}
          legend={t('prefs.textSize')}
          name={name('textSize')}
          value={String(prefs.textSize) as `${TextSize}`}
          onChange={(v) => change({ textSize: Number(v) as TextSize })}
          options={(
            [
              ['100', 'text-sm'],
              ['125', 'text-lg'],
              ['150', compact ? 'text-xl' : 'text-2xl'],
            ] as const
          ).map(([v, size]) => ({
            value: v,
            label: `${v}%`,
            visual: <Glyph size={size}>Aa</Glyph>,
          }))}
        />
        {compact ? null : (
          <div
            aria-hidden="true"
            className="flex flex-wrap items-center gap-3 rounded-2xl bg-sedra-pale-50 p-4 ring-1 ring-border"
          >
            <span className="rounded-full bg-white px-3 py-0.5 text-sm font-semibold text-ink shadow-sm">
              {t('prefs.previewLabel')}
            </span>
            <span className="text-lg text-ink">{t('prefs.previewText')}</span>
          </div>
        )}
        <OptionCards
          compact={compact}
          legend={t('prefs.contrast')}
          name={name('contrast')}
          value={prefs.contrast}
          onChange={(contrast) => change({ contrast })}
          options={[
            {
              value: 'standard',
              label: t('prefs.contrastStandard'),
              visual: <SunMedium className={iconSize} />,
            },
            {
              value: 'high',
              label: t('prefs.contrastHigh'),
              visual: <Contrast className={iconSize} />,
            },
          ]}
        />
      </Section>

      <Section title={t('prefs.sectionMedia')} icon={Captions} delay={stagger(2)} compact={compact}>
        <div className="grid gap-3">
          <SwitchRow
            compact={compact}
            label={t('prefs.captions')}
            icon={Captions}
            checked={prefs.captions}
            onChange={(captions) => change({ captions })}
          />
          <SwitchRow
            compact={compact}
            label={t('prefs.readAloud')}
            hint={t('prefs.readAloudHint')}
            icon={Volume2}
            checked={prefs.readAloud}
            onChange={(readAloud) => change({ readAloud })}
          />
        </div>
      </Section>

      <Section title={t('prefs.sectionMovement')} icon={Wind} delay={stagger(3)} compact={compact}>
        <OptionCards
          compact={compact}
          legend={t('prefs.motion')}
          name={name('reducedMotion')}
          value={prefs.reducedMotion}
          onChange={(reducedMotion) => change({ reducedMotion })}
          options={[
            {
              value: 'system',
              label: t('prefs.motionSystem'),
              visual: <Smartphone className={iconSize} />,
            },
            {
              value: 'on',
              label: t('prefs.motionOn'),
              visual: <Pause className={iconSize} />,
            },
            {
              value: 'off',
              label: t('prefs.motionOff'),
              visual: <Sparkles className={iconSize} />,
            },
          ]}
        />
      </Section>
    </div>
  )
}
