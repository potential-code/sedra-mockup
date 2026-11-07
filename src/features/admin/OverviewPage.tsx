import { Link } from '@tanstack/react-router'
import {
  Activity,
  ArrowRight,
  BookOpen,
  ConciergeBell,
  GraduationCap,
  HelpCircle,
  LayoutDashboard,
  LifeBuoy,
  type LucideIcon,
  MessagesSquare,
  PieChart,
  Presentation,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  DemoTag,
  IconCircle,
  Panel,
  Ring,
  StatusLabel,
  type Tint,
} from '@/components/admin/AdminUi'
import { EnrolmentChart } from '@/components/admin/EnrolmentChart'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { COURSES } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { DEMO_NOW } from '@/mocks/admin-seed'
import { type AdminMetrics, useAdminMetrics, useSupportRequests } from '@/store/admin-actions'

const linkCls =
  'inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline underline-offset-4 hover:no-underline'

/** /admin: illustrative overview computed from the demo db (brief §9). */
export function OverviewPage() {
  const { t } = useTranslation('admin')
  const m = useAdminMetrics()
  const f = useUaeFormat()

  const tiles: {
    key: keyof AdminMetrics
    icon: LucideIcon
    tint: Tint
    span: string
    featured?: boolean
  }[] = [
    { key: 'enrolled', icon: Users, tint: 'green', span: 'lg:col-span-3', featured: true },
    { key: 'active', icon: Activity, tint: 'info', span: 'lg:col-span-3' },
    { key: 'hcCompletions', icon: MessagesSquare, tint: 'success', span: 'lg:col-span-2' },
    { key: 'hfCompletions', icon: ConciergeBell, tint: 'brown', span: 'lg:col-span-2' },
    { key: 'openSupport', icon: LifeBuoy, tint: 'notice', span: 'sm:col-span-2 lg:col-span-2' },
  ]

  return (
    <div>
      <AdminPageHeader
        title={t('overview.title')}
        eyebrow={t('overview.eyebrow')}
        icon={LayoutDashboard}
        intro={t('overview.intro')}
        image="images/home-hero.webp"
      >
        <DemoTag label={t('common.illustrative')} />
        <span className="text-sm text-ink-soft">
          {t('overview.timeNote', { date: f.dateTime(DEMO_NOW) })}
        </span>
      </AdminPageHeader>

      <section aria-labelledby="ov-totals">
        <h2 id="ov-totals" className="sr-only">
          {t('overview.totalsHeading')}
        </h2>
        <ul className="m-0 grid list-none grid-cols-1 gap-4 p-0 sm:grid-cols-2 lg:grid-cols-6">
          {tiles.map((c, i) => (
            <Reveal as="li" key={c.key} delay={stagger(i)} className={cn('max-w-none', c.span)}>
              <div
                className={cn(
                  'card-pop flex h-full items-start gap-4 p-5',
                  c.featured && 'motif-tree-light bg-sedra-green-800 text-white',
                )}
              >
                <IconCircle
                  icon={c.icon}
                  tint={c.tint}
                  size="lg"
                  className={c.featured ? 'bg-white/15 text-white' : undefined}
                />
                <div className="min-w-0">
                  <p
                    className={cn(
                      'm-0 text-4xl leading-none font-bold tabular-nums',
                      c.featured ? 'text-white' : 'text-sedra-green',
                    )}
                  >
                    {f.number(m[c.key])}
                  </p>
                  <p
                    className={cn('m-0 mt-2 font-semibold', c.featured ? 'text-white' : 'text-ink')}
                  >
                    {t(`overview.cards.${c.key}`)}
                  </p>
                  <p
                    className={cn(
                      'm-0 mt-1 text-sm',
                      c.featured ? 'text-white/90' : 'text-ink-soft',
                    )}
                  >
                    {t(`overview.cardHints.${c.key}`)}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <Reveal>
          <Panel
            id="ov-defs"
            title={t('overview.definitionsHeading')}
            icon={PieChart}
            className="h-full"
          >
            <p className="m-0 font-semibold text-ink">{t('overview.countOnce')}</p>
            <EnrolmentChart m={m} />
          </Panel>
        </Reveal>
        <Reveal delay={0.08}>
          <Panel
            id="ov-active"
            title={t('overview.activeHeading')}
            icon={Activity}
            tint="info"
            className="h-full"
          >
            <div className="flex flex-wrap items-center gap-5">
              <Ring value={m.active} max={m.enrolled} size={120} stroke={12}>
                <span className="text-2xl font-bold text-sedra-green tabular-nums">
                  {Math.round((m.active / (m.enrolled || 1)) * 100)}%
                </span>
              </Ring>
              <p className="m-0 min-w-0 flex-1 text-lg font-semibold text-ink">
                {t('overview.activeShare', { active: m.active, total: m.enrolled })}
              </p>
            </div>
            <p className="m-0 text-ink">
              <strong>{t('overview.activeTerm')}</strong> {t('overview.activeDefinition')}
            </p>
            <Link to="/admin/learners" className={linkCls}>
              {t('overview.viewLearners')}
              <ArrowRight aria-hidden="true" className="rtl-mirror size-5" />
            </Link>
          </Panel>
        </Reveal>
      </div>

      <section aria-labelledby="ov-programmes" className="mt-10">
        <div className="mb-4 flex items-center gap-3">
          <IconCircle icon={GraduationCap} />
          <h2 id="ov-programmes" className="m-0 text-2xl">
            {t('overview.programmes.heading')}
          </h2>
        </div>
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2">
          {COURSES.map((c, i) => (
            <Reveal as="li" key={c.id} delay={stagger(i)} className="max-w-none">
              <ProgrammeCard
                course={c}
                enrolled={c.programmeId === 'life-skills' ? m.lifeSkills : m.hospitality}
                completions={c.programmeId === 'life-skills' ? m.hcCompletions : m.hfCompletions}
              />
            </Reveal>
          ))}
        </ul>
      </section>

      <section aria-labelledby="ov-support" className="mt-10">
        <div className="mb-2 flex flex-wrap items-center gap-3">
          <IconCircle icon={LifeBuoy} tint="notice" />
          <h2 id="ov-support" className="m-0 text-2xl">
            {t('support.heading')}
          </h2>
          <DemoTag />
        </div>
        <p className="mt-0 mb-4 text-ink-soft">{t('support.intro')}</p>
        <SupportList />
      </section>
    </div>
  )
}

function ProgrammeCard({
  course,
  enrolled,
  completions,
}: {
  course: (typeof COURSES)[number]
  enrolled: number
  completions: number
}) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const f = useUaeFormat()
  const headingId = `ov-prog-${course.id}`
  return (
    <article aria-labelledby={headingId} className="card-pop flex h-full flex-col overflow-hidden">
      <div className="relative">
        <img
          src={asset(course.image)}
          alt={l(course.imageAlt)}
          width={640}
          height={360}
          className="aspect-[2/1] w-full object-cover"
        />
        <span className="absolute top-3 start-3 inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-sm font-semibold text-sedra-green shadow-sm">
          {course.programmeId === 'life-skills' ? (
            <MessagesSquare aria-hidden="true" className="size-4" />
          ) : (
            <ConciergeBell aria-hidden="true" className="size-4" />
          )}
          {l(course.programmeTitle)}
        </span>
      </div>
      <div className="flex flex-1 flex-col gap-4 p-5">
        <h3 id={headingId} className="m-0 text-xl">
          {l(course.title)}
        </h3>
        <dl className="m-0 grid grid-cols-3 gap-2">
          {[
            { k: 'enrolled', v: enrolled, icon: Users },
            { k: 'completions', v: completions, icon: GraduationCap },
            { k: 'units', v: course.unitIds.length, icon: BookOpen },
          ].map(({ k, v, icon: Icon }) => (
            <div key={k} className="flex flex-col rounded-xl bg-sedra-pale-50 px-3 py-2">
              <dt className="order-2 text-sm leading-snug text-ink-soft">
                {t(`overview.programmes.${k}`)}
              </dt>
              <dd className="order-1 m-0 flex items-center gap-1.5 text-2xl font-bold text-ink tabular-nums">
                <Icon aria-hidden="true" className="size-4 text-sedra-green" />
                {f.number(v)}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-auto flex flex-wrap gap-x-5">
          <Link to="/admin/content" className={linkCls}>
            <Presentation aria-hidden="true" className="size-5" />
            {t('overview.programmes.openContent', { course: l(course.title) })}
          </Link>
        </div>
      </div>
    </article>
  )
}

const TOPIC_ICON: Record<string, LucideIcon> = {
  'signing-in': Users,
  lesson: BookOpen,
  'live-session': Presentation,
}

function SupportList() {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const requests = useSupportRequests()
  const sorted = [...requests].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sorted.length === 0) {
    return <p className="m-0 rounded-2xl bg-white p-5 shadow-sm">{t('support.empty')}</p>
  }
  return (
    <ul aria-label={t('support.listLabel')} className="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
      {sorted.map((r, i) => (
        <Reveal as="li" key={r.id} delay={stagger(i, 0.04)} className="max-w-none">
          <article
            aria-labelledby={`sr-${r.id}`}
            className={cn(
              'card-pop flex h-full gap-4 border p-4 sm:p-5',
              r.status === 'open' ? 'border-notice/30' : 'border-border',
            )}
          >
            <IconCircle
              icon={TOPIC_ICON[r.topic] ?? HelpCircle}
              tint={r.status === 'open' ? 'notice' : 'success'}
            />
            <div className="flex min-w-0 flex-1 flex-col gap-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 id={`sr-${r.id}`} className="m-0 text-lg text-ink">
                  {t(`support.topics.${r.topic}`)}{' '}
                  <span className="ltr-isolate text-sm font-semibold text-ink-soft">{r.id}</span>
                </h3>
                <StatusLabel tone={r.status === 'open' ? 'warning' : 'done'}>
                  {t(`support.status.${r.status}`)}
                </StatusLabel>
              </div>
              <p className="m-0 text-ink" dir="auto">
                {r.message}
              </p>
              <p className="m-0 flex flex-wrap items-center gap-x-4 text-sm text-ink-soft">
                <span>
                  {t('support.cols.received')}: {f.dateTime(r.createdAt)}
                </span>
                {r.learnerId?.startsWith('L-') ? (
                  <Link
                    to="/admin/learners/$learnerId"
                    params={{ learnerId: r.learnerId }}
                    className="inline-flex min-h-12 items-center font-semibold text-sedra-green underline underline-offset-4"
                  >
                    {t('support.cols.learner')}:&nbsp;
                    <span className="ltr-isolate">{r.learnerId}</span>
                  </Link>
                ) : (
                  <span className="inline-flex min-h-12 items-center">
                    {t('support.fromDemoLearner')}
                  </span>
                )}
              </p>
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  )
}
