import type { SupportRequest } from '@shared/types'
import { Link, useCanGoBack, useRouter } from '@tanstack/react-router'
import {
  ArrowLeft,
  BookOpen,
  Check,
  CircleCheck,
  Clock,
  Compass,
  Eye,
  FileText,
  Hand,
  Keyboard,
  KeyRound,
  LifeBuoy,
  type LucideIcon,
  PlayCircle,
  Send,
  ShieldCheck,
  SlidersHorizontal,
  Users,
  Video,
} from 'lucide-react'
import { type FormEvent, useId, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { DemoTag } from '@/components/learner/DemoTag'
import { formatUaeDateTime } from '@/components/learner/learning'
import { ReadAloud } from '@/components/learner/ReadAloud'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { useSession } from '@/store/actions'
import { addSupportRequest, useSupportRequests } from '@/store/support-actions'

type Topic = SupportRequest['topic']
const TOPIC_KEY: Record<Topic, 'help.topicSignIn' | 'help.topicLesson' | 'help.topicSession'> = {
  'signing-in': 'help.topicSignIn',
  lesson: 'help.topicLesson',
  'live-session': 'help.topicSession',
}
const TOPIC_ICON: Record<Topic, LucideIcon> = {
  'signing-in': KeyRound,
  lesson: BookOpen,
  'live-session': Video,
}
const TIPS: { n: 1 | 2 | 3 | 4 | 5 | 6; icon: LucideIcon }[] = [
  { n: 1, icon: Compass },
  { n: 2, icon: PlayCircle },
  { n: 3, icon: FileText },
  { n: 4, icon: Clock },
  { n: 5, icon: Keyboard },
  { n: 6, icon: SlidersHorizontal },
]
const SUPPORTER_ICON: Record<1 | 2 | 3 | 4, LucideIcon> = {
  1: Users,
  2: Hand,
  3: Eye,
  4: ShieldCheck,
}

/** "Back to learning" returns to where the learner came from (brief §2: Help returns to the original place). */
function BackToLearning({ className }: { className?: string }) {
  const { t } = useTranslation('learner')
  const router = useRouter()
  const canGoBack = useCanGoBack()
  const cls = cn('justify-self-start', className)
  if (canGoBack) {
    return (
      <Button variant="outline" size="lg" className={cls} onClick={() => router.history.back()}>
        <ArrowLeft aria-hidden="true" className="rtl-mirror" />
        {t('shared.backToLearning')}
      </Button>
    )
  }
  return (
    <Button asChild variant="outline" size="lg" className={cls}>
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
      id="support-form"
      aria-labelledby={`${id}-h`}
      className="grid scroll-mt-4 grid-cols-1 gap-6 rounded-3xl bg-white p-5 shadow-lg md:p-8"
    >
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className="hidden size-14 shrink-0 items-center justify-center rounded-2xl bg-sedra-green text-white shadow-md sm:flex"
        >
          <LifeBuoy className="size-8" />
        </span>
        <div className="grid min-w-0 grid-cols-1 gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <h2 id={`${id}-h`} className="m-0 text-3xl">
              {t('help.formHeading')}
            </h2>
            <DemoTag />
          </div>
          <p className="m-0">{t('help.formLead')}</p>
        </div>
      </div>

      {sent ? (
        <div
          ref={sentRef}
          tabIndex={-1}
          role="status"
          className="grid grid-cols-1 gap-3 rounded-2xl border-2 border-success bg-success-soft p-5 text-success"
        >
          <p className="m-0 flex items-start gap-3 text-lg font-semibold">
            <CircleCheck aria-hidden="true" className="mt-0.5 size-7 shrink-0" />
            {t('help.sent')}
          </p>
          <Button variant="outline" className="justify-self-start" onClick={() => setSent(false)}>
            {t('help.another')}
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} noValidate className="grid grid-cols-1 gap-7">
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

          <TopicTiles
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
              className="w-full rounded-2xl border-2 border-input bg-sedra-pale-50 px-4 py-3 text-lg text-ink transition-colors focus-visible:border-ink focus-visible:bg-white aria-invalid:border-destructive"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="justify-self-start shadow-md motion-safe:transition-transform motion-safe:active:scale-[0.97]"
          >
            <Send aria-hidden="true" className="rtl-mirror" />
            {t('help.send')}
          </Button>
        </form>
      )}

      {mine.length ? (
        <div className="grid grid-cols-1 gap-2">
          <h3 className="m-0 text-lg">{t('help.myRequests')}</h3>
          <ul className="m-0 grid list-none gap-2 p-0">
            {[...mine].reverse().map((r) => {
              const Icon = TOPIC_ICON[r.topic]
              return (
                <li
                  key={r.id}
                  className="grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 rounded-2xl bg-sedra-pale-50 p-4 text-base"
                >
                  <Icon aria-hidden="true" className="row-span-3 mt-0.5 size-6 text-sedra-green" />
                  <span className="font-semibold">
                    {t(TOPIC_KEY[r.topic])} · {t('help.requestOpen')}
                  </span>
                  {r.message ? <span>{r.message}</span> : null}
                  <span className="text-ink-soft">
                    {formatUaeDateTime(r.createdAt, lang)} ({t('shared.uaeTime')})
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      ) : null}
    </section>
  )
}

/**
 * Topic choice as large icon tiles. Native radios stay in the DOM (visually hidden): arrow keys
 * move, Space selects, the legend asks the question. Selected = thick border + check icon, not
 * colour alone (brief §3).
 */
function TopicTiles({
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
  const errId = `${id}-topic-error`
  return (
    <fieldset
      className="m-0 grid min-w-0 gap-3 border-0 p-0"
      aria-describedby={error ? errId : undefined}
    >
      <legend className="mb-1 p-0 text-xl font-bold text-sedra-green">{t('help.topic')}</legend>
      {error ? (
        <p id={errId} className="m-0 font-semibold text-destructive">
          {error}
        </p>
      ) : null}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {(Object.keys(TOPIC_KEY) as Topic[]).map((v, i) => {
          const checked = topic === v
          const Icon = TOPIC_ICON[v]
          return (
            <label
              key={v}
              className={cn(
                'relative flex min-h-12 cursor-pointer items-center gap-4 rounded-2xl border-2 bg-white p-4 text-ink sm:flex-col sm:items-start sm:p-5',
                'motion-safe:transition-[transform,box-shadow] motion-safe:duration-200 hover:shadow-md motion-safe:active:scale-[0.98]',
                'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-ink',
                checked
                  ? 'border-sedra-green bg-sedra-pale-50 shadow-md ring-2 ring-sedra-green'
                  : 'border-border',
                error && !checked && 'border-destructive',
              )}
            >
              <input
                id={i === 0 ? `${id}-topic-0` : undefined}
                type="radio"
                name={`${id}-topic`}
                value={v}
                checked={checked}
                onChange={() => onChange(v)}
                aria-invalid={error ? true : undefined}
                className="peer sr-only"
              />
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-14 shrink-0 items-center justify-center rounded-2xl',
                  checked ? 'bg-sedra-green text-white' : 'bg-sedra-pale-100 text-sedra-green',
                )}
              >
                <Icon className="size-7" />
              </span>
              <span className="flex-1 text-lg font-bold">{t(TOPIC_KEY[v])}</span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-7 shrink-0 items-center justify-center rounded-full border-2 sm:absolute sm:end-4 sm:top-4',
                  checked
                    ? 'border-sedra-green bg-sedra-green text-white'
                    : 'border-input bg-white',
                )}
              >
                {checked ? <Check className="size-4" strokeWidth={3} /> : null}
              </span>
            </label>
          )
        })}
      </div>
    </fieldset>
  )
}

/** Help (brief §2): navigation tips (optional read-aloud), support request demo, supporter info. */
export function HelpPage() {
  const { t } = useTranslation('learner')
  usePageTitle(t('help.pageTitle'))
  const tips = TIPS.map(({ n }) => t(`help.tip${n}`))
  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-12 py-8">
      <Reveal className="motif-tree grid grid-cols-1 overflow-hidden rounded-3xl bg-white shadow-md lg:grid-cols-[1.1fr_1fr]">
        <div className="grid content-center gap-5 p-6 md:p-10">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-2xl bg-sedra-pale-100 text-sedra-green"
          >
            <LifeBuoy className="size-8" />
          </span>
          <h1 className="m-0 text-4xl break-words md:text-5xl">{t('help.heading')}</h1>
          <p className="m-0 text-xl text-ink">{t('help.lead')}</p>
          <div className="flex flex-wrap gap-3">
            <Button
              size="lg"
              className="shadow-md motion-safe:transition-transform motion-safe:active:scale-[0.97]"
              onClick={() => {
                const el = document.getElementById('support-form')
                el?.scrollIntoView({ block: 'start' })
                el?.querySelector<HTMLInputElement>('input[type=radio]')?.focus({
                  preventScroll: true,
                })
              }}
            >
              <LifeBuoy aria-hidden="true" />
              {t('help.formHeading')}
            </Button>
            <BackToLearning />
          </div>
        </div>
        <div className="relative min-h-60">
          <img
            src={asset('images/supporter.webp')}
            alt={t('help.supporterAlt')}
            width={1200}
            height={896}
            className="absolute inset-0 size-full object-cover"
          />
        </div>
      </Reveal>

      <section aria-labelledby="tips-heading" className="grid grid-cols-1 gap-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 id="tips-heading" className="m-0 text-3xl">
            {t('help.tipsHeading')}
          </h2>
          <ReadAloud text={tips.join(' ')} what={t('help.tipsHeading')} showOffHint />
        </div>
        <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-3">
          {TIPS.map(({ n, icon: Icon }, i) => (
            <Reveal as="li" key={n} delay={stagger(i)}>
              <div className="card-pop grid h-full grid-cols-[auto_1fr] items-start gap-4 p-5">
                <span
                  aria-hidden="true"
                  className="relative flex size-14 items-center justify-center rounded-2xl bg-sedra-pale-100 text-sedra-green"
                >
                  <Icon className="size-7" />
                  <span className="absolute -end-2 -top-2 flex size-7 items-center justify-center rounded-full bg-sedra-green text-sm font-bold text-white shadow-sm">
                    {n}
                  </span>
                </span>
                <p className="m-0">
                  <span className="sr-only">{n}. </span>
                  {tips[i]}
                </p>
              </div>
            </Reveal>
          ))}
        </ol>
      </section>

      <Reveal>
        <SupportForm />
      </Reveal>

      <Reveal>
        <section
          aria-labelledby="supporter-heading"
          className="motif-tree-light grid grid-cols-1 overflow-hidden rounded-3xl bg-sedra-green-800 shadow-lg md:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <img
            src={asset('images/supporter.webp')}
            alt=""
            width={1200}
            height={896}
            className="aspect-[4/3] size-full object-cover object-[75%_center] md:aspect-auto"
          />
          <div className="grid content-start gap-4 p-6 text-white md:p-9">
            <h2 id="supporter-heading" className="m-0 text-3xl text-white">
              {t('help.supporterHeading')}
            </h2>
            <ul className="m-0 grid list-none gap-3 p-0">
              {([1, 2, 3, 4] as const).map((n) => {
                const Icon = SUPPORTER_ICON[n]
                return (
                  <li key={n} className="grid grid-cols-[auto_1fr] items-start gap-3">
                    <span
                      aria-hidden="true"
                      className="flex size-10 items-center justify-center rounded-xl bg-white text-sedra-green-800"
                    >
                      <Icon className="size-5" />
                    </span>
                    <span className="pt-1.5">{t(`help.supporter${n}`)}</span>
                  </li>
                )
              })}
            </ul>
          </div>
        </section>
      </Reveal>

      <BackToLearning />
    </div>
  )
}
