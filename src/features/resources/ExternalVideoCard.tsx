import { Link } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Info } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EXT01 } from '@/content'
import { useLocalized } from '@/i18n'

/**
 * EXT01 (brief §9): responsive embed, titled iframe, no autoplay, visible YouTube fallback and
 * Back to course. Optional; never part of completion. Its subject is not described (not reviewed).
 */
export function ExternalVideoCard() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  return (
    <section
      id="ext01"
      aria-labelledby="ext01-heading"
      className="grid scroll-mt-4 gap-4 rounded-2xl border bg-white p-5 shadow-sm md:p-6"
    >
      <h2 id="ext01-heading" className="m-0 text-2xl">
        {l(EXT01.title)}
      </h2>
      <p className="m-0 flex items-start gap-2 rounded-xl border-2 border-notice bg-notice-soft p-3 font-semibold text-notice">
        <Info aria-hidden="true" className="mt-1 size-5 shrink-0" />
        {t('resources.extLabel')}
      </p>
      <p className="m-0">{t('resources.extNote')}</p>
      <div className="relative aspect-video w-full overflow-hidden rounded-xl bg-ink">
        <iframe
          src={EXT01.embedUrl}
          title={t('resources.extFrameTitle')}
          className="absolute inset-0 size-full border-0"
          loading="lazy"
          referrerPolicy="strict-origin-when-cross-origin"
          allow="encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={EXT01.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-sedra-green px-4 font-semibold text-sedra-green hover:bg-sedra-pale-50"
        >
          <ExternalLink aria-hidden="true" className="size-5" />
          {l(EXT01.fallbackLabel)}
          <span className="sr-only">{t('shared.opensNewTab')}</span>
        </a>
        <Link
          to="/programmes/$programmeId"
          params={{ programmeId: 'life-skills' }}
          className="inline-flex min-h-12 items-center gap-2 rounded-xl px-4 font-semibold text-ink hover:bg-sedra-pale-50"
        >
          <ArrowLeft aria-hidden="true" className="size-5 rtl-mirror" />
          {t('resources.backToCourse')}
        </Link>
      </div>
    </section>
  )
}
