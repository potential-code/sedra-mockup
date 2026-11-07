import { Link, useParams } from '@tanstack/react-router'
import { ArrowRight, Award, Clock, ExternalLink, Film, Hourglass } from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  completedCount,
  courseUnits,
  findCourse,
  isProgrammeId,
  PROGRAMME_LABEL_KEY,
  PROGRAMMES,
  UNITS_PER_COURSE,
  unitLinkParams,
  unitStatus,
} from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressMeter } from '@/components/learner/ProgressMeter'
import { StatusLabel } from '@/components/learner/StatusLabel'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { getUnitProgress, setLastProgramme, useLearner } from '@/store/actions'

/** Programme (brief §2): purpose, course title, eight-unit list with status and progress. */
export function ProgrammePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const { programmeId } = useParams({ from: '/_learner/programmes/$programmeId' })
  const learner = useLearner()

  useEffect(() => {
    if (isProgrammeId(programmeId)) setLastProgramme(programmeId)
  }, [programmeId])

  if (!isProgrammeId(programmeId)) {
    return (
      <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-4 py-8">
        <PageHeading title={t('programme.notFound')} />
        <Button asChild className="justify-self-start">
          <Link to="/learn">{t('shared.backToLearning')}</Link>
        </Button>
      </div>
    )
  }

  const name = t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)
  const course = findCourse(programmeId)
  const units = courseUnits(programmeId)
  const other = PROGRAMMES.find((p) => p !== programmeId) ?? 'life-skills'
  const otherName = t(`common:${PROGRAMME_LABEL_KEY[other]}`)

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[1fr_minmax(0,22rem)] md:items-start">
        <div className="grid grid-cols-1 gap-4">
          <PageHeading title={name} lead={course ? l(course.title) : undefined} />
          {course ? (
            <section aria-labelledby="purpose-heading" className="grid grid-cols-1 gap-2">
              <h2 id="purpose-heading" className="m-0 text-xl">
                {t('programme.purposeHeading')}
              </h2>
              <p className="m-0">{l(course.purpose)}</p>
            </section>
          ) : null}
          <p className="m-0 flex items-start gap-2 text-ink">
            <Clock aria-hidden="true" className="mt-1 size-5 shrink-0 text-sedra-green" />
            {t('programme.timeNote')}
          </p>
          <ProgressMeter done={completedCount(learner, units)} total={UNITS_PER_COURSE} />
        </div>
        {course?.image ? (
          <img
            src={asset(course.image)}
            alt={l(course.imageAlt)}
            width={800}
            height={600}
            className="aspect-[4/3] h-auto w-full rounded-2xl bg-sedra-pale-50 object-cover"
          />
        ) : null}
      </div>

      <section aria-labelledby="units-heading" className="grid grid-cols-1 gap-4">
        <h2 id="units-heading" className="m-0 text-2xl">
          {t('programme.unitsHeading')}
        </h2>
        {units.length === 0 ? <p className="m-0">{t('shared.notAvailable')}</p> : null}
        <ol className="m-0 grid list-none gap-3 p-0">
          {units.map((u) => {
            const status = unitStatus(getUnitProgress(learner, u.id))
            const action =
              status === 'complete'
                ? t('programme.review')
                : status === 'inProgress'
                  ? t('programme.continue')
                  : t('programme.start')
            const title = l(u.title)
            return (
              <li key={u.id} className="grid grid-cols-1 gap-3">
                <article className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-4 shadow-sm sm:grid-cols-[1fr_auto] sm:items-center md:p-5">
                  <div className="grid grid-cols-1 gap-2">
                    <p className="m-0 text-base font-semibold text-ink-soft">
                      {t('shared.unitOf', { n: u.order, total: UNITS_PER_COURSE })}
                    </p>
                    <h3 className="m-0 text-xl">{title}</h3>
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusLabel status={status} />
                      <span className="inline-flex items-center gap-1.5 text-base text-ink-soft">
                        {u.mediaStatus === 'pending' ? (
                          <>
                            <Hourglass aria-hidden="true" className="size-5" />
                            {t('programme.videoPending')}
                          </>
                        ) : (
                          <>
                            <Film aria-hidden="true" className="size-5" />
                            {t('programme.videoReady')}
                          </>
                        )}
                      </span>
                    </div>
                    {u.badge ? (
                      <p className="m-0 flex items-center gap-1.5 text-base">
                        <Award aria-hidden="true" className="size-5 text-sedra-green" />
                        {t('programme.badge', { badge: l(u.badge) })}
                      </p>
                    ) : null}
                  </div>
                  <Button asChild variant={status === 'complete' ? 'outline' : 'default'}>
                    <Link
                      to="/courses/$courseId/units/$unitId"
                      params={unitLinkParams(u)}
                      aria-label={`${action}: ${title}`}
                    >
                      {action}
                      <ArrowRight aria-hidden="true" className="rtl-mirror" />
                    </Link>
                  </Button>
                </article>
                {u.id === 'LS01' ? (
                  <div className="ms-4 flex flex-wrap items-center gap-x-3 gap-y-1 border-s-4 border-sedra-pale ps-4">
                    <Link
                      to="/resources"
                      hash="ext01"
                      className="inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline"
                    >
                      <ExternalLink aria-hidden="true" className="size-5" />
                      {t('programme.extraVideo')}
                    </Link>
                    <span className="text-base text-ink-soft">{t('programme.extraVideoHint')}</span>
                  </div>
                ) : null}
              </li>
            )
          })}
        </ol>
      </section>

      <section
        aria-labelledby="switch-heading"
        className="grid grid-cols-1 gap-3 rounded-2xl bg-sedra-pale-50 p-5"
      >
        <h2 id="switch-heading" className="m-0 text-xl">
          {t('programme.switchHeading')}
        </h2>
        <p className="m-0">{t('programme.switchNote')}</p>
        <Button asChild variant="outline" className="justify-self-start">
          <Link to="/programmes/$programmeId" params={{ programmeId: other }}>
            {otherName}
            <ArrowRight aria-hidden="true" className="rtl-mirror" />
          </Link>
        </Button>
      </section>
    </div>
  )
}
