import type { Course, Unit } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import { ArrowLeft, BarChart3, Eye, EyeOff, Layers, Pencil, Settings2, Video } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AdminPageHeader, DemoTag, Panel, StatusLabel } from '@/components/admin/AdminUi'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { getCourse, getUnit, UNITS } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { useAdminLearners } from '@/store/admin-actions'
import { latestEdit, setUnitPublished, useUnitEdits } from '@/store/admin-content'

function BackLink() {
  const { t } = useTranslation('admin')
  return (
    <Link
      to="/admin/content"
      className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 font-semibold text-sedra-green shadow-sm transition-shadow hover:shadow-md"
    >
      <ArrowLeft aria-hidden="true" className="rtl-mirror size-5" />
      {t('builder.back')}
    </Link>
  )
}

/** /admin/courses/$courseId: course structure (8 units), publish toggles, settings, at a glance. */
export function CourseBuilderPage() {
  const { t } = useTranslation('admin')
  const { courseId } = useParams({ from: '/_admin/admin/courses/$courseId' })
  const course = getCourse(courseId)
  if (!course) {
    return (
      <div>
        <BackLink />
        <AdminPageHeader
          title={t('builder.notFoundTitle')}
          intro={t('builder.notFoundBody')}
          icon={Layers}
        />
      </div>
    )
  }
  return <Builder course={course} />
}

