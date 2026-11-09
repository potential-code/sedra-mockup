import { FlaskConical } from 'lucide-react'
import { useTranslation } from 'react-i18next'

/** Visible "Demo" label for seeded or simulated items (brief §1, §2 Sessions). */
export function DemoTag() {
  const { t } = useTranslation('learner')
  return (
    <span className="inline-flex w-fit items-center justify-self-start gap-1 rounded-full border border-notice bg-notice-soft px-2.5 py-0.5 text-base font-semibold text-notice">
      <FlaskConical aria-hidden="true" className="size-4" />
      {t('shared.demo')}
    </span>
  )
}
