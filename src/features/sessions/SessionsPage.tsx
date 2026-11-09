import type { Lang, LiveSession, ProgrammeId } from '@shared/types'
import {
  BookOpen,
  CalendarDays,
  Captions,
  CircleSlash,
  Clock,
  ConciergeBell,
  FileText,
  HeartHandshake,
  Hourglass,
  Info,
  Play,
  PlayCircle,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChoiceGroup } from '@/components/learner/ChoiceGroup'
import { DemoTag } from '@/components/learner/DemoTag'
import {
  enrolledProgrammes,
  formatUaeDateTime,
  PROGRAMME_LABEL_KEY,
  sortByStart,
} from '@/components/learner/learning'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { usePageTitle } from '@/hooks/use-page-title'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { useLearner, usePrefs } from '@/store/actions'
import { useDb } from '@/store/db'

type Filter = 'all' | ProgrammeId

const PROGRAMME_ICON = { 'life-skills': BookOpen, hospitality: ConciergeBell } as const
/** Recording thumbnails reuse the programme's opening unit still (decorative). */
const RECORDING_THUMB: Record<ProgrammeId, string> = {
  'life-skills': 'images/units/LS01.webp',
  hospitality: 'images/units/HF01.webp',
}

/** Day / month / weekday / time parts in UAE time for the calendar tile and time chip. */
function uaeParts(iso: string, lang: Lang) {
  const loc = lang === 'ar' ? 'ar-AE' : 'en-AE'
  const d = new Date(iso)
  const f = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(loc, { ...o, timeZone: 'Asia/Dubai' }).format(d)
  return {
    day: f({ day: 'numeric' }),
    month: f({ month: 'short' }),
    weekday: f({ weekday: 'short' }),
    time: f({ hour: 'numeric', minute: '2-digit' }),
  }
}

function ProgrammeChip({ programmeId }: { programmeId: ProgrammeId }) {
  const { t } = useTranslation('learner')
  const Icon = PROGRAMME_ICON[programmeId]
  return (
    <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-sedra-pale-100 px-3 py-1 text-base font-semibold text-ink">
      <Icon aria-hidden="true" className="size-4 text-sedra-green" />
      {t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)}
    </span>
  )
}

/** Time chip: visible time + "UAE time"; full date and time for screen readers. */
function TimeChip({ s }: { s: LiveSession }) {
  const { t } = useTranslation('learner')
  const { lang } = useLocalized()
  const p = uaeParts(s.startsAt, lang)
  return (
    <p className="m-0 inline-flex w-fit flex-wrap items-center gap-x-2 gap-y-0.5 rounded-xl border-2 border-sedra-pale bg-white px-3 py-1.5 font-semibold text-ink">
      <Clock aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
      <span aria-hidden="true">
        {p.weekday} · {p.time}
      </span>
      <span className="text-base font-normal text-ink-soft" aria-hidden="true">
        {t('shared.uaeTime')}
      </span>
      <span className="sr-only">
        {t('sessions.time')}: {formatUaeDateTime(s.startsAt, lang)} ({t('shared.uaeTime')})
      </span>
    </p>
  )
}

function UpcomingCard({ s, primary }: { s: LiveSession; primary: boolean }) {
  const { t } = useTranslation('learner')
  const { l, lang } = useLocalized()
  const p = uaeParts(s.startsAt, lang)
  const cancelled = !!s.cancelled
  return (
    <article
      className={cn(
        'grid h-full grid-cols-[auto_1fr] overflow-hidden rounded-2xl bg-white shadow-md',
        cancelled && 'shadow-sm ring-1 ring-border',
      )}
    >
      {/* Calendar tile: decorative copy of the date that TimeChip reads out in full. */}
      <div
        aria-hidden="true"
        className={cn(
          'flex w-20 flex-col items-center justify-center gap-0.5 px-2 py-5 sm:w-28',
          cancelled ? 'bg-muted text-ink' : 'bg-sedra-green text-white',
        )}
      >
        <span className="text-base font-semibold">{p.weekday}</span>
        <span className="text-4xl leading-none font-bold sm:text-5xl">{p.day}</span>
        <span className="text-base font-semibold">{p.month}</span>
        {cancelled ? null : <span className="mt-2 h-1.5 w-8 rounded-full bg-sedra-lime" />}
      </div>
      <div className="grid min-w-0 content-start gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ProgrammeChip programmeId={s.programmeId} />
          {cancelled ? (
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full border border-destructive bg-white px-3 py-1 text-base font-semibold text-destructive">
              <CircleSlash aria-hidden="true" className="size-4" />
              {t('sessions.cancelled')}
            </span>
          ) : null}
        </div>
        <h3 className="m-0 text-xl">{l(s.title)}</h3>
        <TimeChip s={s} />
        {cancelled ? (
          <p className="m-0 text-base">{t('sessions.cancelledBody')}</p>
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr] gap-2 rounded-xl bg-sedra-pale-50 p-3 text-base">
              <Info aria-hidden="true" className="mt-0.5 size-5 text-sedra-green" />
              <div className="grid gap-0.5">
                <h4 className="m-0 text-base font-bold text-ink">{t('sessions.booking')}</h4>
                <p className="m-0">{t('sessions.bookingBody')}</p>
              </div>
            </div>
            <Button
              size="lg"
              variant={primary ? 'default' : 'outline'}
              className={cn('justify-self-start', primary && 'shadow-md')}
              onClick={() => toast.info(t('sessions.joinToast'))}
            >
              <Video aria-hidden="true" />
              {t('sessions.join')}
              <span className="sr-only">: {l(s.title)}</span>
            </Button>
          </>
        )}
      </div>
    </article>
  )
}

