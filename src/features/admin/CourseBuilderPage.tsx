import type { Course, Lang, Unit } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  BarChart3,
  ChevronDown,
  Clapperboard,
  Eye,
  EyeOff,
  Layers,
  MessageCircleQuestion,
  Pencil,
  Save,
  Settings2,
  Sparkles,
  Video,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AdminPageHeader, Panel, StatusLabel, TextField } from '@/components/admin/AdminUi'
import { ContentLangSwitch, useContentLang } from '@/components/admin/ContentLangSwitch'
import { useUaeFormat } from '@/components/admin/format'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { getCourse, getUnit, UNITS } from '@/content'
import { asset } from '@/lib/asset'
import { useAdminLearners } from '@/store/admin-actions'
import {
  latestEdit,
  saveCourseEdit,
  setCoursePublished,
  useAddedBlocks,
  useAddedUnits,
  useCourseEdits,
  useCoursePublished,
  useUnitEdits,
} from '@/store/admin-content'
import { useDb } from '@/store/db'
import { AddBlockDialog, AddedBlockList, AddedUnitCard, AddUnitDialog } from './BuilderAdditions'

/** Every unit has the same three learning blocks (brief: video/text, one check, optional practice). */
const BLOCKS = [
  { key: 'media', icon: Clapperboard },
  { key: 'check', icon: MessageCircleQuestion },
  { key: 'practice', icon: Sparkles },
] as const

/** Unit editor section for each built-in block (Edit opens the editor there). */
const BLOCK_SECTION = { media: 'sec-media', check: 'sec-check', practice: 'sec-practice' } as const

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

