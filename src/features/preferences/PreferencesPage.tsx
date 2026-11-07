import type { Prefs, TextSize } from '@shared/types'
import { useNavigate } from '@tanstack/react-router'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ChoiceGroup } from '@/components/learner/ChoiceGroup'
import { PageHeading } from '@/components/learner/PageHeading'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { setOnboarded, setPrefs, usePrefs } from '@/store/actions'

type OnOff = 'on' | 'off'

/**
 * Preferences (brief §2, §3): every choice applies live and persists; no medical details.
 * Reached after first sign-in and from the header at any time.
 */
export function PreferencesPage() {
  const { t } = useTranslation('learner')
  const prefs = usePrefs()
  const navigate = useNavigate()

  function change(patch: Partial<Prefs>) {
    setPrefs(patch)
    // Language change re-renders in the new language; announce in that language next frame.
    requestAnimationFrame(() => announce(t('prefs.saved', { lng: patch.lang ?? prefs.lang })))
  }

  const onOff = (v: boolean): OnOff => (v ? 'on' : 'off')

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <PageHeading
        title={t('prefs.heading')}
        pageTitle={t('prefs.pageTitle')}
        lead={t('prefs.lead')}
      >
        <p className="m-0 text-base text-ink-soft">{t('prefs.liveNote')}</p>
      </PageHeading>

      <form
        className="grid max-w-3xl gap-8"
        onSubmit={(e) => {
          e.preventDefault()
          setOnboarded()
          void navigate({ to: '/learn' })
        }}
      >
        <ChoiceGroup
          legend={t('prefs.language')}
          name="lang"
          value={prefs.lang}
          onChange={(lang) => change({ lang })}
          choices={[
            { value: 'en', label: 'English', lang: 'en' },
            { value: 'ar', label: 'العربية', lang: 'ar' },
          ]}
        />
        <ChoiceGroup
          legend={t('prefs.view')}
          name="view"
          value={prefs.view}
          onChange={(view) => change({ view })}
          choices={[
            {
              value: 'standard',
              label: t('prefs.viewStandard'),
              hint: t('prefs.viewStandardHint'),
            },
            {
              value: 'simplified',
              label: t('prefs.viewSimplified'),
              hint: t('prefs.viewSimplifiedHint'),
            },
          ]}
        />
        <ChoiceGroup
          legend={t('prefs.textSize')}
          name="textSize"
          value={String(prefs.textSize) as `${TextSize}`}
          onChange={(v) => change({ textSize: Number(v) as TextSize })}
          choices={(['100', '125', '150'] as const).map((v) => ({ value: v, label: `${v}%` }))}
        />
        <ChoiceGroup
          legend={t('prefs.contrast')}
          name="contrast"
          value={prefs.contrast}
          onChange={(contrast) => change({ contrast })}
          choices={[
            { value: 'standard', label: t('prefs.contrastStandard') },
            { value: 'high', label: t('prefs.contrastHigh') },
          ]}
        />
        <ChoiceGroup
          legend={t('prefs.captions')}
          name="captions"
          value={onOff(prefs.captions)}
          onChange={(v) => change({ captions: v === 'on' })}
          choices={[
            { value: 'on', label: t('prefs.on') },
            { value: 'off', label: t('prefs.off') },
          ]}
        />
        <ChoiceGroup
          legend={t('prefs.motion')}
          name="reducedMotion"
          value={prefs.reducedMotion}
          onChange={(reducedMotion) => change({ reducedMotion })}
          choices={[
            { value: 'system', label: t('prefs.motionSystem') },
            { value: 'on', label: t('prefs.motionOn') },
            { value: 'off', label: t('prefs.motionOff') },
          ]}
        />
        <ChoiceGroup
          legend={t('prefs.readAloud')}
          hint={t('prefs.readAloudHint')}
          name="readAloud"
          value={onOff(prefs.readAloud)}
          onChange={(v) => change({ readAloud: v === 'on' })}
          choices={[
            { value: 'off', label: t('prefs.off') },
            { value: 'on', label: t('prefs.on') },
          ]}
        />
        <div>
          <Button type="submit" size="lg">
            {t('prefs.save')}
            <ArrowRight aria-hidden="true" className="rtl-mirror" />
          </Button>
        </div>
      </form>
    </div>
  )
}
