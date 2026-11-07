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

  return (
    <section
      aria-label={label}
      className="overflow-hidden rounded-2xl border bg-ink text-white"
      ref={wrapRef}
    >
      <div className={cn('flex justify-center bg-black', fullscreen && 'h-[calc(100%-8rem)]')}>
        <video
          ref={videoRef}
          className={cn('block h-auto max-h-[60vh] w-auto max-w-full', fullscreen && 'max-h-full')}
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
      </div>

      {/* Player controls keep their order in RTL (brief §4: do not mirror player controls). */}
      <div dir="ltr" className="flex flex-col gap-2 bg-ink p-3">
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
            className="h-12 min-w-0 flex-1 accent-white"
          />
          <span id={`${ids}-time`} className="shrink-0 text-base tabular-nums">
            <span className="sr-only">{t('player.time')} </span>
            {formatTime(time)} / {formatTime(duration)}
          </span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            ref={playRef}
            type="button"
            size="icon"
            className="bg-white text-ink hover:bg-sedra-pale-100"
            onClick={togglePlay}
            aria-label={playLabel}
          >
            {playing ? <Pause aria-hidden="true" /> : <Play aria-hidden="true" />}
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/15 hover:text-white"
            onClick={replay}
            aria-label={t('player.replay')}
          >
            <RotateCcw aria-hidden="true" />
          </Button>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-white hover:bg-white/15 hover:text-white aria-pressed:bg-white/20"
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
            className="text-white hover:bg-white/15 hover:text-white"
            onClick={() => setMuted((m) => !m)}
            aria-pressed={muted}
            aria-label={t('player.mute')}
          >
            {muted ? <VolumeX aria-hidden="true" /> : <Volume2 aria-hidden="true" />}
          </Button>
          <label htmlFor={`${ids}-vol`} className="sr-only">
            {t('player.volume')}
          </label>
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
            className="h-12 w-24 accent-white"
          />
          <label htmlFor={`${ids}-speed`} className="sr-only">
            {t('player.speed')}
          </label>
          <select
            id={`${ids}-speed`}
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            className="min-h-12 rounded-xl border border-white/60 bg-ink px-3 text-base text-white"
          >
            {SPEEDS.map((s) => (
              <option key={s} value={s}>
                {s}×
              </option>
            ))}
          </select>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="ms-auto text-white hover:bg-white/15 hover:text-white"
            onClick={toggleFullscreen}
            aria-label={fullscreen ? t('player.exitFullscreen') : t('player.fullscreen')}
          >
            {fullscreen ? <Minimize aria-hidden="true" /> : <Maximize aria-hidden="true" />}
          </Button>
        </div>
      </div>
    </section>
  )
})
