import type { Course } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { BookOpen, FolderOpen, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader, Chip, StatusLabel } from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { COURSES } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { useAdminLearners } from '@/store/admin-actions'
import { latestEdit, useUnitEdits } from '@/store/admin-content'
import { useDb } from '@/store/db'

interface CourseRow {
  course: Course
  published: boolean
  total: number
  learners: number
  updated?: string
}

const NO_UNPUBLISHED: Partial<Record<string, boolean>> = {}

function useCourseRows(): CourseRow[] {
  const edits = useUnitEdits()
  const unpublished = useDb((db) => db.courseUnpublished ?? NO_UNPUBLISHED)
  const learners = useAdminLearners()
  return COURSES.map((course) => ({
    course,
    total: course.unitIds.length,
    published: !unpublished[course.id],
    learners: learners.filter((l) => l.programmes.includes(course.programmeId)).length,
    updated: latestEdit(edits, course.unitIds),
  }))
}

/** /admin/content: the two SEDRA courses (owner decision: no new course, no delete). */
export function ContentPage() {
  const { t } = useTranslation('admin')
  const rows = useCourseRows()

  return (
    <div>
      <AdminPageHeader
        title={t('content.title')}
        intro={t('content.intro')}
        icon={BookOpen}
      ></AdminPageHeader>

      {rows.length === 0 ? <p>{t('content.notLoaded')}</p> : null}

      {/* Two course cards side by side: image on top, then status, units, learners and Open. */}
      <ul className="m-0 grid list-none grid-cols-1 gap-6 p-0 md:grid-cols-2">
        {rows.map((r, i) => (
          <Reveal as="li" key={r.course.id} delay={stagger(i)} className="max-w-none">
            <CourseCard row={r} />
          </Reveal>
        ))}
      </ul>
    </div>
  )
}

function OpenLink({ course }: { course: Course }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  return (
    <Link
      to="/admin/courses/$courseId"
      params={{ courseId: course.id }}
      aria-label={t('content.openCourse', { course: l(course.title) })}
      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl bg-sedra-green px-5 font-semibold text-white shadow-md transition-[background-color,box-shadow] hover:bg-sedra-green-800 hover:shadow-lg"
    >
      <FolderOpen aria-hidden="true" className="size-5" />
      {t('content.open')}
    </Link>
  )
}

function CourseCard({ row }: { row: CourseRow }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const f = useUaeFormat()
  const id = `cc-${row.course.id}`
  return (
    <article aria-labelledby={id} className="card-pop flex h-full flex-col overflow-hidden">
      <img
        src={asset(row.course.image)}
        alt=""
        width={640}
        height={240}
        className="aspect-[16/7] w-full object-cover"
      />
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div>
          <p className="m-0 text-sm font-semibold text-ink-soft">{l(row.course.programmeTitle)}</p>
          <h2 id={id} className="m-0 text-xl">
            {l(row.course.title)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {row.published ? (
            <StatusLabel tone="done">{t('content.published')}</StatusLabel>
          ) : (
            <StatusLabel tone="neutral">{t('content.unpublished')}</StatusLabel>
          )}
          <Chip>{t('content.unitsN', { n: row.total })}</Chip>
          <Chip>
            <Users aria-hidden="true" className="size-4" />
            {t('content.learnersN', { n: row.learners })}
          </Chip>
        </div>
        <p className="m-0 text-sm text-ink-soft">
          {t('content.cols.updated')}:{' '}
          {row.updated ? f.dateTime(row.updated) : t('content.updatedNever')}
        </p>
        <div className="mt-auto">
          <OpenLink course={row.course} />
        </div>
      </div>
    </article>
  )
}
