import { Link, Outlet } from '@tanstack/react-router'
import { Award, FolderOpen } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { enrolledProgrammes, entryUnit } from '@/components/learner/learning'
import { PageTransition } from '@/components/motion/PageTransition'
import { LEARNER_NAV } from '@/config/nav'
import { cn } from '@/lib/utils'
import { useLearner } from '@/store/actions'
import { AppSidebar, type SidebarItem } from './AppSidebar'

/**
 * Learner shell. Desktop: SEDRA-green sidebar. Mobile: top bar with menu + bottom navigation
 * (brief §3: Home, Learn, Sessions, Help, each with icon and text).
 */
export function LearnerShell() {
  const { t } = useTranslation()
  const tl = useTranslation('learner').t
  const learner = useLearner()
  // Learn opens the unit view (it already shows the course details and menu) for the last
  // programme the learner used, else their first enrolled programme.
  const enrolled = enrolledProgrammes(learner)
  const last = learner?.lastProgramme
  const programmeId = last && enrolled.includes(last) ? last : (enrolled[0] ?? 'life-skills')

  const learnUnit = entryUnit(learner, programmeId)
  const learnParams: Record<string, string> = learnUnit
    ? { courseId: learnUnit.courseId, unitId: learnUnit.id }
    : { programmeId }
  const core: SidebarItem[] = LEARNER_NAV.map((item) =>
    item.key === 'learn'
      ? {
          key: item.key,
          label: t(`nav.${item.key}`),
          to: learnUnit ? '/courses/$courseId/units/$unitId' : item.to,
          icon: item.icon,
          params: learnParams,
        }
      : { key: item.key, label: t(`nav.${item.key}`), to: item.to, icon: item.icon },
  )
  const sidebarItems: SidebarItem[] = [
    ...core.slice(0, 3),
    { key: 'resources', label: tl('nav.resources'), to: '/resources', icon: FolderOpen },
    { key: 'achievements', label: tl('nav.achievements'), to: '/achievements', icon: Award },
    ...core.slice(3),
  ]

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      <AppSidebar items={sidebarItems} navLabel={t('nav.label')} homeTo="/learn" />
      <div className="flex min-w-0 flex-1 flex-col">
        <main id="main" tabIndex={-1} className="flex-1 pb-28 outline-none lg:pb-6">
          <PageTransition>
            <Outlet />
          </PageTransition>
        </main>
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
                  // Fluid label size so 'Sessions' never splits mid-word on a narrow phone or at large text.
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-0.5 text-center text-[min(0.875rem,4vw)] leading-tight font-semibold text-ink [overflow-wrap:normal]',
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
