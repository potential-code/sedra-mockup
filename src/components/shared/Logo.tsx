import { useTranslation } from 'react-i18next'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

/** Original bilingual SEDRA logo (whitespace trimmed only; never recoloured or stretched). */
export function Logo({ className }: { className?: string }) {
  const { t } = useTranslation()
  return (
    <img
      src={asset('brand/sedra-logo-640.png')}
      alt={t('logoAlt', { defaultValue: 'SEDRA Foundation' })}
      className={cn('h-14 w-auto bg-white object-contain', className)}
      width={640}
      height={493}
    />
  )
}
