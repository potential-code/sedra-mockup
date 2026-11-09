import type { CourseId, CustomResource, Lang } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Link2,
  type LucideIcon,
  MapPin,
  Pencil,
  PlayCircle,
  Plus,
  RotateCcw,
  Save,
  ShieldCheck,
  Tag,
} from 'lucide-react'
import { type ReactNode, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { AdminPageHeader, Chip, Notice, StatusLabel, TextField } from '@/components/admin/AdminUi'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { COURSES, EXT01, getCourse, UNITS } from '@/content'
import i18n, { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import {
  saveResourceEdit,
  setExt01Approved,
  setResourceHidden,
  summariesKey,
  useCustomResources,
  useExt01ReviewApproved,
  useResourceText,
  useResourceVisible,
} from '@/store/admin-content'
import type { BuiltInResourceKey } from '@/store/db'
import { RemoveResourceButton, ResourceDialog } from './CustomResources'

type ResType = 'guide' | 'summary' | 'video' | 'link' | 'text'
const TYPE_ICON: Record<ResType, LucideIcon> = {
  guide: BookOpen,
  summary: FileText,
  video: PlayCircle,
  link: Link2,
  text: FileText,
}

/** Built-in guides: HTML pages in Resources (brief §2: downloads stay secondary). */
const GUIDES = [
  { key: 'stopThinkDo', unit: 'LS02', course: 'healthy-communication' },
  { key: 'playbook', unit: 'LS08', course: 'healthy-communication' },
  { key: 'hospitalityPlan', unit: 'HF08', course: 'intro-hospitality' },
] as const satisfies readonly { key: BuiltInResourceKey; unit: string; course: CourseId }[]

type Filter = 'all' | CourseId

/**
 * /admin/resources: ONE list of what learners see in Resources (brief §2, §9, §10). Each row:
 * picture, title, course, type, status (icon + text) and Edit / Show / Hide. EXT01 stays hidden
 * until approved; its technical fields sit in a collapsed Details panel.
 */
export function ResourcesAdminPage() {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const [filter, setFilter] = useState<Filter>('all')
  const custom = useCustomResources()
  const show = (c: CourseId) => filter === 'all' || filter === c

  const rows: ReactNode[] = []
  for (const c of COURSES) {
    if (!show(c.id)) continue
    for (const g of GUIDES) if (g.course === c.id) rows.push(<GuideRow key={g.key} guide={g} />)
    if (EXT01.courseId === c.id) rows.push(<Ext01Row key="ext01" />)
    rows.push(<SummariesRow key={`sum-${c.id}`} courseId={c.id} />)
    for (const r of custom) if (r.courseId === c.id) rows.push(<CustomRow key={r.id} r={r} />)
  }

  return (
    <div>
      <AdminPageHeader
        title={t('resources.title')}
        intro={t('resources.intro')}
        icon={FolderOpen}
        action={
          <ResourceDialog
            trigger={
              <Button type="button">
                <Plus aria-hidden="true" />
                {t('resources.custom.add')}
              </Button>
            }
          />
        }
      />

      <fieldset className="m-0 mb-6 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-2 p-0 font-semibold text-ink">{t('resources.list.filter')}</legend>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {(['all', ...COURSES.map((c) => c.id)] as Filter[]).map((f) => (
            <li key={f}>
              <Button
                type="button"
                variant={filter === f ? 'default' : 'secondary'}
                className="rounded-full"
                aria-pressed={filter === f}
                onClick={() => setFilter(f)}
              >
                {f === 'all' ? t('resources.list.all') : l(getCourse(f)?.title ?? { en: f, ar: f })}
              </Button>
            </li>
          ))}
        </ul>
      </fieldset>

      <h2 id="res-list" className="sr-only">
        {t('resources.list.heading')}
      </h2>
      <ul aria-labelledby="res-list" className="m-0 flex list-none flex-col gap-4 p-0">
        {rows}
      </ul>
    </div>
  )
}

/* ---------- row building blocks ---------- */

function TypeChip({ type }: { type: ResType }) {
  const { t } = useTranslation('admin')
  const Icon = TYPE_ICON[type]
  return (
    <Chip>
      <Icon aria-hidden="true" className="size-4 shrink-0" />
      {t(`resources.type.${type}`)}
    </Chip>
  )
}

type Status = 'visible' | 'hidden' | 'review'
function StatusChip({ status }: { status: Status }) {
  const { t } = useTranslation('admin')
  if (status === 'visible')
    return (
      <StatusLabel tone="done" icon={Eye}>
        {t('resources.status.visible')}
      </StatusLabel>
    )
  if (status === 'review')
    return <StatusLabel tone="warning">{t('resources.status.review')}</StatusLabel>
  return (
    <StatusLabel tone="neutral" icon={EyeOff}>
      {t('resources.status.hidden')}
    </StatusLabel>
  )
}

/** Show / Hide toggle for one resource key, with an announced result. */
function VisibilityButton({ resKey, title }: { resKey: string; title: string }) {
  const { t } = useTranslation('admin')
  const visible = useResourceVisible(resKey)
  function toggle() {
    setResourceHidden(resKey, visible)
    const msg = visible
      ? t('resources.list.hiddenToast', { title })
      : t('resources.list.shownToast', { title })
    toast.success(msg, { description: t('common.demoOnly') })
    announce(msg)
  }
  return (
    <Button
      type="button"
      variant="outline"
      onClick={toggle}
      aria-label={
        visible
          ? t('resources.list.hideLabel', { title })
          : t('resources.list.showLabel', { title })
      }
    >
      {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
      {visible ? t('resources.list.hide') : t('resources.list.show')}
    </Button>
  )
}

function ResourceRow({
  id,
  thumb,
  icon,
  courseId,
  type,
  title,
  description,
  status,
  actions,
  details,
}: {
  id: string
  thumb?: string
  icon: LucideIcon
  courseId: CourseId
  type: ResType
  title: string
  description: ReactNode
  status: Status
  actions: ReactNode
  details?: ReactNode
}) {
  const { l } = useLocalized()
  const course = getCourse(courseId)
  const Icon = icon
  const headingId = `row-${id}`
  return (
    <li className="max-w-none">
      <article
        aria-labelledby={headingId}
        className="card-pop flex flex-col gap-4 p-4 sm:p-5 md:flex-row md:items-start"
      >
        {thumb ? (
          <img
            src={asset(thumb)}
            alt=""
            width={320}
            height={180}
            loading="lazy"
            className="aspect-video w-full shrink-0 rounded-xl object-cover md:w-40"
          />
        ) : (
          <span
            aria-hidden="true"
            className="grid aspect-video w-full shrink-0 place-items-center rounded-xl bg-sedra-pale-100 text-sedra-green md:w-40"
          >
            <Icon className="size-10" strokeWidth={1.75} />
          </span>
        )}
        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <TypeChip type={type} />
            <Chip>{course ? l(course.title) : courseId}</Chip>
            <StatusChip status={status} />
          </div>
          <h3 id={headingId} className="m-0 text-xl break-words">
            {title}
          </h3>
          <div className="text-ink-soft [&_p]:m-0">{description}</div>
          <div className="mt-1 flex flex-wrap gap-2">{actions}</div>
          {details}
        </div>
      </article>
    </li>
  )
}

/* ---------- rows ---------- */

/** Default text for a built-in resource in a given language (not the admin UI language). */
function defaultText(key: BuiltInResourceKey, lang: Lang) {
  const tl = i18n.getFixedT(lang, 'admin')
  return {
    title: tl(`resources.internal.items.${key}.title`),
    body: tl(`resources.internal.items.${key}.body`),
  }
}

function useBuiltInText(key: BuiltInResourceKey) {
  const { lang } = useLocalized()
  const saved = useResourceText(key, lang)
  const base = defaultText(key, lang)
  return { title: saved.title ?? base.title, body: saved.body ?? base.body }
}

function GuideRow({ guide }: { guide: (typeof GUIDES)[number] }) {
  const visible = useResourceVisible(guide.key)
  const text = useBuiltInText(guide.key)
  return (
    <ResourceRow
      id={guide.key}
      thumb={`images/units/${guide.unit}.webp`}
      icon={BookOpen}
      courseId={guide.course}
      type="guide"
      title={text.title}
      description={<p>{text.body}</p>}
      status={visible ? 'visible' : 'hidden'}
      actions={
        <>
          <EditGuideDialog resourceKey={guide.key} title={text.title} />
          <VisibilityButton resKey={guide.key} title={text.title} />
        </>
      }
    />
  )
}

function SummariesRow({ courseId }: { courseId: CourseId }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const key = summariesKey(courseId)
  const visible = useResourceVisible(key)
  const course = getCourse(courseId)
  const n = UNITS.filter((u) => u.courseId === courseId).length
  const title = t('resources.list.summaries', { n })
  const courseName = course ? l(course.title) : courseId
  return (
    <ResourceRow
      id={key.replace(':', '-')}
      thumb={course?.image}
      icon={FileText}
      courseId={courseId}
      type="summary"
      title={title}
      description={<p>{t('resources.list.summariesBody')}</p>}
      status={visible ? 'visible' : 'hidden'}
      actions={
        <>
          <Button asChild variant="outline">
            <Link to="/admin/courses/$courseId" params={{ courseId }}>
              <Pencil aria-hidden="true" />
              {t('resources.list.editSummaries')}
              <span className="sr-only">: {courseName}</span>
            </Link>
          </Button>
          <VisibilityButton resKey={key} title={`${title}, ${courseName}`} />
        </>
      }
    />
  )
}

function CustomRow({ r }: { r: CustomResource }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const visible = useResourceVisible(r.id)
  const title = l(r.title)
  return (
    <ResourceRow
      id={r.id}
      icon={r.url ? Link2 : FileText}
      courseId={r.courseId}
      type={r.url ? 'link' : 'text'}
      title={title}
      description={
        <>
          <p className="whitespace-pre-line">{l(r.body)}</p>
          {r.url ? (
            <p className="mt-1 flex items-start gap-1.5 text-sm break-all">
              <ExternalLink
                aria-hidden="true"
                className="mt-0.5 size-4 shrink-0 text-sedra-green"
              />
              <span className="ltr-isolate">{r.url}</span>
            </p>
          ) : null}
        </>
      }
      status={visible ? 'visible' : 'hidden'}
      actions={
        <>
          <ResourceDialog
            resource={r}
            trigger={
              <Button
                type="button"
                variant="outline"
                aria-label={t('resources.custom.editLabel', { title })}
              >
                <Pencil aria-hidden="true" />
                {t('resources.custom.edit')}
              </Button>
            }
          />
          <VisibilityButton resKey={r.id} title={title} />
          <RemoveResourceButton r={r} />
        </>
      }
    />
  )
}

/** EXT01 (brief §9): hidden until approved; exact URLs and review checklist under Details. */
function Ext01Row() {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const approved = useExt01ReviewApproved()
  const visible = useResourceVisible('EXT01')
  const title = l(EXT01.title)

  function setApproved(next: boolean) {
    setExt01Approved(next)
    const msg = next ? t('resources.ext.approvedToast') : t('resources.ext.backToReviewToast')
    toast.success(msg, { description: t('common.demoOnly') })
    announce(msg)
  }

  return (
    <ResourceRow
      id="ext01"
      icon={PlayCircle}
      courseId={EXT01.courseId}
      type="video"
      title={title}
      description={
        <p>
          {approved ? t('resources.ext.visibleToLearners') : t('resources.ext.hiddenFromLearners')}
        </p>
      }
      status={!approved ? 'review' : visible ? 'visible' : 'hidden'}
      actions={
        approved ? (
          <VisibilityButton resKey="EXT01" title={title} />
        ) : (
          <Button type="button" onClick={() => setApproved(true)}>
            <ShieldCheck aria-hidden="true" />
            {t('resources.ext.approve')}
          </Button>
        )
      }
      details={<Ext01Details approved={approved} onBackToReview={() => setApproved(false)} />}
    />
  )
}

function Ext01Details({
  approved,
  onBackToReview,
}: {
  approved: boolean
  onBackToReview: () => void
}) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const [open, setOpen] = useState(false)
  const [preview, setPreview] = useState(false)
  const course = getCourse(EXT01.courseId)
  const items: { icon: LucideIcon; label: string; value: ReactNode }[] = [
    {
      icon: Tag,
      label: t('resources.list.reviewStatus'),
      value: t('resources.ext.reviewStatus'),
    },
    {
      icon: MapPin,
      label: t('resources.ext.placement'),
      value: t('resources.ext.placementValue', {
        course: course ? l(course.title) : EXT01.courseId,
      }),
    },
    {
      icon: Link2,
      label: t('resources.ext.originalUrl'),
      value: <code className="ltr-isolate break-all">{EXT01.originalUrl}</code>,
    },
    {
      icon: Link2,
      label: t('resources.ext.embedUrl'),
      value: <code className="ltr-isolate break-all">{EXT01.embedUrl}</code>,
    },
    {
      icon: Tag,
      label: t('resources.ext.fallbackLabel'),
      value: (
        <>
          {EXT01.fallbackLabel.en} /{' '}
          <span lang="ar" dir="rtl">
            {EXT01.fallbackLabel.ar}
          </span>
        </>
      ),
    },
    {
      icon: CheckCircle2,
      label: t('resources.ext.completion'),
      value: t('resources.ext.notRequired'),
    },
  ]
  return (
    <div className="mt-2">
      <Button
        type="button"
        variant="ghost"
        className="-ms-2 px-2 text-sedra-green"
        aria-expanded={open}
        aria-controls="ext01-details"
        onClick={() => setOpen((o) => !o)}
      >
        <ChevronDown
          aria-hidden="true"
          className={cn('transition-transform', open && 'rotate-180')}
        />
        {t('resources.list.details')}
      </Button>
      <div id="ext01-details" hidden={!open} className="mt-2 flex flex-col gap-4">
        {open ? (
          <>
            <dl className="m-0 grid gap-3 lg:grid-cols-2">
              {items.map(({ icon: Icon, label, value }) => (
                <div key={label} className="min-w-0 rounded-xl bg-sedra-pale-50 p-3">
                  <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
                    <Icon aria-hidden="true" className="size-4 text-sedra-green" />
                    {label}
                  </dt>
                  <dd className="m-0 text-ink">{value}</dd>
                </div>
              ))}
            </dl>
            <Notice>
              <p>{t('resources.ext.reviewNote')}</p>
            </Notice>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <a href={EXT01.originalUrl} target="_blank" rel="noopener noreferrer">
                  <ExternalLink aria-hidden="true" />
                  {l(EXT01.fallbackLabel)}
                  <span className="sr-only"> {t('common.opensNewTab')}</span>
                </a>
              </Button>
              <Button
                type="button"
                variant="secondary"
                aria-expanded={preview}
                aria-controls="ext01-preview"
                onClick={() => setPreview((p) => !p)}
              >
                {preview ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                {preview ? t('resources.ext.hidePreview') : t('resources.ext.showPreview')}
              </Button>
              {approved ? (
                <Button type="button" variant="outline" onClick={onBackToReview}>
                  <RotateCcw aria-hidden="true" />
                  {t('resources.ext.backToReview')}
                </Button>
              ) : null}
            </div>
            <div id="ext01-preview">
              {preview ? (
                <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-2xl bg-black shadow-lg">
                  <iframe
                    src={EXT01.embedUrl}
                    title={t('resources.ext.iframeTitle', { title: l(EXT01.title) })}
                    className="size-full"
                    allow="encrypted-media; picture-in-picture"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                </div>
              ) : null}
            </div>
          </>
        ) : null}
      </div>
    </div>
  )
}

/* ---------- built-in guide edit (EN + AR in one dialog, same layout as Add resource) ---------- */

/** Content fields SEDRA can edit inside each built-in resource (learner i18n keys). */
const CONTENT_FIELDS: Record<BuiltInResourceKey, string[]> = {
  stopThinkDo: ['stop', 'stopBody', 'think', 'thinkBody', 'do', 'doBody'],
  playbook: [],
  hospitalityPlan: [],
}
/** Resources whose content comes from a unit's practice activity. */
const UNIT_OF: Record<BuiltInResourceKey, 'LS02' | 'LS08' | 'HF08'> = {
  stopThinkDo: 'LS02',
  playbook: 'LS08',
  hospitalityPlan: 'HF08',
}
const LANGS: Lang[] = ['en', 'ar']
type LangText = Record<Lang, string>

function EditGuideDialog({
  resourceKey,
  title,
}: {
  resourceKey: BuiltInResourceKey
  title: string
}) {
  const { t } = useTranslation('admin')
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" aria-label={t('resources.internal.editLabel', { title })}>
          <Pencil aria-hidden="true" />
          {t('resources.internal.edit')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white p-5 sm:max-w-2xl sm:p-6">
        {open ? <EditGuideForm resourceKey={resourceKey} onDone={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

function EditGuideForm({
  resourceKey,
  onDone,
}: {
  resourceKey: BuiltInResourceKey
  onDone: () => void
}) {
  const { t } = useTranslation('admin')
  const savedEn = useResourceText(resourceKey, 'en')
  const savedAr = useResourceText(resourceKey, 'ar')
  const saved = { en: savedEn, ar: savedAr }
  const contentFields = CONTENT_FIELDS[resourceKey]
  const init = (pick: (lang: Lang) => string): LangText => ({ en: pick('en'), ar: pick('ar') })
  const [title, setTitle] = useState<LangText>(() =>
    init((g) => saved[g].title ?? defaultText(resourceKey, g).title),
  )
  const [body, setBody] = useState<LangText>(() =>
    init((g) => saved[g].body ?? defaultText(resourceKey, g).body),
  )
  const [fields, setFields] = useState<Record<string, LangText>>(() =>
    Object.fromEntries(
      contentFields.map((k) => [
        k,
        init((g) => saved[g].field(k) ?? i18n.getFixedT(g, 'learner')(`resources.${k}`)),
      ]),
    ),
  )
  const [errors, setErrors] = useState<Partial<Record<string, boolean>>>({})
  const langName = (g: Lang) => t(`editor.lang.${g}`)

  function onSave() {
    const e: Record<string, boolean> = {}
    for (const g of LANGS) {
      if (!title[g].trim()) e[`title-${g}`] = true
      if (!body[g].trim()) e[`body-${g}`] = true
    }
    setErrors(e)
    const first = Object.keys(e)[0]
    if (first) {
      requestAnimationFrame(() => document.getElementById(`re-${resourceKey}-${first}`)?.focus())
      return
    }
    for (const g of LANGS) {
      const cleaned = Object.fromEntries(
        Object.entries(fields)
          .map(([k, v]) => [k, v[g].trim()])
          .filter(([, v]) => v),
      )
      saveResourceEdit(resourceKey, g, {
        title: title[g].trim(),
        body: body[g].trim(),
        fields: cleaned,
      })
    }
    toast.success(t('resources.internal.savedToast'), {
      description: t('resources.internal.savedDesc'),
    })
    announce(t('resources.internal.savedToast'))
    onDone()
  }

  return (
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
          <h2 className="m-0 text-2xl">{t('resources.internal.editTitle')}</h2>
        </DialogTitle>
        <DialogDescription className="text-base text-ink-soft">
          {t('resources.list.guideIntro')}
        </DialogDescription>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {LANGS.map((g) => (
          <TextField
            key={`t-${g}`}
            id={`re-${resourceKey}-title-${g}`}
            label={t('resources.list.fieldTitleIn', { lang: langName(g) })}
            value={title[g]}
            onChange={(v) => setTitle((s) => ({ ...s, [g]: v }))}
            error={
              errors[`title-${g}`]
                ? t('resources.list.errorTitle', { lang: langName(g) })
                : undefined
            }
            dir={g === 'ar' ? 'rtl' : 'ltr'}
            required
          />
        ))}
        {LANGS.map((g) => (
          <TextField
            key={`b-${g}`}
            id={`re-${resourceKey}-body-${g}`}
            label={t('resources.list.fieldBodyIn', { lang: langName(g) })}
            value={body[g]}
            onChange={(v) => setBody((s) => ({ ...s, [g]: v }))}
            error={
              errors[`body-${g}`] ? t('resources.list.errorBody', { lang: langName(g) }) : undefined
            }
            multiline
            rows={3}
            dir={g === 'ar' ? 'rtl' : 'ltr'}
            required
          />
        ))}
      </div>
      {contentFields.length > 0 ? (
        <fieldset className="m-0 flex flex-col gap-4 rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4">
          <legend className="px-1 font-semibold text-ink">
            {t('resources.internal.contentHeading')}
          </legend>
          {contentFields.map((k) => (
            <div key={k} className="grid gap-4 md:grid-cols-2">
              {LANGS.map((g) => (
                <TextField
                  key={g}
                  id={`re-${resourceKey}-${k}-${g}`}
                  label={`${t(`resources.internal.fields.${k}`)} (${langName(g)})`}
                  value={fields[k]?.[g] ?? ''}
                  onChange={(v) =>
                    setFields((s) => ({ ...s, [k]: { ...(s[k] ?? { en: '', ar: '' }), [g]: v } }))
                  }
                  multiline={k.endsWith('Body')}
                  rows={2}
                  dir={g === 'ar' ? 'rtl' : 'ltr'}
                />
              ))}
            </div>
          ))}
        </fieldset>
      ) : (
        <div className="rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4">
          <p className="m-0">{t(`resources.internal.fromUnit.${resourceKey}`)}</p>
          <Link
            to="/admin/content/$unitId"
            params={{ unitId: UNIT_OF[resourceKey] }}
            className="mt-1 inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline underline-offset-4"
          >
            <Pencil aria-hidden="true" className="size-5" />
            {t('resources.internal.editUnit', { id: UNIT_OF[resourceKey] })}
          </Link>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          <Save aria-hidden="true" />
          {t('builder.settingsSave')}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
