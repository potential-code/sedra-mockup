import { Bot, Briefcase, Globe2, Handshake, Lightbulb, Lock, Wallet } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  IconCircle,
  Notice,
  StatusLabel,
  type Tint,
} from '@/components/admin/AdminUi'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { cn } from '@/lib/utils'

const OPTIONS = [
  { key: 'ai', icon: Bot, tint: 'info', span: 'lg:col-span-2' },
  { key: 'employer', icon: Briefcase, tint: 'brown', span: '' },
  { key: 'mentorship', icon: Handshake, tint: 'success', span: '' },
  { key: 'membership', icon: Wallet, tint: 'notice', span: '' },
  { key: 'regional', icon: Globe2, tint: 'green', span: '' },
] as const satisfies readonly { key: string; icon: unknown; tint: Tint; span: string }[]

/** /admin/future: admin-only ideas, never learner navigation or prerequisites (brief §1). */
export function FuturePage() {
  const { t } = useTranslation('admin')
  return (
    <div>
      <AdminPageHeader title={t('future.title')} intro={t('future.intro')} icon={Lightbulb}>
        <StatusLabel tone="neutral" icon={Lock}>
          {t('future.adminOnly')}
        </StatusLabel>
      </AdminPageHeader>
      <Notice className="mb-8">
        <p>
          <strong>{t('future.notCore')}</strong> {t('future.note')}
        </p>
      </Notice>
      <ul className="m-0 grid list-none gap-5 p-0 sm:grid-cols-2 lg:grid-cols-4">
        {OPTIONS.map(({ key, icon, tint, span }, i) => (
          <Reveal
            as="li"
            key={key}
            delay={stagger(i)}
            className={cn('max-w-none', span, i >= 3 && 'lg:col-span-2')}
          >
            <article
              aria-labelledby={`fo-${key}`}
              className="card-pop motif-tree flex h-full flex-col gap-3 p-6"
            >
              <IconCircle icon={icon} tint={tint} size="lg" />
              <h2 id={`fo-${key}`} className="m-0 text-xl">
                {t(`future.options.${key}.title`)}
              </h2>
              <p className="m-0 text-ink">{t(`future.options.${key}.body`)}</p>
              <div className="mt-auto pt-2">
                <StatusLabel tone="neutral">{t('future.notCore')}</StatusLabel>
              </div>
            </article>
          </Reveal>
        ))}
      </ul>
    </div>
  )
}
