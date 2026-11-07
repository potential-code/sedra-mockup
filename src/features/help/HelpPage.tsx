import type { SupportRequest } from '@shared/types'
import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import { ArrowLeft, CircleCheck, Send } from 'lucide-react'
import { type FormEvent, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChoiceGroup } from '@/components/learner/ChoiceGroup'
import { DemoTag } from '@/components/learner/DemoTag'
import { formatUaeDateTime } from '@/components/learner/learning'
import { PageHeading } from '@/components/learner/PageHeading'
import { ReadAloud } from '@/components/learner/ReadAloud'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { useSession } from '@/store/actions'
import { addSupportRequest, useSupportRequests } from '@/store/support-actions'

type Topic = SupportRequest['topic']
const TOPIC_KEY: Record<Topic, 'help.topicSignIn' | 'help.topicLesson' | 'help.topicSession'> = {
  'signing-in': 'help.topicSignIn',
  lesson: 'help.topicLesson',
  'live-session': 'help.topicSession',
}
const TIPS = [1, 2, 3, 4, 5, 6] as const

/** "Back to learning" returns to where the learner came from (brief §2: Help returns to the original place). */
function BackToLearning() {
  const { t } = useTranslation('learner')
  const router = useRouter()
  const canGoBack = useCanGoBack()
  if (canGoBack) {
    return (
      <Button
        variant="outline"
        className="justify-self-start"
        onClick={() => router.history.back()}
      >
        <ArrowLeft aria-hidden="true" className="rtl-mirror" />
        {t('shared.backToLearning')}
      </Button>
    )
  }
  return (
    <Button asChild variant="outline" className="justify-self-start">
      <Link to="/learn">
        <ArrowLeft aria-hidden="true" className="rtl-mirror" />
        {t('shared.backToLearning')}
      </Link>
    </Button>
  )
}

