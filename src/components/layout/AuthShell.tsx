import { Link, Outlet } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Reveal } from '@/components/motion/Reveal'
import { Logo } from '@/components/shared/Logo'
import { LeafBorder, ValuesBand } from '@/components/shared/Motifs'
import { asset } from '@/lib/asset'
import { DemoBanner } from './DemoControls'
import { LanguageSwitch } from './LanguageSwitch'

/**
 * Split-screen sign-in: photo panel with SEDRA green scrim + faint tree motif on one side,
 * the sign-in content on the other. Collapses to a short photo banner on small screens.
 */
export function AuthShell() {
  const { t } = useTranslation('learner')
  return (
    <div className="flex min-h-dvh flex-col">
      <DemoBanner />
      <div className="grid flex-1 grid-cols-1 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <aside className="motif-tree-light relative flex min-h-56 flex-col justify-between overflow-hidden bg-sedra-green-800 p-6 text-white lg:sticky lg:top-0 lg:h-dvh lg:p-10">
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
          <Link
            to="/"
            className="self-start rounded-2xl bg-white px-4 py-2 shadow-lg"
            aria-label={t('home.title')}
          >
            <Logo className="h-14 lg:h-20" />
          </Link>
          <Reveal className="mt-10 grid max-w-md gap-3">
            <p className="m-0 text-3xl font-bold leading-tight text-white lg:text-4xl">
              {t('auth.panelTitle')}
            </p>
            <p className="m-0 text-lg text-white/90">{t('auth.panelBody')}</p>
          </Reveal>
          <div className="mt-8 hidden lg:block">
            <LeafBorder className="opacity-90" />
            <ValuesBand className="rounded-b-xl bg-white/15 backdrop-blur-sm" />
          </div>
        </aside>

        <div className="flex flex-col bg-surface">
          <div className="flex justify-end p-4">
            <LanguageSwitch />
          </div>
          <main id="main" tabIndex={-1} className="flex-1 px-4 pb-10 outline-none md:px-10">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  )
}
