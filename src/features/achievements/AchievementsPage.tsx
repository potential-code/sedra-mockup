import type { Unit } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Award, CircleCheck, CircleDashed, Flag, Info, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  completedCount,
  courseUnits,
  findCourse,
  isComplete,
  nextStepUnit,
  PROGRAMME_LABEL_KEY,
  PROGRAMMES,
  UNITS_PER_COURSE,
  unitLinkParams,
} from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressMeter } from '@/components/learner/ProgressMeter'
import { ProgressRing } from '@/components/learner/ProgressRing'
import { Reveal } from '@/components/motion/Reveal'
import { getUnit } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { useLearner } from '@/store/actions'
import { BADGE_UNITS, BadgeMedallion } from './BadgeMedallion'

/**
 * Achievements (brief §2, §5): personal milestones; four static Life Skills badges (no sound or
 * animation); Hospitality acknowledgement after HF08. Never a qualification or job-readiness claim.
 */
export function AchievementsPage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const learner = useLearner()
  const hfDone = isComplete(learner, 'HF08')
  const badges = BADGE_UNITS.filter((id) => isComplete(learner, id)).length
  const hfCourse = findCourse('hospitality')
  const hfUnits = courseUnits('hospitality')

  // Journey: finished units in course order, then the next step.
  const finished: Unit[] = PROGRAMMES.flatMap((p) =>
    courseUnits(p).filter((u) => isComplete(learner, u.id)),
  )
  const nextUnit = nextStepUnit(learner)
  const next = nextUnit && !isComplete(learner, nextUnit.id) ? nextUnit : undefined
  const programmeName = (u: Unit) => t(`common:${PROGRAMME_LABEL_KEY[u.programmeId]}`)

  return (
    <div className="container-page grid grid-cols-1 gap-10 py-8 [&_:is(h2,h3,h4)]:break-words [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink">
      {/* Header band */}
      <Reveal>
        <div className="grid grid-cols-1 gap-6 rounded-3xl bg-white p-6 shadow-md md:grid-cols-[1fr_auto] md:items-center md:p-10">
          <PageHeading
            title={t('achievements.heading')}
            pageTitle={t('achievements.pageTitle')}
            lead={t('achievements.lead')}
          />
          <ul
            aria-label={t('achievements.summaryLabel')}
            className="m-0 flex list-none flex-wrap gap-3 p-0"
          >
            <li className="flex max-w-none items-center gap-3 rounded-2xl bg-notice-soft px-4 py-3">
              <Award aria-hidden="true" className="size-7 text-notice" />
              <span className="text-lg font-bold text-ink">
                {t('achievements.badgesCount', { count: badges })}
              </span>
            </li>
            <li className="flex max-w-none items-center gap-3 rounded-2xl bg-success-soft px-4 py-3">
              <CircleCheck aria-hidden="true" className="size-7 text-success" />
              <span className="text-lg font-bold text-ink">
                {t('shared.unitsComplete', {
                  done: finished.length,
                  total: PROGRAMMES.length * UNITS_PER_COURSE,
                })}
              </span>
            </li>
          </ul>
        </div>
      </Reveal>

      {/* Badges: static medallions, no Reveal or hover motion (brief §2). */}
      <section aria-labelledby="ach-badges" className="grid grid-cols-1 gap-5">
        <div className="grid grid-cols-1 gap-1">
          <h2 id="ach-badges" className="m-0 text-2xl md:text-3xl">
            {t('achievements.badgesHeading')}
          </h2>
          <p className="m-0 text-ink-soft">{t('achievements.badgesLead')}</p>
        </div>
        <ul className="m-0 grid list-none grid-cols-2 gap-3 p-0 sm:gap-4 lg:grid-cols-4">
          {BADGE_UNITS.map((id) => {
            const earned = isComplete(learner, id)
            const unit = getUnit(id)
            const n = unit?.order ?? Number(id.slice(2))
            const name = unit?.badge ? l(unit.badge) : t(`achievements.badges.${id}`)
            return (
              <li
                key={id}
                className={cn(
                  'grid min-w-0 max-w-none grid-cols-1 content-start justify-items-center gap-3 rounded-2xl p-3 text-center sm:p-6',
                  earned
                    ? 'bg-white shadow-md ring-2 ring-sedra-green'
                    : 'border-2 border-dashed border-border bg-white/60',
                )}
              >
                <BadgeMedallion unitId={id} earned={earned} />
                <h3 className="m-0 text-lg">{name}</h3>
                <p className="m-0 text-base text-ink-soft">{t('achievements.badgeAfter', { n })}</p>
                <p
                  className={cn(
                    'm-0 inline-flex items-center justify-center gap-1.5 rounded-full border px-3 py-1 text-center text-base font-semibold',
                    earned
                      ? 'border-success bg-success-soft text-success'
                      : 'border-border bg-white text-ink',
                  )}
                >
                  {earned ? (
                    <CircleCheck aria-hidden="true" className="size-5" />
                  ) : (
                    <CircleDashed aria-hidden="true" className="size-5" />
                  )}
                  {earned ? t('achievements.earned') : t('achievements.notYet', { n })}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* Milestone timeline */}
        <section aria-labelledby="ach-journey" className="grid content-start grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-1">
            <h2 id="ach-journey" className="m-0 text-2xl">
              {t('achievements.journeyHeading')}
            </h2>
            <p className="m-0 text-ink-soft">{t('achievements.journeyLead')}</p>
          </div>
          <ol className="relative m-0 grid list-none gap-4 p-0 before:absolute before:start-[1.375rem] before:top-6 before:bottom-6 before:w-1 before:rounded-full before:bg-sedra-pale before:content-['']">
            {finished.length === 0 ? (
              <li className="relative flex max-w-none items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full border-2 border-border bg-white text-ink-soft"
                >
                  <Sprout className="size-6" />
                </span>
                <p className="m-0">{t('achievements.journeyEmpty')}</p>
              </li>
            ) : null}
            {finished.map((u) => (
              <li key={u.id} className="relative flex max-w-none items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-sedra-green text-white shadow-md"
                >
                  {u.badge ? <Award className="size-6" /> : <CircleCheck className="size-6" />}
                </span>
                <div className="grid min-w-0 flex-1 gap-0.5 rounded-2xl bg-white px-4 py-3 shadow-sm">
                  <span className="inline-flex items-center gap-1.5 text-base font-semibold text-success">
                    <CircleCheck aria-hidden="true" className="size-4" />
                    {t('achievements.journeyDone')}
                  </span>
                  <span className="font-semibold text-ink">{l(u.title)}</span>
                  <span className="text-base text-ink-soft">
                    {programmeName(u)} ·{' '}
                    {t('shared.unitOf', { n: u.order, total: UNITS_PER_COURSE })}
                  </span>
                  {u.badge ? (
                    <span className="text-base text-ink">
                      {t('programme.badge', { badge: l(u.badge) })}
                    </span>
                  ) : null}
                </div>
              </li>
            ))}
            {next ? (
              <li className="relative flex max-w-none items-center gap-4">
                <span
                  aria-hidden="true"
                  className="grid size-12 shrink-0 place-items-center rounded-full bg-white text-sedra-green ring-4 ring-sedra-green"
                >
                  <Flag className="size-6" />
                </span>
                <Link
                  to="/courses/$courseId/units/$unitId"
                  params={unitLinkParams(next)}
                  className="group grid min-h-12 min-w-0 flex-1 gap-0.5 rounded-2xl border-2 border-dashed border-sedra-green bg-sedra-pale-50 px-4 py-3 no-underline transition-colors hover:bg-white"
                >
                  <span className="text-base font-semibold text-sedra-green">
                    {t('achievements.journeyNext')}
                  </span>
                  <span className="inline-flex items-center gap-2 font-semibold text-ink underline underline-offset-4 group-hover:no-underline">
                    {l(next.title)}
                    <ArrowRight aria-hidden="true" className="size-5 shrink-0 rtl-mirror" />
                  </span>
                  <span className="text-base text-ink-soft">
                    {programmeName(next)} ·{' '}
                    {t('shared.unitOf', { n: next.order, total: UNITS_PER_COURSE })}
                  </span>
                </Link>
              </li>
            ) : null}
          </ol>
        </section>

        <div className="grid content-start grid-cols-1 gap-6">
          {/* Hospitality completion acknowledgement (no qualification claim). */}
          <section
            aria-labelledby="ach-hf"
            className={cn(
              'grid grid-cols-1 overflow-hidden rounded-3xl shadow-md',
              hfDone ? 'bg-sedra-green-800' : 'bg-white',
            )}
          >
            {hfCourse?.image ? (
              <img
                src={asset(hfCourse.image)}
                alt=""
                width={1200}
                height={896}
                className="aspect-[2/1] w-full object-cover"
              />
            ) : null}
            <div className="grid grid-cols-1 gap-3 p-6">
              <h2 id="ach-hf" className={cn('m-0 text-2xl', hfDone && 'text-white')}>
                {t('achievements.hospitalityHeading')}
              </h2>
              <p
                className={cn(
                  'm-0 flex items-start gap-2 text-lg',
                  hfDone ? 'text-white' : 'text-ink',
                )}
              >
                {hfDone ? <Sprout aria-hidden="true" className="mt-1 size-6 shrink-0" /> : null}
                {hfDone ? t('achievements.hospitalityDone') : t('achievements.hospitalityNotYet')}
              </p>
              {!hfDone ? <ProgressMeter done={completedCount(learner, hfUnits)} /> : null}
            </div>
          </section>

          {/* Course progress */}
          <section aria-labelledby="ach-progress" className="grid grid-cols-1 gap-4">
            <h2 id="ach-progress" className="m-0 text-2xl">
              {t('achievements.progressHeading')}
            </h2>
            <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0">
              {PROGRAMMES.map((p) => {
                const course = findCourse(p)
                const done = completedCount(learner, courseUnits(p))
                return (
                  <li
                    key={p}
                    className="flex max-w-none items-center gap-4 rounded-2xl bg-white p-4 shadow-sm"
                  >
                    <ProgressRing value={done / UNITS_PER_COURSE} size={64} stroke={8}>
                      <span aria-hidden="true" className="font-bold text-ink">
                        {done}/{UNITS_PER_COURSE}
                      </span>
                    </ProgressRing>
                    <div className="grid min-w-0">
                      <h3 className="m-0 text-lg">{t(`common:${PROGRAMME_LABEL_KEY[p]}`)}</h3>
                      {course ? (
                        <span className="text-base text-ink-soft">{l(course.title)}</span>
                      ) : null}
                      <span className="font-semibold text-ink">
                        {t('shared.unitsComplete', { done, total: UNITS_PER_COURSE })}
                      </span>
                    </div>
                  </li>
                )
              })}
            </ul>
          </section>
        </div>
      </div>

      <p className="m-0 flex max-w-none items-start gap-2 rounded-2xl bg-sedra-pale-50 p-4 text-base text-ink">
        <Info aria-hidden="true" className="mt-1 size-5 shrink-0 text-sedra-green" />
        {t('achievements.disclaimer')}
      </p>
    </div>
  )
}
