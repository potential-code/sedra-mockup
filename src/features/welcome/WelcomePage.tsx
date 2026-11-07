import type { Persona } from '@shared/types'
import { Link, useNavigate } from '@tanstack/react-router'
import { ArrowRight, CircleHelp, Eye, EyeOff, LogIn } from 'lucide-react'
import { type FormEvent, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DemoTag } from '@/components/learner/DemoTag'
import { PageHeading } from '@/components/learner/PageHeading'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { PERSONAS } from '@/mocks/seed'
import { signInAs } from '@/store/actions'

const fieldClass =
  'min-h-12 w-full rounded-xl border-2 border-input bg-white px-4 py-2 text-lg text-ink focus-visible:border-ink'

/**
 * Welcome / demo sign-in (brief §2). Labelled fields, password reveal and help. The demo action
 * opens a fictional profile; no real account or email is used. Plus explicit persona cards.
 */
export function WelcomePage() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const navigate = useNavigate()
  const id = useId()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [show, setShow] = useState(false)
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
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-10 py-8 md:py-12">
      <PageHeading
        title={t('welcome.heading')}
        pageTitle={t('welcome.pageTitle')}
        lead={t('welcome.lead')}
      />

      <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,26rem)_1fr]">
        <section
          aria-labelledby={`${id}-form`}
          className="grid grid-cols-1 content-start gap-5 rounded-2xl border bg-white p-5 shadow-sm md:p-6"
        >
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`${id}-form`} className="m-0 text-2xl">
              {t('welcome.formHeading')}
            </h2>
            <DemoTag />
          </div>
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

          <div className="grid grid-cols-1 gap-2">
            <Button
              type="button"
              variant="link"
              className="justify-self-start px-0"
              aria-expanded={helpOpen}
              aria-controls={`${id}-help`}
              onClick={() => setHelpOpen((o) => !o)}
            >
              <CircleHelp aria-hidden="true" />
              {t('welcome.needHelp')}
            </Button>
            <div id={`${id}-help`} hidden={!helpOpen} className="rounded-xl bg-sedra-pale-50 p-4">
              <p className="m-0">{t('welcome.helpBody')}</p>
            </div>
          </div>
        </section>

        <section
          aria-labelledby={`${id}-personas`}
          className="grid grid-cols-1 content-start gap-4"
        >
          <div className="grid grid-cols-1 gap-1">
            <h2 id={`${id}-personas`} className="m-0 text-2xl">
              {t('welcome.personasHeading')}
            </h2>
            <p className="m-0 text-ink-soft">{t('welcome.personasLead')}</p>
          </div>
          <ul className="m-0 grid list-none gap-4 p-0">
            {PERSONAS.map((p) => {
              const name = l(p.name)
              return (
                <li
                  key={p.id}
                  className="flex flex-wrap items-center gap-4 rounded-2xl border bg-white p-4 shadow-sm"
                >
                  <img
                    src={asset(p.avatar)}
                    alt={t('welcome.avatarAlt', { name })}
                    width={96}
                    height={96}
                    className="size-20 shrink-0 rounded-full bg-sedra-pale-100 object-cover"
                  />
                  <div className="grid min-w-0 flex-1 basis-48 gap-1">
                    <h3 className="m-0 text-xl">{name}</h3>
                    <p className="m-0 text-base">{l(p.description)}</p>
                  </div>
                  <Button
                    variant={p.role === 'admin' ? 'outline' : 'default'}
                    onClick={() => choose(p)}
                  >
                    {t('welcome.choose', { name })}
                    <ArrowRight aria-hidden="true" className="rtl-mirror" />
                  </Button>
                </li>
              )
            })}
          </ul>
          <p className="m-0 text-base">
            <Link to="/" className="font-semibold text-sedra-green underline">
              {t('common:back')}
            </Link>
          </p>
        </section>
      </div>
    </div>
  )
}
