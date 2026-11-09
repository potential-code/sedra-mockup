import type { CourseId, ProgrammeId } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarClock,
  CheckCheck,
  CircleCheck,
  Clock,
  HandHelping,
  LifeBuoy,
  ListChecks,
  Sprout,
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  Avatar,
  Chip,
  IconCircle,
  Notice,
  Panel,
  Ring,
  StatusLabel,
} from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { getCourse } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { isActive, UNITS_PER_COURSE, useAdminLearners } from '@/store/admin-actions'
import { useSupportRequests } from '@/store/support-actions'

const COURSE_BY_PROGRAMME: Record<ProgrammeId, CourseId> = {
  'life-skills': 'healthy-communication',
  hospitality: 'intro-hospitality',
}

function BackLink() {
  const { t } = useTranslation('admin')
  return (
    <Link
      to="/admin/learners"
      className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 font-semibold text-sedra-green shadow-sm transition-shadow hover:shadow-md"
    >
      <ArrowLeft aria-hidden="true" className="rtl-mirror size-5" />
      {t('learnerDetail.back')}
    </Link>
  )
}

/** /admin/learners/$learnerId: units completed and practice status. No diagnosis or ranking. */
export function LearnerDetailPage() {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const f = useUaeFormat()
  const { learnerId } = useParams({ from: '/_admin/admin/learners/$learnerId' })
  const learner = useAdminLearners().find((x) => x.id === learnerId)

  if (!learner) {
    return (
      <div>
        <BackLink />
        <AdminPageHeader
          title={t('learnerDetail.notFoundTitle')}
          intro={t('learnerDetail.notFoundBody')}
          icon={UserRound}
        />
      </div>
    )
  }

  const p = learner.practice
  const active = isActive(learner)
  const practice = [
    { key: 'practiceDone', n: p.done, icon: CheckCheck, tint: 'success' as const },
    { key: 'practiceLater', n: p.later, icon: Clock, tint: 'notice' as const },
    { key: 'practiceWithHelp', n: p.withHelp, icon: HandHelping, tint: 'info' as const },
  ]

  return (
    <div>
      <BackLink />
      <header className="motif-tree mb-8 flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-md sm:flex-row sm:items-center sm:p-7">
        <Avatar name={learner.name} size="lg" className="ring-4 ring-sedra-pale-100" />
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <h1 className="m-0 text-3xl sm:text-4xl">
            {t('learnerDetail.title', { name: learner.name })}
          </h1>
          <p className="m-0 text-ink-soft">
            <span className="ltr-isolate font-semibold">{learner.id}</span>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {learner.programmes.map((prog) => (
              <Chip key={prog}>{t(`programme.${prog}`)}</Chip>
            ))}
            <StatusLabel tone={active ? 'done' : 'neutral'}>
              {active ? t('learners.activeYes') : t('learners.activeNo')}
            </StatusLabel>
          </div>
        </div>
      </header>

      <section aria-labelledby="ld-units" className="mb-8">
        <div className="mb-4 flex items-center gap-3">
          <IconCircle icon={ListChecks} />
          <h2 id="ld-units" className="m-0 text-2xl">
            {t('learnerDetail.unitsHeading')}
          </h2>
        </div>
        <ul className="m-0 grid list-none gap-5 p-0 md:grid-cols-2">
          {learner.programmes.map((prog, i) => {
            const courseId = COURSE_BY_PROGRAMME[prog]
            const course = getCourse(courseId)
            const done = learner.unitsCompleted[courseId] ?? 0
            const complete = done >= UNITS_PER_COURSE
            return (
              <Reveal as="li" key={prog} delay={stagger(i)} className="max-w-none">
                <article
                  aria-labelledby={`ld-c-${prog}`}
                  className="card-pop flex h-full flex-col overflow-hidden"
                >
                  {course ? (
                    <img
                      src={asset(course.image)}
                      alt=""
                      width={640}
                      height={200}
                      className="h-32 w-full object-cover"
                    />
                  ) : null}
                  <div className="flex flex-1 items-center gap-5 p-5">
                    <Ring value={done} max={UNITS_PER_COURSE} size={92} stroke={10}>
                      <span className="text-xl font-bold text-sedra-green tabular-nums">
                        {done}/{UNITS_PER_COURSE}
                      </span>
                    </Ring>
                    <div className="flex min-w-0 flex-1 flex-col gap-2">
                      <p className="m-0 text-sm font-semibold text-ink-soft">
                        {t(`programme.${prog}`)}
                      </p>
                      <h3 id={`ld-c-${prog}`} className="m-0 text-xl">
                        {course ? l(course.title) : t(`course.${courseId}`)}
                      </h3>
                      <p className="m-0 font-semibold text-ink">
                        {t('learnerDetail.unitsDone', { done, total: UNITS_PER_COURSE })}
                      </p>
                      <ol aria-hidden="true" className="m-0 flex list-none gap-1 p-0">
                        {Array.from({ length: UNITS_PER_COURSE }, (_, u) => (
                          <li
                            // biome-ignore lint/suspicious/noArrayIndexKey: fixed-length unit track
                            key={u}
                            className={cn(
                              'h-2 flex-1 rounded-full',
                              u < done ? 'bg-sedra-green' : 'bg-sedra-pale-100',
                            )}
                          />
                        ))}
                      </ol>
                      {complete ? (
                        <StatusLabel tone="done" icon={CircleCheck}>
                          {t('learnerDetail.courseComplete')}
                        </StatusLabel>
                      ) : null}
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </ul>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        <Reveal>
          <Panel
            id="ld-practice"
            title={t('learnerDetail.practiceHeading')}
            icon={Sprout}
            className="h-full"
          >
            <p className="m-0 text-sm text-ink-soft">{t('learnerDetail.practiceNote')}</p>
            <dl className="m-0 grid grid-cols-1 gap-3 min-[420px]:grid-cols-3">
              {practice.map((x) => (
                <div key={x.key} className="flex flex-col gap-2 rounded-xl bg-sedra-pale-50 p-3">
                  <dt className="order-2 text-sm font-semibold text-ink">
                    {t(`learnerDetail.${x.key}`)}
                  </dt>
                  <dd className="order-1 m-0 flex items-center gap-3 text-3xl font-bold text-ink tabular-nums">
                    <IconCircle icon={x.icon} tint={x.tint} size="sm" />
                    {x.n}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        </Reveal>

        <Reveal delay={0.06}>
          <Panel
            id="ld-activity"
            title={t('learnerDetail.activityHeading')}
            icon={CalendarClock}
            tint="info"
            className="h-full"
          >
            <dl className="m-0 flex flex-col gap-3">
              <div>
                <dt className="flex items-center gap-2 font-semibold">
                  <CalendarClock aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
                  {t('learners.cols.latest')}
                </dt>
                <dd className="ms-7 m-0">
                  {f.dateTime(learner.latestActivity)} {t('common.uaeTime')}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-semibold">
                  <ListChecks aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
                  {t('learners.cols.checks')}
                </dt>
                <dd className="ms-7 m-0">
                  {t('learners.checksSummary', {
                    reviewed: learner.checksReviewed,
                    firstTry: learner.checksCorrectFirstTry,
                  })}
                </dd>
              </div>
              <div>
                <dt className="flex items-center gap-2 font-semibold">
                  <LifeBuoy aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
                  {t('learners.cols.support')}
                </dt>
                <dd className="ms-7 m-0 mt-1">
                  <LearnerRequests learnerId={learner.id} flagged={learner.supportFlag} />
                </dd>
              </div>
            </dl>
          </Panel>
        </Reveal>
      </div>

      <Notice className="mt-6">
        <p>{t('learnerDetail.privacy')}</p>
      </Notice>
    </div>
  )
}

/** This learner's support requests: topic, status, message and when it arrived (UAE time). */
function LearnerRequests({ learnerId, flagged }: { learnerId: string; flagged: boolean }) {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const requests = useSupportRequests().filter((r) => r.learnerId === learnerId)
  if (requests.length === 0) {
    return flagged ? (
      <StatusLabel tone="warning">{t('learners.supportOpen')}</StatusLabel>
    ) : (
      <StatusLabel tone="neutral">{t('learners.supportNone')}</StatusLabel>
    )
  }
  return (
    <div className="flex flex-col gap-2">
      <ul className="m-0 flex list-none flex-col gap-2 p-0">
        {requests.map((r) => (
          <li key={r.id} className="max-w-none rounded-xl border bg-sedra-pale-50 p-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-semibold text-ink">{t(`support.topics.${r.topic}`)}</span>
              <StatusLabel tone={r.status === 'open' ? 'warning' : 'done'}>
                {t(`support.status.${r.status}`)}
              </StatusLabel>
            </div>
            <p className="m-0 mt-1 text-ink" dir="auto">
              {r.message}
            </p>
            <p className="m-0 mt-1 text-sm text-ink-soft">
              {t('support.cols.received')}: {f.dateTime(r.createdAt)}
            </p>
          </li>
        ))}
      </ul>
      <Link
        to="/admin"
        hash="ov-support"
        className="inline-flex min-h-12 items-center font-semibold text-sedra-green underline underline-offset-4"
      >
        {t('learnerDetail.allRequests')}
      </Link>
    </div>
  )
}
