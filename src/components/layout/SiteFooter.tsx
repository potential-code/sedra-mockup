import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { PreferencesButton } from '@/components/preferences/PreferencesButton'
import { Logo } from '@/components/shared/Logo'
import { ValuesBand } from '@/components/shared/Motifs'
import { LanguageSwitch } from './LanguageSwitch'

const linkClass =
  'inline-flex min-h-12 items-center font-semibold text-sedra-green underline-offset-4 hover:underline'

/**
 * Footer landmark. `public`: values band + logo, links and language/access controls.
 * `app`: values band + copyright only (signed-in shells already have full navigation).
 * Plain white under the band: no decoration behind footer text.
 */
export function SiteFooter({
  variant = 'app',
  className,
}: {
  variant?: 'public' | 'app'
  className?: string
}) {
  const { t } = useTranslation()
  const year = new Date().getFullYear()
  return (
    <footer className={className}>
      <ValuesBand />
      {variant === 'public' ? (
        <div className="bg-white">
          <div className="container-page grid gap-8 py-10 md:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)_minmax(0,1fr)]">
            <div className="grid content-start gap-3">
              <Link to="/" className="w-fit rounded-lg" aria-label={t('footer.home')}>
                <Logo className="h-20" />
              </Link>
              <p className="m-0 text-ink-soft">{t('footer.about')}</p>
            </div>
            <nav aria-labelledby="footer-explore" className="grid content-start gap-1">
              <h2 id="footer-explore" className="m-0 text-lg">
                {t('footer.explore')}
              </h2>
              <ul className="m-0 grid list-none gap-0 p-0">
                <li>
                  <Link to="/" className={linkClass}>
                    {t('footer.home')}
                  </Link>
                </li>
                <li>
                  <Link to="/" hash="programmes" className={linkClass}>
                    {t('footer.programmes')}
                  </Link>
                </li>
                <li>
                  <Link to="/welcome" className={linkClass}>
                    {t('footer.signIn')}
                  </Link>
                </li>
              </ul>
            </nav>
            <div className="grid content-start gap-3">
              <h2 className="m-0 text-lg">{t('footer.access')}</h2>
              <div className="flex flex-wrap gap-2">
                <LanguageSwitch />
                <PreferencesButton />
              </div>
            </div>
          </div>
          <div className="border-t border-border">
            <div className="container-page py-4">
              <p className="m-0 text-base text-ink-soft">{t('footer.copy', { year })}</p>
            </div>
          </div>
        </div>
      ) : (
        <p className="m-0 max-w-none bg-white px-4 py-3 text-center text-base text-ink-soft">
          {t('footer.copy', { year })}
        </p>
      )}
    </footer>
  )
}
