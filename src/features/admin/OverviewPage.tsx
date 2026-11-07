import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  captionCls,
  DemoTag,
  Notice,
  StatusLabel,
  TableRegion,
  tdCls,
  thCls,
} from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { DEMO_NOW } from '@/mocks/admin-seed'
import { useAdminMetrics, useSupportRequests } from '@/store/admin-actions'

/** /admin: illustrative overview cards computed from the demo db (brief §9). */
export function OverviewPage() {
  const { t } = useTranslation('admin')
  const m = useAdminMetrics()
  const f = useUaeFormat()

  const cards = [
    { key: 'enrolled', value: m.enrolled, to: '/admin/learners' as const },
    { key: 'active', value: m.active, to: '/admin/learners' as const },
    { key: 'hcCompletions', value: m.hcCompletions, to: '/admin/learners' as const },
    { key: 'hfCompletions', value: m.hfCompletions, to: '/admin/learners' as const },
    { key: 'openSupport', value: m.openSupport, to: undefined },
  ]

  return (
    <div>
      <AdminPageHeader title={t('overview.title')} intro={t('overview.intro')}>
        <DemoTag label={t('common.illustrative')} />
      </AdminPageHeader>

      <section aria-labelledby="ov-totals">
        <h2 id="ov-totals" className="sr-only">
          {t('overview.totalsHeading')}
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((c) => (
            <li key={c.key} className="max-w-none rounded-2xl border bg-white p-5">
              <p className="m-0 text-4xl font-bold text-sedra-green">{f.number(c.value)}</p>
              <p className="m-0 mt-1 font-semibold text-ink">{t(`overview.cards.${c.key}`)}</p>
              <p className="m-0 mt-1 text-sm text-ink-soft">{t(`overview.cardHints.${c.key}`)}</p>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ov-defs" className="mt-6 flex flex-col gap-3">
        <h2 id="ov-defs" className="m-0 text-2xl">
          {t('overview.definitionsHeading')}
        </h2>
        <Notice>
          <p>
            <strong>{t('overview.activeTerm')}</strong> {t('overview.activeDefinition')}
          </p>
        </Notice>
        <Notice>
          <p>
            <strong>{t('overview.countOnce')}</strong>
          </p>
          <p className="mt-1 ltr-isolate font-semibold">
            {t('overview.breakdownFormula', {
              ls: m.lifeSkills,
              hf: m.hospitality,
              both: m.both,
              total: m.lifeSkills + m.hospitality - m.both,
            })}
          </p>
          <p className="mt-1">
            {t('overview.breakdownText', {
              ls: m.lifeSkills,
              hf: m.hospitality,
              both: m.both,
              total: m.enrolled,
            })}
          </p>
        </Notice>
      </section>

      <section aria-labelledby="ov-support" className="mt-8 flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <h2 id="ov-support" className="m-0 text-2xl">
            {t('support.heading')}
          </h2>
          <DemoTag />
        </div>
        <p className="m-0 text-ink-soft">{t('support.intro')}</p>
        <SupportTable />
      </section>

      <p className="mt-8">
        <Link
          to="/admin/learners"
          className="inline-flex min-h-12 items-center font-semibold text-sedra-green underline underline-offset-4"
        >
          {t('overview.viewLearners')}
        </Link>
      </p>
      <p className="m-0 text-sm text-ink-soft">
        {t('overview.timeNote', { date: f.dateTime(DEMO_NOW) })}
      </p>
    </div>
  )
}

function SupportTable() {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const requests = useSupportRequests()
  const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  return (
    <TableRegion label={t('support.tableLabel')}>
      <table className="w-full min-w-[40rem] border-collapse">
        <caption className={captionCls}>{t('support.caption')}</caption>
        <thead className="border-b bg-sedra-pale-50">
          <tr>
            <th scope="col" className={thCls}>
              {t('support.cols.request')}
            </th>
            <th scope="col" className={thCls}>
              {t('support.cols.topic')}
            </th>
            <th scope="col" className={thCls}>
              {t('support.cols.learner')}
            </th>
            <th scope="col" className={thCls}>
              {t('support.cols.received')}
            </th>
            <th scope="col" className={thCls}>
              {t('support.cols.status')}
            </th>
          </tr>
        </thead>
        <tbody>
          {sorted.length === 0 ? (
            <tr>
              <td colSpan={5} className={tdCls}>
                {t('support.empty')}
              </td>
            </tr>
          ) : (
            sorted.map((r) => (
              <tr key={r.id} className="border-b last:border-0">
                <th scope="row" className={`${thCls} align-top font-normal`}>
                  <span className="ltr-isolate font-semibold">{r.id}</span>
                  <span className="mt-1 block max-w-80 text-ink-soft" dir="auto">
                    {r.message}
                  </span>
                </th>
                <td className={tdCls}>{t(`support.topics.${r.topic}`)}</td>
                <td className={tdCls}>
                  {r.learnerId?.startsWith('L-') ? (
                    <Link
                      to="/admin/learners/$learnerId"
                      params={{ learnerId: r.learnerId }}
                      className="inline-flex min-h-12 items-center font-semibold text-sedra-green underline underline-offset-4"
                    >
                      <span className="ltr-isolate">{r.learnerId}</span>
                    </Link>
                  ) : (
                    t('support.fromDemoLearner')
                  )}
                </td>
                <td className={tdCls}>{f.dateTime(r.createdAt)}</td>
                <td className={tdCls}>
                  <StatusLabel tone={r.status === 'open' ? 'warning' : 'done'}>
                    {t(`support.status.${r.status}`)}
                  </StatusLabel>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </TableRegion>
  )
}
