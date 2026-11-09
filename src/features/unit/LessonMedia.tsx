import type { Unit } from '@shared/types'
import { BookOpen, Clapperboard, Hourglass } from 'lucide-react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { TranscriptPanel } from '@/components/player/TranscriptPanel'
import { VideoPlayer, type VideoPlayerHandle } from '@/components/player/VideoPlayer'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import { usePrefs } from '@/store/actions'
import { DoneControl } from './DoneControl'
import { Storyboard } from './Storyboard'
import { SummaryCard } from './SummaryCard'
import { UnitImage } from './UnitImage'

export type MediaMode = 'watch' | 'read'

interface Props {
  unit: Unit
  done: boolean
  onDone: () => void
  mode: MediaMode
  onModeChange: (m: MediaMode) => void
  playerRef: RefObject<VideoPlayerHandle | null>
  readHeadingRef: RefObject<HTMLHeadingElement | null>
}

/** The produced sample video exists only for LS02/HF01 in English (agreed with Aliya). */
export function videoFor(unit: Unit, lang: 'en' | 'ar') {
  if (unit.mediaStatus !== 'sample' || lang !== 'en') return undefined
  return unit.media?.en
}

/** Learning step 1: Watch or Read (equal routes, brief §4). */
export function LessonMedia({
  unit,
  done,
  onDone,
  mode,
  onModeChange,
  playerRef,
  readHeadingRef,
}: Props) {
  const { t } = useTranslation('unit')
  const { l, lang } = useLocalized()
  const prefs = usePrefs()
  const video = videoFor(unit, lang)
  const narration = unit.scenes.map((s) => s.narration.en).join('\n')

  if (!video) {
    return (
      <div className="flex flex-col gap-6">
        <section
          aria-labelledby={`${unit.id}-pending`}
          className="grid overflow-hidden rounded-3xl border bg-sedra-pale-50 shadow-sm @xl:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]"
        >
          <div className="relative">
            <UnitImage
              src={unit.image}
              alt={l(unit.imageAlt)}
              className="aspect-[4/3] h-full @xl:aspect-auto"
            />
            <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-base font-semibold text-sedra-green shadow-md">
              <Clapperboard aria-hidden="true" className="size-4" />
              {t('pending.chip')}
            </span>
          </div>
          <div className="flex flex-col gap-4 p-5">
            <h3
              id={`${unit.id}-pending`}
              className="m-0 inline-flex items-center gap-2 self-start rounded-full bg-notice-soft px-3 py-1 text-base text-notice ring-1 ring-notice/30"
            >
              <Hourglass aria-hidden="true" className="size-5 shrink-0" />
              {t('pending.title')}
            </h3>
            <p className="m-0 text-lg">
              {unit.mediaStatus === 'sample' ? t('pending.bodyArabic') : t('pending.body')}
            </p>
            <div className="flex flex-col gap-2">
              <p className="m-0 text-base text-ink-soft">
                {t('pending.storyboard', { count: unit.scenes.length })}
              </p>
              {/* Mini timeline of the four scenes (the full storyboard follows below). */}
              <ol aria-hidden="true" className="m-0 grid list-none grid-cols-4 gap-1.5 p-0">
                {unit.scenes.map((s, i) => (
                  <li
                    key={s.time}
                    className="flex max-w-none flex-col gap-1 rounded-xl bg-white px-2 py-1.5 shadow-sm"
                  >
                    <span className="h-1.5 rounded-full bg-sedra-mid" />
                    <span className="text-base font-bold text-ink">{i + 1}</span>
                    <span className="ltr-isolate text-base leading-tight text-ink-soft">
                      {lang === 'ar' ? s.time.replace(/ s$/, ' ث') : s.time}
                    </span>
                  </li>
                ))}
              </ol>
            </div>
            <Button
              type="button"
              size="lg"
              className="self-start shadow-md"
              onClick={() => readHeadingRef.current?.focus()}
            >
              <BookOpen aria-hidden="true" />
              {t('read.action')}
            </Button>
          </div>
        </section>
        <SummaryCard unit={unit} />
        <Storyboard
          ref={readHeadingRef}
          unit={unit}
          done={done}
          onDone={onDone}
          showImage={false}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Two equal routes. Plain toggle buttons so each choice is one Tab stop with a clear state. */}
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 p-0 font-semibold">{t('media.routeLabel')}</legend>
        <div className="grid grid-cols-2 gap-1.5 rounded-2xl bg-sedra-pale-50 p-1.5 ring-1 ring-border">
          {(
            [
              ['watch', Clapperboard, t('media.watch')],
              ['read', BookOpen, t('read.action')],
            ] as const
          ).map(([m, Icon, label]) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => {
                playerRef.current?.pause()
                onModeChange(m)
              }}
              className={cn(
                'inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-xl px-3 text-base font-semibold transition-[background-color,box-shadow,color] duration-200',
                mode === m
                  ? 'bg-sedra-green text-white shadow-md'
                  : 'text-sedra-green hover:bg-white',
              )}
            >
              <Icon aria-hidden="true" className="size-5 shrink-0" />
              {label}
            </button>
          ))}
        </div>
      </fieldset>

      {mode === 'watch' ? (
        <div className="grid gap-5 @2xl:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] @2xl:items-start">
          <VideoPlayer
            ref={playerRef}
            src={video.video}
            captions={video.captions}
            poster={video.poster}
            posterAlt={l(video.posterAlt)}
            label={t('player.label', { title: l(unit.title) })}
            mediaLang="en"
            captionsDefault={prefs.captions}
            onEnded={onDone}
          />
          <div className="flex min-w-0 flex-col gap-4">
            <TranscriptPanel
              lang="en"
              sources={[
                {
                  label: t('common:readTranscript'),
                  path: video.transcript,
                  fallback: narration,
                },
                {
                  label: t('transcript.descriptive'),
                  path: video.descriptiveTranscript,
                  fallback: unit.scenes
                    .map((s) => `${s.visual.en}\n${s.narration.en}`)
                    .join('\n\n'),
                },
              ]}
            />
            <DoneControl
              done={done}
              onDone={onDone}
              doneText={t('media.watchedStatus')}
              actionText={t('media.markWatched')}
            />
            <SummaryCard unit={unit} />
          </div>
        </div>
      ) : (
        <>
          <SummaryCard unit={unit} />
          <Storyboard ref={readHeadingRef} unit={unit} done={done} onDone={onDone} />
        </>
      )}
    </div>
  )
}
