import { useEffect } from 'react'
import i18n from '@/i18n'
import { usePrefs } from '@/store/actions'

/** Applies saved preferences to <html>: lang, dir, text size, contrast, reduced motion. */
export function PrefsSync() {
  const prefs = usePrefs()
  useEffect(() => {
    const html = document.documentElement
    html.lang = prefs.lang
    html.dir = prefs.lang === 'ar' ? 'rtl' : 'ltr'
    html.dataset.text = String(prefs.textSize)
    html.dataset.contrast = prefs.contrast
    if (prefs.reducedMotion === 'system') delete html.dataset.motion
    else html.dataset.motion = prefs.reducedMotion === 'on' ? 'reduce' : 'full'
    html.dataset.view = prefs.view
    if (i18n.language !== prefs.lang) void i18n.changeLanguage(prefs.lang)
  }, [prefs])
  return null
}
