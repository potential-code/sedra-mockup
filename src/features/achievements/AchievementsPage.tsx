import type { LifeSkillsUnitId } from '@shared/types'
import { Award, CircleDashed, Info, Sprout } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  completedCount,
  courseUnits,
  findCourse,
  isComplete,
  PROGRAMME_LABEL_KEY,
  PROGRAMMES,
} from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ProgressMeter } from '@/components/learner/ProgressMeter'
import { getUnit } from '@/content'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import { useLearner } from '@/store/actions'

const BADGE_UNITS: LifeSkillsUnitId[] = ['LS02', 'LS04', 'LS06', 'LS08']

/**
 * Achievements (brief §2, §5): personal milestones; four static Life Skills badges (no sound or
 * animation); Hospitality acknowledgement after HF08. Never a qualification or job-readiness claim.
 */
export function AchievementsPage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const learner = useLearner()
  const hfDone = isComplete(learner, 'HF08')

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <PageHeading
        title={t('achievements.heading')}
        pageTitle={t('achievements.pageTitle')}
        lead={t('achievements.lead')}
      />

      <section aria-labelledby="ach-progress" className="grid grid-cols-1 gap-4">
        <h2 id="ach-progress" className="m-0 text-2xl">
          {t('achievements.progressHeading')}
        </h2>
        <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
          {PROGRAMMES.map((p) => {
            const course = findCourse(p)
            return (
              <li
                key={p}
                className="grid grid-cols-1 gap-2 rounded-2xl border bg-white p-5 shadow-sm"
              >
                <h3 className="m-0 text-xl">{t(`common:${PROGRAMME_LABEL_KEY[p]}`)}</h3>
                {course ? <p className="m-0 text-ink-soft">{l(course.title)}</p> : null}
                <ProgressMeter done={completedCount(learner, courseUnits(p))} />
              </li>
            )
          })}
        </ul>
      </section>

      <section aria-labelledby="ach-badges" className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-1">
          <h2 id="ach-badges" className="m-0 text-2xl">
            {t('achievements.badgesHeading')}
          </h2>
          <p className="m-0">{t('achievements.badgesLead')}</p>
        </div>
        <ul className="m-0 grid list-none gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {BADGE_UNITS.map((id) => {
            const earned = isComplete(learner, id)
            const unit = getUnit(id)
            const name = unit?.badge ? l(unit.badge) : t(`achievements.badges.${id}`)
            const Icon = earned ? Award : CircleDashed
            return (
              <li
                key={id}
                className={cn(
                  'grid content-start justify-items-center gap-2 rounded-2xl border-2 p-5 text-center',
                  earned
                    ? 'border-sedra-green bg-sedra-pale-50'
                    : 'border-dashed border-border bg-white',
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn('size-14', earned ? 'text-sedra-green' : 'text-ink-soft')}
                  strokeWidth={1.5}
                />
                <h3 className="m-0 text-lg">{name}</h3>
                <p className="m-0 text-base font-semibold text-ink">
                  {earned
                    ? t('achievements.earned')
                    : t('achievements.notYet', { n: unit?.order ?? Number(id.slice(2)) })}
                </p>
              </li>
            )
          })}
        </ul>
      </section>

      <section
        aria-labelledby="ach-hf"
        className="grid grid-cols-1 gap-3 rounded-2xl bg-sedra-pale-50 p-5"
      >
        <h2 id="ach-hf" className="m-0 text-2xl">
          {t('achievements.hospitalityHeading')}
        </h2>
        <p className="m-0 flex items-start gap-2 text-lg">
          {hfDone ? (
            <Sprout aria-hidden="true" className="mt-1 size-6 shrink-0 text-sedra-green" />
          ) : null}
          {hfDone ? t('achievements.hospitalityDone') : t('achievements.hospitalityNotYet')}
        </p>
      </section>

      <p className="m-0 flex items-start gap-2 text-base text-ink-soft">
        <Info aria-hidden="true" className="mt-1 size-5 shrink-0" />
        {t('achievements.disclaimer')}
      </p>
    </div>
  )
}
