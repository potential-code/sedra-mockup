import type { AdminLearner } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  captionCls,
  DemoTag,
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
      <AdminPageHeader title={t('learners.title')} intro={t('learners.intro')}>
        <DemoTag label={t('common.illustrative')} />
      </AdminPageHeader>

      <form
        aria-labelledby="lf-legend"
        onSubmit={(e) => e.preventDefault()}
        className="mb-4 rounded-2xl border bg-sedra-pale-50 p-4"
      >
        <fieldset className="m-0 grid gap-4 border-0 p-0 sm:grid-cols-2">
          <legend id="lf-legend" className="mb-2 text-lg font-bold text-sedra-green">
            {t('learners.filters.legend')}
          </legend>
          <SelectField
            id="filter-programme"
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
            label={t('learners.filters.progress')}
            value={progress}
            onChange={(v) => setProgress(v as ProgressFilter)}
            options={PROGRESS_FILTERS.map((p) => ({
              value: p,
              label: t(`learners.filters.progressOptions.${p}`),
            }))}
          />
        </fieldset>
      </form>

      <p className="mb-3 font-semibold text-ink" aria-live="polite">
        {t('learners.showing', { shown: rows.length, total: learners.length })}
      </p>

      <ul className="m-0 flex list-none flex-col gap-3 p-0 md:hidden">
        {rows.map((l) => (
          <LearnerCard key={l.id} l={l} />
        ))}
      </ul>
      {rows.length === 0 ? <p className="md:hidden">{t('learners.empty')}</p> : null}

      <div className="hidden md:block">
        <TableRegion label={t('learners.tableLabel')}>
          <table className="w-full min-w-[56rem] border-collapse">
            <caption className={captionCls}>{t('learners.caption')}</caption>
            <thead className="border-b bg-sedra-pale-50">
              <tr>
                <th scope="col" className={thCls}>
                  {t('learners.cols.learner')}
                </th>
                <th scope="col" className={thCls}>
                  {t('learners.cols.programmes')}
                </th>
                <th scope="col" className={thCls}>
                  {t('learners.cols.progress')}
                </th>
                <th scope="col" className={thCls}>
                  {t('learners.cols.latest')}
                </th>
                <th scope="col" className={thCls}>
                  {t('learners.cols.checks')}
                </th>
                <th scope="col" className={thCls}>
                  {t('learners.cols.support')}
                </th>
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

function LearnerRow({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  return (
    <tr className="border-b last:border-0">
      <th scope="row" className={`${thCls} align-top`}>
        <Link
          to="/admin/learners/$learnerId"
          params={{ learnerId: l.id }}
          className="inline-flex min-h-12 flex-col justify-center font-semibold text-sedra-green underline underline-offset-4"
        >
          <span className="ltr-isolate">{l.id}</span>
          <span dir="auto">{l.name}</span>
        </Link>
      </th>
      <td className={tdCls}>
        <ul className="m-0 list-none p-0">
          {l.programmes.map((p) => (
            <li key={p}>{t(`programme.${p}`)}</li>
          ))}
        </ul>
      </td>
      <td className={tdCls}>
        <ul className="m-0 list-none p-0">
          {l.programmes.includes('life-skills') ? (
            <li>
              {t('learners.unitsOf', {
                course: t('course.healthy-communication'),
                done: l.unitsCompleted['healthy-communication'] ?? 0,
              })}
            </li>
          ) : null}
          {l.programmes.includes('hospitality') ? (
            <li>
              {t('learners.unitsOf', {
                course: t('course.intro-hospitality'),
                done: l.unitsCompleted['intro-hospitality'] ?? 0,
              })}
            </li>
          ) : null}
        </ul>
      </td>
      <td className={tdCls}>
        <span className="block">{f.dateTime(l.latestActivity)}</span>
        <span className="text-sm text-ink-soft">
          {isActive(l) ? t('learners.activeYes') : t('learners.activeNo')}
        </span>
      </td>
      <td className={tdCls}>
        {t('learners.checksSummary', {
          reviewed: l.checksReviewed,
          firstTry: l.checksCorrectFirstTry,
        })}
      </td>
      <td className={tdCls}>
        {l.supportFlag ? (
          <StatusLabel tone="warning">{t('learners.supportOpen')}</StatusLabel>
        ) : (
          <StatusLabel tone="neutral">{t('learners.supportNone')}</StatusLabel>
        )}
      </td>
    </tr>
  )
}

/** Stacked card for narrow screens (320-767 px): same fields as the table row. */
function LearnerCard({ l }: { l: AdminLearner }) {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  return (
    <li className="max-w-none rounded-2xl border bg-white p-4">
      <h2 className="m-0 text-lg">
        <Link
          to="/admin/learners/$learnerId"
          params={{ learnerId: l.id }}
          className="inline-flex min-h-12 items-center gap-2 text-sedra-green underline underline-offset-4"
        >
          <span className="ltr-isolate">{l.id}</span>
          <span dir="auto">{l.name}</span>
        </Link>
      </h2>
      <dl className="m-0 flex flex-col gap-2">
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.programmes')}</dt>
          <dd className="m-0">{l.programmes.map((p) => t(`programme.${p}`)).join(' · ')}</dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.progress')}</dt>
          {l.programmes.includes('life-skills') ? (
            <dd className="m-0">
              {t('learners.unitsOf', {
                course: t('course.healthy-communication'),
                done: l.unitsCompleted['healthy-communication'] ?? 0,
              })}
            </dd>
          ) : null}
          {l.programmes.includes('hospitality') ? (
            <dd className="m-0">
              {t('learners.unitsOf', {
                course: t('course.intro-hospitality'),
                done: l.unitsCompleted['intro-hospitality'] ?? 0,
              })}
            </dd>
          ) : null}
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.latest')}</dt>
          <dd className="m-0">
            {f.dateTime(l.latestActivity)}
            <span className="block text-sm text-ink-soft">
              {isActive(l) ? t('learners.activeYes') : t('learners.activeNo')}
            </span>
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.checks')}</dt>
          <dd className="m-0">
            {t('learners.checksSummary', {
              reviewed: l.checksReviewed,
              firstTry: l.checksCorrectFirstTry,
            })}
          </dd>
        </div>
        <div>
          <dt className="text-sm font-semibold text-ink-soft">{t('learners.cols.support')}</dt>
          <dd className="m-0">
            {l.supportFlag ? (
              <StatusLabel tone="warning">{t('learners.supportOpen')}</StatusLabel>
            ) : (
              <StatusLabel tone="neutral">{t('learners.supportNone')}</StatusLabel>
            )}
          </dd>
        </div>
      </dl>
    </li>
  )
}
