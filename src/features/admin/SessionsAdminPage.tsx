import type { LiveSession, ProgrammeId } from '@shared/types'
import { Captions, FileText, Pencil, Save, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  DemoTag,
  Notice,
  SelectField,
  StatusLabel,
  TextField,
} from '@/components/admin/AdminUi'
import { fromUaeParts, toUaeParts, useUaeFormat } from '@/components/admin/format'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { saveSession, useAdminSessions } from '@/store/admin-actions'

/** /admin/sessions: demo session records and editor (brief §9 Sessions editor). */
export function SessionsAdminPage() {
  const { t } = useTranslation('admin')
  const sessions = useAdminSessions()
  const [editing, setEditing] = useState<string | null>(null)
  const openers = useRef<Record<string, HTMLButtonElement | null>>({})
  const current = sessions.find((s) => s.id === editing)

  const close = () => {
    const id = editing
    setEditing(null)
    if (id) requestAnimationFrame(() => openers.current[id]?.focus())
  }

  return (
    <div>
      <AdminPageHeader title={t('sessions.title')} intro={t('sessions.intro')}>
        <DemoTag />
      </AdminPageHeader>

      <Notice className="mb-6">
        <p>{t('sessions.integrationNote')}</p>
      </Notice>

      <ul className="m-0 grid list-none gap-4 p-0 lg:grid-cols-2">
        {sessions.map((s) => (
          <li key={s.id} className="max-w-none">
            <SessionCard
              session={s}
              editing={editing === s.id}
              openerRef={(el) => {
                openers.current[s.id] = el
              }}
              onEdit={() => setEditing(s.id)}
            />
          </li>
        ))}
      </ul>

      {current ? <SessionForm key={current.id} session={current} onClose={close} /> : null}
    </div>
  )
}

function SessionCard({
  session: s,
  editing,
  openerRef,
  onEdit,
}: {
  session: LiveSession
  editing: boolean
  openerRef: (el: HTMLButtonElement | null) => void
  onEdit: () => void
}) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const f = useUaeFormat()
  const headingId = `ses-${s.id}`
  return (
    <article
      aria-labelledby={headingId}
      className="flex h-full flex-col gap-3 rounded-2xl border bg-white p-5"
    >
      <div className="flex flex-wrap items-center gap-2">
        <DemoTag />
        <span className="text-sm font-semibold text-ink-soft">
          {t(`programme.${s.programmeId}`)}
        </span>
      </div>
      <h2 id={headingId} className="m-0 text-xl">
        {l(s.title)}
      </h2>
      <dl className="m-0 grid gap-x-4 gap-y-1 sm:grid-cols-[auto_1fr]">
        <dt className="font-semibold">{t('sessions.when')}</dt>
        <dd className="m-0">
          {f.dateTime(s.startsAt)} {t('common.uaeTime')}
        </dd>
        <dt className="font-semibold">{t('sessions.fields.accessLink')}</dt>
        <dd className="m-0 break-all">
          <span className="ltr-isolate">{s.accessLink}</span>{' '}
          <span className="text-sm text-ink-soft">({t('sessions.demoLink')})</span>
        </dd>
        <dt className="font-semibold">{t('sessions.fields.attendance')}</dt>
        <dd className="m-0">
          <StatusLabel
            tone={
              s.attendanceStatus === 'attended'
                ? 'done'
                : s.attendanceStatus === 'upcoming'
                  ? 'info'
                  : 'neutral'
            }
          >
            {t(`sessions.attendance.${s.attendanceStatus}`)}
          </StatusLabel>
        </dd>
        <dt className="font-semibold">{t('sessions.fields.recording')}</dt>
        <dd className="m-0">
          <StatusLabel tone={s.recordingStatus === 'available' ? 'info' : 'pending'}>
            {t(`sessions.recording.${s.recordingStatus}`)}
          </StatusLabel>
        </dd>
      </dl>

      <section
        aria-label={t('sessions.placeholdersLabel', { title: l(s.title) })}
        className="flex flex-col gap-2 rounded-xl bg-sedra-pale-50 p-3"
      >
        <p className="m-0 flex items-start gap-2">
          <Captions aria-hidden="true" className="mt-1 size-5 shrink-0" />
          <span>
            <strong>{t('sessions.captionedRecording')}:</strong> {t('sessions.pendingRecording')}
          </span>
        </p>
        <p className="m-0 flex items-start gap-2">
          <FileText aria-hidden="true" className="mt-1 size-5 shrink-0" />
          <span>
            <strong>{t('sessions.transcript')}:</strong> {t('sessions.pendingRecording')}
          </span>
        </p>
      </section>

      <div className="mt-auto">
        <Button
          ref={openerRef}
          type="button"
          variant="outline"
          onClick={onEdit}
          aria-expanded={editing}
          aria-label={t('sessions.editTitle', { title: l(s.title) })}
        >
          <Pencil aria-hidden="true" />
          {t('sessions.edit')}
        </Button>
      </div>
    </article>
  )
}

interface FormState {
  programmeId: ProgrammeId
  titleEn: string
  titleAr: string
  date: string
  time: string
  accessLink: string
  attendanceStatus: LiveSession['attendanceStatus']
  recordingStatus: LiveSession['recordingStatus']
}

type FormErrors = Partial<Record<keyof FormState, string>>

