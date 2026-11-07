import { Bot, Briefcase, Globe2, Handshake, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader, Notice, StatusLabel } from '@/components/admin/AdminUi'

const OPTIONS = [
  { key: 'ai', icon: Bot },
  { key: 'employer', icon: Briefcase },
  { key: 'mentorship', icon: Handshake },
  { key: 'membership', icon: Wallet },
  { key: 'regional', icon: Globe2 },
] as const

/** /admin/future: admin-only ideas, never learner navigation or prerequisites (brief §1). */
export function FuturePage() {
  const { t } = useTranslation('admin')
  return (
    <div>
      <AdminPageHeader title={t('future.title')} intro={t('future.intro')} />
      <Notice className="mb-6">
        <p>
          <strong>{t('future.notCore')}</strong> {t('future.note')}
        </p>
      </Notice>
      <ul className="m-0 grid list-none gap-4 p-0 md:grid-cols-2">
        {OPTIONS.map(({ key, icon: Icon }) => (
          <li key={key} className="flex max-w-none flex-col gap-2 rounded-2xl border bg-white p-5">
            <h2 className="m-0 flex items-center gap-2 text-xl">
              <Icon aria-hidden="true" className="size-6 shrink-0" />
              {t(`future.options.${key}.title`)}
            </h2>
            <p className="m-0">{t(`future.options.${key}.body`)}</p>
            <StatusLabel tone="neutral">{t('future.notCore')}</StatusLabel>
          </li>
        ))}
      </ul>
    </div>
  )
}
