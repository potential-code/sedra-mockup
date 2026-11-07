import { Languages } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { setPrefs, usePrefs } from '@/store/actions'

/** Switches EN/AR without losing the current page, unit or progress (brief §4). */
export function LanguageSwitch() {
  const { t } = useTranslation()
  const { lang } = usePrefs()
  const other = lang === 'en' ? 'ar' : 'en'
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={() => setPrefs({ lang: other })}
      aria-label={`${t('language.switchTo')}: ${t(`language.${other}`)}`}
      lang={other}
    >
      <Languages aria-hidden="true" />
      <span>{t(`language.${other}`)}</span>
    </Button>
  )
}
