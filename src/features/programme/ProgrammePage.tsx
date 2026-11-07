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
  Sparkles,
} from 'lucide-react'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
  completedCount,
  courseUnits,
  findCourse,
  isProgrammeId,
  nextStepUnit,
  PROGRAMME_LABEL_KEY,
  PROGRAMMES,
  UNITS_PER_COURSE,
  type UnitStatus,
  unitLinkParams,
  unitStatus,
} from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressBar } from '@/components/learner/ProgressMeter'
import { ProgressRing } from '@/components/learner/ProgressRing'
import { StatusLabel } from '@/components/learner/StatusLabel'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { getUnitProgress, setLastProgramme, useLearner } from '@/store/actions'

const CHIP =
  'inline-flex w-fit items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-sm font-semibold'

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
          <span className="absolute start-3 top-3 inline-flex items-center gap-1 rounded-full bg-sedra-green px-2.5 py-0.5 text-sm font-semibold text-white shadow-md">
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
          variant={status === 'complete' ? 'outline' : 'default'}
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
      <div className="container-page grid grid-cols-1 gap-4 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
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
  const done = completedCount(learner, units)
  const other = PROGRAMMES.find((p) => p !== programmeId) ?? 'life-skills'
  const otherName = t(`common:${PROGRAMME_LABEL_KEY[other]}`)
  const otherCourse = findCourse(other)
  // Highlight the learner's next unit in this course: last location if here, else first incomplete.
  const nextOverall = nextStepUnit(learner)
  const current =
    nextOverall?.programmeId === programmeId
      ? nextOverall.id
      : units.find((u) => unitStatus(getUnitProgress(learner, u.id)) !== 'complete')?.id

  return (
    <div className="container-page grid grid-cols-1 gap-10 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
      {/* Banner: course photo with a SEDRA-green scrim; white text only over the scrim. */}
      <Reveal>
        <div className="relative isolate overflow-hidden rounded-3xl bg-sedra-green-800 shadow-lg">
          {course?.image ? (
            <img
              src={asset(course.image)}
              alt={l(course.imageAlt)}
              width={1200}
              height={896}
              className="aspect-[16/9] w-full object-cover lg:absolute lg:inset-y-0 lg:start-[38%] lg:-z-10 lg:aspect-auto lg:h-full lg:w-[62%]"
            />
          ) : null}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 hidden lg:block lg:ltr:bg-linear-to-r lg:rtl:bg-linear-to-l lg:from-sedra-green-800 lg:from-40% lg:via-sedra-green-800/85 lg:via-55% lg:to-sedra-green-800/0 lg:to-80%"
          />
          <div className="motif-tree-light grid max-w-2xl grid-cols-1 gap-5 p-6 md:p-10">
            <PageHeading tone="inverse" title={name} lead={course ? l(course.title) : undefined} />
            {course ? (
              <section aria-labelledby="purpose-heading" className="grid grid-cols-1 gap-1">
                <h2 id="purpose-heading" className="m-0 text-lg text-white">
                  {t('programme.purposeHeading')}
                </h2>
                <p className="m-0 text-white">{l(course.purpose)}</p>
              </section>
            ) : null}
            <p className="m-0 flex items-start gap-2 text-white">
              <Clock aria-hidden="true" className="mt-1 size-5 shrink-0" />
              {t('programme.timeNote')}
            </p>
            <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/25">
              <ProgressRing value={done / UNITS_PER_COURSE} size={68} stroke={8} tone="inverse">
                <span aria-hidden="true" className="font-bold text-white">
                  {done}/{UNITS_PER_COURSE}
                </span>
              </ProgressRing>
              <div className="grid min-w-0 flex-1 gap-2">
                <p className="m-0 font-semibold text-white">
                  {t('programme.progressHeading')}:{' '}
                  {t('shared.unitsComplete', { done, total: UNITS_PER_COURSE })}
                </p>
                <ProgressBar value={done / UNITS_PER_COURSE} tone="inverse" />
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <section aria-labelledby="units-heading" className="grid grid-cols-1 gap-5">
        <div className="grid gap-1">
          <h2 id="units-heading" className="m-0 text-2xl md:text-3xl">
            {t('programme.unitsHeading')}
          </h2>
          <p className="m-0 text-ink-soft">{t('programme.pathLead')}</p>
        </div>
        {units.length === 0 ? <p className="m-0">{t('shared.notAvailable')}</p> : null}
        {/* Path: numbered nodes joined by a line. Order and status are also in each card's text. */}
        <ol className="relative m-0 grid list-none gap-5 p-0 before:absolute before:start-[1.375rem] before:top-8 before:bottom-8 before:w-1 before:rounded-full before:bg-sedra-pale before:content-['']">
          {units.map((u, i) => {
            const status = unitStatus(getUnitProgress(learner, u.id))
            return (
              <Reveal
                as="li"
                key={u.id}
                delay={stagger(i, 0.04)}
                className="grid max-w-none grid-cols-[3rem_minmax(0,1fr)] gap-3 md:gap-5"
              >
                <div className="pt-5">
                  <PathNode n={u.order} status={status} current={u.id === current} />
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-3">
                  <UnitCard u={u} status={status} current={u.id === current} />
                  {u.id === 'LS01' ? (
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
              </Reveal>
            )
          })}
        </ol>
      </section>

      <Reveal>
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
      </Reveal>
    </div>
  )
}
