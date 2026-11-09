import type { Invitation } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import {
  BookOpen,
  CircleAlert,
  ConciergeBell,
  Eye,
  EyeOff,
  MailOpen,
  UserCheck,
} from 'lucide-react'
import { type FormEvent, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DemoTag } from '@/components/learner/DemoTag'
import { PROGRAMME_LABEL_KEY } from '@/components/learner/learning'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { acceptInvitation } from '@/store/invitations'

const fieldClass =
  'min-h-12 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-lg text-ink focus-visible:border-ink'
const PROGRAMME_ICON = { 'life-skills': BookOpen, hospitality: ConciergeBell } as const
const MIN_LENGTH = 8

type Errors = { password?: string; confirm?: string }

/**
 * Learner invitation entry (brief §2 Welcome; §1 invitations are simulated). SEDRA chose the
 * programmes; the learner only creates a password (demo: nothing is stored or sent) and accepts.
 * Errors: plain language beside the field plus a summary; entered text is kept (brief §3).
 */
export function InviteAccept({ invitation }: { invitation: Invitation }) {
  const { t } = useTranslation('learner')
  const navigate = useNavigate()
  const id = useId()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [show, setShow] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const summaryRef = useRef<HTMLDivElement>(null)
  const errorList = (['password', 'confirm'] as const).filter((k) => errors[k])

  function validate(): Errors {
    const next: Errors = {}
    if (!password) next.password = t('invite.errorRequired')
    else if (password.length < MIN_LENGTH) next.password = t('invite.errorShort')
    if (!confirm) next.confirm = t('invite.errorConfirmRequired')
    else if (!next.password && confirm !== password) next.confirm = t('invite.errorMismatch')
    return next
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next = validate()
    setErrors(next)
    if (next.password || next.confirm) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    if (acceptInvitation(invitation.id)) {
      announce(t('invite.acceptedAnnounce'))
      void navigate({ to: '/preferences' })
    }
  }

  function toggle() {
    const next = !show
    setShow(next)
    announce(next ? t('invite.passwordsShown') : t('invite.passwordsHidden'))
  }

  const describedBy = (field: keyof Errors, hint?: string) =>
    [hint, errors[field] ? `${id}-${field}-error` : undefined].filter(Boolean).join(' ') ||
    undefined

  return (
    <section
      aria-labelledby={`${id}-heading`}
      className="grid grid-cols-1 gap-5 rounded-3xl bg-white p-5 shadow-md ring-1 ring-border sm:p-7"
    >
      <div className="flex items-center gap-3">
        <span className="grid size-12 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green">
          <MailOpen aria-hidden="true" className="size-6" />
        </span>
        <h2 id={`${id}-heading`} className="m-0 text-2xl">
          {t('invite.heading')}
        </h2>
      </div>
      <DemoTag />
      <div className="grid grid-cols-1 gap-2">
        <p className="m-0 text-xl font-semibold text-ink">
          {t('invite.hello', { name: invitation.name })}
        </p>
        <p className="m-0">{t('invite.invitedTo')}</p>
        <ul
          aria-label={t('invite.programmesLabel')}
          className="m-0 flex list-none flex-wrap gap-2 p-0"
        >
          {invitation.programmes.map((p) => {
            const Icon = PROGRAMME_ICON[p]
            return (
              <li
                key={p}
                className="inline-flex max-w-none items-center gap-1.5 rounded-full bg-sedra-pale-100 px-3 py-1 text-base font-semibold text-ink"
              >
                <Icon aria-hidden="true" className="size-4 text-sedra-green" />
                {t(`common:${PROGRAMME_LABEL_KEY[p]}`)}
              </li>
            )
          })}
        </ul>
        <p className="m-0 text-base text-ink-soft">{t('invite.enrolNote')}</p>
      </div>

      <div className="grid grid-cols-1 gap-1 rounded-xl bg-sedra-pale-50 p-4">
        <p className="m-0 text-base font-semibold text-ink">{t('invite.emailLabel')}</p>
        <p className="m-0 text-lg break-all text-ink" dir="ltr">
          {invitation.email}
        </p>
      </div>

      {errorList.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby={`${id}-summary`}
          className="grid grid-cols-1 gap-2 rounded-xl border-2 border-destructive bg-white p-4"
        >
          <p
            id={`${id}-summary`}
            className="m-0 flex items-center gap-2 font-semibold text-destructive"
          >
            <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
            {t('invite.errorSummary')}
          </p>
          <ul className="m-0 grid gap-1 ps-6">
            {errorList.map((k) => (
              <li key={k}>
                <a
                  href={`#${id}-${k}`}
                  className="font-semibold text-ink underline underline-offset-4"
                  onClick={(e) => {
                    e.preventDefault()
                    document.getElementById(`${id}-${k}`)?.focus()
                  }}
                >
                  {errors[k]}
                </a>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5" noValidate>
        <div className="grid grid-cols-1 gap-2">
          <label htmlFor={`${id}-password`} className="font-semibold">
            {t('invite.createPassword')}
          </label>
          <p id={`${id}-password-hint`} className="m-0 text-base text-ink-soft">
            {t('invite.passwordHint')}
          </p>
          {errors.password ? (
            <p
              id={`${id}-password-error`}
              className="m-0 flex items-center gap-2 font-semibold text-destructive"
            >
              <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
              {errors.password}
            </p>
          ) : null}
          <input
            id={`${id}-password`}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            dir="ltr"
            aria-invalid={errors.password ? true : undefined}
            aria-describedby={describedBy('password', `${id}-password-hint`)}
            className={cn(fieldClass, errors.password && 'border-destructive')}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 gap-2">
          <label htmlFor={`${id}-confirm`} className="font-semibold">
            {t('invite.confirmPassword')}
          </label>
          {errors.confirm ? (
            <p
              id={`${id}-confirm-error`}
              className="m-0 flex items-center gap-2 font-semibold text-destructive"
            >
              <CircleAlert aria-hidden="true" className="size-5 shrink-0" />
              {errors.confirm}
            </p>
          ) : null}
          <input
            id={`${id}-confirm`}
            type={show ? 'text' : 'password'}
            autoComplete="new-password"
            dir="ltr"
            aria-invalid={errors.confirm ? true : undefined}
            aria-describedby={describedBy('confirm')}
            className={cn(fieldClass, errors.confirm && 'border-destructive')}
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </div>
        <Button
          type="button"
          variant="outline"
          className="justify-self-start"
          aria-controls={`${id}-password ${id}-confirm`}
          onClick={toggle}
        >
          {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {show ? t('invite.hidePasswords') : t('invite.showPasswords')}
        </Button>
        <p className="m-0 text-base text-ink-soft">{t('invite.demoNote')}</p>
        <Button type="submit" size="lg">
          <UserCheck aria-hidden="true" />
          {t('invite.accept')}
        </Button>
      </form>
      <Link
        to="/welcome"
        search={{}}
        className="inline-flex min-h-12 items-center font-semibold text-sedra-green underline underline-offset-4 hover:no-underline"
      >
        {t('invite.otherWay')}
      </Link>
    </section>
  )
}
