import { Outlet } from '@tanstack/react-router'
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
import { PageTransition } from '@/components/motion/PageTransition'
import { AppSidebar, type SidebarItem } from './AppSidebar'

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
  const items: SidebarItem[] = ADMIN_NAV.map((n) => ({
    key: n.key,
    label: t(`nav.${n.key}`),
    to: n.to,
    icon: n.icon,
    exact: 'exact' in n,
  }))
  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar
        items={items}
        navLabel={t('shell.navLabel', { defaultValue: 'Admin' })}
        homeTo="/admin"
      />
      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" tabIndex={-1} className="container-page flex-1 py-6 outline-none">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
      </div>
    </div>
  )
}
