import type { ContentDraft, Unit } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  captionCls,
  DemoTag,
  Notice,
  StatusLabel,
  TableRegion,
  tdCls,
  thCls,
} from '@/components/admin/AdminUi'
import { COURSES, unitsForCourse } from '@/content'
import { useLocalized } from '@/i18n'
import { useContentDrafts } from '@/store/admin-actions'

/** /admin/content: both courses and all 16 units with language, media and review status. */
export function ContentPage() {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const drafts = useContentDrafts()

  return (
    <div>
      <AdminPageHeader title={t('content.title')} intro={t('content.intro')}>
        <DemoTag />
      </AdminPageHeader>

      <Notice className="mb-6">
        <p>{t('content.reviewNote')}</p>
      </Notice>

      {COURSES.length === 0 ? <p>{t('content.notLoaded')}</p> : null}

      {COURSES.map((course) => {
        const units = unitsForCourse(course.id)
        const headingId = `course-${course.id}`
        return (
          <section key={course.id} aria-labelledby={headingId} className="mb-8">
            <h2 id={headingId} className="m-0 text-2xl">
              {l(course.programmeTitle)}: {l(course.title)}
            </h2>
            <p className="mt-1 mb-3 text-ink-soft">
              {t('content.courseMeta', { units: units.length })}{' '}
              <span className="ltr-isolate text-sm">
                programme_id: {course.programmeId} · course_id: {course.id}
              </span>
            </p>
            <TableRegion label={t('content.tableLabel', { course: l(course.title) })}>
              <table className="w-full min-w-[52rem] border-collapse">
                <caption className={captionCls}>
                  {t('content.caption', { course: l(course.title) })}
                </caption>
                <thead className="border-b bg-sedra-pale-50">
                  <tr>
                    <th scope="col" className={thCls}>
                      {t('content.cols.unit')}
                    </th>
                    <th scope="col" className={thCls}>
                      {t('content.cols.languages')}
                    </th>
                    <th scope="col" className={thCls}>
                      {t('content.cols.media')}
                    </th>
                    <th scope="col" className={thCls}>
                      {t('content.cols.review')}
                    </th>
                    <th scope="col" className={thCls}>
                      {t('content.cols.action')}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {units.map((u) => (
                    <UnitRow key={u.id} unit={u} drafts={drafts.filter((d) => d.unitId === u.id)} />
                  ))}
                </tbody>
              </table>
            </TableRegion>
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
  return (
    <tr className="border-b last:border-0">
      <th scope="row" className={`${thCls} align-top`}>
        <span className="ltr-isolate block font-bold">{unit.id}</span>
        <span className="block font-normal">
          {t('content.unitOrder', { order: unit.order })} · {l(unit.title)}
        </span>
        <span className="block text-sm font-normal text-ink-soft">{unit.sourcePages}</span>
      </th>
      <td className={tdCls}>
        <ul className="m-0 flex list-none flex-col gap-1 p-0">
          <li>
            <StatusLabel tone="done">
              {hasEnVideo ? t('content.langEnVideo') : t('content.langEn')}
            </StatusLabel>
          </li>
          <li>
            <StatusLabel tone="pending">{t('content.langAr')}</StatusLabel>
          </li>
        </ul>
      </td>
      <td className={tdCls}>
        {unit.mediaStatus === 'sample' ? (
          <StatusLabel tone="done">{t('media.sample')}</StatusLabel>
        ) : (
          <StatusLabel tone="pending">{t('media.pending')}</StatusLabel>
        )}
      </td>
      <td className={tdCls}>
        {latest ? (
          <StatusLabel tone={latest.reviewStatus === 'approved' ? 'done' : 'info'}>
            {t(`review.${latest.reviewStatus}`)} ({latest.language.toUpperCase()})
          </StatusLabel>
        ) : (
          <StatusLabel tone="neutral">{t('review.awaiting')}</StatusLabel>
        )}
      </td>
      <td className={tdCls}>
        <Link
          to="/admin/content/$unitId"
          params={{ unitId: unit.id }}
          className="inline-flex min-h-12 items-center rounded-xl border-2 border-sedra-green px-4 font-semibold text-sedra-green hover:bg-sedra-pale-50"
        >
          {t('content.edit', { id: unit.id })}
        </Link>
      </td>
    </tr>
  )
}
