import type { Lang } from '@shared/types'
import {
  Captions,
  CaptionsOff,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react'
import {
  forwardRef,
  useCallback,
  useEffect,
  useId,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'

export interface VideoPlayerHandle {
  pause: () => void
  /** Restart from the beginning. Plays only because the learner asked for it. */
  replay: () => void
  focus: () => void
}

interface Props {
  /** Paths relative to public/. */
  src: string
  captions: string
  poster: string
  posterAlt: string
  /** Accessible name of the player region, e.g. "Video: Stop Think Do". */
  label: string
  /** Language of the media track (only English sample media exists). */
  mediaLang: Lang
  captionsDefault: boolean
  onEnded?: () => void
}

const SPEEDS = [0.75, 1, 1.25] as const

function formatTime(s: number) {
  if (!Number.isFinite(s) || s < 0) return '0:00'
  const m = Math.floor(s / 60)
  const sec = Math.floor(s % 60)
  return `${m}:${sec.toString().padStart(2, '0')}`
}

/**
 * Accessible custom player (brief §3 Media): no autoplay, captions on by default, every
 * control is a labelled native control reachable by keyboard, no keyboard trap. Pauses when
 * the page is hidden or the window loses focus. Player controls are not mirrored in RTL.
 */
export const VideoPlayer = forwardRef<VideoPlayerHandle, Props>(function VideoPlayer(
  { src, captions, poster, posterAlt, label, mediaLang, captionsDefault, onEnded },
  ref,
) {
  const { t } = useTranslation('unit')
  const videoRef = useRef<HTMLVideoElement>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const playRef = useRef<HTMLButtonElement>(null)
  const [playing, setPlaying] = useState(false)
  const [captionsOn, setCaptionsOn] = useState(captionsDefault)
  const [muted, setMuted] = useState(false)
  const [volume, setVolume] = useState(1)
  const [speed, setSpeed] = useState<number>(1)
  const [time, setTime] = useState(0)
  const [duration, setDuration] = useState(30)
  const [fullscreen, setFullscreen] = useState(false)
  const [ended, setEnded] = useState(false)
  const ids = useId()

  const pause = useCallback(() => {
    videoRef.current?.pause()
  }, [])

  const replay = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    v.currentTime = 0
    setEnded(false)
    void v.play().catch(() => {})
  }, [])

  useImperativeHandle(ref, () => ({ pause, replay, focus: () => playRef.current?.focus() }), [
    pause,
    replay,
  ])

  // Captions follow the toggle (default from the learner's preference).
  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    const apply = () => {
      for (const track of Array.from(v.textTracks)) {
        track.mode = captionsOn ? 'showing' : 'hidden'
      }
    }
    apply()
    v.textTracks.addEventListener?.('addtrack', apply)
    return () => v.textTracks.removeEventListener?.('addtrack', apply)
  }, [captionsOn])

  useEffect(() => {
    const v = videoRef.current
    if (!v) return
    v.volume = volume
    v.muted = muted
    v.playbackRate = speed
  }, [volume, muted, speed])

  // Brief §3: all media pauses when a unit loses focus.
  useEffect(() => {
    const onHide = () => {
      if (document.visibilityState === 'hidden') pause()
    }
    document.addEventListener('visibilitychange', onHide)
    window.addEventListener('blur', pause)
    window.addEventListener('pagehide', pause)
    return () => {
      document.removeEventListener('visibilitychange', onHide)
      window.removeEventListener('blur', pause)
      window.removeEventListener('pagehide', pause)
      pause()
    }
  }, [pause])

  useEffect(() => {
    const onFs = () => setFullscreen(document.fullscreenElement === wrapRef.current)
    document.addEventListener('fullscreenchange', onFs)
    return () => document.removeEventListener('fullscreenchange', onFs)
  }, [])

  function togglePlay() {
    const v = videoRef.current
    if (!v) return
    if (v.paused) {
      if (v.ended) v.currentTime = 0
      setEnded(false)
      void v.play().catch(() => {})
    } else {
      v.pause()
    }
  }

  function toggleFullscreen() {
    const el = wrapRef.current
    if (!el) return
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => {})
    else void el.requestFullscreen?.().catch(() => {})
  }

  function seek(value: number) {
    const v = videoRef.current
    if (!v) return
    v.currentTime = value
    setTime(value)
  }

  const playLabel = playing ? t('player.pause') : ended ? t('player.playAgain') : t('player.play')
  const pct = duration > 0 ? Math.min(100, (time / duration) * 100) : 0
  const roundBtn =
    'rounded-full text-white hover:bg-white/15 hover:text-white aria-pressed:bg-white/20'

  return (
    <section
      aria-label={label}
      className={cn(
        'mx-auto w-full max-w-[24rem] overflow-hidden rounded-3xl bg-sedra-green-800 text-white shadow-lg ring-1 ring-black/5',
        fullscreen && 'flex max-w-none flex-col rounded-none',
      )}
      ref={wrapRef}
    >
      <div
        className={cn(
          'relative flex justify-center overflow-hidden bg-black',
          fullscreen && 'min-h-0 flex-1',
        )}
      >
        <video
          ref={videoRef}
          className={cn(
            'block aspect-[9/16] max-h-[68vh] w-full object-contain',
            '[&::cue]:bg-[rgb(0_0_0/0.82)] [&::cue]:text-[1.05em] [&::cue]:leading-snug [&::cue]:text-white',
            fullscreen && 'h-full max-h-none w-auto',
          )}
          src={asset(src)}
          poster={asset(poster)}
          preload="metadata"
          playsInline
          lang={mediaLang}
          aria-label={posterAlt}
          aria-describedby={`${ids}-time`}
          onClick={togglePlay}
          onPlay={() => setPlaying(true)}
          onPause={() => setPlaying(false)}
          onEnded={() => {
            setPlaying(false)
            setEnded(true)
            onEnded?.()
          }}
          onTimeUpdate={(e) => setTime(e.currentTarget.currentTime)}
          onLoadedMetadata={(e) => {
            if (Number.isFinite(e.currentTarget.duration)) setDuration(e.currentTarget.duration)
          }}
        >
          <track
            kind="captions"
            src={asset(captions)}
            srcLang={mediaLang}
            label={t('player.captionsTrack')}
            default={captionsDefault}
          />
        </video>
        {/* Decorative play cue over the paused frame; clicks pass through to the video. */}
        {!playing && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 flex items-center justify-center bg-black/15"
          >
            <span className="flex size-20 items-center justify-center rounded-full bg-white/90 text-sedra-green shadow-pop">
              {ended ? (
                <RotateCcw className="size-9" />
              ) : (
                <Play className="size-9 translate-x-0.5 fill-current" />
              )}
            </span>
          </span>
        )}
        {/* Progress sliver along the bottom of the frame (illustration; the slider below is the control). */}
        <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-white/20">
          <span className="block h-full bg-sedra-lime" style={{ width: `${pct}%` }} />
        </span>
      </div>

      {/* Player controls keep their order in RTL (brief §4: do not mirror player controls). */}
      <div dir="ltr" className="flex flex-col gap-1 px-3 pt-2 pb-3">
        <div className="flex items-center gap-3">
          <label htmlFor={`${ids}-pos`} className="sr-only">
            {t('player.position')}
          </label>
          <input
            id={`${ids}-pos`}
            type="range"
            min={0}
            max={duration}
            step={0.5}
            value={time}
            onChange={(e) => seek(Number(e.target.value))}
            aria-valuetext={t('player.timeOf', {
              current: formatTime(time),
              total: formatTime(duration),
            })}
            className="h-12 min-w-0 flex-1 cursor-pointer accent-white"
          />
          <span id={`${ids}-time`} className="shrink-0 text-base font-semibold tabular-nums">
            <span className="sr-only">{t('player.time')} </span>
            {formatTime(time)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            ref={playRef}
            type="button"
            size="icon"
            className="size-14 rounded-full bg-white text-sedra-green-800 shadow-md hover:bg-sedra-pale-100"
            onClick={togglePlay}
            aria-label={playLabel}
          >
            {playing ? (
              <Pause aria-hidden="true" className="size-6 fill-current" />
            ) : (
              <Play aria-hidden="true" className="size-6 translate-x-0.5 fill-current" />
            )}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={roundBtn}
            onClick={replay}
            aria-label={t('player.replay')}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={roundBtn}
            onClick={() => setCaptionsOn((c) => !c)}
            aria-pressed={captionsOn}
            aria-label={t('player.captions')}
          >
            {captionsOn ? <Captions aria-hidden="true" /> : <CaptionsOff aria-hidden="true" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={roundBtn}
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            aria-label={t('player.mute')}
          >
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className={cn(roundBtn, 'ms-auto')}
            onClick={toggleFullscreen}
            aria-label={fullscreen ? t('player.exitFullscreen') : t('player.fullscreen')}
          >
            {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl bg-black/20 px-3">
          <label htmlFor={`${ids}-vol`} className="sr-only">
            {t('player.volume')}
          </label>
          <Volume2 aria-hidden="true" className="size-5 shrink-0 opacity-80" />
          <input
            id={`${ids}-vol`}
            type="range"
            min={0}
            max={1}
            step={0.1}
            value={muted ? 0 : volume}
            onChange={(e) => {
              setVolume(Number(e.target.value))
              setMuted(Number(e.target.value) === 0)
            }}
            aria-valuetext={`${Math.round((muted ? 0 : volume) * 100)}%`}
            className="h-12 min-w-0 flex-1 basis-24 cursor-pointer accent-white"
          />
          <label htmlFor={`${ids}-speed`} className="sr-only">
            {t('player.speed')}
          </label>
          <Select value={String(speed)} onValueChange={(v) => setSpeed(Number(v))}>
            <SelectTrigger
              id={`${ids}-speed`}
              className="my-1 w-auto min-w-24 rounded-full border-white/50 bg-sedra-green-800 px-4 font-semibold text-white hover:border-white [&_svg]:text-white"
            >
              <SelectValue>{speed}×</SelectValue>
            </SelectTrigger>
            <SelectContent container={fullscreen ? wrapRef.current : null}>
              {SPEEDS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}×
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </section>
  )
})
