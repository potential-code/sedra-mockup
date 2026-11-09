import type { LiveSession, ProgrammeId } from '@shared/types'
import {
  Ban,
  CalendarDays,
  Captions,
  ClipboardCheck,
  FileText,
  Link2,
  Pencil,
  Plus,
  RotateCcw,
  Save,
  Video,
  X,
} from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  Chip,
  DemoTag,
  IconCircle,
  Notice,
  SelectField,
  StatusLabel,
  TextField,
} from '@/components/admin/AdminUi'
import { fromUaeParts, toUaeParts, useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { saveSession, useAdminSessions } from '@/store/admin-actions'
import { createSession, setSessionCancelled } from '@/store/admin-content'

const NEW = '__new__'

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
      <AdminPageHeader title={t('sessions.title')} intro={t('sessions.intro')} icon={CalendarDays}>
        <DemoTag />
      </AdminPageHeader>

      <Notice className="mb-6">
        <p>{t('sessions.integrationNote')}</p>
      </Notice>

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button
          ref={(el) => {
            openers.current[NEW] = el
          }}
          type="button"
          onClick={() => setEditing(NEW)}
          aria-expanded={editing === NEW}
        >
          <Plus aria-hidden="true" />
          {t('sessions.new')}
        </Button>
        <p className="m-0 text-sm text-ink-soft">{t('sessions.newDefaultsNote')}</p>
      </div>

      {editing === NEW ? <SessionForm key={NEW} onClose={close} /> : null}

      <ul className="m-0 grid list-none gap-5 p-0 lg:grid-cols-2">
        {sessions.map((s, i) => (
          <Reveal as="li" key={s.id} delay={stagger(i)} className="max-w-none">
            <SessionCard
              session={s}
              editing={editing === s.id}
              openerRef={(el) => {
                openers.current[s.id] = el
              }}
              onEdit={() => setEditing(s.id)}
            />
          </Reveal>
        ))}
      </ul>

      {current && editing !== NEW ? (
        <SessionForm key={current.id} session={current} onClose={close} />
      ) : null}
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
  const { l, lang } = useLocalized()
  const f = useUaeFormat()
  const headingId = `ses-${s.id}`
  const locale = lang === 'ar' ? 'ar-AE' : 'en-AE'
  const d = new Date(s.startsAt)
  const month = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Dubai', month: 'short' }).format(
    d,
  )
  const day = new Intl.DateTimeFormat(locale, { timeZone: 'Asia/Dubai', day: 'numeric' }).format(d)
  const image =
    s.programmeId === 'life-skills'
      ? 'images/programme-life-skills.webp'
      : 'images/programme-hospitality.webp'
  return (
    <article
      aria-labelledby={headingId}
      className={`card-pop flex h-full flex-col overflow-hidden ${editing ? 'ring-3 ring-sedra-green' : ''}`}
    >
      <div className="relative h-28 shrink-0">
        <img
          src={asset(image)}
          alt=""
          width={640}
          height={160}
          className="size-full object-cover"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-sedra-green-800/35" />
        <div className="absolute top-3 end-3">
          <DemoTag />
        </div>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5 pt-0">
        <div className="-mt-10 flex items-end gap-4">
          <div
            aria-hidden="true"
            className="relative flex w-20 shrink-0 flex-col overflow-hidden rounded-2xl bg-white text-center shadow-lg"
          >
            <span className="bg-sedra-green py-1 text-sm font-bold text-white uppercase">
              {month}
            </span>
            <span className="py-1.5 text-3xl font-bold text-ink tabular-nums">{day}</span>
          </div>
          <Chip className="mb-1">{t(`programme.${s.programmeId}`)}</Chip>
          {s.cancelled ? (
            <StatusLabel tone="warning" icon={Ban} className="mb-1">
              {t('sessions.cancelledLabel')}
            </StatusLabel>
          ) : null}
        </div>
        <h2 id={headingId} className="m-0 text-xl">
          {l(s.title)}
        </h2>
        <dl className="m-0 flex flex-col gap-3">
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <CalendarDays aria-hidden="true" className="size-4 text-sedra-green" />
              {t('sessions.when')}
            </dt>
            <dd className="m-0 ms-6 font-semibold">
              {f.dateTime(s.startsAt)} {t('common.uaeTime')}
            </dd>
          </div>
          <div>
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <Link2 aria-hidden="true" className="size-4 text-sedra-green" />
              {t('sessions.fields.accessLink')}
            </dt>
            <dd className="m-0 ms-6 break-all">
              <span className="ltr-isolate">{s.accessLink}</span>{' '}
              <span className="text-sm text-ink-soft">({t('sessions.demoLink')})</span>
            </dd>
          </div>
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            <div>
              <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <ClipboardCheck aria-hidden="true" className="size-4 text-sedra-green" />
                {t('sessions.fields.attendance')}
              </dt>
              <dd className="m-0 mt-1">
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
            </div>
            <div>
              <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                <Video aria-hidden="true" className="size-4 text-sedra-green" />
                {t('sessions.fields.recording')}
              </dt>
              <dd className="m-0 mt-1">
                <StatusLabel tone={s.recordingStatus === 'available' ? 'info' : 'pending'}>
                  {t(`sessions.recording.${s.recordingStatus}`)}
                </StatusLabel>
              </dd>
            </div>
          </div>
        </dl>

        <section
          aria-label={t('sessions.placeholdersLabel', { title: l(s.title) })}
          className="grid gap-2 sm:grid-cols-2"
        >
          {[
            { icon: Captions, label: t('sessions.captionedRecording') },
            { icon: FileText, label: t('sessions.transcript') },
          ].map((p) => (
            <p
              key={p.label}
              className="m-0 flex items-center gap-3 rounded-xl border-2 border-dashed border-border bg-sedra-pale-50 p-3"
            >
              <IconCircle icon={p.icon} tint="notice" size="sm" />
              <span className="min-w-0 text-sm">
                <strong className="block text-ink">{p.label}</strong>
                {t('sessions.pendingRecording')}
              </span>
            </p>
          ))}
        </section>

        <div className="mt-auto flex flex-wrap gap-3">
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
          <CancelRestore session={s} />
        </div>
      </div>
    </article>
  )
}

