import type { Unit } from '@shared/types'
import { Square, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/store/actions'

/**
 * Accessible summary (simplified text alternative). Optional read-aloud is simulated in the
 * mockup: learner-initiated, highlights one sentence at a time, always has a Stop control and
 * produces no audio, so it cannot clash with screen-reader speech (brief §3 Preferences).
 */
export function SummaryCard({ unit }: { unit: Unit }) {
  const { t } = useTranslation('unit')
  const { l, lang } = useLocalized()
  const prefs = usePrefs()
  const text = l(unit.summary)
  const sentences = useMemo(
    () =>
      text
        .match(/[^.!?؟]+[.!?؟]?/g)
        ?.map((s) => s.trim())
        .filter(Boolean) ?? [text],
    [text],
  )
  const [active, setActive] = useState<number | null>(null)
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  function stop() {
    window.clearTimeout(timer.current)
    setActive(null)
  }

  function step(i: number) {
    if (i >= sentences.length) {
      setActive(null)
      return
    }
    setActive(i)
    const words = sentences[i]?.split(/\s+/).length ?? 1
    timer.current = window.setTimeout(() => step(i + 1), Math.max(1600, words * 420))
  }

  return (
    <section
      aria-labelledby={`${unit.id}-summary`}
      className="rounded-2xl bg-sedra-pale-50 p-4 text-ink"
    >
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${unit.id}-summary`} className="m-0 text-xl">
          {t('summary.title')}
        </h3>
        {prefs.readAloud &&
          (active === null ? (
            <Button type="button" variant="outline" size="sm" onClick={() => step(0)}>
              <Volume2 aria-hidden="true" />
              {t('summary.readAloud')}
            </Button>
          ) : (
            <Button type="button" variant="outline" size="sm" onClick={stop}>
              <Square aria-hidden="true" />
              {t('summary.stop')}
            </Button>
          ))}
      </div>
      <p className="m-0 mt-2" lang={lang}>
        {sentences.map((s, i) => (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: sentences are static text
            key={i}
            className={cn(active === i && 'rounded bg-white underline decoration-2')}
          >
            {s}{' '}
          </span>
        ))}
      </p>
      {prefs.readAloud && active !== null && (
        <p className="m-0 mt-2 text-base text-ink-soft">{t('summary.simulated')}</p>
      )}
    </section>
  )
}
