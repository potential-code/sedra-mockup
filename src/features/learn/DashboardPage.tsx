import type { ProgrammeId } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  CircleCheck,
  CircleDashed,
  CircleHelp,
  Clock,
  FolderOpen,
  Layers,
  type LucideIcon,
  Play,
  Settings2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { BRAND_CARDS, type BrandCard } from '@/components/admin/AdminUi'
import { DemoTag } from '@/components/learner/DemoTag'
import {
  completedCount,
  courseUnits,
  enrolledProgrammes,
  entryUnit,
  findCourse,
  formatUaeDateTime,
  hasStartedLearning,
  isComplete,
  nextStepUnit,
  PROGRAMME_LABEL_KEY,
  programmeStatus,
  sortByStart,
  UNITS_PER_COURSE,
  uaeDateParts,
  unitLinkParams,
} from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressMeter } from '@/components/learner/ProgressMeter'
import { ProgressRing } from '@/components/learner/ProgressRing'
import { StatusLabel } from '@/components/learner/StatusLabel'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { getCourse, getUnit } from '@/content'
import { BADGE_UNITS, BadgeMedallion } from '@/features/achievements/BadgeMedallion'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { useLearner, usePrefs, useSession } from '@/store/actions'
import { useDb } from '@/store/db'

const LINK =
  'inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline underline-offset-4 hover:no-underline'

function Panel({
  title,
  icon: Icon,
  children,
  className,
}: {
  title: string
  icon: LucideIcon
  children: ReactNode
  className?: string
}) {
  return (
    <section
      className={cn('card-pop grid h-full grid-cols-1 content-start gap-4 p-5 md:p-6', className)}
    >
      <h2 className="m-0 flex items-center gap-3 text-xl">
        <span className="grid size-11 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green">
          <Icon aria-hidden="true" className="size-6" />
        </span>
        <span className="min-w-0">{title}</span>
      </h2>
      {children}
    </section>
  )
}

function StatTile({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: LucideIcon
  label: string
  value: string
  /** Brand gradient card (text colours checked for contrast in BRAND_CARDS). */
  tone: BrandCard
}) {
  return (
    <div className={cn('flex h-full items-center gap-4 rounded-2xl p-5', BRAND_CARDS[tone])}>
      <span className="grid min-w-0 flex-1 gap-0.5">
        <span className="text-base font-semibold">{label}</span>
        <span className="text-2xl leading-tight font-bold">{value}</span>
      </span>
      {/* Large icon on the end side, centred against the text (decorative). */}
      <Icon aria-hidden="true" className="size-14 shrink-0 opacity-90" strokeWidth={1.5} />
    </div>
  )
}

/** A course card opens the unit view directly: it already shows the course details and menu. */
function useCourseLink() {
  const learner = useLearner()
  return (p: ProgrammeId) => {
    const u = entryUnit(learner, p)
    return u
      ? ({ to: '/courses/$courseId/units/$unitId', params: unitLinkParams(u) } as const)
      : ({ to: '/programmes/$programmeId', params: { programmeId: p } } as const)
  }
}

