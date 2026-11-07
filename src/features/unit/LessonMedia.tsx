import type { Unit } from '@shared/types'
import { BookOpen, CheckCircle2, Clapperboard, Hourglass } from 'lucide-react'
import type { RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { TranscriptPanel } from '@/components/player/TranscriptPanel'
import { VideoPlayer, type VideoPlayerHandle } from '@/components/player/VideoPlayer'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { usePrefs } from '@/store/actions'
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
          className="overflow-hidden rounded-2xl border bg-white"
        >
          <UnitImage src={unit.image} alt={l(unit.imageAlt)} />
          <div className="flex flex-col gap-3 p-4">
            <h3 id={`${unit.id}-pending`} className="m-0 flex items-center gap-2 text-xl">
              <Hourglass aria-hidden="true" className="size-6 shrink-0" />
              {t('pending.title')}
            </h3>
            <p className="m-0">
              {unit.mediaStatus === 'sample' ? t('pending.bodyArabic') : t('pending.body')}
            </p>
            <Button
              type="button"
              className="self-start"
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
    <div className="flex flex-col gap-4">
      {/* Two equal routes. Plain toggle buttons so each choice is one Tab stop with a clear state. */}
      <fieldset className="m-0 grid grid-cols-2 gap-2 border-0 p-0">
        <legend className="mb-2 p-0 font-semibold">{t('media.routeLabel')}</legend>
        {(
          [
            ['watch', Clapperboard, t('media.watch')],
            ['read', BookOpen, t('read.action')],
          ] as const
        ).map(([m, Icon, label]) => (
          <Button
            key={m}
            type="button"
            variant={mode === m ? 'default' : 'outline'}
            aria-pressed={mode === m}
            onClick={() => {
              playerRef.current?.pause()
              onModeChange(m)
            }}
            className="w-full"
          >
            <Icon aria-hidden="true" />
            {label}
          </Button>
        ))}
      </fieldset>

      {mode === 'watch' ? (
        <>
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
          <div className="flex flex-col gap-2">
            <TranscriptPanel
              label={t('common:readTranscript')}
              path={video.transcript}
              fallback={narration}
              lang="en"
            />
            <TranscriptPanel
              label={t('transcript.descriptive')}
              path={video.descriptiveTranscript}
              fallback={unit.scenes.map((s) => `${s.visual.en}\n${s.narration.en}`).join('\n\n')}
              lang="en"
            />
          </div>
          {done ? (
            <p className="m-0 flex items-center gap-2 font-semibold text-success">
              <CheckCircle2 aria-hidden="true" className="size-5" />
              {t('media.watchedStatus')}
            </p>
          ) : (
            <Button type="button" variant="outline" className="self-start" onClick={onDone}>
              <CheckCircle2 aria-hidden="true" />
              {t('media.markWatched')}
            </Button>
          )}
          <SummaryCard unit={unit} />
        </>
      ) : (
        <>
          <SummaryCard unit={unit} />
          <Storyboard ref={readHeadingRef} unit={unit} done={done} onDone={onDone} />
        </>
      )}
    </div>
  )
}