function RecordingCard({ s }: { s: LiveSession }) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  return (
    <article className="grid h-full content-start overflow-hidden rounded-2xl bg-white shadow-md">
      <div className="relative aspect-video overflow-hidden bg-sedra-green-800">
        <img
          src={asset(RECORDING_THUMB[s.programmeId])}
          alt=""
          width={1200}
          height={896}
          loading="lazy"
          className="size-full object-cover opacity-80"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-sedra-green-800/45" />
        {/* Decorative play glyph: the recording is pending, so it is not a control. */}
        <span
          aria-hidden="true"
          className="absolute inset-0 m-auto flex size-16 items-center justify-center rounded-full bg-white/90 text-sedra-green shadow-lg"
        >
          <Play className="ms-1 size-7 fill-current" />
        </span>
        <span className="absolute start-3 top-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-base font-semibold text-notice shadow-md">
          <Hourglass aria-hidden="true" className="size-4" />
          {t('sessions.pendingRecording')}
        </span>
      </div>
      <div className="grid content-start gap-3 p-5">
        <div className="flex flex-wrap items-center gap-2">
          <ProgrammeChip programmeId={s.programmeId} />
        </div>
        <h3 className="m-0 text-xl">{l(s.title)}</h3>
        <TimeChip s={s} />
        <p className="m-0 text-base">{t('sessions.pendingBody')}</p>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0 text-base">
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <Captions aria-hidden="true" className="size-5 text-sedra-green" />
            {t('sessions.captions')}
          </li>
          <li className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1">
            <FileText aria-hidden="true" className="size-5 text-sedra-green" />
            {t('sessions.transcript')}
          </li>
        </ul>
        {/* Plain status, not a control: there is nothing to open until the recording exists. */}
        <p className="m-0 flex items-center gap-2 font-semibold text-notice">
          <Hourglass aria-hidden="true" className="size-5 shrink-0" />
          {t('sessions.recordingNotReady')}
        </p>
      </div>
    </article>
  )
}

function Hero({ next, simplified }: { next: LiveSession | undefined; simplified: boolean }) {
  const { t } = useTranslation('learner')
  const { l, lang } = useLocalized()
  usePageTitle(t('sessions.pageTitle'))
  const p = next ? uaeParts(next.startsAt, lang) : undefined
  return (
    <Reveal
      className={cn(
        'motif-tree grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-md',
        !simplified && 'lg:grid-cols-[1.15fr_1fr]',
      )}
    >
      <div className="grid content-center gap-4 p-6 md:p-10">
        <h1 className="m-0 text-4xl break-words md:text-5xl">{t('sessions.heading')}</h1>
        <p className="m-0 text-lg text-ink">{t('sessions.lead')}</p>
        <p className="m-0 flex w-fit items-start gap-2 rounded-2xl bg-success-soft px-4 py-2 text-base font-semibold text-success">
          <HeartHandshake aria-hidden="true" className="mt-0.5 size-5 shrink-0" />
          {t('sessions.noPenalty')}
        </p>
        {next && p && !simplified ? (
          <div className="mt-2 flex items-center gap-4 rounded-2xl border-2 border-sedra-pale bg-sedra-pale-50 p-3">
            <div
              aria-hidden="true"
              className="flex size-16 shrink-0 flex-col items-center justify-center rounded-xl bg-sedra-green text-white shadow-md"
            >
              <span className="text-2xl leading-none font-bold">{p.day}</span>
              <span className="text-base font-semibold">{p.month}</span>
            </div>
            <div className="grid min-w-0 gap-0.5">
              <p className="m-0 text-base font-bold text-sedra-green">{t('sessions.next')}</p>
              <p className="m-0 font-semibold text-ink">{l(next.title)}</p>
              <p className="m-0 text-base text-ink-soft">
                {formatUaeDateTime(next.startsAt, lang)} ({t('shared.uaeTime')})
              </p>
            </div>
          </div>
        ) : null}
      </div>
      {simplified ? null : (
        <div className="relative min-h-56 lg:min-h-full">
          <img
            src={asset('images/home-hero.webp')}
            alt={t('sessions.heroAlt')}
            width={1600}
            height={893}
            className="absolute inset-0 size-full object-cover"
          />
          <div
            aria-hidden="true"
            className="absolute inset-y-0 start-0 hidden w-24 bg-linear-to-r from-white to-transparent lg:block rtl:bg-linear-to-l"
          />
        </div>
      )}
    </Reveal>
  )
}