/** First visit (no unit started): the one task is choosing where to start (brief §2, §3). */
function ChooseStart({ programmes }: { programmes: ProgrammeId[] }) {
  const { t } = useTranslation('learner')
  const courseLink = useCourseLink()
  const { l } = useLocalized()
  return (
    <section aria-labelledby="start-heading" className="grid grid-cols-1 gap-4">
      <div className="grid gap-1">
        <h2 id="start-heading" className="m-0 text-2xl md:text-3xl">
          {t('firstRun.taskHeading')}
        </h2>
        <p className="m-0 text-ink-soft">{t('firstRun.taskLead')}</p>
      </div>
      {programmes.length === 0 ? (
        <p className="m-0 rounded-2xl bg-white p-5 shadow-sm">{t('enrolment.none')}</p>
      ) : null}
      <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
        {programmes.map((p, i) => {
          const course = findCourse(p)
          const name = t(`common:${PROGRAMME_LABEL_KEY[p]}`)
          return (
            <li key={p} className="max-w-none">
              <Reveal delay={stagger(i)} className="h-full">
                <article className="card-pop flex h-full flex-col overflow-hidden">
                  {course?.image ? (
                    <img
                      src={asset(course.image)}
                      alt={l(course.imageAlt)}
                      width={1200}
                      height={896}
                      className="aspect-[16/9] w-full object-cover"
                    />
                  ) : null}
                  <div className="grid flex-1 grid-cols-1 content-start gap-3 p-5 md:p-6">
                    <h3 className="m-0 text-2xl">{name}</h3>
                    {course ? (
                      <p className="m-0 font-semibold text-ink">{l(course.title)}</p>
                    ) : null}
                    {course ? <p className="m-0 text-ink-soft">{l(course.purpose)}</p> : null}
                    <p className="m-0 inline-flex w-fit items-center gap-1.5 rounded-full bg-sedra-pale-100 px-3 py-1 text-base font-semibold text-ink">
                      <Layers aria-hidden="true" className="size-4 text-sedra-green" />
                      {t('firstRun.shortUnits', { count: courseUnits(p).length })}
                    </p>
                    <Button asChild size="lg" className="justify-self-start shadow-md">
                      <Link
                        {...courseLink(p)}
                        aria-label={t('firstRun.startLabel', { programme: name })}
                      >
                        <Play aria-hidden="true" />
                        {t('firstRun.start')}
                        <ArrowRight aria-hidden="true" className="rtl-mirror" />
                      </Link>
                    </Button>
                  </div>
                </article>
              </Reveal>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

/** Dashboard (brief §2): Continue learning first; programmes; next session; achievements; Help. */
export function DashboardPage() {
  const { t } = useTranslation('learner')
  const { l, lang } = useLocalized()
  const { persona } = useSession()
  const learner = useLearner()
  const courseLink = useCourseLink()
  const { view } = usePrefs()
  const sessions = useDb((db) => db.sessions)
  const simplified = view === 'simplified'

  // Enrolled programmes only: SEDRA manages enrolment (no self-enrolment).
  const programmes = enrolledProgrammes(learner)
  const started = hasStartedLearning(learner)
  const next = nextStepUnit(learner)
  const allDone =
    !next &&
    programmes.length > 0 &&
    programmes.every((p) => {
      const units = courseUnits(p)
      return units.length > 0 && completedCount(learner, units) === units.length
    })
  const nextSession = sortByStart(
    sessions.filter(
      (s) =>
        s.attendanceStatus === 'upcoming' && !s.cancelled && programmes.includes(s.programmeId),
    ),
  )[0]
  const badges = programmes.includes('life-skills')
    ? BADGE_UNITS.filter((id) => isComplete(learner, id)).length
    : 0
  const name = learner?.displayName || (persona?.id === 'noor' ? l(persona.name) : '')
  const greeting = name ? t('dashboard.welcomeName', { name }) : t('dashboard.welcomeGeneric')

  const totalUnits = programmes.reduce((n, p) => n + courseUnits(p).length, 0)
  const totalDone = programmes.reduce((n, p) => n + completedCount(learner, courseUnits(p)), 0)

  // Hero: the unit Continue learning opens, or the last programme when everything is done.
  const heroProgramme =
    next?.programmeId ??
    (learner?.lastProgramme && programmes.includes(learner.lastProgramme)
      ? learner.lastProgramme
      : (programmes[0] ?? 'life-skills'))
  const heroCourse = next ? getCourse(next.courseId) : findCourse(heroProgramme)
  const heroUnits = courseUnits(heroProgramme)
  const heroDone = completedCount(learner, heroUnits)
  const heroImage = next?.image ?? heroCourse?.image
  const heroAlt = next ? l(next.imageAlt) : heroCourse ? l(heroCourse.imageAlt) : ''
  const lead = next
    ? t('dashboard.nextStep', { unit: l(next.title) })
    : allDone
      ? t('dashboard.allDone')
      : t('dashboard.startStep')
  const session = nextSession ? uaeDateParts(nextSession.startsAt, lang) : null

  if (!started) {
    return (
      <div className="container-page grid grid-cols-1 gap-8 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
        <div className="flex items-center gap-4">
          {persona?.avatar ? (
            <img
              src={asset(persona.avatar)}
              alt=""
              width={72}
              height={72}
              className="size-16 shrink-0 rounded-full object-cover shadow-md ring-4 ring-white md:size-18"
            />
          ) : null}
          <PageHeading title={greeting} pageTitle={t('dashboard.pageTitle')} className="gap-1">
            <p className="m-0 text-lg text-ink-soft md:text-xl">
              {t('firstRun.lead', { count: programmes.length })}
            </p>
          </PageHeading>
        </div>
        <ChooseStart programmes={programmes} />
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <Panel title={t('dashboard.helpHeading')} icon={CircleHelp}>
            <p className="m-0">{t('dashboard.helpBody')}</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/help">{t('dashboard.openHelp')}</Link>
              </Button>
              <Button asChild variant="ghost">
                <Link to="/preferences">
                  <Settings2 aria-hidden="true" />
                  {t('dashboard.prefsLink')}
                </Link>
              </Button>
            </div>
          </Panel>
        </div>
      </div>
    )
  }

  return (
    <div className="container-page grid grid-cols-1 gap-8 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
      {/* Greeting */}
      <div className="flex items-center gap-4">
        {persona?.avatar ? (
          <img
            src={asset(persona.avatar)}
            alt=""
            width={72}
            height={72}
            className="size-16 shrink-0 rounded-full object-cover shadow-md ring-4 ring-white md:size-18"
          />
        ) : null}
        <PageHeading title={greeting} pageTitle={t('dashboard.pageTitle')} className="gap-1">
          <p className="m-0 text-lg text-ink-soft md:text-xl">{lead}</p>
        </PageHeading>
      </div>

      {/* Continue learning hero */}
      <Reveal>
        <section
          aria-labelledby="continue-heading"
          className="grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-lg md:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]"
        >
          {heroImage ? (
            <div className="relative min-h-56 bg-sedra-pale-50 md:min-h-full">
              <img
                src={asset(heroImage)}
                alt={heroAlt}
                width={1200}
                height={896}
                className="absolute inset-0 size-full object-cover"
              />
              {next ? (
                <span className="absolute start-4 top-4 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-base font-semibold text-ink shadow-md">
                  <Play aria-hidden="true" className="size-4 text-sedra-green" />
                  {t('shared.unitOf', { n: next.order, total: UNITS_PER_COURSE })}
                </span>
              ) : null}
            </div>
          ) : null}
          <div className="grid content-center gap-5 p-6 md:p-8 lg:p-10">
            <p className="m-0 inline-flex w-fit items-center gap-2 rounded-full bg-sedra-pale-100 px-3 py-1 text-base font-semibold text-sedra-green">
              <span aria-hidden="true" className="size-2 rounded-full bg-sedra-green" />
              {next
                ? learner?.lastLocation
                  ? t('dashboard.heroEyebrow')
                  : t('dashboard.heroEyebrowStart')
                : t('dashboard.heroDoneTitle')}
            </p>
            <div className="grid gap-1">
              <p className="m-0 text-base font-semibold text-ink-soft">
                {t(`common:${PROGRAMME_LABEL_KEY[heroProgramme]}`)}
                {heroCourse ? ` · ${l(heroCourse.title)}` : null}
              </p>
              <h2 id="continue-heading" className="m-0 text-3xl md:text-4xl">
                {next ? l(next.title) : t('common:continueLearning')}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <ProgressRing value={heroDone / Math.max(1, heroUnits.length)} size={76} stroke={9}>
                <span className="text-lg font-bold text-ink" aria-hidden="true">
                  {heroDone}/{heroUnits.length}
                </span>
              </ProgressRing>
              <div className="grid">
                <span className="text-base text-ink-soft">{t('dashboard.courseProgress')}</span>
                <span className="font-semibold text-ink">
                  {t('shared.unitsComplete', { done: heroDone, total: heroUnits.length })}
                </span>
              </div>
            </div>
            {next ? (
              <Button asChild size="lg" className="w-full justify-center shadow-md sm:w-fit">
                <Link to="/courses/$courseId/units/$unitId" params={unitLinkParams(next)}>
                  <Play aria-hidden="true" />
                  {t('common:continueLearning')}
                  <ArrowRight aria-hidden="true" className="rtl-mirror" />
                </Link>
              </Button>
            ) : (
              <Button asChild size="lg" className="w-full justify-center shadow-md sm:w-fit">
                <Link to="/programmes/$programmeId" params={{ programmeId: heroProgramme }}>
                  <Play aria-hidden="true" />
                  {t('common:continueLearning')}
                  <ArrowRight aria-hidden="true" className="rtl-mirror" />
                </Link>
              </Button>
            )}
          </div>
        </section>
      </Reveal>

      {/* Secondary statistics: hidden in Simplified view (brief §3). */}
      {!simplified ? (
        <section aria-label={t('dashboard.statsLabel')}>
          <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-3">
            <li className="max-w-none">
              <StatTile
                icon={CircleCheck}
                label={t('dashboard.statUnits')}
                value={t('dashboard.statUnitsValue', { done: totalDone, total: totalUnits })}
                tone="forest"
              />
            </li>
            {programmes.includes('life-skills') ? (
              <li className="max-w-none">
                <StatTile
                  icon={Award}
                  label={t('dashboard.statBadges')}
                  value={t('dashboard.statBadgesValue', { count: badges })}
                  tone="brown"
                />
              </li>
            ) : null}
            <li className="max-w-none">
              <StatTile
                icon={CalendarClock}
                label={t('dashboard.statSession')}
                value={session ? `${session.weekday} ${session.day} ${session.month}` : '-'}
                tone="pale"
              />
            </li>
          </ul>
        </section>
      ) : null}

      {/* Programmes */}
      <section aria-labelledby="programmes-heading" className="grid grid-cols-1 gap-4">
        <h2 id="programmes-heading" className="m-0 text-2xl">
          {t('dashboard.programmesHeading')}
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2">
          {programmes.map((p) => {
            const course = findCourse(p)
            const units = courseUnits(p)
            const name = t(`common:${PROGRAMME_LABEL_KEY[p]}`)
            return (
              <li key={p} className="max-w-none">
                <article className="card-pop flex h-full flex-col overflow-hidden">
                  {course?.image ? (
                    <div className="relative">
                      <img
                        src={asset(course.image)}
                        alt=""
                        width={1200}
                        height={896}
                        className="aspect-[16/9] w-full object-cover"
                      />
                      <StatusLabel
                        status={programmeStatus(learner, units)}
                        size="sm"
                        className="absolute start-4 top-4 shadow-md"
                      />
                    </div>
                  ) : null}
                  <div className="grid flex-1 grid-cols-1 content-start gap-4 p-5 md:p-6">
                    <div className="grid gap-0.5">
                      <h3 className="m-0 text-2xl">{name}</h3>
                      {course ? <p className="m-0 text-ink-soft">{l(course.title)}</p> : null}
                    </div>
                    <ProgressMeter done={completedCount(learner, units)} />
                    <Button asChild variant="outline" className="justify-self-start">
                      <Link {...courseLink(p)}>
                        <BookOpen aria-hidden="true" />
                        {t('dashboard.openProgramme', { programme: name })}
                      </Link>
                    </Button>
                  </div>
                </article>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* Next live session as a calendar tile */}
        <Panel title={t('dashboard.sessionHeading')} icon={CalendarClock}>
          {nextSession && session ? (
            <div className="flex items-start gap-4">
              <div
                aria-hidden="true"
                className="grid w-20 shrink-0 overflow-hidden rounded-2xl text-center shadow-md"
              >
                <span className="bg-sedra-green px-2 py-1 text-base font-bold text-white">
                  {session.month}
                </span>
                <span className="bg-white pt-1 text-3xl leading-tight font-bold text-ink">
                  {session.day}
                </span>
                <span className="bg-white pb-2 text-base font-semibold text-ink-soft">
                  {session.weekday}
                </span>
              </div>
              <div className="grid min-w-0 gap-1.5">
                <p className="m-0 font-semibold text-ink">{l(nextSession.title)}</p>
                <p className="m-0 flex items-start gap-1.5 text-base text-ink-soft">
                  <Clock aria-hidden="true" className="mt-1 size-4 shrink-0" />
                  <span>
                    {formatUaeDateTime(nextSession.startsAt, lang)} ({t('shared.uaeTime')})
                  </span>
                </p>
                <DemoTag />
              </div>
            </div>
          ) : (
            <p className="m-0">{t('dashboard.noSession')}</p>
          )}
          <Link to="/sessions" className={LINK}>
            {t('dashboard.allSessions')}
            <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
          </Link>
        </Panel>

        {/* Achievements teaser: static badge outlines (brief §2: no badge animation). */}
        {!simplified && programmes.includes('life-skills') ? (
          <Panel title={t('dashboard.achievementsHeading')} icon={Award}>
            <p className="m-0 font-semibold text-ink">
              {t('dashboard.badgesEarned', { count: badges })}
            </p>
            <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:grid-cols-4">
              {BADGE_UNITS.map((id) => {
                const earned = isComplete(learner, id)
                const unit = getUnit(id)
                const name = unit?.badge ? l(unit.badge) : t(`achievements.badges.${id}`)
                return (
                  <li
                    key={id}
                    className="grid min-w-0 max-w-none grid-cols-1 justify-items-center gap-1"
                  >
                    <BadgeMedallion unitId={id} earned={earned} size="sm" />
                    <span className="sr-only">
                      {earned
                        ? t('dashboard.badgeEarned', { badge: name })
                        : t('dashboard.badgeNotYet', { badge: name })}
                    </span>
                    <span
                      aria-hidden="true"
                      className="inline-flex items-center gap-1 text-base font-semibold text-ink-soft"
                    >
                      {earned ? (
                        <CircleCheck className="size-4 text-success" />
                      ) : (
                        <CircleDashed className="size-4" />
                      )}
                      {t('programme.unitNumber', { n: unit?.order ?? Number(id.slice(2)) })}
                    </span>
                  </li>
                )
              })}
            </ul>
            <Link to="/achievements" className={LINK}>
              {t('dashboard.openAchievements')}
              <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
            </Link>
          </Panel>
        ) : null}

        {!simplified ? (
          <Panel title={t('dashboard.resourcesHeading')} icon={FolderOpen}>
            <p className="m-0">{t('dashboard.resourcesBody')}</p>
            <Link to="/resources" className={LINK}>
              {t('dashboard.openResources')}
              <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
            </Link>
          </Panel>
        ) : null}
        <Panel title={t('dashboard.helpHeading')} icon={CircleHelp}>
          <p className="m-0">{t('dashboard.helpBody')}</p>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link to="/help">{t('dashboard.openHelp')}</Link>
            </Button>
            <Button asChild variant="ghost">
              <Link to="/preferences">
                <Settings2 aria-hidden="true" />
                {t('dashboard.prefsLink')}
              </Link>
            </Button>
          </div>
        </Panel>
      </div>
      {simplified ? (
        <p className="m-0">
          <Link to="/achievements" className={LINK}>
            {t('dashboard.openAchievements')}
          </Link>
        </p>
      ) : null}
    </div>
  )
}
