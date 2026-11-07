import { Download } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  captionCls,
  DemoTag,
  Notice,
  TableRegion,
  tdCls,
  thCls,
} from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
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
      <AdminPageHeader title={t('reports.title')} intro={t('reports.intro')}>
        <DemoTag label={t('common.illustrative')} />
      </AdminPageHeader>

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
              <tr key={r.key} className="border-b last:border-0">
                <th scope="row" className={`${thCls} font-normal`}>
                  {t(`reports.rows.${r.key}`)}
                </th>
                <td className={`${tdCls} text-end font-bold`}>{f.number(r.value)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </TableRegion>
      <p className="mt-3 text-sm text-ink-soft">{t('overview.countOnce')}</p>

      <section
        aria-labelledby="export-h"
        className="mt-8 flex flex-col gap-3 rounded-2xl border bg-white p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <h2 id="export-h" className="m-0 text-2xl">
            {t('reports.exportHeading')}
          </h2>
          <DemoTag label={t('common.simulated')} />
        </div>
        <p className="m-0">{t('reports.exportBody', { file: CSV_FILE_NAME })}</p>
        <Notice>
          <p>{t('reports.exportNote')}</p>
        </Notice>
        <div>
          <Button type="button" onClick={onExport}>
            <Download aria-hidden="true" />
            {t('reports.export')}
          </Button>
        </div>
      </section>
    </div>
  )
}
