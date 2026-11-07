import { Link } from '@tanstack/react-router'
import { Square, Volume2 } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { usePrefs } from '@/store/actions'

/**
 * Optional, learner-started read-aloud (brief §3 Preferences). Simulated: uses the browser's
 * speech engine when present, otherwise shows the visual "Reading aloud (demo)" state only.
 * Never starts by itself and never announces through the live region, so it does not talk over
 * a screen reader. Hidden unless the learner turned read-aloud on in Preferences.
 */
export function ReadAloud({
  text,
  what,
  showOffHint = false,
}: {
  text: string
  /** Short name of what will be read, for the button's accessible name. */
  what: string
  showOffHint?: boolean
}) {
  const { t } = useTranslation('learner')
  const { lang } = useLocalized()
  const { readAloud } = usePrefs()
  const [reading, setReading] = useState(false)
  const stopRef = useRef<HTMLButtonElement>(null)
  const startRef = useRef<HTMLButtonElement>(null)
  const timer = useRef<number | undefined>(undefined)

  const synth = typeof window !== 'undefined' ? window.speechSynthesis : undefined

  function stop(returnFocus = true) {
    synth?.cancel()
    window.clearTimeout(timer.current)
    setReading(false)
    if (returnFocus) requestAnimationFrame(() => startRef.current?.focus())
  }

  function start() {
    setReading(true)
    requestAnimationFrame(() => stopRef.current?.focus())
    const simulate = () => {
      // No usable speech engine: keep the visual demo state for a short while.
      window.clearTimeout(timer.current)
      timer.current = window.setTimeout(() => setReading(false), 8000)
    }
    if (synth && typeof SpeechSynthesisUtterance !== 'undefined' && synth.getVoices().length > 0) {
      synth.cancel()
      const u = new SpeechSynthesisUtterance(text)
      u.lang = lang === 'ar' ? 'ar' : 'en'
      u.rate = 0.9
      u.onend = () => setReading(false)
      u.onerror = simulate
      synth.speak(u)
    } else {
      simulate()
    }
  }

  // Stop when leaving the page or switching language.
  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel()
      window.clearTimeout(timer.current)
    }
  }, [])
  useEffect(() => {
    if (lang) {
      window.speechSynthesis?.cancel()
      setReading(false)
    }
  }, [lang])

  if (!readAloud) {
    return showOffHint ? (
      <p className="m-0 flex flex-wrap items-center gap-2 text-base text-ink-soft">
        <span>{t('readAloud.off')}</span>
        <Link
          to="/preferences"
          className="inline-flex min-h-12 items-center font-semibold text-sedra-green underline"
        >
          {t('readAloud.openPrefs')}
        </Link>
      </p>
    ) : null
  }

  if (reading) {
    return (
      <div className="flex flex-wrap items-center gap-2 rounded-xl border-2 border-sedra-green bg-sedra-pale-50 p-2 ps-4">
        <Volume2 aria-hidden="true" className="size-5 text-sedra-green" />
        <span className="font-semibold text-ink">{t('readAloud.reading')}</span>
        <Button ref={stopRef} variant="outline" onClick={() => stop()}>
          <Square aria-hidden="true" />
          {t('readAloud.stop')}
        </Button>
      </div>
    )
  }

  return (
    <Button
      ref={startRef}
      variant="secondary"
      onClick={start}
      aria-label={t('readAloud.startLabel', { what })}
    >
      <Volume2 aria-hidden="true" />
      {t('readAloud.start')}
    </Button>
  )
}