function Builder({ course }: { course: Course }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const f = useUaeFormat()
  // Subscribe to edits so the list re-renders after publish/unpublish.
  const edits = useUnitEdits()
  const learners = useAdminLearners()
  const units = UNITS.filter((u) => u.courseId === course.id)
    .map((u) => getUnit(u.id) ?? u)
    .sort((a, b) => a.order - b.order)
  const isPub = (u: Unit) => edits[u.id]?.published ?? true
  const published = units.filter(isPub).length
  const samples = units.filter((u) => u.mediaStatus === 'sample').length
  const enrolled = learners.filter((x) => x.programmes.includes(course.programmeId)).length
  const updated = latestEdit(edits, course.unitIds)

  return (
    <div>
      <BackLink />
      <AdminPageHeader
        eyebrow={t('builder.eyebrow')}
        title={l(course.title)}
        intro={t('builder.intro')}
        icon={Layers}
      >
        <StatusLabel tone="done">{t('content.published')}</StatusLabel>
        <DemoTag />
      </AdminPageHeader>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel
          id="structure-h"
          title={t('builder.structure')}
          icon={Layers}
          aside={
            <span className="text-sm text-ink-soft">
              {updated
                ? t('builder.updated', { date: f.dateTime(updated) })
                : t('content.updatedNever')}
            </span>
          }
        >
          <p className="m-0 text-ink-soft">{t('builder.structureHint')}</p>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {units.map((u, i) => (
              <Reveal as="li" key={u.id} delay={stagger(i, 0.04)} className="max-w-none">
                <UnitItem unit={u} published={isPub(u)} />
              </Reveal>
            ))}
          </ol>
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            id="settings-h"
            title={t('builder.settings')}
            icon={Settings2}
            aside={<DemoTag label={t('builder.setBySedra')} />}
          >
            <p className="m-0 text-sm text-ink-soft">{t('builder.settingsHint')}</p>
            <dl className="m-0 flex flex-col gap-3">
              {(
                [
                  ['titleEn', course.title.en, 'en'],
                  ['titleAr', course.title.ar, 'ar'],
                  ['purposeEn', course.purpose.en, 'en'],
                  ['purposeAr', course.purpose.ar, 'ar'],
                ] as const
              ).map(([k, v, lang]) => (
                <div key={k} className="rounded-xl bg-sedra-pale-50 p-3">
                  <dt className="text-sm font-semibold text-ink-soft">{t(`builder.${k}`)}</dt>
                  <dd className="m-0" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
                    {v}
                  </dd>
                </div>
              ))}
              <div className="rounded-xl bg-sedra-pale-50 p-3">
                <dt className="text-sm font-semibold text-ink-soft">course_id</dt>
                <dd className="ltr-isolate m-0">{course.id}</dd>
              </div>
            </dl>
          </Panel>

          <Panel id="glance-h" title={t('builder.glance')} icon={BarChart3}>
            <dl className="m-0 grid grid-cols-2 gap-3">
              {(
                [
                  ['glanceUnits', units.length],
                  ['glancePublished', published],
                  ['glanceSamples', samples],
                  ['glanceLearners', enrolled],
                ] as const
              ).map(([k, n]) => (
                <div key={k} className="flex flex-col rounded-xl bg-sedra-pale-50 p-3">
                  <dt className="order-2 text-sm text-ink-soft">{t(`builder.${k}`)}</dt>
                  <dd className="order-1 m-0 text-3xl font-bold text-sedra-green tabular-nums">
                    {f.number(n)}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="m-0 text-sm text-ink-soft">{t('common.illustrative')}</p>
          </Panel>
        </div>
      </div>
    </div>
  )
}

function UnitItem({ unit, published }: { unit: Unit; published: boolean }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const id = `bu-${unit.id}`

  function toggle() {
    setUnitPublished(unit.id, !published)
    const msg = published
      ? t('builder.unpublishedToast', { id: unit.id })
      : t('builder.publishedToast', { id: unit.id })
    toast.success(msg, { description: t('builder.liveToast') })
    announce(`${msg} ${t('builder.liveToast')}`)
  }

  return (
    <article
      aria-labelledby={id}
      className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 rounded-2xl border border-border/70 bg-white p-3 transition-colors focus-within:bg-sedra-pale-50 hover:bg-sedra-pale-50 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4"
    >
      <img
        src={asset(`images/units/${unit.id}.webp`)}
        alt=""
        width={160}
        height={120}
        loading="lazy"
        className="aspect-[4/3] w-full rounded-xl object-cover shadow-sm"
      />
      <div className="flex min-w-0 flex-col gap-2">
        <div>
          <p className="m-0 text-sm font-semibold text-ink-soft">
            {t('builder.unitN', { n: unit.order })} · <span className="ltr-isolate">{unit.id}</span>
          </p>
          <h3 id={id} className="m-0 text-lg text-ink">
            {l(unit.title)}
          </h3>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {unit.mediaStatus === 'sample' ? (
            <StatusLabel tone="done" icon={Video}>
              {t('media.sample')}
            </StatusLabel>
          ) : (
            <StatusLabel tone="pending">{t('media.pending')}</StatusLabel>
          )}
          {published ? (
            <StatusLabel tone="done" icon={Eye}>
              {t('content.published')}
            </StatusLabel>
          ) : (
            <StatusLabel tone="neutral" icon={EyeOff}>
              {t('content.unpublished')}
            </StatusLabel>
          )}
        </div>
      </div>
      <div className="col-span-2 flex flex-wrap gap-2 sm:col-span-1 sm:flex-col">
        <Link
          to="/admin/content/$unitId"
          params={{ unitId: unit.id }}
          aria-label={t('builder.editUnit', { id: unit.id, title: l(unit.title) })}
          className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-xl border-2 border-sedra-green bg-white px-4 font-semibold text-sedra-green transition-colors hover:bg-sedra-green hover:text-white"
        >
          <Pencil aria-hidden="true" className="size-5" />
          {t('builder.edit')}
        </Link>
        <Button
          type="button"
          variant={published ? 'outline' : 'default'}
          onClick={toggle}
          className="flex-1"
          aria-label={
            published
              ? t('builder.unpublishUnit', { id: unit.id })
              : t('builder.publishUnit', { id: unit.id })
          }
        >
          {published ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          {published ? t('builder.unpublish') : t('builder.publish')}
        </Button>
      </div>
    </article>
  )
}
