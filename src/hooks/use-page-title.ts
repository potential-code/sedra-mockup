import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'

/** Sets document.title as "<page> · SEDRA learning" in the active language. */
export function usePageTitle(title: string) {
  const { t } = useTranslation()
  useEffect(() => {
    document.title = title ? `${title} · ${t('brand')}` : t('brand')
  }, [title, t])
}
