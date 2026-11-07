import { Link, Outlet } from '@tanstack/react-router'
import { Award, FolderOpen, Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { PageTransition } from '@/components/motion/PageTransition'
import { LeafBorder, ValuesBand } from '@/components/shared/Motifs'
import { LEARNER_NAV } from '@/config/nav'
import { cn } from '@/lib/utils'
import { useLearner } from '@/store/actions'
import { AppSidebar, type SidebarItem } from './AppSidebar'
import { DemoBanner } from './DemoControls'

/**
 * Learner shell. Desktop: SEDRA-green sidebar. Mobile: top bar with menu + bottom navigation
 * (brief §3: Home, Learn, Sessions, Help, each with icon and text).
 */
export function LearnerShell() {
  const { t } = useTranslation()
  const tl = useTranslation('learner').t
  const learner = useLearner()
  const programmeId = learner?.lastProgramme ?? 'life-skills'

  const core: SidebarItem[] = LEARNER_NAV.map((item) => ({
    key: item.key,
    label: t(`nav.${item.key}`),
    to: item.to,
    icon: item.icon,
    params: item.key === 'learn' ? { programmeId } : undefined,
  }))
  const sidebarItems: SidebarItem[] = [
    ...core.slice(0, 3),
    { key: 'resources', label: tl('nav.resources'), to: '/resources', icon: FolderOpen },
    { key: 'achievements', label: tl('nav.achievements'), to: '/achievements', icon: Award },
    ...core.slice(3),
    { key: 'preferences', label: t('preferences'), to: '/preferences', icon: Settings2 },
  ]

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar items={sidebarItems} navLabel={t('nav.label')} homeTo="/learn" />
      <div className="flex min-w-0 flex-1 flex-col">
        <DemoBanner />
        <main id="main" tabIndex={-1} className="flex-1 pb-6 outline-none">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
        <footer className="pb-24 lg:pb-0">
          <LeafBorder />
          <ValuesBand />
          <p className="m-0 max-w-none bg-white px-4 py-3 text-center text-sm text-ink-soft">
            {t('footer')}
          </p>
        </footer>
      </div>

      <nav
        aria-label={t('nav.label')}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white pb-[env(safe-area-inset-bottom)] shadow-[0_-6px_20px_rgb(45_64_25/0.1)] lg:hidden"
      >
        <ul className="m-0 grid list-none grid-cols-4 p-0">
          {core.map(({ key, to, params, icon: Icon, label }) => (
            <li key={key} className="max-w-none">
              <Link
                to={to}
                params={params as never}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-sm font-semibold text-ink',
                  'aria-[current=page]:text-sedra-green [&[aria-current=page]_svg]:scale-110',
                )}
              >
                <Icon aria-hidden="true" className="size-6 transition-transform" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
