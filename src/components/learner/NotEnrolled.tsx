import { Link } from '@tanstack/react-router'
import { ArrowLeft, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { PageHeading } from './PageHeading'

/**
 * Friendly stop for a programme or unit the learner is not enrolled in. SEDRA enrols learners
 * (no self-enrolment), so the only action is back to the dashboard.
 */
export function NotEnrolled() {
  const { t } = useTranslation('learner')
  return (
    <div className="container-page py-8 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
      <div className="grid max-w-2xl grid-cols-1 gap-5 rounded-3xl bg-white p-6 shadow-md md:p-8">
        <span
          aria-hidden="true"
          className="grid size-12 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green"
        >
          <Info className="size-6" />
        </span>
        <PageHeading
          title={t('enrolment.notEnrolledTitle')}
          lead={t('enrolment.notEnrolledBody')}
        />
        <Button asChild className="justify-self-start">
          <Link to="/learn">
            <ArrowLeft aria-hidden="true" className="rtl-mirror" />
            {t('enrolment.backToDashboard')}
          </Link>
        </Button>
      </div>
    </div>
  )
}