function SupportForm() {
  const { t } = useTranslation('learner')
  const { lang } = useLocalized()
  const id = useId()
  const { personaId } = useSession()
  const all = useSupportRequests()
  const mine = all.filter((r) => r.learnerId === personaId)
  const [topic, setTopic] = useState<Topic | undefined>()
  const [message, setMessage] = useState('')
  const [errors, setErrors] = useState<{ topic?: string; message?: string }>({})
  const [sent, setSent] = useState(false)
  const summaryRef = useRef<HTMLDivElement>(null)
  const sentRef = useRef<HTMLDivElement>(null)

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const next: typeof errors = {}
    if (!topic) next.topic = t('help.errorTopic')
    if (!message.trim()) next.message = t('help.errorMessage')
    setErrors(next)
    if (next.topic || next.message || !topic) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    addSupportRequest(topic, message)
    setSent(true)
    setTopic(undefined)
    setMessage('')
    requestAnimationFrame(() => sentRef.current?.focus())
  }

  const errorList = [
    errors.topic ? { href: `${id}-topic-0`, text: errors.topic } : null,
    errors.message ? { href: `${id}-message`, text: errors.message } : null,
  ].filter((x): x is { href: string; text: string } => !!x)

  return (
    <section
      aria-labelledby={`${id}-h`}
      className="grid grid-cols-1 gap-5 rounded-2xl border bg-white p-5 shadow-sm md:p-6"
    >
      <div className="grid grid-cols-1 gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h2 id={`${id}-h`} className="m-0 text-2xl">
            {t('help.formHeading')}
          </h2>
          <DemoTag />
        </div>
        <p className="m-0">{t('help.formLead')}</p>
      </div>

      {sent ? (
        <div
          ref={sentRef}
          tabIndex={-1}
          role="status"
          className="grid grid-cols-1 gap-3 rounded-xl border-2 border-success bg-success-soft p-4 text-success"
        >
          <p className="m-0 flex items-start gap-2 font-semibold">
            <CircleCheck aria-hidden="true" className="mt-1 size-5 shrink-0" />
            {t('help.sent')}
          </p>
          <Button variant="outline" className="justify-self-start" onClick={() => setSent(false)}>
            {t('help.another')}
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-6">
          {errorList.length ? (
            <div
              ref={summaryRef}
              tabIndex={-1}
              role="alert"
              aria-labelledby={`${id}-err-h`}
              className="grid grid-cols-1 gap-2 rounded-xl border-2 border-destructive bg-white p-4"
            >
              <h3 id={`${id}-err-h`} className="m-0 text-lg text-destructive">
                {t('help.errorSummary')}
              </h3>
              <ul className="m-0 grid list-disc gap-1 ps-6">
                {errorList.map((e) => (
                  <li key={e.href}>
                    <a
                      href={`#${e.href}`}
                      className="font-semibold text-destructive underline"
                      onClick={(ev) => {
                        // Hash routing: focus the field instead of changing the URL.
                        ev.preventDefault()
                        document.getElementById(e.href)?.focus()
                      }}
                    >
                      {e.text}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <TopicGroup
            id={id}
            topic={topic}
            error={errors.topic}
            onChange={(v) => {
              setTopic(v)
              if (errors.topic) setErrors((er) => ({ ...er, topic: undefined }))
            }}
          />

          <div className="grid grid-cols-1 gap-2">
            <label htmlFor={`${id}-message`} className="text-xl font-bold text-sedra-green">
              {t('help.message')}
            </label>
            <p id={`${id}-message-hint`} className="m-0 text-base text-ink-soft">
              {t('help.messageHint')}
            </p>
            {errors.message ? (
              <p id={`${id}-message-error`} className="m-0 font-semibold text-destructive">
                {errors.message}
              </p>
            ) : null}
            <textarea
              id={`${id}-message`}
              rows={4}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              aria-invalid={errors.message ? true : undefined}
              aria-describedby={`${id}-message-hint${errors.message ? ` ${id}-message-error` : ''}`}
              className="w-full rounded-xl border-2 border-input bg-white px-4 py-3 text-lg text-ink focus-visible:border-ink aria-invalid:border-destructive"
            />
          </div>

          <Button type="submit" size="lg" className="justify-self-start">
            <Send aria-hidden="true" className="rtl-mirror" />
            {t('help.send')}
          </Button>
        </form>
      )}

      {mine.length ? (
        <div className="grid grid-cols-1 gap-2">
          <h3 className="m-0 text-lg">{t('help.myRequests')}</h3>
          <ul className="m-0 grid list-none gap-2 p-0">
            {[...mine].reverse().map((r) => (
              <li
                key={r.id}
                className="grid grid-cols-1 gap-1 rounded-xl bg-sedra-pale-50 p-3 text-base"
              >
                <span className="font-semibold">
                  {t(TOPIC_KEY[r.topic])} · {t('help.requestOpen')}
                </span>
                <span>{r.message}</span>
                <span className="text-ink-soft">
                  {formatUaeDateTime(r.createdAt, lang)} ({t('shared.uaeTime')})
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

function TopicGroup({
  id,
  topic,
  error,
  onChange,
}: {
  id: string
  topic: Topic | undefined
  error?: string
  onChange: (v: Topic) => void
}) {
  const { t } = useTranslation('learner')
  return (
    <ChoiceGroup
      legend={t('help.topic')}
      name={`${id}-topic`}
      value={topic}
      onChange={onChange}
      error={error}
      columns="stack"
      firstId={`${id}-topic-0`}
      choices={(Object.keys(TOPIC_KEY) as Topic[]).map((v) => ({
        value: v,
        label: t(TOPIC_KEY[v]),
      }))}
    />
  )
}

/** Help (brief §2): navigation tips (optional read-aloud), support request demo, supporter info. */
export function HelpPage() {
  const { t } = useTranslation('learner')
  const tips = TIPS.map((n) => t(`help.tip${n}`))
  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-8 py-8">
      <PageHeading title={t('help.heading')} pageTitle={t('help.pageTitle')} lead={t('help.lead')}>
        <BackToLearning />
      </PageHeading>

      <section aria-labelledby="tips-heading" className="grid grid-cols-1 gap-3">
        <h2 id="tips-heading" className="m-0 text-2xl">
          {t('help.tipsHeading')}
        </h2>
        <ReadAloud text={tips.join(' ')} what={t('help.tipsHeading')} showOffHint />
        <ol className="m-0 grid list-decimal gap-2 ps-6">
          {tips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ol>
      </section>

      <SupportForm />

      <section
        aria-labelledby="supporter-heading"
        className="grid grid-cols-1 gap-4 rounded-2xl bg-sedra-pale-50 p-5 md:grid-cols-[minmax(0,18rem)_1fr] md:p-6"
      >
        <img
          src={asset('images/supporter.webp')}
          alt={t('help.supporterAlt')}
          width={800}
          height={600}
          className="aspect-[4/3] h-auto w-full rounded-xl bg-sedra-pale-100 object-cover"
        />
        <div className="grid grid-cols-1 content-start gap-3">
          <h2 id="supporter-heading" className="m-0 text-2xl">
            {t('help.supporterHeading')}
          </h2>
          {([1, 2, 3, 4] as const).map((n) => (
            <p key={n} className="m-0">
              {t(`help.supporter${n}`)}
            </p>
          ))}
        </div>
      </section>

      <BackToLearning />
    </div>
  )
}
