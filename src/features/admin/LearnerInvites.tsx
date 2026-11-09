import type { Invitation, Lang, ProgrammeId } from '@shared/types'
import { AlertTriangle, CircleCheck, Link2, MailPlus, UserPlus, UserRound } from 'lucide-react'
import { useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  Chip,
  DemoTag,
  FieldError,
  Notice,
  Panel,
  StatusLabel,
  TextField,
} from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { PROGRAMME_IDS } from '@/store/admin-actions'
import { type LearnerPersonaId, useDb } from '@/store/db'
import { createInvitation, setEnrolment, useInvitations } from '@/store/invitations'

/**
 * Open the demo invitation link. The /welcome route reads `invite` from its search params
 * (learner side). Hash routing, so a plain hash change works without route search typing.
 */
export function openInvitationLink(id: string) {
  window.location.hash = `#/welcome?invite=${encodeURIComponent(id)}`
}

const radioCls =
  'flex min-h-12 cursor-pointer items-center gap-2 rounded-full border-2 border-input bg-white px-5 font-semibold transition-colors hover:border-sedra-green has-[:checked]:border-sedra-green has-[:checked]:bg-sedra-pale-100 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring/50'

/* ---------------------------------------------------------------- Invite dialog */

type InviteErrors = Partial<Record<'name' | 'email' | 'programmes', string>>