/** /admin/courses/$courseId: one course publish switch, units with their learning blocks, settings. */
export function CourseBuilderPage() {
  const { t } = useTranslation('admin')
  const { courseId } = useParams({ from: '/_admin/admin/courses/$courseId' })
  useCourseEdits() // re-render after a course edit
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
  const f = useUaeFormat()
  const lang = useContentLang()
  const edits = useUnitEdits()
  const learners = useAdminLearners()
  const published = useCoursePublished(course.id)
  const units = UNITS.filter((u) => u.courseId === course.id)
    .map((u) => getUnit(u.id) ?? u)
    .sort((a, b) => a.order - b.order)
  const samples = units.filter((u) => u.mediaStatus === 'sample').length
  const added = useAddedUnits(course.id)
  const extraBlocks = useDb((db) =>
    course.unitIds.reduce((n, id) => n + (db.addedBlocks?.[id]?.length ?? 0), 0),
  )
  const totalBlocks =
    units.length * BLOCKS.length + extraBlocks + added.reduce((n, u) => n + u.blocks.length, 0)
  const enrolled = learners.filter((x) => x.programmes.includes(course.programmeId)).length
  const updated = latestEdit(edits, course.unitIds)

  function togglePublish() {
    setCoursePublished(course.id, !published)
    const msg = published ? t('builder.courseUnpublished') : t('builder.coursePublished')
    toast.success(msg, { description: t('builder.liveToast') })
    announce(`${msg} ${t('builder.liveToast')}`)
  }

  return (
    <div>
      <BackLink />
      <AdminPageHeader
        eyebrow={t('builder.eyebrow')}
        title={course.title[lang]}
        intro={t('builder.intro')}
        icon={Layers}
        image={course.image}
        action={
          <Button type="button" variant={published ? 'outline' : 'default'} onClick={togglePublish}>
            {published ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
            {published ? t('builder.unpublishCourse') : t('builder.publishCourse')}
          </Button>
        }
      >
        {published ? (
          <StatusLabel tone="done" icon={Eye}>
            {t('content.published')}
          </StatusLabel>
        ) : (
          <StatusLabel tone="neutral" icon={EyeOff}>
            {t('content.unpublished')}
          </StatusLabel>
        )}
      </AdminPageHeader>

      {/* One switch for the language SEDRA is entering content in. */}
      <div className="mb-6 flex flex-wrap items-end gap-x-6 gap-y-2 rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4 shadow-sm sm:p-5">
        <ContentLangSwitch />
        <p className="m-0 max-w-xl flex-1 basis-64 text-base text-ink-soft">
          {t('builder.langHint')}
        </p>
      </div>

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <Panel
          id="structure-h"
          title={t('builder.structure')}
          icon={Layers}
          aside={
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm text-ink-soft">
                {updated
                  ? t('builder.updated', { date: f.dateTime(updated) })
                  : t('content.updatedNever')}
              </span>
              <AddUnitDialog courseId={course.id} lang={lang} />
            </div>
          }
        >
          <p className="m-0 text-ink-soft">{t('builder.structureHint')}</p>
          <ol className="m-0 flex list-none flex-col gap-3 p-0">
            {units.map((u, i) => (
              <Reveal as="li" key={u.id} delay={stagger(i, 0.04)} className="max-w-none">
                <UnitItem unit={u} lang={lang} />
              </Reveal>
            ))}
            {added.map((u, i) => (
              <li key={u.id} className="max-w-none">
                <AddedUnitCard unit={u} order={units.length + i + 1} lang={lang} />
              </li>
            ))}
          </ol>
        </Panel>

        <div className="flex min-w-0 flex-col gap-6">
          <Panel
            id="settings-h"
            title={t('builder.settings')}
            icon={Settings2}
            aside={<CourseSettingsDialog course={course} lang={lang} />}
          >
            <img
              src={asset(course.image)}
              alt={course.imageAlt[lang]}
              width={640}
              height={360}
              className="aspect-[16/9] w-full rounded-xl object-cover shadow-sm"
            />
            <p className="m-0 text-base text-ink-soft">{t('builder.settingsHint')}</p>
            <dl className="m-0 flex flex-col gap-3" lang={lang} dir={lang === 'ar' ? 'rtl' : 'ltr'}>
              <div className="rounded-xl border border-border bg-sedra-pale-50 p-3">
                <dt className="text-sm font-semibold text-ink-soft">{t('builder.courseTitle')}</dt>
                <dd className="m-0 font-semibold text-ink">{course.title[lang]}</dd>
              </div>
              <div className="rounded-xl border border-border bg-sedra-pale-50 p-3">
                <dt className="text-sm font-semibold text-ink-soft">
                  {t('builder.coursePurpose')}
                </dt>
                <dd className="m-0">{course.purpose[lang]}</dd>
              </div>
            </dl>
          </Panel>

          <Panel id="glance-h" title={t('builder.glance')} icon={BarChart3}>
            <dl className="m-0 grid grid-cols-2 gap-3">
              {(
                [
                  ['glanceUnits', units.length + added.length],
                  ['glanceBlocks', totalBlocks],
                  ['glanceSamples', samples],
                  ['glanceLearners', enrolled],
                ] as const
              ).map(([k, n]) => (
                <div
                  key={k}
                  className="flex flex-col rounded-xl border border-sedra-pale bg-sedra-pale-50 p-3"
                >
                  <dt className="order-2 text-sm text-ink-soft">{t(`builder.${k}`)}</dt>
                  <dd className="order-1 m-0 text-3xl font-bold text-sedra-green tabular-nums">
                    {f.number(n)}
                  </dd>
                </div>
              ))}
            </dl>
          </Panel>
        </div>
      </div>
    </div>
  )
}

/** One unit: image, title, video status, and its three learning blocks behind a disclosure. */
function UnitItem({ unit, lang }: { unit: Unit; lang: Lang }) {
  const { t } = useTranslation('admin')
  const id = `bu-${unit.id}`
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const extra = useAddedBlocks(unit.id)
  const blockText: Record<(typeof BLOCKS)[number]['key'], string> = {
    media: unit.mediaStatus === 'sample' ? t('media.sample') : t('media.pending'),
    check: unit.check.question[lang],
    practice: unit.practice.prompt[lang],
  }
  return (
    <article
      aria-labelledby={id}
      className="overflow-hidden rounded-2xl border border-border bg-white shadow-sm transition-shadow focus-within:shadow-md hover:shadow-md"
    >
      <div className="grid grid-cols-[5rem_minmax(0,1fr)] items-start gap-3 p-3 sm:grid-cols-[7rem_minmax(0,1fr)_auto] sm:items-center sm:gap-4">
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
              {t('builder.unitN', { n: unit.order })} ·{' '}
              <span className="ltr-isolate">{unit.id}</span>
            </p>
            <h3 id={id} className="m-0 text-lg text-ink" lang={lang} dir={dir}>
              {unit.title[lang]}
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
            <StatusLabel tone="info" icon={Layers}>
              {t('builder.blocksN', { n: BLOCKS.length + extra.length })}
            </StatusLabel>
          </div>
        </div>
        <Link
          to="/admin/content/$unitId"
          params={{ unitId: unit.id }}
          aria-label={t('builder.editUnit', { id: unit.id, title: unit.title[lang] })}
          className="col-span-2 inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border-2 border-sedra-green bg-white px-5 font-semibold text-sedra-green transition-colors hover:bg-sedra-green hover:text-white sm:col-span-1"
        >
          <Pencil aria-hidden="true" className="size-5" />
          {t('builder.edit')}
        </Link>
      </div>
      <details className="group border-t border-border bg-sedra-pale-50/60">
        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 px-4 font-semibold text-sedra-green [&::-webkit-details-marker]:hidden">
          <ChevronDown
            aria-hidden="true"
            className="size-5 transition-transform group-open:rotate-180"
          />
          {t('builder.showBlocks')}
        </summary>
        <div className="flex flex-col gap-2 px-4 pb-4">
          <ol className="m-0 flex list-none flex-col gap-2 p-0">
            {BLOCKS.map(({ key, icon: Icon }, i) => (
              <li
                key={key}
                className="flex max-w-none flex-wrap items-start gap-3 rounded-xl border border-border bg-white p-3"
              >
                <Icon
                  aria-hidden="true"
                  className="mt-0.5 size-7 shrink-0 text-sedra-green"
                  strokeWidth={1.75}
                />
                <span className="grid min-w-0 flex-1 basis-48 gap-0.5">
                  <span className="font-semibold text-ink">
                    {i + 1}. {t(`builder.block.${key}`)}
                    {key === 'practice' ? (
                      <span className="font-normal text-ink-soft"> ({t('builder.optional')})</span>
                    ) : null}
                  </span>
                  <span className="text-base text-ink-soft" lang={lang} dir={dir}>
                    {blockText[key]}
                  </span>
                </span>
                <Link
                  to="/admin/content/$unitId"
                  params={{ unitId: unit.id }}
                  hash={BLOCK_SECTION[key]}
                  aria-label={t('builder.editBlock', {
                    block: t(`builder.block.${key}`),
                    title: unit.title[lang],
                  })}
                  className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-xl border-2 border-sedra-green bg-white px-3 text-base font-semibold text-sedra-green transition-colors hover:bg-sedra-green hover:text-white"
                >
                  <Pencil aria-hidden="true" className="size-4" />
                  {t('builder.edit')}
                </Link>
              </li>
            ))}
          </ol>
          <AddedBlockList unitId={unit.id} startAt={BLOCKS.length + 1} />
          <AddBlockDialog unitId={unit.id} unitTitle={unit.title[lang]} lang={lang} />
        </div>
      </details>
    </article>
  )
}

/** Popup form: SEDRA edits the course title and purpose in the language the switch shows. */
function CourseSettingsDialog({ course, lang }: { course: Course; lang: Lang }) {
  const { t } = useTranslation('admin')
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [purpose, setPurpose] = useState('')
  const [errors, setErrors] = useState<{ title?: boolean; purpose?: boolean }>({})
  const dir = lang === 'ar' ? 'rtl' : 'ltr'

  function onOpenChange(next: boolean) {
    if (next) {
      setTitle(course.title[lang])
      setPurpose(course.purpose[lang])
      setErrors({})
    }
    setOpen(next)
  }

  function onSave() {
    const e = { title: !title.trim(), purpose: !purpose.trim() }
    setErrors(e)
    if (e.title || e.purpose) {
      requestAnimationFrame(() =>
        document.getElementById(e.title ? 'cs-title' : 'cs-purpose')?.focus(),
      )
      return
    }
    saveCourseEdit(course.id, {
      title: { ...course.title, [lang]: title.trim() },
      purpose: { ...course.purpose, [lang]: purpose.trim() },
    })
    toast.success(t('builder.settingsSaved'), { description: t('builder.settingsSavedDesc') })
    announce(t('builder.settingsSaved'))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Pencil aria-hidden="true" />
          {t('builder.editSettings')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white p-5 sm:max-w-xl sm:p-6">
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault()
            onSave()
          }}
          className="flex flex-col gap-5"
        >
          <div className="flex flex-col gap-2 pe-12">
            <DialogTitle asChild>
              <h2 className="m-0 text-2xl">{t('builder.editSettings')}</h2>
            </DialogTitle>
            <DialogDescription className="text-base text-ink-soft">
              {t('builder.editingIn', { lang: t(`editor.lang.${lang}`) })}
            </DialogDescription>
          </div>
          <TextField
            id="cs-title"
            label={t('builder.courseTitle')}
            value={title}
            onChange={setTitle}
            error={errors.title ? t('builder.settingsRequired') : undefined}
            dir={dir}
            required
          />
          <TextField
            id="cs-purpose"
            label={t('builder.coursePurpose')}
            value={purpose}
            onChange={setPurpose}
            error={errors.purpose ? t('builder.settingsRequired') : undefined}
            multiline
            dir={dir}
            required
          />
          <div className="flex flex-wrap gap-3">
            <Button type="submit">
              <Save aria-hidden="true" />
              {t('builder.settingsSave')}
            </Button>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
