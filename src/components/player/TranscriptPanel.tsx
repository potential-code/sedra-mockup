import { ChevronDown, FileText } from 'lucide-react'
import { useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

interface Props {
  /** Visible toggle label, e.g. "Read transcript". */
  label: string
  /** Path relative to public/ of a UTF-8 .txt file. */
  path: string
  /** Shown if the file cannot be loaded (storyboard narration). */
  fallback: string
  lang: string
}

/** Text alternative adjacent to the player (brief §3 Media). Loads the .txt on first open. */
export function TranscriptPanel({ label, path, fallback, lang }: Props) {
  const { t } = useTranslation('unit')
  const [open, setOpen] = useState(false)
  const [text, setText] = useState<string | null>(null)
  const id = useId()

  useEffect(() => {
    if (!open || text !== null) return
    let alive = true
    fetch(asset(path))
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error(String(r.status)))))
      .then((body) => {
        if (alive) setText(body.trim())
      })
      .catch(() => {
        if (alive) setText(fallback)
      })
    return () => {
      alive = false
    }
  }, [open, text, path, fallback])

  return (
    <div className="rounded-2xl border bg-white">
      <Button
        type="button"
        variant="ghost"
        className="w-full justify-start rounded-2xl text-start"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
      >
        <FileText aria-hidden="true" />
        <span className="flex-1">{label}</span>
        <ChevronDown aria-hidden="true" className={cn(open && 'rotate-180')} />
      </Button>
      <div id={id} hidden={!open} className="border-t px-4 py-3">
        {text === null ? (
          <p className="m-0 text-ink-soft">{t('transcript.loading')}</p>
        ) : (
          <div lang={lang} className="whitespace-pre-line">
            {text}
          </div>
        )}
      </div>
    </div>
  )
}