export function InviteLearnerButton() {
  const { t } = useTranslation('admin')
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button">
          <UserPlus aria-hidden="true" />
          {t('invite.open')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white p-5 sm:max-w-xl sm:p-6">
        {open ? <InviteForm onDone={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function InviteForm({ onDone }: { onDone: () => void }) {
  const { t } = useTranslation('admin')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [lang, setLang] = useState<Lang>('en')
  const [programmes, setProgrammes] = useState<ProgrammeId[]>([])
  const [errors, setErrors] = useState<InviteErrors>({})
  const [created, setCreated] = useState<Invitation | null>(null)
  const summaryRef = useRef<HTMLDivElement>(null)
  const successRef = useRef<HTMLHeadingElement>(null)

  function toggle(p: ProgrammeId, on: boolean) {
    setProgrammes((cur) => (on ? [...cur, p] : cur.filter((x) => x !== p)))
  }

  function onSubmit() {
    const e: InviteErrors = {}
    if (!name.trim()) e.name = 'invite.errors.name'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) e.email = 'invite.errors.email'
    if (programmes.length === 0) e.programmes = 'invite.errors.programmes'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    const inv = createInvitation({
      name,
      email,
      lang,
      // Keep the programme order stable.
      programmes: PROGRAMME_IDS.filter((p) => programmes.includes(p)),
    })
    setCreated(inv)
    announce(t('invite.success'))
    requestAnimationFrame(() => successRef.current?.focus())
  }

  if (created) {
    return (
      <div className="flex flex-col gap-4">
        <DialogTitle asChild>
          <h2
            ref={successRef}
            tabIndex={-1}
            className="m-0 flex items-start gap-2 pe-12 text-2xl text-sedra-green"
          >
            <CircleCheck aria-hidden="true" className="mt-1 size-6 shrink-0" />
            {t('invite.success')}
          </h2>
        </DialogTitle>
        <DialogDescription className="text-base text-ink">
          {t('invite.successBody', { name: created.name })}
        </DialogDescription>
        <p className="m-0 rounded-xl bg-sedra-pale-50 p-3 text-sm break-all">
          <strong className="block text-ink">{t('invite.linkLabel')}</strong>
          <code className="ltr-isolate">#/welcome?invite={created.id}</code>
        </p>
        <div className="flex flex-wrap gap-3">
          <Button type="button" onClick={() => openInvitationLink(created.id)}>
            <Link2 aria-hidden="true" />
            {t('invite.openLink')}
          </Button>
          <Button type="button" variant="outline" onClick={onDone}>
            {t('invite.done')}
          </Button>
        </div>
      </div>
    )
  }

  const errorEntries = Object.entries(errors) as [keyof InviteErrors, string][]
  const focusTarget: Record<keyof InviteErrors, string> = {
    name: 'inv-name',
    email: 'inv-email',
    programmes: 'inv-prog-life-skills',
  }

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault()
        onSubmit()
      }}
      className="flex flex-col gap-5"
    >
      <div className="flex flex-col gap-2 pe-12">
        <DialogTitle asChild>
          <h2 className="m-0 flex items-center gap-2 text-2xl">
            <MailPlus aria-hidden="true" className="size-6 shrink-0 text-sedra-green" />
            {t('invite.title')}
          </h2>
        </DialogTitle>
        <DialogDescription className="text-base text-ink-soft">
          {t('invite.intro')}
        </DialogDescription>
        <DemoTag />
      </div>

      {errorEntries.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-2xl border-2 border-destructive bg-white p-4"
        >
          <p className="m-0 flex items-center gap-2 font-bold text-destructive">
            <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
            {t('invite.errorSummary', { n: errorEntries.length })}
          </p>
          <ul className="m-0 mt-1 flex flex-col gap-1 ps-5">
            {errorEntries.map(([k, msg]) => (
              <li key={k}>
                <button
                  type="button"
                  className="min-h-11 text-start font-semibold text-sedra-green underline underline-offset-4"
                  onClick={() => document.getElementById(focusTarget[k])?.focus()}
                >
                  {t(msg)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <TextField
        id="inv-name"
        label={t('invite.fields.name')}
        value={name}
        onChange={setName}
        error={errors.name ? t(errors.name) : undefined}
        dir="auto"
        required
      />
      <TextField
        id="inv-email"
        type="email"
        label={t('invite.fields.email')}
        value={email}
        onChange={setEmail}
        error={errors.email ? t(errors.email) : undefined}
        hint={t('invite.emailHint')}
        dir="ltr"
        required
      />
      <fieldset className="m-0 border-0 p-0">
        <legend className="mb-2 font-semibold text-ink">{t('invite.fields.lang')}</legend>
        <div className="flex flex-wrap gap-2">
          {(['en', 'ar'] as const).map((code) => (
            <label key={code} className={radioCls}>
              <input
                type="radio"
                name="inv-lang"
                value={code}
                checked={lang === code}
                onChange={() => setLang(code)}
                className="size-5 accent-sedra-green"
              />
              {t(`editor.lang.${code}`)}
            </label>
          ))}
        </div>
      </fieldset>
      <fieldset
        className="m-0 border-0 p-0"
        aria-describedby={errors.programmes ? 'inv-prog-error' : 'inv-prog-hint'}
      >
        <legend className="mb-1 font-semibold text-ink">
          {t('invite.fields.programmes')}{' '}
          <span className="font-normal text-ink-soft">({t('common.required')})</span>
        </legend>
        <p id="inv-prog-hint" className="m-0 mb-2 text-sm text-ink-soft">
          {t('invite.programmesHint')}
        </p>
        <div className="flex flex-wrap gap-2">
          {PROGRAMME_IDS.map((p) => (
            <label key={p} className={radioCls}>
              <input
                id={`inv-prog-${p}`}
                type="checkbox"
                checked={programmes.includes(p)}
                onChange={(e) => toggle(p, e.target.checked)}
                aria-invalid={errors.programmes ? true : undefined}
                className="size-5 accent-sedra-green"
              />
              {t(`programme.${p}`)}
            </label>
          ))}
        </div>
        {errors.programmes ? (
          <FieldError id="inv-prog-error">{t(errors.programmes)}</FieldError>
        ) : null}
      </fieldset>
      <Notice>
        <p>{t('invite.noEmail')}</p>
      </Notice>
      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          <MailPlus aria-hidden="true" />
          {t('invite.submit')}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}

/* ---------------------------------------------------------------- Invitations list */

export function InvitationsPanel() {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const invitations = useInvitations()
  return (
    <Panel id="inv-list-h" title={t('invite.listHeading')} icon={MailPlus} aside={<DemoTag />}>
      <p className="m-0 text-ink-soft">{t('invite.listIntro')}</p>
      {invitations.length === 0 ? (
        <p className="m-0 rounded-xl bg-sedra-pale-50 p-4">{t('invite.empty')}</p>
      ) : (
        <ul className="m-0 flex list-none flex-col gap-3 p-0">
          {invitations.map((inv) => (
            <li
              key={inv.id}
              className="flex max-w-none flex-col gap-3 rounded-2xl border border-border/70 p-4 sm:flex-row sm:items-center"
            >
              <div className="flex min-w-0 flex-1 flex-col gap-1.5">
                <p className="m-0 text-lg font-bold text-ink" dir="auto">
                  {inv.name}
                </p>
                <p className="m-0 text-sm break-all text-ink-soft">
                  <span className="ltr-isolate">{inv.email}</span> · {t(`editor.lang.${inv.lang}`)}{' '}
                  · {f.dateTime(inv.createdAt)}
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {inv.programmes.map((p) => (
                    <Chip key={p}>{t(`programme.${p}`)}</Chip>
                  ))}
                  {inv.status === 'accepted' ? (
                    <StatusLabel tone="done">{t('invite.status.accepted')}</StatusLabel>
                  ) : (
                    <StatusLabel tone="pending">{t('invite.status.pending')}</StatusLabel>
                  )}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => openInvitationLink(inv.id)}
                aria-label={t('invite.openLinkFor', { name: inv.name })}
              >
                <Link2 aria-hidden="true" />
                {t('invite.openLinkShort')}
              </Button>
            </li>
          ))}
        </ul>
      )}
    </Panel>
  )
}

/* ---------------------------------------------------------------- Demo accounts */

const ACCOUNTS: LearnerPersonaId[] = ['noor', 'new-learner']

export function DemoAccountsPanel() {
  const { t } = useTranslation('admin')
  const learners = useDb((db) => db.learners)
  return (
    <Panel
      id="accounts-h"
      title={t('accounts.heading')}
      icon={UserRound}
      aside={<DemoTag label={t('accounts.notCounted')} />}
    >
      <p className="m-0 text-ink-soft">{t('accounts.intro')}</p>
      <ul className="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
        {ACCOUNTS.map((id) => (
          <li key={id} className="max-w-none">
            <AccountCard
              id={id}
              name={learners[id]?.displayName || t(`accounts.persona.${id}`)}
              enrolled={learners[id]?.enrolled ?? []}
            />
          </li>
        ))}
      </ul>
    </Panel>
  )
}

function AccountCard({
  id,
  name,
  enrolled,
}: {
  id: LearnerPersonaId
  name: string
  enrolled: ProgrammeId[]
}) {
  const { t } = useTranslation('admin')
  const legendId = useId()
  function toggle(p: ProgrammeId, on: boolean) {
    const next = PROGRAMME_IDS.filter((x) => (x === p ? on : enrolled.includes(x)))
    setEnrolment(id, next)
    toast.success(t('accounts.savedToast', { name }))
    announce(t('accounts.savedToast', { name }))
  }
  return (
    <fieldset className="m-0 flex h-full flex-col gap-3 rounded-2xl border border-border/70 p-4">
      <legend id={legendId} className="px-1 text-lg font-bold text-ink">
        <span dir="auto">{name}</span>{' '}
        <span className="text-sm font-normal text-ink-soft">({t(`accounts.kind.${id}`)})</span>
      </legend>
      <p className="m-0 text-sm text-ink-soft">{t('accounts.programmesLabel')}</p>
      <div className="flex flex-wrap gap-2">
        {PROGRAMME_IDS.map((p) => (
          <label key={p} className={radioCls}>
            <input
              type="checkbox"
              checked={enrolled.includes(p)}
              onChange={(e) => toggle(p, e.target.checked)}
              className="size-5 accent-sedra-green"
            />
            {t(`programme.${p}`)}
          </label>
        ))}
      </div>
      {enrolled.length === 0 ? (
        <StatusLabel tone="warning">{t('accounts.none')}</StatusLabel>
      ) : null}
    </fieldset>
  )
}
