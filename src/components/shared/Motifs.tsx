import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/utils'

/** Decorative leaf scallop strip from SEDRA's materials. Hidden from assistive tech. */
export function LeafBorder({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn('leaf-border', className)} />
}

/**
 * SEDRA values band (from the lesson-plan cover and SEDRA's letterhead):
 * Inclusion · No One Left Behind · Love, shown in the active language.
 */
export function ValuesBand({ className }: { className?: string }) {
  const { t } = useTranslation()
  const values = [t('values.inclusion'), t('values.noOneLeftBehind'), t('values.love')]
  return (
    <ul
      aria-label={t('values.label')}
      className={cn(
        'm-0 flex list-none flex-wrap items-center justify-center gap-x-6 gap-y-1 bg-sedra-green px-4 py-2 text-sm font-semibold text-white',
        className,
      )}
    >
      {values.map((v) => (
        <li key={v} className="max-w-none">
          {v}
        </li>
      ))}
    </ul>
  )
}
