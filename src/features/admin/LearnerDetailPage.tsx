import type { CourseId, ProgrammeId } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader, DemoTag, Notice, StatusLabel } from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { isActive, UNITS_PER_COURSE, useAdminLearners } from '@/store/admin-actions'

const COURSE_BY_PROGRAMME: Record<ProgrammeId, CourseId> = {
  'life-skills': 'healthy-communication',
  hospitality: 'intro-hospitality',
}

function BackLink() {
  const { t } = useTranslation('admin')
  return (
    <Link
      to="/admin/learners"
      className="mb-4 inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline underline-offset-4"
    >
      <ArrowLeft aria-hidden="true" className="rtl-mirror size-5" />
      {t('learnerDetail.back')}
    </Link>
  )
}

/** /admin/learners/$learnerId: units completed and practice status. No diagnosis or ranking. */
export function LearnerDetailPage() {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const { learnerId } = useParams({ from: '/_admin/admin/learners/$learnerId' })
  const learner = useAdminLearners().find((l) => l.id === learnerId)

  if (!learner) {
    return (
      <div>
        <BackLink />
        <AdminPageHeader
          title={t('learnerDetail.notFoundTitle')}
          intro={t('learnerDetail.notFoundBody')}
        />
      </div>
    )
  }

  const p = learner.practice
  return (
    <div>
      <BackLink />
      <AdminPageHeader
        title={t('learnerDetail.title', { name: learner.name })}
        intro={<span className="ltr-isolate">{learner.id}</span>}
      >
        <DemoTag label={t('learnerDetail.fictional')} />
      </AdminPageHeader>

      <div className="grid gap-4 lg:grid-cols-2">
        <section aria-labelledby="ld-units" className="rounded-2xl border bg-white p-5">
          <h2 id="ld-units" className="m-0 mb-3 text-2xl">
            {t('learnerDetail.unitsHeading')}
          </h2>
          <ul className="m-0 flex list-none flex-col gap-4 p-0">
            {learner.programmes.map((prog) => {
              const course = COURSE_BY_PROGRAMME[prog]
              const done = learner.unitsCompleted[course] ?? 0
              return (
                <li key={prog} className="max-w-none">
                  <p className="m-0 font-semibold text-ink">
                    {t(`programme.${prog}`)}: {t(`course.${course}`)}
                  </p>
                  <p className="m-0">
                    {t('learnerDetail.unitsDone', { done, total: UNITS_PER_COURSE })}
                  </p>
                  <div
                    aria-hidden="true"
                    className="mt-2 h-3 w-full overflow-hidden rounded-full bg-sedra-pale-100"
                  >
                    <div
                      className="h-full rounded-full bg-sedra-green"
                      style={{ inlineSize: `${(done / UNITS_PER_COURSE) * 100}%` }}
                    />
                  </div>
                  {done >= UNITS_PER_COURSE ? (
                    <StatusLabel tone="done" className="mt-2">
                      {t('learnerDetail.courseComplete')}
                    </StatusLabel>
                  ) : null}
                </li>
              )
            })}
          </ul>
        </section>

        <section aria-labelledby="ld-practice" className="rounded-2xl border bg-white p-5">
          <h2 id="ld-practice" className="m-0 mb-3 text-2xl">
            {t('learnerDetail.practiceHeading')}
          </h2>
          <p className="m-0 mb-2 text-sm text-ink-soft">{t('learnerDetail.practiceNote')}</p>
          <dl className="m-0 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2">
            <dt className="font-semibold">{t('learnerDetail.practiceDone')}</dt>
            <dd className="m-0">{p.done}</dd>
            <dt className="font-semibold">{t('learnerDetail.practiceLater')}</dt>
            <dd className="m-0">{p.later}</dd>
            <dt className="font-semibold">{t('learnerDetail.practiceWithHelp')}</dt>
            <dd className="m-0">{p.withHelp}</dd>
          </dl>
        </section>

        <section aria-labelledby="ld-activity" className="rounded-2xl border bg-white p-5">
          <h2 id="ld-activity" className="m-0 mb-3 text-2xl">
            {t('learnerDetail.activityHeading')}
          </h2>
          <dl className="m-0 flex flex-col gap-2">
            <div>
              <dt className="font-semibold">{t('learners.cols.latest')}</dt>
              <dd className="m-0">
                {f.dateTime(learner.latestActivity)} ·{' '}
                {isActive(learner) ? t('learners.activeYes') : t('learners.activeNo')}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">{t('learners.cols.checks')}</dt>
              <dd className="m-0">
                {t('learners.checksSummary', {
                  reviewed: learner.checksReviewed,
                  firstTry: learner.checksCorrectFirstTry,
                })}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">{t('learners.cols.support')}</dt>
              <dd className="m-0">
                {learner.supportFlag ? (
                  <StatusLabel tone="warning">{t('learners.supportOpen')}</StatusLabel>
                ) : (
                  <StatusLabel tone="neutral">{t('learners.supportNone')}</StatusLabel>
                )}
              </dd>
            </div>
          </dl>
        </section>

        <Notice className="self-start">
          <p>{t('learnerDetail.privacy')}</p>
        </Notice>
      </div>
    </div>
  )
}
