import { Link, Outlet } from '@tanstack/react-router'
import { Settings2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { LEARNER_NAV } from '@/config/nav'
import { cn } from '@/lib/utils'
import { useLearner } from '@/store/actions'
import { DemoBanner, DemoControls } from './DemoControls'
import { LanguageSwitch } from './LanguageSwitch'

/**
 * Learner shell (brief §3): single column on mobile with bottom navigation
 * (Home, Learn, Sessions, Help: icon + text), same order as a top nav on desktop.
 */
export function LearnerShell() {
  const { t } = useTranslation()
  const learner = useLearner()
  const programmeId = learner?.lastProgramme ?? 'life-skills'

  const navItems = LEARNER_NAV.map((item) => ({
    ...item,
    label: t(`nav.${item.key}`),
    params: item.key === 'learn' ? { programmeId } : undefined,
  }))

  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <header className="border-b bg-white">
        <div className="container-page flex flex-wrap items-center gap-2 py-2">
          <Link to="/learn" className="me-auto rounded-lg" aria-label={t('nav.home')}>
            <Logo className="h-16 md:h-20" />
          </Link>
          <nav aria-label={t('nav.label')} className="hidden md:block">
            <ul className="m-0 flex list-none gap-1 p-0">
              {navItems.map(({ key, to, params, icon: Icon, label }) => (
                <li key={key}>
                  <Link
                    to={to}
                    params={params as never}
                    className="flex min-h-12 items-center gap-2 rounded-xl px-4 font-semibold text-ink hover:bg-sedra-pale-50 aria-[current=page]:bg-sedra-pale-100 aria-[current=page]:text-sedra-green"
                  >
                    <Icon aria-hidden="true" className="size-5" />
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <Button asChild variant="ghost" size="sm">
            <Link to="/preferences">
              <Settings2 aria-hidden="true" />
              <span>{t('preferences')}</span>
            </Link>
          </Button>
          <LanguageSwitch />
          <DemoControls />
        </div>
      </header>

      <main id="main" tabIndex={-1} className="flex-1 pb-28 outline-none md:pb-10">
        <Outlet />
      </main>

      <footer className="hidden border-t py-4 md:block">
        <p className="container-page m-0 max-w-none text-sm text-ink-soft">{t('footer')}</p>
      </footer>

      <nav
        aria-label={t('nav.label')}
        className="fixed inset-x-0 bottom-0 z-40 border-t bg-white pb-[env(safe-area-inset-bottom)] md:hidden"
      >
        <ul className="m-0 grid list-none grid-cols-4 p-0">
          {navItems.map(({ key, to, params, icon: Icon, label }) => (
            <li key={key}>
              <Link
                to={to}
                params={params as never}
                className={cn(
                  'flex min-h-16 flex-col items-center justify-center gap-1 px-1 text-sm font-semibold text-ink',
                  'aria-[current=page]:bg-sedra-pale-100 aria-[current=page]:text-sedra-green',
                )}
              >
                <Icon aria-hidden="true" className="size-6" />
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
