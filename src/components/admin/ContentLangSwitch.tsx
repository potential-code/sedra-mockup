import type { Lang } from '@shared/types'
import { Languages } from 'lucide-react'
import { useSyncExternalStore } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/**
 * Which language SEDRA is entering content in (course builder and unit editor share it).
 * Kept per viewer in localStorage; falls back to English if storage is blocked.
 */
const KEY = 'sedra-admin-content-lang'
const listeners = new Set<() => void>()

function read(): Lang {
  try {
    return localStorage.getItem(KEY) === 'ar' ? 'ar' : 'en'
  } catch {
    return memory
  }
}
let memory: Lang = 'en'

export function setContentLang(lang: Lang) {
  memory = lang
  try {
    localStorage.setItem(KEY, lang)
  } catch {
    // Storage blocked: the in-memory value still works for this visit.
  }
  for (const fn of listeners) fn()
}

export function useContentLang(): Lang {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn)
      return () => listeners.delete(fn)
    },
    read,
    () => 'en',
  )
}

/** One switch: English or Arabic content. Two radio buttons, one Tab stop, clear state. */
export function ContentLangSwitch({
  className,
  onChange,
}: {
  className?: string
  onChange?: (lang: Lang) => void
}) {
  const { t } = useTranslation('admin')
  const lang = useContentLang()
  return (
    <fieldset className={cn('m-0 border-0 p-0', className)}>
      <legend className="mb-2 flex items-center gap-2 p-0 font-semibold text-ink">
        <Languages aria-hidden="true" className="size-5 text-sedra-green" />
        {t('contentLang.label')}
      </legend>
      <div className="inline-grid grid-cols-2 gap-1 rounded-2xl bg-sedra-pale-100 p-1 ring-1 ring-border">
        {(['en', 'ar'] as const).map((code) => (
          <label
            key={code}
            className="flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-5 font-semibold text-sedra-green transition-colors has-[:checked]:bg-sedra-green has-[:checked]:text-white has-[:checked]:shadow-md has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-sedra-green"
          >
            <input
              type="radio"
              name="content-lang"
              value={code}
              checked={lang === code}
              onChange={() => {
                setContentLang(code)
                onChange?.(code)
              }}
              className="sr-only"
            />
            {t(`editor.lang.${code}`)}
          </label>
        ))}
      </div>
    </fieldset>
  )
}
