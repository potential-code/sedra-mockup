import { Download, FileBarChart, FileSpreadsheet, PieChart, Table2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  BRAND_CARDS,
  DemoTag,
  IconCircle,
  Panel,
} from '@/components/admin/AdminUi'
import { EnrolmentChart } from '@/components/admin/EnrolmentChart'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import {
  CSV_FILE_NAME,
  downloadLearnersCsv,
  useAdminLearners,
  useAdminMetrics,
} from '@/store/admin-actions'

/** /admin/reports: summary + simulated CSV export generated in the browser (brief §9). */
/** Summary cards cycle through the brand gradients (text contrast checked per style). */
const SUMMARY_STYLES = [BRAND_CARDS.forest, BRAND_CARDS.pale, BRAND_CARDS.brown, BRAND_CARDS.cream]

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
      <AdminPageHeader
        title={t('reports.title')}
        intro={t('reports.intro')}
        icon={FileBarChart}
      ></AdminPageHeader>

      <Reveal>
        <section
          aria-labelledby="export-h"
          className="motif-tree-light mb-6 flex flex-col gap-4 rounded-2xl bg-sedra-green-800 p-5 text-white shadow-lg sm:p-6"
        >
          <div className="flex flex-wrap items-center gap-3">
            <IconCircle icon={FileSpreadsheet} size="lg" className="text-white" />
            <h2 id="export-h" className="m-0 flex-1 text-2xl text-white">
              {t('reports.exportHeading')}
            </h2>
            <DemoTag label={t('common.simulated')} />
          </div>
          <p className="m-0 text-white">{t('reports.exportBody', { file: CSV_FILE_NAME })}</p>
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

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        <Reveal className="flex min-w-0 flex-col gap-3">
          <div className="flex items-center gap-3">
            <IconCircle icon={Table2} />
            <h2 className="m-0 text-2xl">{t('reports.summaryHeading')}</h2>
          </div>
          <p className="m-0 text-sm text-ink-soft">{t('reports.caption')}</p>
          {/* One card per measure: the value large, the measure in words under it. */}
          <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2">
            {rows.map((r, i) => (
              <li
                key={r.key}
                className={`flex max-w-none flex-col gap-1 rounded-2xl p-4 ${SUMMARY_STYLES[i % SUMMARY_STYLES.length]}`}
              >
                <span className="text-3xl leading-none font-bold tabular-nums">
                  {f.number(r.value)}
                </span>
                <span className="text-base font-semibold">{t(`reports.rows.${r.key}`)}</span>
              </li>
            ))}
          </ul>
        </Reveal>

        <div className="flex min-w-0 flex-col">
          <Reveal delay={0.06}>
            <Panel id="rep-breakdown" title={t('overview.definitionsHeading')} icon={PieChart}>
              <p className="m-0 font-semibold text-ink">{t('overview.countOnce')}</p>
              <EnrolmentChart m={m} compact />
            </Panel>
          </Reveal>
        </div>
      </div>
    </div>
  )
}
