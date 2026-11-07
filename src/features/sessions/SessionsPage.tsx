import type { LiveSession, ProgrammeId } from '@shared/types'
import { CalendarClock, Captions, Check, FileText, Hourglass, Info, Video } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { ChoiceGroup } from '@/components/learner/ChoiceGroup'
import { DemoTag } from '@/components/learner/DemoTag'
import { formatUaeDateTime, PROGRAMME_LABEL_KEY, sortByStart } from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useLocalized } from '@/i18n'
import { useDb } from '@/store/db'

type Filter = 'all' | ProgrammeId

function SessionCard({ s, kind }: { s: LiveSession; kind: 'upcoming' | 'recording' }) {
  const { t } = useTranslation('learner')
  const { l, lang } = useLocalized()
  return (
    <article className="grid grid-cols-1 gap-3 rounded-2xl border bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-base font-semibold text-ink-soft">
          {t(`common:${PROGRAMME_LABEL_KEY[s.programmeId]}`)}
        </span>
        <DemoTag />
      </div>
      <h3 className="m-0 text-xl">{l(s.title)}</h3>
      <p className="m-0 flex items-start gap-2">
        <CalendarClock aria-hidden="true" className="mt-1 size-5 shrink-0 text-sedra-green" />
        <span>
          <span className="sr-only">{t('sessions.time')}: </span>
          {formatUaeDateTime(s.startsAt, lang)} ({t('shared.uaeTime')})
        </span>
      </p>

      {kind === 'upcoming' ? (
        <>
          <div className="grid grid-cols-1 gap-1 rounded-xl bg-sedra-pale-50 p-3">
            <h4 className="m-0 text-base font-bold text-ink">{t('sessions.booking')}</h4>
            <p className="m-0 text-base">{t('sessions.bookingBody')}</p>
          </div>
          <Button
            className="justify-self-start"
            onClick={() => toast.info(t('sessions.joinToast'))}
          >
            <Video aria-hidden="true" />
            {t('sessions.join')}
          </Button>
        </>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-2 rounded-xl border-2 border-dashed border-border bg-sedra-pale-50 p-4">
            <p className="m-0 flex items-center gap-2 font-semibold text-ink">
              <Hourglass aria-hidden="true" className="size-5" />
              {t('sessions.pendingRecording')}
            </p>
            <p className="m-0 text-base">{t('sessions.pendingBody')}</p>
            <ul className="m-0 grid list-none gap-1 p-0 text-base">
              <li className="flex items-center gap-2">
                <Captions aria-hidden="true" className="size-5" />
                {t('sessions.captions')}
              </li>
              <li className="flex items-center gap-2">
                <FileText aria-hidden="true" className="size-5" />
                {t('sessions.transcript')}
              </li>
            </ul>
          </div>
          <p className="m-0 flex items-start gap-2 text-base text-ink-soft">
            <Info aria-hidden="true" className="mt-1 size-5 shrink-0" />
            {t('sessions.viewDisabled')}
          </p>
        </>
      )}
    </article>
  )
}

/** Sessions (brief §2): programme filter, upcoming and a separate recordings tab; UAE time. */
export function SessionsPage() {
  const { t } = useTranslation('learner')
  const { dir } = useLocalized()
  const sessions = useDb((db) => db.sessions)
  const [filter, setFilter] = useState<Filter>('all')
  const [tab, setTab] = useState('upcoming')

  const shown = sortByStart(sessions.filter((s) => filter === 'all' || s.programmeId === filter))
  const upcoming = shown.filter((s) => s.attendanceStatus === 'upcoming')
  const recordings = shown.filter((s) => s.attendanceStatus !== 'upcoming').reverse()

  const tabClass =
    'min-h-12 flex-none gap-2 rounded-lg px-5 text-base font-semibold text-ink data-[state=active]:bg-sedra-green data-[state=active]:text-white'

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <PageHeading
        title={t('sessions.heading')}
        pageTitle={t('sessions.pageTitle')}
        lead={t('sessions.lead')}
      >
        <p className="m-0 text-base text-ink-soft">{t('sessions.noPenalty')}</p>
      </PageHeading>

      <ChoiceGroup
        legend={t('sessions.filter')}
        name="programme-filter"
        value={filter}
        onChange={setFilter}
        choices={[
          { value: 'all', label: t('sessions.all') },
          { value: 'life-skills', label: t('common:lifeSkills') },
          { value: 'hospitality', label: t('common:hospitalityForAll') },
        ]}
      />

      <Tabs value={tab} onValueChange={setTab} dir={dir} className="gap-4">
        <TabsList className="h-auto w-full flex-wrap justify-start gap-2 bg-sedra-pale-50 p-1 sm:w-fit">
          <TabsTrigger value="upcoming" className={tabClass}>
            {tab === 'upcoming' ? <Check aria-hidden="true" className="size-5" /> : null}
            {t('sessions.upcoming')} ({upcoming.length})
          </TabsTrigger>
          <TabsTrigger value="recordings" className={tabClass}>
            {tab === 'recordings' ? <Check aria-hidden="true" className="size-5" /> : null}
            {t('sessions.recordings')} ({recordings.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="upcoming" className="grid grid-cols-1 gap-4">
          {upcoming.length === 0 ? <p className="m-0">{t('sessions.noUpcoming')}</p> : null}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {upcoming.map((s) => (
              <SessionCard key={s.id} s={s} kind="upcoming" />
            ))}
          </div>
        </TabsContent>
        <TabsContent value="recordings" className="grid grid-cols-1 gap-4">
          {recordings.length === 0 ? <p className="m-0">{t('sessions.noRecordings')}</p> : null}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {recordings.map((s) => (
              <SessionCard key={s.id} s={s} kind="recording" />
            ))}
          </div>
        </TabsContent>
      </Tabs>
      <p className="m-0 text-base text-ink-soft">{t('sessions.seedNote')}</p>
    </div>
  )
}
