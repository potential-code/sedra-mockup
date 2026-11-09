import type { Course } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { BookOpen, FolderOpen, Users } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  Chip,
  captionCls,
  DemoTag,
  Notice,
  StatusLabel,
  TableRegion,
  tdCls,
  thCls,
} from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { COURSES } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { useAdminLearners } from '@/store/admin-actions'
import { latestEdit, useUnitEdits } from '@/store/admin-content'

interface CourseRow {
  course: Course
  published: number
  total: number
  learners: number
  updated?: string
}

function useCourseRows(): CourseRow[] {
  const edits = useUnitEdits()
  const learners = useAdminLearners()
  return COURSES.map((course) => ({
    course,
    total: course.unitIds.length,
    published: course.unitIds.filter((id) => edits[id]?.published ?? true).length,
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
      <AdminPageHeader title={t('content.title')} intro={t('content.intro')} icon={BookOpen}>
        <DemoTag />
      </AdminPageHeader>

      <Notice className="mb-6">
        <p>{t('content.reviewNote')}</p>
        <p className="mt-1">{t('content.noNewCourse')}</p>
      </Notice>

      {rows.length === 0 ? <p>{t('content.notLoaded')}</p> : null}

      <ul className="m-0 flex list-none flex-col gap-4 p-0 md:hidden">
        {rows.map((r, i) => (
          <Reveal as="li" key={r.course.id} delay={stagger(i)} className="max-w-none">
            <CourseCard row={r} />
          </Reveal>
        ))}
      </ul>

      <div className="hidden md:block">
        <TableRegion label={t('content.tableLabel')}>
          <table className="w-full min-w-[52rem] border-separate border-spacing-0">
            <caption className={captionCls}>{t('content.caption')}</caption>
            <thead>
              <tr>
                {(['course', 'status', 'units', 'learners', 'updated', 'actions'] as const).map(
                  (c) => (
                    <th
                      key={c}
                      scope="col"
                      className={`${thCls} border-b bg-sedra-pale-50 first:ps-5 ${c === 'actions' ? 'text-end' : ''}`}
                    >
                      {t(`content.cols.${c}`)}
                    </th>
                  ),
                )}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <CourseTableRow key={r.course.id} row={r} />
              ))}
            </tbody>
          </table>
        </TableRegion>
      </div>
    </div>
  )
}

function CourseTableRow({ row }: { row: CourseRow }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const f = useUaeFormat()
  const cell = `${tdCls} border-b border-border/60 align-middle group-last:border-0`
  return (
    <tr className="group transition-colors hover:bg-sedra-pale-50">
      <th
        scope="row"
        className={`${thCls} border-b border-border/60 ps-5 align-middle group-last:border-0`}
      >
        <div className="flex items-center gap-3">
          <img
            src={asset(row.course.image)}
            alt=""
            width={96}
            height={72}
            className="aspect-[4/3] w-24 shrink-0 rounded-xl object-cover shadow-sm"
          />
          <div className="min-w-0">
            <span className="block text-lg font-bold text-ink">{l(row.course.title)}</span>
            <span className="block text-sm font-normal text-ink-soft">
              {l(row.course.programmeTitle)}
            </span>
          </div>
        </div>
      </th>
      <td className={cell}>
        <StatusLabel tone="done">{t('content.published')}</StatusLabel>
      </td>
      <td className={cell}>
        {t('content.unitsPublished', { published: row.published, total: row.total })}
      </td>
      <td className={cell}>{t('content.learnersN', { n: row.learners })}</td>
      <td className={`${cell} text-sm`}>
        {row.updated ? f.dateTime(row.updated) : t('content.updatedNever')}
      </td>
      <td className={`${cell} text-end`}>
        <OpenLink course={row.course} />
      </td>
    </tr>
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
      className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-sedra-green bg-white px-4 font-semibold text-sedra-green transition-colors hover:bg-sedra-green hover:text-white"
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
    <article aria-labelledby={id} className="card-pop flex flex-col overflow-hidden">
      <img
        src={asset(row.course.image)}
        alt=""
        width={640}
        height={240}
        className="aspect-[16/7] w-full object-cover"
      />
      <div className="flex flex-col gap-3 p-4">
        <div>
          <p className="m-0 text-sm font-semibold text-ink-soft">{l(row.course.programmeTitle)}</p>
          <h2 id={id} className="m-0 text-xl">
            {l(row.course.title)}
          </h2>
        </div>
        <div className="flex flex-wrap gap-1.5">
          <StatusLabel tone="done">{t('content.published')}</StatusLabel>
          <Chip>{t('content.unitsPublished', { published: row.published, total: row.total })}</Chip>
          <Chip>
            <Users aria-hidden="true" className="size-4" />
            {t('content.learnersN', { n: row.learners })}
          </Chip>
        </div>
        <p className="m-0 text-sm text-ink-soft">
          {t('content.cols.updated')}:{' '}
          {row.updated ? f.dateTime(row.updated) : t('content.updatedNever')}
        </p>
        <OpenLink course={row.course} />
      </div>
    </article>
  )
}
