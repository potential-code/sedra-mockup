import { useTranslation } from 'react-i18next'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

/**
 * Bilingual SEDRA logo (whitespace trimmed only; never stretched).
 * `variant="white"` is the all-white (transparent) version for dark green backgrounds.
 */
export function Logo({
  className,
  variant = 'color',
}: {
  className?: string
  variant?: 'color' | 'white'
}) {
  const { t } = useTranslation()
  const white = variant === 'white'
  return (
    <img
      src={asset(white ? 'brand/sedra-logo-white-640.png' : 'brand/sedra-logo-640.png')}
      alt={t('logoAlt', { defaultValue: 'SEDRA Foundation' })}
      className={cn('h-14 w-auto object-contain', !white && 'bg-white', className)}
      width={640}
      height={493}
    />
  )
}
