import type { Persona } from '@shared/types'
import { Link, useNavigate, useSearch } from '@tanstack/react-router'
import { ArrowRight, CircleHelp, Eye, EyeOff, Info, Link2, LogIn, Mail } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DemoTag } from '@/components/learner/DemoTag'
import { Reveal } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { PERSONAS } from '@/mocks/seed'
import { signInAs } from '@/store/actions'
import { useInvitations } from '@/store/invitations'
import { InviteAccept } from './InviteAccept'

const fieldClass =
  'min-h-12 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-lg text-ink focus-visible:border-ink'

/**
 * Welcome / demo sign-in (brief §2). The labelled email form (password reveal and help) comes
 * first, like a real sign-in; demo persona cards follow as the quick alternative. The demo action
 * opens a fictional profile; no real account or email is used.
 */
export function WelcomePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const navigate = useNavigate()
  const id = useId()
  usePageTitle(t('welcome.pageTitle'))
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)
  const [inviteInfoOpen, setInviteInfoOpen] = useState(false)
  // Learner invitation entry (brief §2): /welcome?invite=<id> from the (demo) invitation link.
  const { invite } = useSearch({ from: '/_auth/welcome' })
  const invitations = useInvitations()
  const invitation = invite ? invitations.find((i) => i.id === invite) : undefined
  const pending = invitation?.status === 'pending'

  function choose(p: Persona) {
    signInAs(p.id)
    void navigate({ to: p.home })
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    signInAs('noor')
    void navigate({ to: '/learn' })
  }

  function togglePassword() {
    const next = !show
    setShow(next)
    announce(next ? t('welcome.passwordShown') : t('welcome.passwordHidden'))
  }

  return (
    <div className="mx-auto grid w-full max-w-2xl grid-cols-1 gap-8 py-4 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words md:py-6">
      <Reveal className="grid grid-cols-1 gap-2">
        <h1 className="m-0 text-3xl break-words md:text-4xl">{t('welcome.heading')}</h1>
        <p className="m-0 text-lg text-ink-soft">{t('welcome.lead')}</p>
      </Reveal>

      {invitation && pending ? <InviteAccept invitation={invitation} /> : null}

      {invite && !pending ? (
        <section
          aria-labelledby={`${id}-invite-msg`}
          className="flex items-start gap-3 rounded-2xl bg-sedra-pale-50 p-5 ring-1 ring-border"
        >
          <Info aria-hidden="true" className="mt-1 size-6 shrink-0 text-sedra-green" />
          <div className="grid gap-1">
            <h2 id={`${id}-invite-msg`} className="m-0 text-xl">
              {invitation ? t('invite.usedTitle') : t('invite.notFoundTitle')}
            </h2>
            <p className="m-0">{invitation ? t('invite.usedBody') : t('invite.notFoundBody')}</p>
          </div>
        </section>
      ) : null}

      {pending ? null : (
        <>
          {/* First: the email sign-in form (demo). */}
          <section
            aria-labelledby={`${id}-form`}
            className="grid grid-cols-1 gap-5 rounded-3xl bg-white p-5 shadow-md ring-1 ring-border sm:p-7"
          >
            <div className="flex items-center gap-3">
              <span className="hidden size-12 shrink-0 place-items-center rounded-full bg-sedra-pale-100 sm:grid text-sedra-green">
                <Mail aria-hidden="true" className="size-6" />
              </span>
              <h2 id={`${id}-form`} className="m-0 text-2xl">
                {t('welcome.formHeading')}
              </h2>
            </div>
            <div className="grid grid-cols-1 gap-5">
              <DemoTag />
              <form onSubmit={onSubmit} className="grid grid-cols-1 gap-5" noValidate>
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor={`${id}-email`} className="font-semibold">
                    {t('welcome.email')}
                  </label>
                  <p id={`${id}-email-hint`} className="m-0 text-base text-ink-soft">
                    {t('welcome.emailHint')}
                  </p>
                  <input
                    id={`${id}-email`}
                    type="email"
                    autoComplete="email"
                    dir="ltr"
                    aria-describedby={`${id}-email-hint`}
                    className={`${fieldClass} text-start`}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 gap-2">
                  <label htmlFor={`${id}-password`} className="font-semibold">
                    {t('welcome.password')}
                  </label>
                  <div className="flex flex-wrap gap-2">
                    <input
                      id={`${id}-password`}
                      type={show ? 'text' : 'password'}
                      autoComplete="current-password"
                      dir="ltr"
                      className={`${fieldClass} min-w-0 flex-1 basis-48`}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      aria-controls={`${id}-password`}
                      onClick={togglePassword}
                    >
                      {show ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                      {show ? t('welcome.hidePassword') : t('welcome.showPassword')}
                    </Button>
                  </div>
                </div>
                <Button type="submit" size="lg">
                  <LogIn aria-hidden="true" className="rtl-mirror" />
                  {t('welcome.submit')}
                </Button>
              </form>
            </div>
          </section>

          {/* Then: demo profile cards. Each whole card is one button. */}
          <section aria-labelledby={`${id}-personas`} className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-1 gap-1">
              <h2 id={`${id}-personas`} className="m-0 text-2xl">
                {t('welcome.personasHeading')}
              </h2>
              <p className="m-0 text-base text-ink-soft">{t('welcome.pickLead')}</p>
            </div>
            <ul className="m-0 grid list-none gap-3 p-0">
              {PERSONAS.map((p) => {
                const name = l(p.name)
                const staff = p.role === 'admin'
                return (
                  <li key={p.id} className="max-w-none">
                    <button
                      type="button"
                      onClick={() => choose(p)}
                      aria-label={`${t('welcome.choose', { name })}. ${l(p.description)}`}
                      className={cn(
                        // Phones: photo above the text so the name and description keep the full width.
                        'group flex min-h-24 w-full flex-col items-start gap-3 rounded-2xl border-2 bg-white p-3 pe-4 text-start shadow-md sm:flex-row sm:items-center sm:gap-5 sm:p-4',
                        'transition-[box-shadow,border-color] duration-200 ease-out',
                        'hover:border-sedra-green hover:shadow-pop focus-visible:border-sedra-green',
                        staff ? 'border-border' : 'border-transparent',
                      )}
                    >
                      <span className="relative shrink-0">
                        <img
                          src={asset(p.avatar)}
                          alt=""
                          width={96}
                          height={96}
                          className="size-12 rounded-2xl bg-sedra-pale-100 object-cover sm:size-20"
                        />
                      </span>
                      <span className="grid min-w-0 flex-1 gap-0.5">
                        <span className="flex flex-wrap items-center gap-2">
                          <span className="text-xl font-bold text-sedra-green">{name}</span>
                        </span>
                        <span className="text-base text-ink-soft">{l(p.description)}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className="grid size-12 shrink-0 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green transition-colors duration-200 group-hover:bg-sedra-green group-hover:text-white group-focus-visible:bg-sedra-green group-focus-visible:text-white"
                      >
                        <ArrowRight className="rtl-mirror size-6" />
                      </span>
                    </button>
                  </li>
                )
              })}
            </ul>
          </section>
        </>
      )}

      <div className="grid grid-cols-1 gap-2">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1">
          <Button
            type="button"
            variant="link"
            className="px-0"
            aria-expanded={helpOpen}
            aria-controls={`${id}-help`}
            onClick={() => setHelpOpen((o) => !o)}
          >
            <CircleHelp aria-hidden="true" />
            {t('welcome.needHelp')}
          </Button>
          {invite ? null : (
            <Button
              type="button"
              variant="link"
              className="px-0"
              aria-expanded={inviteInfoOpen}
              aria-controls={`${id}-invite-info`}
              onClick={() => setInviteInfoOpen((o) => !o)}
            >
              <Link2 aria-hidden="true" />
              {t('invite.disclosure')}
            </Button>
          )}
          <Link
            to="/"
            className="inline-flex min-h-12 min-w-12 items-center font-semibold text-sedra-green underline underline-offset-4 hover:no-underline"
          >
            {t('common:back')}
          </Link>
        </div>
        <div id={`${id}-help`} hidden={!helpOpen} className="rounded-xl bg-sedra-pale-50 p-4">
          <p className="m-0">{t('welcome.helpBody')}</p>
        </div>
        {invite ? null : (
          <div
            id={`${id}-invite-info`}
            hidden={!inviteInfoOpen}
            className="rounded-xl bg-sedra-pale-50 p-4"
          >
            <p className="m-0">{t('invite.disclosureBody')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
