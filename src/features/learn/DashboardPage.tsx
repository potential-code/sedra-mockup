import { Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Award,
  BookOpen,
  CalendarClock,
  CircleHelp,
  Play,
  Settings2,
} from 'lucide-react'
import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { DemoTag } from '@/components/learner/DemoTag'
import {
  completedCount,
  courseUnits,
  findCourse,
  formatUaeDateTime,
  isComplete,
  nextStepUnit,
  PROGRAMME_LABEL_KEY,
  PROGRAMMES,
  sortByStart,
  unitLinkParams,
} from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressMeter } from '@/components/learner/ProgressMeter'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { useLearner, usePrefs, useSession } from '@/store/actions'
import { useDb } from '@/store/db'

const BADGE_UNITS = ['LS02', 'LS04', 'LS06', 'LS08'] as const

function Panel({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) {
  return (
    <section className="grid grid-cols-1 content-start gap-3 rounded-2xl border bg-white p-5 shadow-sm">
      <h2 className="m-0 flex items-center gap-2 text-xl">
        {icon}
        {title}
      </h2>
      {children}
    </section>
  )
}

/** Dashboard (brief §2): Continue learning first; programmes; next session; achievements; Help. */
export function DashboardPage() {
  const { t } = useTranslation('learner')
  const { l, lang } = useLocalized()
  const { persona } = useSession()
  const learner = useLearner()
  const { view } = usePrefs()
  const sessions = useDb((db) => db.sessions)
  const simplified = view === 'simplified'

  const next = nextStepUnit(learner)
  const allDone =
    !next &&
    PROGRAMMES.every((p) => {
      const units = courseUnits(p)
      return units.length > 0 && completedCount(learner, units) === units.length
    })
  const nextSession = sortByStart(sessions.filter((s) => s.attendanceStatus === 'upcoming'))[0]
  const badges = BADGE_UNITS.filter((id) => isComplete(learner, id)).length
  const greeting =
    persona?.id === 'noor'
      ? t('dashboard.welcomeName', { name: l(persona.name) })
      : t('dashboard.welcomeGeneric')

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <div className="grid grid-cols-1 gap-4 rounded-2xl bg-sedra-pale-50 p-5 md:p-8">
        <PageHeading title={greeting} pageTitle={t('dashboard.pageTitle')} />
        <p className="m-0 text-xl text-ink">
          {next
            ? t('dashboard.nextStep', { unit: l(next.title) })
            : allDone
              ? t('dashboard.allDone')
              : t('dashboard.startStep')}
        </p>
        {next ? (
          <Button asChild size="lg" className="justify-self-start">
            <Link to="/courses/$courseId/units/$unitId" params={unitLinkParams(next)}>
              <Play aria-hidden="true" />
              {t('common:continueLearning')}
            </Link>
          </Button>
        ) : (
          <Button asChild size="lg" className="justify-self-start">
            <Link
              to="/programmes/$programmeId"
              params={{ programmeId: learner?.lastProgramme ?? 'life-skills' }}
            >
              <Play aria-hidden="true" />
              {t('common:continueLearning')}
            </Link>
          </Button>
        )}
      </div>

      <section aria-labelledby="programmes-heading" className="grid grid-cols-1 gap-4">
        <h2 id="programmes-heading" className="m-0 text-2xl">
          {t('dashboard.programmesHeading')}
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {PROGRAMMES.map((p) => {
            const course = findCourse(p)
            const units = courseUnits(p)
            const name = t(`common:${PROGRAMME_LABEL_KEY[p]}`)
            return (
              <li
                key={p}
                className="grid grid-cols-1 content-start gap-3 rounded-2xl border bg-white p-5 shadow-sm"
              >
                <h3 className="m-0 text-xl">{name}</h3>
                {course ? <p className="m-0 text-ink-soft">{l(course.title)}</p> : null}
                <ProgressMeter done={completedCount(learner, units)} />
                <Button asChild variant="outline" className="justify-self-start">
                  <Link to="/programmes/$programmeId" params={{ programmeId: p }}>
                    <BookOpen aria-hidden="true" />
                    {t('dashboard.openProgramme', { programme: name })}
                  </Link>
                </Button>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Panel
          title={t('dashboard.sessionHeading')}
          icon={<CalendarClock aria-hidden="true" className="size-6" />}
        >
          {nextSession ? (
            <>
              <p className="m-0 font-semibold">{l(nextSession.title)}</p>
              <p className="m-0">
                {formatUaeDateTime(nextSession.startsAt, lang)} ({t('shared.uaeTime')})
              </p>
              <DemoTag />
            </>
          ) : (
            <p className="m-0">{t('dashboard.noSession')}</p>
          )}
          <Link
            to="/sessions"
            className="flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline"
          >
            {t('dashboard.allSessions')}
            <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
          </Link>
        </Panel>

        {!simplified ? (
          <Panel
            title={t('dashboard.achievementsHeading')}
            icon={<Award aria-hidden="true" className="size-6" />}
          >
            <p className="m-0">{t('dashboard.badgesEarned', { count: badges })}</p>
            <Link
              to="/achievements"
              className="flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline"
            >
              {t('dashboard.openAchievements')}
              <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
            </Link>
          </Panel>
        ) : null}

        {!simplified ? (
          <Panel
            title={t('dashboard.resourcesHeading')}
            icon={<BookOpen aria-hidden="true" className="size-6" />}
          >
            <p className="m-0">{t('dashboard.resourcesBody')}</p>
            <Link
              to="/resources"
              className="flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline"
            >
              {t('dashboard.openResources')}
              <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
            </Link>
          </Panel>
        ) : null}

        <Panel
          title={t('dashboard.helpHeading')}
          icon={<CircleHelp aria-hidden="true" className="size-6" />}
        >
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
          <Link to="/achievements" className="font-semibold text-sedra-green underline">
            {t('dashboard.openAchievements')}
          </Link>
        </p>
      ) : null}
    </div>
  )
}
