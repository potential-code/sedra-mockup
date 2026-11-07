import { Download, FileBarChart, FileSpreadsheet, PieChart, Table2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  captionCls,
  DemoTag,
  IconCircle,
  Notice,
  Panel,
  TableRegion,
  tdCls,
  thCls,
} from '@/components/admin/AdminUi'
import { EnrolmentChart } from '@/components/admin/EnrolmentChart'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import {
  CSV_FILE_NAME,
  downloadLearnersCsv,
  useAdminLearners,
  useAdminMetrics,
} from '@/store/admin-actions'

/** /admin/reports: summary + simulated CSV export generated in the browser (brief §9). */
export function ReportsPage() {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const m = useAdminMetrics()
  const learners = useAdminLearners()

  const rows = [
    { key: 'enrolled', value: m.enrolled },
    { key: 'lifeSkills', value: m.lifeSkills },
    { key: 'hospitality', value: m.hospitality },
    { key: 'both', value: m.both },
    { key: 'active', value: m.active },
    { key: 'hcCompletions', value: m.hcCompletions },
    { key: 'hfCompletions', value: m.hfCompletions },
    { key: 'openSupport', value: m.openSupport },
  ]

  function onExport() {
    downloadLearnersCsv(learners)
    toast.success(t('reports.exportToast'), { description: t('reports.exportDescription') })
    announce(t('reports.exportToast'))
  }

  return (
    <div>
      <AdminPageHeader title={t('reports.title')} intro={t('reports.intro')} icon={FileBarChart}>
        <DemoTag label={t('common.illustrative')} />
      </AdminPageHeader>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Reveal className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-3">
            <IconCircle icon={Table2} />
            <h2 className="m-0 text-2xl">{t('reports.summaryHeading')}</h2>
          </div>
          <TableRegion label={t('reports.tableLabel')}>
            <table className="w-full border-collapse">
              <caption className={captionCls}>{t('reports.caption')}</caption>
              <thead className="border-b bg-sedra-pale-50">
                <tr>
                  <th scope="col" className={thCls}>
                    {t('reports.cols.measure')}
                  </th>
                  <th scope="col" className={`${thCls} text-end`}>
                    {t('reports.cols.value')}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr
                    key={r.key}
                    className="border-b border-border/60 transition-colors last:border-0 even:bg-sedra-pale-50/50 hover:bg-sedra-pale-100/60"
                  >
                    <th scope="row" className={cn(thCls, 'text-base font-normal')}>
                      {t(`reports.rows.${r.key}`)}
                    </th>
                    <td
                      className={`${tdCls} text-end text-xl font-bold text-sedra-green tabular-nums`}
                    >
                      {f.number(r.value)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </TableRegion>
        </Reveal>

        <div className="flex min-w-0 flex-col gap-6">
          <Reveal delay={0.06}>
            <Panel id="rep-breakdown" title={t('overview.definitionsHeading')} icon={PieChart}>
              <p className="m-0 font-semibold text-ink">{t('overview.countOnce')}</p>
              <EnrolmentChart m={m} compact />
            </Panel>
          </Reveal>

          <Reveal delay={0.12}>
            <section
              aria-labelledby="export-h"
              className="motif-tree-light flex flex-col gap-4 rounded-2xl bg-sedra-green-800 p-5 text-white shadow-lg sm:p-6"
            >
              <div className="flex flex-wrap items-center gap-3">
                <IconCircle icon={FileSpreadsheet} size="lg" className="bg-white/15 text-white" />
                <h2 id="export-h" className="m-0 flex-1 text-2xl text-white">
                  {t('reports.exportHeading')}
                </h2>
                <DemoTag label={t('common.simulated')} />
              </div>
              <p className="m-0 text-white">{t('reports.exportBody', { file: CSV_FILE_NAME })}</p>
              <Notice className="text-ink">
                <p>{t('reports.exportNote')}</p>
              </Notice>
              <div>
                <Button
                  type="button"
                  onClick={onExport}
                  className="bg-white text-sedra-green hover:bg-sedra-pale-100"
                >
                  <Download aria-hidden="true" />
                  {t('reports.export')}
                </Button>
              </div>
            </section>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
