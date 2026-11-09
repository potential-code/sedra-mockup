import { FileText, ScrollText } from 'lucide-react'
import { motion } from 'motion/react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

export interface TranscriptSource {
  /** Visible toggle label, e.g. "Read transcript". */
  label: string
  /** Path relative to public/ of a UTF-8 .txt file. */
  path: string
  /** Shown if the file cannot be loaded (storyboard narration). */
  fallback: string
}

/**
 * Text alternatives adjacent to the player (brief §3 Media), in one tidy card. Each source is a
 * disclosure button (aria-expanded) styled as a tab; one text shows at a time and loads on first
 * open. Plain buttons keep each choice one Tab stop with a clear spoken state.
 */
export function TranscriptPanel({ sources, lang }: { sources: TranscriptSource[]; lang: string }) {
  const { t } = useTranslation('unit')
  const reduce = useReducedMotion()
  const [open, setOpen] = useState<number | null>(null)
  const [texts, setTexts] = useState<Record<number, string>>({})
  const id = useId()
  const titleId = `${id}-title`
  const current = open === null ? undefined : sources[open]

  useEffect(() => {
    if (open === null || texts[open] !== undefined || !current) return
    let alive = true
    const idx = open
    fetch(asset(current.path))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        if (alive) setTexts((m) => ({ ...m, [idx]: body.trim() }))
      })
      .catch(() => {
        if (alive) setTexts((m) => ({ ...m, [idx]: current.fallback }))
      })
    return () => {
      alive = false
    }
  }, [open, texts, current])

  const text = open === null ? undefined : texts[open]

  return (
    <section
      aria-labelledby={titleId}
      className="flex min-w-0 flex-col overflow-hidden rounded-2xl border bg-white shadow-sm"
    >
      <div className="flex flex-col gap-3 bg-sedra-pale-50 p-3">
        <h3 id={titleId} className="m-0 flex items-center gap-2 px-1 text-lg">
          <ScrollText aria-hidden="true" className="size-5 shrink-0" />
          {t('transcript.title')}
        </h3>
        <div className="grid gap-2 sm:grid-cols-2">
          {sources.map((s, i) => {
            const active = open === i
            return (
              <button
                key={s.path}
                type="button"
                aria-expanded={active}
                aria-controls={`${id}-panel`}
                onClick={() => setOpen(active ? null : i)}
                className={cn(
                  'inline-flex min-h-12 w-full items-center justify-start gap-2 rounded-xl border-2 px-3 text-start text-base font-semibold transition-colors',
                  active
                    ? 'border-sedra-green bg-sedra-green text-white shadow-sm'
                    : 'border-sedra-green bg-white text-sedra-green hover:bg-sedra-pale-100',
                )}
              >
                <FileText aria-hidden="true" className="size-5 shrink-0" />
                {s.label}
              </button>
            )
          })}
        </div>
      </div>
      {/* Long text scrolls inside the panel so the page stays short; focusable so keyboard users can scroll it. */}
      <section
        id={`${id}-panel`}
        // biome-ignore lint/a11y/noNoninteractiveTabindex: scrollable region must be keyboard reachable
        tabIndex={0}
        aria-labelledby={titleId}
        className="max-h-80 overflow-y-auto px-4 py-3 focus-visible:outline-2 focus-visible:outline-offset-[-2px]"
      >
        {open === null ? (
          <p className="m-0 text-base text-ink-soft">{t('transcript.hint')}</p>
        ) : text === undefined ? (
          <p className="m-0 text-ink-soft">{t('transcript.loading')}</p>
        ) : (
          <motion.div
            key={open}
            lang={lang}
            initial={reduce ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.25 }}
            className="whitespace-pre-line"
          >
            {text}
          </motion.div>
        )}
      </section>
    </section>
  )
}
