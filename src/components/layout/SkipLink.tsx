import { useTranslation } from 'react-i18next'

/**
 * First focusable element. A button, not href="#main": with hash routing a #main link would
 * change the route. Moves focus to <main id="main" tabIndex={-1}>.
 */
export function SkipLink() {
  const { t } = useTranslation()
  return (
    <button
      type="button"
      onClick={() => {
        const main = document.getElementById('main')
        main?.focus()
        main?.scrollIntoView()
      }}
      className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:start-3 focus:z-[100] focus:min-h-12 focus:rounded-xl focus:bg-white focus:px-5 focus:py-3 focus:text-ink focus:shadow-lg"
    >
      {t('skipToMain')}
    </button>
  )
}
