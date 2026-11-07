import { useLocation } from '@tanstack/react-router'
import { ChevronDown, Printer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { PageHeading } from '@/components/learner/PageHeading'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/store/actions'
import { ExternalVideoCard } from './ExternalVideoCard'
import { PlaybookCard } from './PlaybookCard'
import { StopThinkDoGuide } from './StopThinkDoGuide'
import { SummaryList } from './SummaryList'

/**
 * Resources (brief §2): Stop Think Do guide, playbook card, searchable summaries, EXT01 card;
 * downloads secondary. Simplified view folds optional cards behind one button.
 */
export function ResourcesPage() {
  const { t } = useTranslation('learner')
  const { view } = usePrefs()
  const hash = useLocation({ select: (s) => s.hash })
  const simplified = view === 'simplified'
  const [showOptional, setShowOptional] = useState(hash === 'ext01')

  useEffect(() => {
    if (hash === 'ext01') {
      setShowOptional(true)
      requestAnimationFrame(() => document.getElementById('ext01')?.scrollIntoView())
    }
  }, [hash])

  const optional = (
    <>
      <PlaybookCard />
      <ExternalVideoCard />
      <section aria-labelledby="print-heading" className="grid grid-cols-1 gap-2">
        <h2 id="print-heading" className="m-0 text-xl">
          {t('resources.downloadsHeading')}
        </h2>
        <p className="m-0 text-base">{t('resources.downloadsBody')}</p>
        <Button variant="outline" className="justify-self-start" onClick={() => window.print()}>
          <Printer aria-hidden="true" />
          {t('resources.print')}
        </Button>
      </section>
    </>
  )

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <PageHeading
        title={t('resources.heading')}
        pageTitle={t('resources.pageTitle')}
        lead={t('resources.lead')}
      />
      <StopThinkDoGuide />
      <SummaryList />
      {simplified ? (
        <div className="grid grid-cols-1 gap-6">
          <Button
            variant="secondary"
            className="justify-self-start"
            aria-expanded={showOptional}
            aria-controls="optional-resources"
            onClick={() => setShowOptional((o) => !o)}
          >
            <ChevronDown aria-hidden="true" className={cn(showOptional && 'rotate-180')} />
            {showOptional ? t('resources.hideOptional') : t('resources.showOptional')}
          </Button>
          <div id="optional-resources" hidden={!showOptional} className="grid grid-cols-1 gap-8">
            {showOptional ? optional : null}
          </div>
        </div>
      ) : (
        optional
      )}
    </div>
  )
}
