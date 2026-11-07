import { Link, Outlet } from '@tanstack/react-router'
import {
  BookOpen,
  CalendarDays,
  FileBarChart,
  FolderOpen,
  LayoutDashboard,
  Lightbulb,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/shared/Logo'
import { DemoBanner, DemoControls } from './DemoControls'
import { LanguageSwitch } from './LanguageSwitch'

/** Admin nav (brief §2 Admin): overview, learners, programmes/content, sessions, resources, reports. */
export const ADMIN_NAV = [
  { key: 'overview', to: '/admin', icon: LayoutDashboard, exact: true },
  { key: 'learners', to: '/admin/learners', icon: Users },
  { key: 'content', to: '/admin/content', icon: BookOpen },
  { key: 'sessions', to: '/admin/sessions', icon: CalendarDays },
  { key: 'resources', to: '/admin/resources', icon: FolderOpen },
  { key: 'reports', to: '/admin/reports', icon: FileBarChart },
  { key: 'future', to: '/admin/future', icon: Lightbulb },
] as const

export function AdminShell() {
  const { t } = useTranslation('admin')
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <header className="border-b bg-white">
        <div className="container-page flex flex-wrap items-center gap-2 py-2">
          <Link
            to="/admin"
            className="me-2 rounded-lg"
            aria-label={t('nav.overview', { defaultValue: 'Overview' })}
          >
            <Logo className="h-16 md:h-20" />
          </Link>
          <p className="m-0 me-auto rounded-lg bg-sedra-pale-100 px-3 py-1 text-sm font-semibold text-ink">
            {t('shell.badge', { defaultValue: 'Admin · demo role' })}
          </p>
          <LanguageSwitch />
          <DemoControls />
        </div>
      </header>
      <div className="container-page flex flex-1 flex-col gap-6 py-6 md:flex-row">
        <nav
          aria-label={t('shell.navLabel', { defaultValue: 'Admin' })}
          className="md:w-60 md:shrink-0"
        >
          <ul className="m-0 flex list-none gap-1 overflow-x-auto p-0 md:flex-col">
            {ADMIN_NAV.map(({ key, to, icon: Icon, ...rest }) => (
              <li key={key} className="shrink-0">
                <Link
                  to={to}
                  activeOptions={{ exact: 'exact' in rest }}
                  className="flex min-h-12 items-center gap-2 rounded-xl px-4 font-semibold text-ink hover:bg-sedra-pale-50 aria-[current=page]:bg-sedra-pale-100 aria-[current=page]:text-sedra-green"
                >
                  <Icon aria-hidden="true" className="size-5" />
                  {t(`nav.${key}`)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <main id="main" tabIndex={-1} className="min-w-0 flex-1 outline-none">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
