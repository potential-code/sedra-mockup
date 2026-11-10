import type { Unit } from '@shared/types'
import { BookOpen, Clapperboard, Hourglass } from 'lucide-react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { VideoPlayer, type VideoPlayerHandle } from '@/components/player/VideoPlayer'
import { Button } from '@/components/ui/button'
import { getUnit } from '@/content'
import { useLocalized } from '@/i18n'
import { usePrefs } from '@/store/actions'
import { UnitImage } from './UnitImage'

/**
 * The produced sample video (LS02/HF01, English audio). In Arabic it plays only when an Arabic
 * caption track exists (LS02 v4); otherwise the Arabic learner gets the Read block.
 */
export function videoFor(unit: Unit, lang: 'en' | 'ar') {
  const v = unit.mediaStatus === 'sample' ? unit.media?.en : undefined
  if (!v) return undefined
  return lang === 'en' || v.captionsAr ? v : undefined
}

/**
 * Demo placeholder until each unit's own video is made: Life Skills units use LS02, every
 * Hospitality unit (HF01 too, until its update arrives) uses HF01. Always labelled as a placeholder.
 */
function placeholderFor(unit: Unit) {
  if (unit.programmeId === 'hospitality') return getUnit('HF01')?.media?.en
  if (unit.id === 'LS02') return undefined
  return getUnit('LS02')?.media?.en
}

/**
 * Learning block 1: the video only (summary and the readable lesson are their own blocks).
 * When the video is still being prepared, a short note points to the Read block instead.
 */
export function VideoBlock({
  unit,
  onEnded,
  onRead,
  playerRef,
}: {
  unit: Unit
  /** Called when the video ends. */
  onEnded: () => void
  /** Opens the Read block (equal route when there is no video yet). */
  onRead: () => void
  playerRef: RefObject<VideoPlayerHandle | null>
}) {
  const { t } = useTranslation('unit')
  const { l, lang } = useLocalized()
  const prefs = usePrefs()
  const placeholder = placeholderFor(unit)
  const video = placeholder ?? videoFor(unit, lang)

  if (!video) {
    return (
      <section
        aria-labelledby={`${unit.id}-pending`}
        className="grid overflow-hidden rounded-3xl border bg-sedra-pale-50 shadow-sm @xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
      >
        <div className="relative">
          <UnitImage
            src={unit.image}
            alt={l(unit.imageAlt)}
            className="aspect-video h-full @xl:aspect-auto"
          />
          <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-base font-semibold text-sedra-green shadow-md">
            <Clapperboard aria-hidden="true" className="size-4" />
            {t('pending.chip')}
          </span>
        </div>
        <div className="flex flex-col justify-center gap-4 p-5">
          <h3
            id={`${unit.id}-pending`}
            className="m-0 inline-flex items-center gap-2 self-start rounded-full bg-notice-soft px-3 py-1 text-base text-notice ring-1 ring-notice/30"
          >
            <Hourglass aria-hidden="true" className="size-5 shrink-0" />
            {t('pending.title')}
          </h3>
          <p className="m-0 text-lg">{t('pending.short')}</p>
          <Button type="button" size="lg" className="self-start shadow-md" onClick={onRead}>
            <BookOpen aria-hidden="true" />
            {t('read.action')}
          </Button>
        </div>
      </section>
    )
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="w-full">
        <VideoPlayer
          ref={playerRef}
          src={video.video}
          captions={video.captions}
          captionsAr={video.captionsAr}
          portrait={video.portrait}
          poster={video.poster}
          posterAlt={l(video.posterAlt)}
          label={t('player.label', { title: l(unit.title) })}
          mediaLang="en"
          captionsDefault={prefs.captions}
          onEnded={onEnded}
        />
      </div>
      {/* The Read block is the text route (voice + what is shown), so no transcript here. */}
      <Button
        type="button"
        variant="link"
        className="min-h-12 self-center text-base"
        onClick={onRead}
      >
        <BookOpen aria-hidden="true" />
        {t('media.preferRead')}
      </Button>
    </div>
  )
}
