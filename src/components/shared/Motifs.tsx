import { Heart } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import treeWhite from '@/assets/motifs/motif-tree-white.png'
import i18n from '@/i18n'
import { cn } from '@/lib/utils'

const VALUE_KEYS = ['values.inclusion', 'values.noOneLeftBehind', 'values.love'] as const

/**
 * SEDRA values band (from SEDRA's social banner): white tree marks, hearts and each value in
 * English and Arabic on SEDRA green. Static on purpose (no marquee), so nothing moves and no pause
 * control is needed. Each value is one list item; the second language carries its own `lang`/`dir`
 * so screen readers switch voice. Tree marks and hearts are decorative.
 */
export function ValuesBand({ className }: { className?: string }) {
  const { t, i18n: inst } = useTranslation()
  const active = inst.language === 'ar' ? 'ar' : 'en'
  const other = active === 'en' ? 'ar' : 'en'
  const tOther = i18n.getFixedT(other)
  return (
    <div className={cn('bg-sedra-green px-4 py-4 text-white', className)}>
      <ul
        aria-label={t('values.label')}
        className="m-0 mx-auto flex max-w-6xl list-none flex-col items-center justify-center gap-x-10 gap-y-3 p-0 md:flex-row md:flex-wrap"
      >
        {VALUE_KEYS.map((key) => (
          <li key={key} className="flex max-w-none items-center gap-3 text-lg font-semibold">
            <img src={treeWhite} alt="" width={676} height={464} className="h-7 w-auto" />
            <span>{t(key)}</span>
            <Heart aria-hidden="true" className="size-5 fill-white" />
            <span lang={other} dir={other === 'ar' ? 'rtl' : 'ltr'}>
              {tOther(key)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  )
}
