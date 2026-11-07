import type { ContentDraft, Unit } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { BookOpen, Languages, Pencil, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader, DemoTag, Notice, StatusLabel } from '@/components/admin/AdminUi'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { COURSES, unitsForCourse } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { useContentDrafts } from '@/store/admin-actions'

/** /admin/content: both courses and all 16 units with language, media and review status. */
export function ContentPage() {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const drafts = useContentDrafts()

  return (
    <div>
      <AdminPageHeader title={t('content.title')} intro={t('content.intro')} icon={BookOpen}>
        <DemoTag />
      </AdminPageHeader>

      <Notice className="mb-8">
        <p>{t('content.reviewNote')}</p>
      </Notice>

      {COURSES.length === 0 ? <p>{t('content.notLoaded')}</p> : null}

      {COURSES.map((course) => {
        const units = unitsForCourse(course.id)
        const headingId = `course-${course.id}`
        const samples = units.filter((u) => u.mediaStatus === 'sample').length
        return (
          <section
            key={course.id}
            aria-labelledby={headingId}
            className="mb-10 overflow-hidden rounded-3xl bg-white shadow-md"
          >
            <div className="relative isolate">
              <img
                src={asset(course.image)}
                alt=""
                width={1200}
                height={360}
                className="absolute inset-0 -z-10 size-full object-cover"
              />
              {/* Green scrim: white text on photos only over a green scrim (DESIGN.md). */}
              <div className="flex min-h-60 flex-col justify-end gap-2 bg-gradient-to-t from-sedra-green-800 from-25% via-sedra-green-800/75 via-55% to-sedra-green-800/0 p-5 sm:p-7">
                <p className="m-0 text-sm font-semibold tracking-wide text-white uppercase">
                  {l(course.programmeTitle)}
                </p>
                <h2 id={headingId} className="m-0 text-2xl text-white sm:text-3xl">
                  <span className="sr-only">{l(course.programmeTitle)}: </span>
                  {l(course.title)}
                </h2>
                <p className="m-0 flex flex-wrap gap-x-4 gap-y-1 text-white">
                  <span className="inline-flex items-center gap-1.5">
                    <BookOpen aria-hidden="true" className="size-4" />
                    {t('content.courseMeta', { units: units.length })}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <Video aria-hidden="true" className="size-4" />
                    {t('content.samplesMeta', { n: samples })}
                  </span>
                  <span className="ltr-isolate text-sm">
                    programme_id: {course.programmeId} · course_id: {course.id}
                  </span>
                </p>
              </div>
            </div>
            <ul
              aria-label={t('content.tableLabel', { course: l(course.title) })}
              className="m-0 flex list-none flex-col gap-0 p-2 sm:p-3"
            >
              {units.map((u, i) => (
                <Reveal as="li" key={u.id} delay={stagger(i, 0.04)} className="max-w-none">
                  <UnitRow unit={u} drafts={drafts.filter((d) => d.unitId === u.id)} />
                </Reveal>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}

function UnitRow({ unit, drafts }: { unit: Unit; drafts: ContentDraft[] }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const latest = [...drafts].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))[0]
  const hasEnVideo = !!unit.media?.en
  const headingId = `unit-${unit.id}`
  return (
    <article
      aria-labelledby={headingId}
      className="group grid grid-cols-[5.5rem_minmax(0,1fr)] items-start gap-3 rounded-2xl p-3 transition-colors focus-within:bg-sedra-pale-50 hover:bg-sedra-pale-50 sm:flex sm:flex-row sm:items-center sm:gap-4"
    >
      <div className="relative shrink-0">
        <img
          src={asset(`images/units/${unit.id}.webp`)}
          alt=""
          width={160}
          height={120}
          loading="lazy"
          className="aspect-[4/3] w-full rounded-xl object-cover shadow-sm transition-transform duration-300 group-hover:scale-[1.03] sm:w-36"
        />
        <span className="ltr-isolate absolute top-2 start-2 hidden rounded-full bg-white px-2.5 py-0.5 text-sm font-bold text-sedra-green shadow-sm sm:inline">
          {unit.id}
        </span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div>
          <p className="m-0 text-sm font-semibold text-ink-soft">
            {t('content.unitOrder', { order: unit.order })} ·{' '}
            <span className="font-normal">{unit.sourcePages}</span>
          </p>
          <h3 id={headingId} className="m-0 text-lg text-ink">
            <span className="sr-only">{unit.id}: </span>
            {l(unit.title)}
          </h3>
        </div>
        <ul
          aria-label={t('content.statusLabel')}
          className="m-0 flex list-none flex-wrap gap-1.5 p-0"
        >
          <li>
            <StatusLabel tone="done" icon={Languages}>
              {hasEnVideo ? t('content.langEnVideo') : t('content.langEn')}
            </StatusLabel>
          </li>
          <li>
            <StatusLabel tone="pending" icon={Languages}>
              {t('content.langAr')}
            </StatusLabel>
          </li>
          <li>
            {unit.mediaStatus === 'sample' ? (
              <StatusLabel tone="done" icon={Video}>
                {t('media.sample')}
              </StatusLabel>
            ) : (
              <StatusLabel tone="pending">{t('media.pending')}</StatusLabel>
            )}
          </li>
          <li>
            {latest ? (
              <StatusLabel tone={latest.reviewStatus === 'approved' ? 'done' : 'info'}>
                {t(`review.${latest.reviewStatus}`)} ({latest.language.toUpperCase()})
              </StatusLabel>
            ) : (
              <StatusLabel tone="neutral">{t('review.awaiting')}</StatusLabel>
            )}
          </li>
        </ul>
      </div>
      <Link
        to="/admin/content/$unitId"
        params={{ unitId: unit.id }}
        className="col-span-2 inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-sedra-green bg-white px-4 font-semibold text-sedra-green transition-colors hover:bg-sedra-green hover:text-white"
      >
        <Pencil aria-hidden="true" className="size-5" />
        {t('content.edit', { id: unit.id })}
      </Link>
    </article>
  )
}