/** Sessions (brief §2): programme filter, upcoming and a separate recordings tab; UAE time. */
export function SessionsPage() {
  const { t } = useTranslation('learner')
  const { dir } = useLocalized()
  const allSessions = useDb((db) => db.sessions)
  // Enrolled programmes only (SEDRA manages enrolment).
  const programmes = enrolledProgrammes(useLearner())
  const sessions = allSessions.filter((s) => programmes.includes(s.programmeId))
  const [filter, setFilter] = useState<Filter>('all')
  const [tab, setTab] = useState('upcoming')
  const simplified = usePrefs().view === 'simplified'

  const shown = sortByStart(sessions.filter((s) => filter === 'all' || s.programmeId === filter))
  const upcoming = shown.filter((s) => s.attendanceStatus === 'upcoming')
  const recordings = shown.filter((s) => s.attendanceStatus !== 'upcoming').reverse()
  const next = sortByStart(sessions).find((s) => s.attendanceStatus === 'upcoming' && !s.cancelled)
  const firstOpen = upcoming.find((s) => !s.cancelled)

  const tabClass = cn(
    'h-auto min-h-12 flex-none gap-2 rounded-full px-3 text-base font-semibold whitespace-normal text-ink [overflow-wrap:normal] sm:px-5',
    'hover:bg-sedra-pale-50 data-[state=active]:bg-sedra-green data-[state=active]:text-white data-[state=active]:shadow-md',
    'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink',
  )
  const countClass =
    'rounded-full bg-sedra-pale-100 px-2 text-base text-ink group-data-[state=active]/trigger:bg-white group-data-[state=active]/trigger:text-sedra-green'

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <Hero next={next} simplified={simplified} />

      <div className="rounded-2xl bg-white p-5 shadow-sm md:p-6">
        <ChoiceGroup
          legend={t('sessions.filter')}
          name="programme-filter"
          value={filter}
          onChange={setFilter}
          choices={[
            { value: 'all' as Filter, label: t('sessions.all') },
            ...programmes.map((p) => ({
              value: p as Filter,
              label: t(`common:${PROGRAMME_LABEL_KEY[p]}`),
            })),
          ]}
        />
      </div>

      <Tabs value={tab} onValueChange={setTab} dir={dir} className="gap-6">
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 rounded-full bg-white p-1.5 shadow-md group-data-[orientation=horizontal]/tabs:h-auto sm:inline-flex sm:w-fit">
          <TabsTrigger value="upcoming" className={cn(tabClass, 'group/trigger')}>
            <CalendarDays aria-hidden="true" className="hidden size-5 min-[400px]:block" />
            {t('sessions.upcoming')}
            <span className={countClass}>{upcoming.length}</span>
          </TabsTrigger>
          <TabsTrigger value="recordings" className={cn(tabClass, 'group/trigger')}>
            <PlayCircle aria-hidden="true" className="hidden size-5 min-[400px]:block" />
            {t('sessions.recordings')}
            <span className={countClass}>{recordings.length}</span>
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="grid grid-cols-1 gap-4">
          {upcoming.length === 0 ? <p className="m-0">{t('sessions.noUpcoming')}</p> : null}
          <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 lg:grid-cols-2">
            {upcoming.map((s) => (
              <li key={s.id} className="max-w-none">
                <UpcomingCard s={s} primary={s.id === firstOpen?.id} />
              </li>
            ))}
          </ul>
        </TabsContent>
        <TabsContent value="recordings" className="grid grid-cols-1 gap-4">
          {recordings.length === 0 ? <p className="m-0">{t('sessions.noRecordings')}</p> : null}
          <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 md:grid-cols-2 xl:grid-cols-3">
            {recordings.map((s) => (
              <li key={s.id} className="max-w-none">
                <RecordingCard s={s} />
              </li>
            ))}
          </ul>
        </TabsContent>
      </Tabs>
      <p className="m-0 flex items-center gap-2 text-base text-ink-soft">
        <DemoTag />
        {t('sessions.seedNote')}
      </p>
    </div>
  )
}