function SessionForm({ session, onClose }: { session: LiveSession; onClose: () => void }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const { date, time } = toUaeParts(session.startsAt)
  const [s, setS] = useState<FormState>({
    programmeId: session.programmeId,
    titleEn: session.title.en,
    titleAr: session.title.ar,
    date,
    time,
    accessLink: session.accessLink,
    attendanceStatus: session.attendanceStatus,
    recordingStatus: session.recordingStatus,
  })
  const [errors, setErrors] = useState<FormErrors>({})

  useEffect(() => {
    headingRef.current?.focus()
  }, [])

  const set =
    <K extends keyof FormState>(k: K) =>
    (v: string) =>
      setS((prev) => ({ ...prev, [k]: v as FormState[K] }))

  function onSave() {
    const e: FormErrors = {}
    if (!s.titleEn.trim()) e.titleEn = 'sessions.errors.title'
    if (!s.titleAr.trim()) e.titleAr = 'sessions.errors.title'
    const startsAt = fromUaeParts(s.date, s.time)
    if (!startsAt) e.date = 'sessions.errors.dateTime'
    if (!/^https:\/\/\S+$/.test(s.accessLink.trim())) e.accessLink = 'sessions.errors.link'
    setErrors(e)
    if (Object.keys(e).length > 0 || !startsAt) {
      const first = Object.keys(e)[0]
      requestAnimationFrame(() => document.getElementById(`s-${first}`)?.focus())
      return
    }
    saveSession({
      ...session,
      programmeId: s.programmeId,
      title: { en: s.titleEn.trim(), ar: s.titleAr.trim() },
      startsAt,
      timezone: 'Asia/Dubai',
      accessLink: s.accessLink.trim(),
      attendanceStatus: s.attendanceStatus,
      recordingStatus: s.recordingStatus,
    })
    toast.success(t('sessions.savedToast'), { description: t('sessions.savedDescription') })
    announce(t('sessions.savedToast'))
    onClose()
  }

  const err = (k: keyof FormState) => (errors[k] ? t(errors[k]) : undefined)

  return (
    <section
      id="session-editor"
      aria-labelledby="session-editor-title"
      className="mt-8 rounded-2xl border-2 border-sedra-green bg-white p-4 sm:p-6"
    >
      <h2 id="session-editor-title" ref={headingRef} tabIndex={-1} className="m-0 mb-1 text-2xl">
        {t('sessions.editTitle', { title: l(session.title) })}
      </h2>
      <p className="mt-0 mb-4 text-ink-soft">{t('sessions.editIntro')}</p>
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault()
          onSave()
        }}
        className="flex flex-col gap-5"
      >
        <SelectField
          id="s-programmeId"
          label={t('sessions.fields.programme')}
          value={s.programmeId}
          onChange={set('programmeId')}
          options={[
            { value: 'life-skills', label: t('programme.life-skills') },
            { value: 'hospitality', label: t('programme.hospitality') },
          ]}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <TextField
            id="s-titleEn"
            label={t('sessions.fields.titleEn')}
            value={s.titleEn}
            onChange={set('titleEn')}
            error={err('titleEn')}
            dir="ltr"
            required
          />
          <TextField
            id="s-titleAr"
            label={t('sessions.fields.titleAr')}
            value={s.titleAr}
            onChange={set('titleAr')}
            error={err('titleAr')}
            dir="rtl"
            required
          />
        </div>
        <fieldset className="m-0 flex flex-col gap-4 rounded-xl border p-4">
          <legend className="px-1 font-semibold text-ink">
            {t('sessions.fields.dateTimeLegend')}
          </legend>
          <div className="grid gap-4 sm:grid-cols-3">
            <TextField
              id="s-date"
              type="date"
              label={t('sessions.fields.date')}
              value={s.date}
              onChange={set('date')}
              error={err('date')}
              dir="ltr"
              required
            />
            <TextField
              id="s-time"
              type="time"
              label={t('sessions.fields.time')}
              value={s.time}
              onChange={set('time')}
              dir="ltr"
              required
            />
            <TextField
              id="s-timezone"
              label={t('sessions.fields.timezone')}
              value="Asia/Dubai"
              readOnly
              dir="ltr"
              hint={t('sessions.timezoneHint')}
            />
          </div>
        </fieldset>
        <TextField
          id="s-accessLink"
          type="url"
          inputMode="url"
          label={t('sessions.fields.accessLink')}
          value={s.accessLink}
          onChange={set('accessLink')}
          error={err('accessLink')}
          hint={t('sessions.accessLinkHint')}
          dir="ltr"
          required
        />
        <div className="grid gap-4 md:grid-cols-2">
          <SelectField
            id="s-attendanceStatus"
            label={t('sessions.fields.attendance')}
            value={s.attendanceStatus}
            onChange={set('attendanceStatus')}
            hint={t('sessions.attendanceHint')}
            options={(['upcoming', 'attended', 'not-attended'] as const).map((v) => ({
              value: v,
              label: t(`sessions.attendance.${v}`),
            }))}
          />
          <SelectField
            id="s-recordingStatus"
            label={t('sessions.fields.recording')}
            value={s.recordingStatus}
            onChange={set('recordingStatus')}
            hint={t('sessions.recordingHint')}
            options={(['pending', 'available'] as const).map((v) => ({
              value: v,
              label: t(`sessions.recording.${v}`),
            }))}
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <Button type="submit">
            <Save aria-hidden="true" />
            {t('sessions.save')}
          </Button>
          <Button type="button" variant="outline" onClick={onClose}>
            <X aria-hidden="true" />
            {t('common.cancel')}
          </Button>
        </div>
      </form>
    </section>
  )
}
