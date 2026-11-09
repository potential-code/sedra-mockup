import { useNavigate } from '@tanstack/react-router'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Reveal } from '@/components/motion/Reveal'
import { PreferenceControls } from '@/components/preferences/PreferenceControls'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import { setOnboarded } from '@/store/actions'

/**
 * Preferences (brief §2, §3): every choice applies live and persists; no medical details.
 * Reached after first sign-in; the same controls live in the Preferences side panel everywhere.
 */
export function PreferencesPage() {
  const { t } = useTranslation('learner')
  const navigate = useNavigate()
  usePageTitle(t('prefs.pageTitle'))

  return (
    <div className="container-page grid grid-cols-1 gap-6 py-6 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words md:py-8">
      <Reveal>
        <div className="motif-tree grid gap-3 rounded-3xl bg-white p-6 shadow-md md:p-8">
          <h1 className="m-0 text-3xl break-words md:text-4xl">{t('prefs.heading')}</h1>
          <p className="m-0 text-lg text-ink">{t('prefs.lead')}</p>
          <p className="m-0 inline-flex w-fit items-center gap-2 rounded-full bg-success-soft px-3 py-1 text-base font-semibold text-success">
            <Sparkles aria-hidden="true" className="size-4" />
            {t('prefs.liveNote')}
          </p>
        </div>
      </Reveal>

      <form
        className="grid gap-6"
        onSubmit={(e) => {
          e.preventDefault()
          setOnboarded()
          void navigate({ to: '/learn' })
        }}
      >
        <PreferenceControls />

        {/* Sticky save bar: sits above the mobile bottom navigation. */}
        <div className="sticky bottom-[calc(4.75rem+env(safe-area-inset-bottom))] z-30 lg:bottom-4">
          <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-white/95 p-2 shadow-lg ring-1 ring-border backdrop-blur-sm sm:p-4">
            <p className="m-0 flex-1 basis-56 text-base text-ink-soft max-sm:hidden">
              {t('prefs.saveNote')}
            </p>
            <Button
              type="submit"
              size="lg"
              className="ms-auto shadow-md transition-[background-color,scale] active:scale-[0.98] max-sm:w-full"
            >
              {t('prefs.save')}
              <ArrowRight aria-hidden="true" className="rtl-mirror" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
