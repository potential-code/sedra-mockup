import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'
import { UNITS_PER_COURSE } from './learning'

/** "x of 8 units complete" as text first; the bar is decorative support. */
export function ProgressMeter({
  done,
  total = UNITS_PER_COURSE,
}: {
  done: number
  total?: number
}) {
  const { t } = useTranslation('learner')
  return (
    <div className="grid grid-cols-1 gap-2">
      <p className="m-0 font-semibold text-ink">{t('shared.unitsComplete', { done, total })}</p>
      <Progress
        value={total ? (done / total) * 100 : 0}
        aria-hidden="true"
        className="h-3 bg-sedra-pale-100 [&>[data-slot=progress-indicator]]:bg-sedra-green"
      />
    </div>
  )
}
