import type { Persona } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, ChevronDown, CircleHelp, Eye, EyeOff, LogIn, Mail } from 'lucide-react'
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

const fieldClass =
  'min-h-12 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-lg text-ink focus-visible:border-ink'

/**
 * Welcome / demo sign-in (brief §2). Persona cards are the main choice; the labelled email form
 * (password reveal and help) sits in a secondary, expandable card. The demo action opens a
 * fictional profile; no real account or email is used.
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
  const [formOpen, setFormOpen] = useState(false)
  const [helpOpen, setHelpOpen] = useState(false)

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

      {/* Main choice: three large persona cards. Each whole card is one button. */}
      <section aria-labelledby={`${id}-personas`} className="grid grid-cols-1 gap-4">
        <div className="grid grid-cols-1 gap-1">
          <h2 id={`${id}-personas`} className="m-0 text-2xl">
            {t('welcome.pickHeading')}
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
                    'group flex min-h-24 w-full items-center gap-4 rounded-2xl border-2 bg-white p-3 pe-4 text-start shadow-md sm:gap-5 sm:p-4',
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
                      className="size-16 rounded-2xl bg-sedra-pale-100 object-cover sm:size-20"
                    />
                  </span>
                  <span className="grid min-w-0 flex-1 gap-0.5">
                    <span className="flex flex-wrap items-center gap-2">
                      <span className="text-xl font-bold text-sedra-green">{name}</span>
                      {staff ? (
                        <span className="rounded-full bg-sedra-pale-100 px-2.5 py-0.5 text-base font-semibold text-ink">
                          {t('welcome.staffTag')}
                        </span>
                      ) : null}
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

      {/* Secondary: email sign-in (demo), collapsed by default. */}
      <section
        aria-labelledby={`${id}-form`}
        className="grid grid-cols-1 overflow-hidden rounded-2xl bg-sedra-pale-50 ring-1 ring-border"
      >
        <h2 id={`${id}-form`} className="m-0 text-xl">
          <button
            type="button"
            aria-expanded={formOpen}
            aria-controls={`${id}-form-body`}
            onClick={() => setFormOpen((o) => !o)}
            className="flex min-h-16 w-full items-center gap-3 px-4 py-3 text-start text-sedra-green hover:bg-sedra-pale-100 sm:px-5"
          >
            <span className="grid size-10 shrink-0 place-items-center rounded-full bg-white text-sedra-green shadow-sm">
              <Mail aria-hidden="true" className="size-5" />
            </span>
            <span className="grid flex-1">
              <span>{t('welcome.emailToggle')}</span>
              <span className="text-base font-normal text-ink-soft">
                {t('welcome.emailToggleHint')}
              </span>
            </span>
            <ChevronDown
              aria-hidden="true"
              className={cn(
                'size-6 shrink-0 transition-transform duration-200',
                formOpen && 'rotate-180',
              )}
            />
          </button>
        </h2>

        <div
          id={`${id}-form-body`}
          hidden={!formOpen}
          className="grid grid-cols-1 gap-5 border-t bg-white p-4 sm:p-5"
        >
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
            <p className="m-0 rounded-xl bg-notice-soft p-3 text-base text-notice">
              {t('welcome.demoNote')}
            </p>
            <Button type="submit" size="lg">
              <LogIn aria-hidden="true" className="rtl-mirror" />
              {t('welcome.submit')}
            </Button>
          </form>
        </div>
      </section>

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
      </div>
    </div>
  )
}
