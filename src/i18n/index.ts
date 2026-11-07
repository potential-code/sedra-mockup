import type { Lang, Localized } from '@shared/types'
import i18n from 'i18next'
import { initReactI18next, useTranslation } from 'react-i18next'
import arAdmin from './ar/admin.json'
import arCommon from './ar/common.json'
import arLearner from './ar/learner.json'
import enAdmin from './en/admin.json'
import enCommon from './en/common.json'
import enLearner from './en/learner.json'

/**
 * Translation keys for all labels, feedback, alt text and announcements (brief §4).
 * Namespaces: common (shell), learner (learner screens), admin (admin screens).
 * Lesson content lives in src/content as Localized { en, ar } objects.
 */
void i18n.use(initReactI18next).init({
  resources: {
    en: { common: enCommon, learner: enLearner, admin: enAdmin },
    ar: { common: arCommon, learner: arLearner, admin: arAdmin },
  },
  lng: 'en',
  fallbackLng: false,
  defaultNS: 'common',
  ns: ['common', 'learner', 'admin'],
  interpolation: { escapeValue: false },
  returnNull: false,
})

export default i18n

export function currentLang(): Lang {
  return i18n.language === 'ar' ? 'ar' : 'en'
}

/** Pick the string for the active language from a Localized value. */
export function useLocalized() {
  const { i18n: inst } = useTranslation()
  const lang: Lang = inst.language === 'ar' ? 'ar' : 'en'
  const l = (v: Localized | undefined) => (v ? v[lang] : '')
  return { l, lang, dir: lang === 'ar' ? ('rtl' as const) : ('ltr' as const) }
}
