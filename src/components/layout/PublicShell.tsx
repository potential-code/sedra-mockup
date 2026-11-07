import { Link, Outlet } from '@tanstack/react-router'
import { LogIn } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/shared/Logo'
import { Button } from '@/components/ui/button'
import { DemoBanner } from './DemoControls'
import { LanguageSwitch } from './LanguageSwitch'

export function PublicShell() {
  const { t } = useTranslation('learner')
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <header className="sticky top-0 z-40 bg-white shadow-[0_1px_0_rgb(45_64_25/0.06),0_6px_20px_rgb(45_64_25/0.08)]">
        <div className="container-page flex flex-wrap items-center gap-2 py-2">
          <Link
            to="/"
            className="me-auto rounded-lg"
            aria-label={t('home.title', { defaultValue: 'Home' })}
          >
            <Logo className="h-14 md:h-16" />
          </Link>
          <LanguageSwitch />
          <Button asChild size="sm" className="active:scale-[0.98]">
            <Link to="/welcome">
              <LogIn aria-hidden="true" className="rtl-mirror" />
              <span>{t('home.signIn', { defaultValue: 'Sign in' })}</span>
            </Link>
          </Button>
        </div>
      </header>
      <main id="main" tabIndex={-1} className="flex-1 outline-none">
        <Outlet />
      </main>
      <footer className="bg-white py-4">
        <p className="container-page m-0 max-w-none text-sm text-ink-soft">{t('common:footer')}</p>
      </footer>
    </div>
  )
}
