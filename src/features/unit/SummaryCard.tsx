import type { Unit } from '@shared/types'
import { Lightbulb, Square, Volume2 } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/store/actions'

/**
 * Accessible summary (simplified text alternative). Optional read-aloud: learner-initiated,
 * speaks one sentence at a time with the browser voice and highlights it, always has a Stop
 * control. If the device has no voice it falls back to the silent highlight demo (brief §3
 * Preferences). It never starts on its own, so it does not clash with a screen reader.
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
  const [silent, setSilent] = useState(false)
  const timer = useRef<number | undefined>(undefined)
  const run = useRef(0)
  const noVoice = useRef(false)
  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

  useEffect(
    () => () => {
      run.current += 1
      window.clearTimeout(timer.current)
      window.speechSynthesis?.cancel()
    },
    [],
  )

  function stop() {
    run.current += 1
    window.clearTimeout(timer.current)
    synth?.cancel()
    setActive(null)
  }

  function start() {
    run.current += 1
    noVoice.current = !synth || typeof SpeechSynthesisUtterance === 'undefined'
    setSilent(noVoice.current)
    step(0, run.current)
  }

  function step(i: number, id: number) {
    if (id !== run.current) return
    if (i >= sentences.length) {
      setActive(null)
      return
    }
    setActive(i)
    const sentence = sentences[i] ?? ''
    const timedNext = () => {
      const words = sentence.split(/\s+/).length
      timer.current = window.setTimeout(() => step(i + 1, id), Math.max(1600, words * 420))
    }
    if (noVoice.current || !synth) {
      timedNext()
      return
    }
    const u = new SpeechSynthesisUtterance(sentence)
    u.lang = lang === 'ar' ? 'ar' : 'en'
    u.rate = 0.9
    let started = false
    const fallBack = () => {
      noVoice.current = true
      setSilent(true)
      window.clearTimeout(timer.current)
      timedNext()
    }
    u.onstart = () => {
      started = true
      window.clearTimeout(timer.current)
    }
    u.onend = () => {
      if (started) step(i + 1, id)
    }
    u.onerror = (e) => {
      if (id !== run.current || e.error === 'canceled' || e.error === 'interrupted') return
      fallBack()
    }
    synth.speak(u)
    // No sound started (no voice on this device, or voices still loading): silent demo instead.
    timer.current = window.setTimeout(() => {
      if (!started && id === run.current) {
        synth.cancel()
        fallBack()
      }
    }, 2000)
  }

  return (
    <section
      aria-labelledby={`${unit.id}-summary`}
      className="relative overflow-hidden rounded-2xl bg-sedra-pale-50 p-4 ps-5 text-ink ring-1 ring-border"
    >
      <span aria-hidden="true" className="absolute inset-y-0 start-0 w-1.5 bg-sedra-mid" />
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 id={`${unit.id}-summary`} className="m-0 flex items-center gap-2 text-xl">
          <Lightbulb aria-hidden="true" className="size-5 shrink-0" />
          {t('summary.title')}
        </h3>
        {prefs.readAloud &&
          (active === null ? (
            <Button type="button" variant="outline" size="sm" onClick={start}>
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
      <p className="m-0 mt-2 text-lg" lang={lang}>
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
      {prefs.readAloud && active !== null && silent && (
        <p className="m-0 mt-2 text-base text-ink-soft">{t('summary.simulated')}</p>
      )}
    </section>
  )
}
