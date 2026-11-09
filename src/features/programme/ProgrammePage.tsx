import type { Unit } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowRight,
  Award,
  Check,
  Clock,
  ExternalLink,
  Film,
  Hourglass,
  Layers,
  Play,
  Sparkles,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  completedCount,
  courseUnits,
  enrolledProgrammes,
  findCourse,
  isEnrolled,
  isProgrammeId,
  nextStepUnit,
  PROGRAMME_LABEL_KEY,
  UNITS_PER_COURSE,
  type UnitStatus,
  unitLinkParams,
  unitStatus,
} from '@/components/learner/learning'
import { NotEnrolled } from '@/components/learner/NotEnrolled'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressRing } from '@/components/learner/ProgressRing'
import { StatusLabel } from '@/components/learner/StatusLabel'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { getUnitProgress, setLastProgramme, useLearner, usePrefs } from '@/store/actions'

const CHIP =
  'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-base font-semibold'

/** Numbered node on the unit path: number, or a tick once complete (status is also in text). */
function PathNode({ n, status, current }: { n: number; status: UnitStatus; current: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'relative z-10 grid size-12 place-items-center rounded-full text-lg font-bold shadow-md',
        status === 'complete' && 'bg-sedra-green text-white',
        status !== 'complete' && current && 'bg-white text-sedra-green ring-4 ring-sedra-green',
        status !== 'complete' && !current && 'border-2 border-border bg-white text-ink-soft',
      )}
    >
      {status === 'complete' ? <Check className="size-6" strokeWidth={3} /> : n}
    </span>
  )
}

function UnitCard({ u, status, current }: { u: Unit; status: UnitStatus; current: boolean }) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const action =
    status === 'complete'
      ? t('programme.review')
      : status === 'inProgress'
        ? t('programme.continue')
        : t('programme.start')
  const title = l(u.title)
  return (
    <article
      className={cn(
        'card-pop grid grid-cols-1 overflow-hidden sm:grid-cols-[minmax(0,13rem)_1fr] lg:grid-cols-[minmax(0,15rem)_1fr]',
        current && 'ring-2 ring-sedra-green',
      )}
    >
      <div className="relative bg-sedra-pale-50">
        <img
          src={asset(u.image)}
          alt={l(u.imageAlt)}
          width={1200}
          height={896}
          loading="lazy"
          className="aspect-[16/9] size-full object-cover sm:absolute sm:inset-0 sm:aspect-auto"
        />
        {current ? (
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-sedra-green px-2.5 py-0.5 text-base font-semibold text-white shadow-md">
            <Sparkles aria-hidden="true" className="size-4" />
            {t('programme.upNext')}
          </span>
        ) : null}
      </div>
      <div className="grid grid-cols-1 gap-3 p-5 md:grid-cols-[1fr_auto] md:items-center">
        <div className="grid min-w-0 grid-cols-1 gap-2">
          <p className="m-0 text-base font-semibold text-ink-soft">
            {t('shared.unitOf', { n: u.order, total: UNITS_PER_COURSE })}
          </p>
          <h3 className="m-0 text-xl md:text-2xl">{title}</h3>
          <div className="flex flex-wrap items-center gap-2">
            <StatusLabel status={status} size="sm" />
            {u.mediaStatus === 'pending' ? (
              <span className={cn(CHIP, 'border-notice bg-notice-soft text-notice')}>
                <Hourglass aria-hidden="true" className="size-4" />
                {t('programme.videoPendingChip')}
              </span>
            ) : (
              <span className={cn(CHIP, 'border-info bg-info-soft text-info')}>
                <Film aria-hidden="true" className="size-4" />
                {t('programme.videoSampleChip')}
              </span>
            )}
            <span className={cn(CHIP, 'border-border bg-white text-ink-soft')}>
              <Clock aria-hidden="true" className="size-4" />
              {t('programme.durationChip')}
            </span>
          </div>
          {u.badge ? (
            <p className="m-0 flex items-center gap-1.5 text-base text-ink">
              <Award aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
              {t('programme.badge', { badge: l(u.badge) })}
            </p>
          ) : null}
        </div>
        <Button
          asChild
          variant={current ? 'default' : 'outline'}
          className="justify-self-start md:justify-self-end"
        >
          <Link
            to="/courses/$courseId/units/$unitId"
            params={unitLinkParams(u)}
            aria-label={`${action}: ${title}`}
          >
            {action}
            <ArrowRight aria-hidden="true" className="rtl-mirror" />
          </Link>
        </Button>
      </div>
    </article>
  )
}

