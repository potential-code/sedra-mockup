import type { AdminLearner } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { BarChart3, Filter, Layers, Users } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  Avatar,
  Chip,
  captionCls,
  DemoTag,
  ProgressMini,
  SelectField,
  StatusLabel,
  TableRegion,
  tdCls,
  thCls,
} from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import {
  filterLearners,
  isActive,
  type ProgrammeFilter,
  type ProgressFilter,
  UNITS_PER_COURSE,
  useAdminLearners,
} from '@/store/admin-actions'

const PROGRAMME_FILTERS: ProgrammeFilter[] = ['all', 'life-skills', 'hospitality', 'both']
const PROGRESS_FILTERS: ProgressFilter[] = ['all', 'not-started', 'in-progress', 'completed']

/** /admin/learners: fictional learner table with programme and progress filters (brief §9). */
export function LearnersPage() {
  const { t } = useTranslation('admin')
  const learners = useAdminLearners()
  const [programme, setProgramme] = useState<ProgrammeFilter>('all')
  const [progress, setProgress] = useState<ProgressFilter>('all')
  const rows = filterLearners(learners, programme, progress)

  return (
    <div>
      <AdminPageHeader title={t('learners.title')} intro={t('learners.intro')} icon={Users}>
        <DemoTag label={t('common.illustrative')} />
      </AdminPageHeader>

      <form
        aria-labelledby="lf-legend"
        onSubmit={(e) => e.preventDefault()}
        className="mb-5 rounded-2xl bg-white p-4 shadow-md sm:p-5"
      >
        <fieldset className="m-0 flex flex-col gap-4 border-0 p-0 md:flex-row md:items-end">
          <legend
            id="lf-legend"
            className="mb-3 flex items-center gap-2 text-lg font-bold text-sedra-green"
          >
            <Filter aria-hidden="true" className="size-5" />
            {t('learners.filters.legend')}
          </legend>
          <SelectField
            id="filter-programme"
            pill
            icon={Layers}
            className="md:min-w-64 md:flex-1"
            label={t('learners.filters.programme')}
            value={programme}
            onChange={(v) => setProgramme(v as ProgrammeFilter)}
            options={PROGRAMME_FILTERS.map((p) => ({
              value: p,
              label: t(`learners.filters.programmeOptions.${p}`),
            }))}
          />
          <SelectField
            id="filter-progress"
            pill
            icon={BarChart3}
            className="md:min-w-64 md:flex-1"
            label={t('learners.filters.progress')}
            value={progress}
            onChange={(v) => setProgress(v as ProgressFilter)}
            options={PROGRESS_FILTERS.map((p) => ({
              value: p,
              label: t(`learners.filters.progressOptions.${p}`),
            }))}
          />
          <p
            className="m-0 flex min-h-12 items-center gap-2 rounded-full bg-sedra-pale-100 px-4 font-semibold text-ink md:shrink-0"
            aria-live="polite"
          >
            <Users aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
            {t('learners.showing', { shown: rows.length, total: learners.length })}
          </p>
        </fieldset>
      </form>

      <ul className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
        {rows.map((l) => (
          <li key={l.id} className="max-w-none">
            <LearnerCard l={l} />
          </li>
        ))}
      </ul>
      {rows.length === 0 ? (
        <p className="rounded-2xl bg-white p-5 shadow-sm md:hidden">{t('learners.empty')}</p>
      ) : null}

      <div className="hidden md:block">
        <TableRegion label={t('learners.tableLabel')} className="max-h-[42rem] overflow-y-auto">
          <table className="w-full min-w-[58rem] border-separate border-spacing-0">
            <caption className={captionCls}>{t('learners.caption')}</caption>
            <thead>
              <tr>
                {(
                  ['learner', 'programmes', 'progress', 'latest', 'checks', 'support'] as const
                ).map((c) => (
                  <th
                    key={c}
                    scope="col"
                    className={`${thCls} sticky top-0 z-10 border-b bg-sedra-pale-50 first:ps-5`}
                  >
                    {t(`learners.cols.${c}`)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className={tdCls}>
                    {t('learners.empty')}
                  </td>
                </tr>
              ) : (
                rows.map((l) => <LearnerRow key={l.id} l={l} />)
              )}
            </tbody>
          </table>
        </TableRegion>
      </div>
    </div>
  )
}

function CourseProgress({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  return (
    <div className="flex flex-col gap-2">
      {l.programmes.includes('life-skills') ? (
        <ProgressMini
          value={l.unitsCompleted['healthy-communication'] ?? 0}
          max={UNITS_PER_COURSE}
          label={t('learners.unitsOf', {
            course: t('course.healthy-communication'),
            done: l.unitsCompleted['healthy-communication'] ?? 0,
          })}
        />
      ) : null}
      {l.programmes.includes('hospitality') ? (
        <ProgressMini
          value={l.unitsCompleted['intro-hospitality'] ?? 0}
          max={UNITS_PER_COURSE}
          label={t('learners.unitsOf', {
            course: t('course.intro-hospitality'),
            done: l.unitsCompleted['intro-hospitality'] ?? 0,
          })}
        />
      ) : null}
    </div>
  )
}

function ActiveText({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  const on = isActive(l)
  return (
    <span className="flex items-center gap-1.5 text-sm text-ink-soft">
      <span
        aria-hidden="true"
        className={`size-2.5 shrink-0 rounded-full ${on ? 'bg-sedra-green' : 'border-2 border-ink-soft'}`}
      />
      {on ? t('learners.activeYes') : t('learners.activeNo')}
    </span>
  )
}

function SupportChip({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  return l.supportFlag ? (
    <StatusLabel tone="warning">{t('learners.supportOpen')}</StatusLabel>
  ) : (
    <StatusLabel tone="neutral">{t('learners.supportNone')}</StatusLabel>
  )
}

function LearnerRow({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const cell = `${tdCls} border-b border-border/60 group-last:border-0`
  return (
    <tr className="group transition-colors even:bg-sedra-pale-50/50 hover:bg-sedra-pale-100/60">
      <th
        scope="row"
        className={`${thCls} border-b border-border/60 ps-5 align-top group-last:border-0`}
      >
        <div className="flex items-center gap-3">
          <Avatar name={l.name} />
          <Link
            to="/admin/learners/$learnerId"
            params={{ learnerId: l.id }}
            className="inline-flex min-h-12 min-w-12 flex-col justify-center text-base font-semibold text-sedra-green underline-offset-4 hover:underline"
          >
            <span dir="auto">{l.name}</span>
            <span className="ltr-isolate text-sm font-normal text-ink-soft">{l.id}</span>
          </Link>
        </div>
      </th>
      <td className={cell}>
        <ul className="m-0 flex list-none flex-col items-start gap-1 p-0">
          {l.programmes.map((p) => (
            <li key={p}>
              <Chip>{t(`programme.${p}`)}</Chip>
            </li>
          ))}
        </ul>
      </td>
      <td className={`${cell} min-w-56`}>
        <CourseProgress l={l} />
      </td>
      <td className={cell}>
        <span className="block text-sm font-semibold text-ink">{f.dateTime(l.latestActivity)}</span>
        <ActiveText l={l} />
      </td>
      <td className={`${cell} text-sm`}>
        {t('learners.checksSummary', {
          reviewed: l.checksReviewed,
          firstTry: l.checksCorrectFirstTry,
        })}
      </td>
      <td className={cell}>
        <SupportChip l={l} />
      </td>
    </tr>
  )
}

/** Stacked card for narrow screens (320-767 px): same fields as the table row. */
function LearnerCard({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  return (
    <article aria-labelledby={`lc-${l.id}`} className="card-pop flex flex-col gap-4 p-4">
      <div className="flex items-center gap-3">
        <Avatar name={l.name} />
        <h2 id={`lc-${l.id}`} className="m-0 min-w-0 flex-1 text-lg">
          <Link
            to="/admin/learners/$learnerId"
            params={{ learnerId: l.id }}
            className="inline-flex min-h-12 min-w-12 flex-col justify-center text-sedra-green underline underline-offset-4"
          >
            <span dir="auto">{l.name}</span>
            <span className="ltr-isolate text-sm font-normal text-ink-soft">{l.id}</span>
          </Link>
        </h2>
      </div>
      <dl className="m-0 flex flex-col gap-3">
        <div>
          <dt className="sr-only">{t('learners.cols.programmes')}</dt>
          <dd className="m-0 flex flex-wrap gap-1.5">
            {l.programmes.map((p) => (
              <Chip key={p}>{t(`programme.${p}`)}</Chip>
            ))}
          </dd>
        </div>
        <div>
          <dt className="sr-only">{t('learners.cols.support')}</dt>
          <dd className="m-0">
            <SupportChip l={l} />
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.progress')}</dt>
          <dd className="m-0 mt-1">
            <CourseProgress l={l} />
          </dd>
        </div>
        <div className="grid grid-cols-1 gap-3 rounded-xl bg-sedra-pale-50 p-3 min-[400px]:grid-cols-2">
          <div>
            <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.latest')}</dt>
            <dd className="m-0">
              <span className="block text-sm font-semibold">{f.dateTime(l.latestActivity)}</span>
              <ActiveText l={l} />
            </dd>
          </div>
          <div>
            <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.checks')}</dt>
            <dd className="m-0 text-sm">
              {t('learners.checksSummary', {
                reviewed: l.checksReviewed,
                firstTry: l.checksCorrectFirstTry,
              })}
            </dd>
          </div>
        </div>
      </dl>
    </article>
  )
}
