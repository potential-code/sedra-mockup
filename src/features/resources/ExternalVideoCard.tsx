import { Link } from '@tanstack/react-router'
import { ArrowLeft, ExternalLink, Info, MonitorPlay } from 'lucide-react'
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
      className="grid h-full scroll-mt-4 content-start gap-4 rounded-3xl bg-white p-5 shadow-lg ring-1 ring-border md:p-7"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-sedra-pale-100 text-sedra-green"
        >
          <MonitorPlay className="size-7" />
        </span>
        <div className="grid min-w-0 grid-cols-1 gap-1">
          <h3 id="ext01-heading" className="m-0 text-2xl">
            {l(EXT01.title)}
          </h3>
          <p className="m-0 text-base">{t('resources.extNote')}</p>
        </div>
      </div>
      <p className="m-0 flex items-start gap-2 rounded-xl border-2 border-notice bg-notice-soft p-3 font-semibold text-notice">
        <Info aria-hidden="true" className="mt-1 size-5 shrink-0" />
        {t('resources.extLabel')}
      </p>
      {/* Framed player: dark green mat + deep shadow so the third-party embed reads as a "screen". */}
      <div className="rounded-2xl bg-sedra-green-800 p-2 shadow-pop">
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
      </div>
      <div className="flex flex-wrap gap-2">
        <a
          href={EXT01.originalUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-12 items-center gap-2 rounded-xl border-2 border-sedra-green bg-white px-4 font-semibold text-sedra-green hover:bg-sedra-pale-50 motion-safe:transition-transform motion-safe:active:scale-[0.97]"
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
