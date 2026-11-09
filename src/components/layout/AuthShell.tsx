import { Link, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import treeWhite from '@/assets/motifs/motif-tree-white.png'
import { Reveal } from '@/components/motion/Reveal'
import { PreferencesButton } from '@/components/preferences/PreferencesButton'
import { Logo } from '@/components/shared/Logo'
import { asset } from '@/lib/asset'
import { LanguageSwitch } from './LanguageSwitch'

/**
 * Split-screen sign-in: photo panel with SEDRA green scrim (faint tree motif down the end side, clear of the
 * bottom text) on one side,
 * the sign-in content on the other. Collapses to a short photo banner on small screens.
 */
export function AuthShell() {
  const { t } = useTranslation('learner')
  return (
    <div className="flex min-h-dvh flex-col">
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="relative flex min-h-56 flex-col justify-between gap-10 overflow-hidden bg-sedra-green-800 p-6 text-white lg:sticky lg:top-0 lg:h-dvh lg:p-10">
          <img
            src={asset('images/home-hero.webp')}
            alt=""
            className="absolute inset-0 -z-20 size-full object-cover"
          />
          {/* Scrim keeps white text at AA contrast over the photo. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-t from-sedra-green-800 via-sedra-green-800/85 to-sedra-green-800/40"
          />
          {/* Large faint tree down the end side, clear of the text at the bottom (decorative). */}
          <img
            src={treeWhite}
            alt=""
            width={676}
            height={464}
            className="pointer-events-none absolute -end-16 top-[30%] -z-10 hidden w-[min(30vw,28rem)] opacity-10 lg:block"
          />
          <Link to="/" className="self-start rounded-2xl" aria-label={t('home.title')}>
            <Logo variant="white" className="h-20 lg:h-28" />
          </Link>
          <Reveal className="grid max-w-md gap-3">
            <p className="m-0 text-3xl font-bold leading-tight text-white lg:text-4xl">
              {t('auth.panelTitle')}
            </p>
            <p className="m-0 text-lg text-white/90">{t('auth.panelBody')}</p>
          </Reveal>
        </aside>

        <div className="flex flex-col bg-surface">
          <div className="flex flex-wrap justify-end gap-2 p-4">
            <LanguageSwitch />
            <PreferencesButton />
          </div>
          <main id="main" tabIndex={-1} className="flex-1 px-4 pb-10 outline-none md:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
