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
  Presentation,
  Users,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  BRAND_CARDS,
  IconCircle,
  Panel,
  Ring,
  StatusLabel,
  type Tint,
} from '@/components/admin/AdminUi'
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
/** Brand colour per stat card (gradient + pop shadow from BRAND_CARDS). */
const TILE_STYLES: Partial<Record<keyof AdminMetrics, string>> = {
  enrolled: `motif-tree-light ${BRAND_CARDS.forest}`,
  active: BRAND_CARDS.green,
  hcCompletions: BRAND_CARDS.pale,
  hfCompletions: BRAND_CARDS.brown,
  openSupport: BRAND_CARDS.cream,
}

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
                  'flex h-full items-center gap-3 overflow-hidden rounded-2xl px-5 py-4',
                  TILE_STYLES[c.key],
                )}
              >
                <div className="min-w-0 flex-1">
                  <p className="m-0 text-3xl leading-none font-bold tabular-nums">
                    {f.number(m[c.key])}
                  </p>
                  <p className="m-0 mt-1.5 text-base leading-snug font-semibold">
                    {t(`overview.cards.${c.key}`)}
                  </p>
                  <p className="m-0 mt-0.5 text-sm leading-snug">
                    {t(`overview.cardHints.${c.key}`)}
                  </p>
                </div>
                {/* Large icon on the end side, centred against the whole text block (decorative). */}
                <c.icon
                  aria-hidden="true"
                  className="size-12 shrink-0 opacity-90"
                  strokeWidth={1.5}
                />
              </div>
            </Reveal>
          ))}
        </ul>
      </section>

      <div className="mt-8 grid gap-6">
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
              <p className="m-0 min-w-0 flex-1 basis-48 text-lg font-semibold text-ink">
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
        </div>
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
          <Link
            to="/admin/courses/$courseId"
            params={{ courseId: course.id }}
            className="mt-auto inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-sedra-green px-5 font-semibold text-white shadow-md transition-[background-color,box-shadow] hover:bg-sedra-green-800 hover:shadow-lg"
          >
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
              'relative flex h-full flex-col gap-3 overflow-hidden rounded-2xl border bg-white p-5 ps-6 shadow-md transition-shadow hover:shadow-lg',
              r.status === 'open' ? 'border-notice/30' : 'border-border',
            )}
          >
            {/* Status edge: amber while open, green once closed (status is also written out). */}
            <span
              aria-hidden="true"
              className={cn(
                'absolute inset-y-0 start-0 w-1.5',
                r.status === 'open' ? 'bg-notice' : 'bg-success',
              )}
            />
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="flex min-w-0 flex-1 basis-48 items-center gap-3">
                <IconCircle
                  icon={TOPIC_ICON[r.topic] ?? HelpCircle}
                  tint={r.status === 'open' ? 'notice' : 'success'}
                />
                <div className="min-w-0">
                  <h3 id={`sr-${r.id}`} className="m-0 text-lg text-ink">
                    {t(`support.topics.${r.topic}`)}
                  </h3>
                  <p className="ltr-isolate m-0 text-sm font-semibold text-ink-soft">{r.id}</p>
                </div>
              </div>
              <StatusLabel tone={r.status === 'open' ? 'warning' : 'done'}>
                {t(`support.status.${r.status}`)}
              </StatusLabel>
            </div>
            <p className="m-0 rounded-xl bg-sedra-pale-50 px-4 py-3 text-ink" dir="auto">
              {r.message}
            </p>
            <div className="mt-auto flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-t border-border/60 pt-3 text-sm text-ink-soft">
              <span>
                {t('support.cols.received')}: {f.dateTime(r.createdAt)}
              </span>
              {r.learnerId?.startsWith('L-') ? (
                <Link
                  to="/admin/learners/$learnerId"
                  params={{ learnerId: r.learnerId }}
                  className="inline-flex min-h-11 items-center gap-1.5 rounded-xl bg-sedra-green px-4 text-base font-semibold text-white shadow-sm transition-colors hover:bg-sedra-green-800"
                >
                  {t('support.viewLearner')}
                  <span className="ltr-isolate">{r.learnerId}</span>
                  <ArrowRight aria-hidden="true" className="rtl-mirror size-4" />
                </Link>
              ) : (
                <span className="inline-flex min-h-11 items-center">
                  {t('support.fromDemoLearner')}
                </span>
              )}
            </div>
          </article>
        </Reveal>
      ))}
    </ul>
  )
}