/** Cancel (with confirmation) or restore a demo session. No message is sent to learners. */
function CancelRestore({ session: s }: { session: LiveSession }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const [confirm, setConfirm] = useState(false)
  if (s.cancelled) {
    return (
      <Button
        type="button"
        variant="outline"
        aria-label={t('sessions.restoreLabel', { title: l(s.title) })}
        onClick={() => {
          setSessionCancelled(s.id, false)
          toast.success(t('sessions.restoredToast'))
          announce(t('sessions.restoredToast'))
        }}
      >
        <RotateCcw aria-hidden="true" />
        {t('sessions.restore')}
      </Button>
    )
  }
  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label={t('sessions.cancelLabel', { title: l(s.title) })}
        onClick={() => setConfirm(true)}
      >
        <Ban aria-hidden="true" />
        {t('sessions.cancelSession')}
      </Button>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('sessions.cancelTitle', { title: l(s.title) })}</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-ink">
              {t('sessions.cancelBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-12">{t('sessions.keep')}</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-12"
              onClick={() => {
                setSessionCancelled(s.id, true)
                toast.success(t('sessions.cancelledToast'))
                announce(t('sessions.cancelledToast'))
              }}
            >
              {t('sessions.cancelConfirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
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

function SessionForm({ session, onClose }: { session?: LiveSession; onClose: () => void }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const headingRef = useRef<HTMLHeadingElement>(null)
  const isNew = !session
  const { date, time } = session ? toUaeParts(session.startsAt) : { date: '', time: '16:00' }
  const [s, setS] = useState<FormState>({
    programmeId: session?.programmeId ?? 'life-skills',
    titleEn: session?.title.en ?? '',
    titleAr: session?.title.ar ?? '',
    date,
    time,
    accessLink: session?.accessLink ?? '',
    attendanceStatus: session?.attendanceStatus ?? 'upcoming',
    recordingStatus: session?.recordingStatus ?? 'pending',
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
    if (!session) {
      createSession({
        programmeId: s.programmeId,
        title: { en: s.titleEn.trim(), ar: s.titleAr.trim() },
        startsAt,
        accessLink: s.accessLink.trim(),
      })
      toast.success(t('sessions.createdToast'), { description: t('sessions.savedDescription') })
      announce(t('sessions.createdToast'))
      onClose()
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
      className="mt-8 rounded-3xl bg-white ring-2 ring-sedra-green/40 p-4 shadow-lg sm:p-7"
    >
      <div className="mb-5 flex items-center gap-3">
        <IconCircle icon={Pencil} size="lg" />
        <div className="min-w-0">
          <h2 id="session-editor-title" ref={headingRef} tabIndex={-1} className="m-0 text-2xl">
            {session
              ? t('sessions.editTitle', { title: l(session.title) })
              : t('sessions.newTitle')}
          </h2>
          <p className="m-0 text-ink-soft">
            {isNew ? t('sessions.newIntro') : t('sessions.editIntro')}
          </p>
        </div>
      </div>
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
        <fieldset className="m-0 flex flex-col gap-4 rounded-2xl border-2 border-dashed border-border bg-sedra-pale-50/60 p-4">
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
        {isNew ? null : (
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
        )}
        <div className="flex flex-wrap gap-3">
          <Button type="submit">
            <Save aria-hidden="true" />
            {isNew ? t('sessions.create') : t('sessions.save')}
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