/**
 * Programme = course detail (brief §2; template course-detail structure): meta chips, title,
 * purpose, progress ring + one primary Start / Continue, then the course outline of PUBLISHED
 * units with status chips and the up-next highlight. Enrolled programmes only.
 */
export function ProgrammePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const { programmeId } = useParams({ from: '/_learner/programmes/$programmeId' })
  const learner = useLearner()
  const simplified = usePrefs().view === 'simplified'
  const enrolled = isProgrammeId(programmeId) && isEnrolled(learner, programmeId)

  useEffect(() => {
    if (enrolled && isProgrammeId(programmeId)) setLastProgramme(programmeId)
  }, [programmeId, enrolled])

  if (!isProgrammeId(programmeId)) {
    return (
      <div className="container-page grid grid-cols-1 gap-4 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
        <PageHeading title={t('programme.notFound')} />
        <Button asChild className="justify-self-start">
          <Link to="/learn">{t('shared.backToLearning')}</Link>
        </Button>
      </div>
    )
  }
  if (!enrolled) return <NotEnrolled />

  const name = t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)
  const course = findCourse(programmeId)
  const units = courseUnits(programmeId)
  const total = units.length
  const done = completedCount(learner, units)
  const other = enrolledProgrammes(learner).find((p) => p !== programmeId)
  const otherName = other ? t(`common:${PROGRAMME_LABEL_KEY[other]}`) : ''
  const otherCourse = other ? findCourse(other) : undefined
  // Highlight the learner's next unit in this course: last location if here, else first incomplete.
  const nextOverall = nextStepUnit(learner)
  const current =
    nextOverall?.programmeId === programmeId
      ? nextOverall.id
      : units.find((u) => unitStatus(getUnitProgress(learner, u.id)) !== 'complete')?.id
  const currentUnit = units.find((u) => u.id === current)
  const anyStarted = units.some((u) => unitStatus(getUnitProgress(learner, u.id)) !== 'notStarted')
  const ctaUnit = currentUnit ?? units[0]
  const ctaLabel = !ctaUnit
    ? ''
    : !currentUnit
      ? t('programme.reviewUnit', { n: ctaUnit.order })
      : anyStarted
        ? t('programme.continueCta')
        : t('programme.startUnit', { n: ctaUnit.order })

  return (
    <div className="container-page grid grid-cols-1 gap-10 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
      {/* Course header: meta, title, summary; progress ring and the one primary action. */}
      <Reveal>
        <header className="motif-tree grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-md lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
          <div className="grid grid-cols-1 content-center gap-5 p-6 md:p-10">
            <ul
              aria-label={t('programme.metaLabel')}
              className="m-0 flex list-none flex-wrap gap-2 p-0"
            >
              <li className={cn(CHIP, 'border-sedra-pale bg-sedra-pale-100 text-ink')}>
                <Layers aria-hidden="true" className="size-4 text-sedra-green" />
                {t('programme.metaUnits', { count: total })}
              </li>
              <li className={cn(CHIP, 'border-border bg-white text-ink')}>
                <Clock aria-hidden="true" className="size-4 text-sedra-green" />
                {t('programme.metaVideos')}
              </li>
            </ul>
            <PageHeading title={name} lead={course ? l(course.title) : undefined} />
            {course ? <p className="m-0 text-ink">{l(course.purpose)}</p> : null}
            <p className="m-0 flex items-start gap-2 text-base text-ink-soft">
              <Clock aria-hidden="true" className="mt-0.5 size-5 shrink-0 text-sedra-green" />
              {t('programme.timeNote')}
            </p>
            <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
              <div className="flex items-center gap-4">
                <ProgressRing value={done / Math.max(1, total)} size={72} stroke={8}>
                  <span aria-hidden="true" className="font-bold text-ink">
                    {done}/{total}
                  </span>
                </ProgressRing>
                <div className="grid">
                  <span className="text-base text-ink-soft">{t('programme.progressHeading')}</span>
                  <span className="font-semibold text-ink">
                    {t('shared.unitsComplete', { done, total })}
                  </span>
                </div>
              </div>
              {ctaUnit ? (
                <Button asChild size="lg" className="shadow-md">
                  <Link to="/courses/$courseId/units/$unitId" params={unitLinkParams(ctaUnit)}>
                    <Play aria-hidden="true" />
                    {ctaLabel}
                    <ArrowRight aria-hidden="true" className="rtl-mirror" />
                  </Link>
                </Button>
              ) : null}
            </div>
          </div>
          {course?.image ? (
            <img
              src={asset(course.image)}
              alt={l(course.imageAlt)}
              width={1200}
              height={896}
              className="order-first aspect-[16/9] size-full object-cover lg:order-none lg:aspect-auto"
            />
          ) : null}
        </header>
      </Reveal>

      <section aria-labelledby="units-heading" className="grid grid-cols-1 gap-5">
        <div className="grid gap-1">
          <h2 id="units-heading" className="m-0 text-2xl md:text-3xl">
            {t('programme.outlineHeading')}
          </h2>
          <p className="m-0 text-ink-soft">{t('programme.pathLead')}</p>
        </div>
        {units.length === 0 ? <p className="m-0">{t('shared.notAvailable')}</p> : null}
        {/* Path: numbered nodes joined by a line. Order and status are also in each card's text. */}
        <ol className="relative m-0 grid list-none gap-5 p-0 before:absolute before:start-[1.375rem] before:top-8 before:bottom-8 before:w-1 before:rounded-full before:bg-sedra-pale before:content-['']">
          {units.map((u) => {
            const status = unitStatus(getUnitProgress(learner, u.id))
            return (
              <li
                key={u.id}
                className="grid max-w-none grid-cols-[3rem_minmax(0,1fr)] gap-3 md:gap-5"
              >
                <div className="pt-5">
                  <PathNode n={u.order} status={status} current={u.id === current} />
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-3">
                  <UnitCard u={u} status={status} current={u.id === current} />
                  {u.id === 'LS01' && !simplified ? (
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-2xl border-2 border-dashed border-sedra-pale bg-white/70 px-4 py-1">
                      <Link
                        to="/resources"
                        hash="ext01"
                        className="inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline underline-offset-4 hover:no-underline"
                      >
                        <ExternalLink aria-hidden="true" className="size-5" />
                        {t('programme.extraVideo')}
                      </Link>
                      <span className="text-base text-ink-soft">
                        {t('programme.extraVideoHint')}
                      </span>
                    </div>
                  ) : null}
                </div>
              </li>
            )
          })}
        </ol>
      </section>

      {simplified || !other ? null : (
        <section
          aria-labelledby="switch-heading"
          className="card-pop grid grid-cols-1 overflow-hidden sm:grid-cols-[minmax(0,14rem)_1fr]"
        >
          {otherCourse?.image ? (
            <img
              src={asset(otherCourse.image)}
              alt=""
              width={1200}
              height={896}
              loading="lazy"
              className="aspect-[16/9] size-full object-cover sm:aspect-auto"
            />
          ) : null}
          <div className="grid grid-cols-1 content-center gap-3 p-5 md:p-6">
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
          </div>
        </section>
      )}
    </div>
  )
}
