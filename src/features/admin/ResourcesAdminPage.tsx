import type { Lang } from '@shared/types'
import { Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Link2,
  MapPin,
  Pencil,
  PlayCircle,
  Save,
  Tag,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  Chip,
  IconCircle,
  Notice,
  StatusLabel,
  TextField,
} from '@/components/admin/AdminUi'
import { ContentLangSwitch, useContentLang } from '@/components/admin/ContentLangSwitch'
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
import { EXT01, getCourse } from '@/content'
import i18n, { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import {
  saveResourceEdit,
  setExt01Approved,
  useExt01Approved,
  useResourceText,
} from '@/store/admin-content'
import type { BuiltInResourceKey } from '@/store/db'
import { CustomResourcesSection } from './CustomResources'

/** In-platform resources: HTML summaries; downloads stay secondary (brief §2 Resources). */
const INTERNAL_RESOURCES = [
  { key: 'stopThinkDo', unit: 'LS02', course: 'healthy-communication' },
  { key: 'playbook', unit: 'LS08', course: 'healthy-communication' },
  { key: 'hospitalityPlan', unit: 'HF08', course: 'intro-hospitality' },
] as const

/** /admin/resources: EXT01 review record + in-platform resources (brief §9, §10). */
export function ResourcesAdminPage() {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const [preview, setPreview] = useState(false)
  const course = getCourse(EXT01.courseId)
  const approved = useExt01Approved()

  function toggleApproved() {
    setExt01Approved(!approved)
    const msg = approved ? t('resources.ext.backToReviewToast') : t('resources.ext.approvedToast')
    toast.success(msg, { description: t('add.demoOnly') })
    announce(msg)
  }

  return (
    <div>
      <AdminPageHeader
        title={t('resources.title')}
        intro={t('resources.intro')}
        icon={FolderOpen}
      ></AdminPageHeader>

      <section
        aria-labelledby="ext01-title"
        className="mb-10 flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-md sm:p-7"
      >
        <div className="flex flex-wrap items-start gap-4">
          <IconCircle icon={PlayCircle} tint="notice" size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip className="ltr-isolate">{EXT01.id}</Chip>
              {approved ? (
                <StatusLabel tone="done">{t('resources.ext.approvedStatus')}</StatusLabel>
              ) : (
                <StatusLabel tone="warning">{t('resources.ext.reviewStatus')}</StatusLabel>
              )}
            </div>
            <h2 id="ext01-title" className="m-0 text-2xl">
              {l(EXT01.title)}
            </h2>
          </div>
        </div>
        <dl className="m-0 grid gap-3 md:grid-cols-2">
          <div className="min-w-0 rounded-xl bg-sedra-pale-50 p-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <MapPin aria-hidden="true" className="size-4 text-sedra-green" />
              {t('resources.ext.placement')}
            </dt>
            <dd className="m-0">
              {t('resources.ext.placementValue', {
                course: course ? l(course.title) : EXT01.courseId,
              })}
            </dd>
          </div>
          <div className="min-w-0 rounded-xl bg-sedra-pale-50 p-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <Link2 aria-hidden="true" className="size-4 text-sedra-green" />
              {t('resources.ext.originalUrl')}
            </dt>
            <dd className="m-0 break-all">
              <code className="ltr-isolate">{EXT01.originalUrl}</code>
            </dd>
          </div>
          <div className="min-w-0 rounded-xl bg-sedra-pale-50 p-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <Link2 aria-hidden="true" className="size-4 text-sedra-green" />
              {t('resources.ext.embedUrl')}
            </dt>
            <dd className="m-0 break-all">
              <code className="ltr-isolate">{EXT01.embedUrl}</code>
            </dd>
          </div>
          <div className="min-w-0 rounded-xl bg-sedra-pale-50 p-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <Tag aria-hidden="true" className="size-4 text-sedra-green" />
              {t('resources.ext.fallbackLabel')}
            </dt>
            <dd className="m-0">
              {EXT01.fallbackLabel.en} /{' '}
              <span lang="ar" dir="rtl">
                {EXT01.fallbackLabel.ar}
              </span>
            </dd>
          </div>
          <div className="min-w-0 rounded-xl bg-sedra-pale-50 p-3">
            <dt className="flex items-center gap-2 text-sm font-semibold text-ink-soft">
              <CheckCircle2 aria-hidden="true" className="size-4 text-sedra-green" />
              {t('resources.ext.completion')}
            </dt>
            <dd className="m-0">
              <StatusLabel tone="neutral">{t('resources.ext.notRequired')}</StatusLabel>
            </dd>
          </div>
        </dl>
        <Notice>
          <p>{t('resources.ext.reviewNote')}</p>
        </Notice>
        <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4">
          <p className="m-0 min-w-0 flex-1 basis-64">
            {approved
              ? t('resources.ext.visibleToLearners')
              : t('resources.ext.hiddenFromLearners')}
          </p>
          <Button type="button" variant={approved ? 'outline' : 'default'} onClick={toggleApproved}>
            {approved ? t('resources.ext.backToReview') : t('resources.ext.approve')}
          </Button>
        </div>
        <div className="flex flex-wrap gap-3">
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
      </section>

      <section aria-labelledby="internal-res" className="flex flex-col gap-3">
        <div className="flex items-center gap-3">
          <IconCircle icon={FileText} />
          <h2 id="internal-res" className="m-0 text-2xl">
            {t('resources.internal.heading')}
          </h2>
        </div>
        <p className="m-0 text-ink-soft">{t('resources.internal.intro')}</p>
        <div className="mt-1 flex flex-wrap items-end gap-x-6 gap-y-2 rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4">
          <ContentLangSwitch />
          <p className="m-0 max-w-xl flex-1 basis-64 text-base text-ink-soft">
            {t('resources.internal.langHint')}
          </p>
        </div>
        <ul className="m-0 mt-2 grid list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {INTERNAL_RESOURCES.map((r, i) => {
            const c = getCourse(r.course)
            return (
              <Reveal as="li" key={r.key} delay={stagger(i)} className="max-w-none">
                <article
                  aria-labelledby={`res-${r.key}`}
                  className="card-pop flex h-full flex-col overflow-hidden"
                >
                  <img
                    src={asset(`images/units/${r.unit}.webp`)}
                    alt=""
                    width={480}
                    height={270}
                    loading="lazy"
                    className="aspect-[16/9] w-full object-cover"
                  />
                  <div className="flex flex-1 flex-col gap-2 p-5">
                    <p className="m-0 text-sm font-semibold text-ink-soft">
                      <span className="ltr-isolate">{r.unit}</span>
                      {c ? ` · ${l(c.title)}` : ''}
                    </p>
                    <ResourceText resourceKey={r.key} />
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      <StatusLabel tone="done">{t('resources.internal.status')}</StatusLabel>
                      <p className="m-0 text-sm text-ink-soft">
                        {t('resources.internal.download')}
                      </p>
                      <EditResourceDialog resourceKey={r.key} />
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </ul>
      </section>

      <CustomResourcesSection />
    </div>
  )
}

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

/** Default text for a built-in resource in a given language (not the admin UI language). */
function defaultText(key: BuiltInResourceKey, lang: Lang) {
  const tl = i18n.getFixedT(lang, 'admin')
  return {
    title: tl(`resources.internal.items.${key}.title`),
    body: tl(`resources.internal.items.${key}.body`),
  }
}

/** Title and description in the content language the switch shows (saved edit, else default). */
function ResourceText({ resourceKey }: { resourceKey: BuiltInResourceKey }) {
  const lang = useContentLang()
  const saved = useResourceText(resourceKey, lang)
  const base = defaultText(resourceKey, lang)
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  return (
    <div lang={lang} dir={dir} className="flex flex-col gap-2">
      <h3 id={`res-${resourceKey}`} className="m-0 text-lg">
        {saved.title ?? base.title}
      </h3>
      <p className="m-0">{saved.body ?? base.body}</p>
    </div>
  )
}

/** Popup: SEDRA edits a built-in resource's title and description in the selected language. */
function EditResourceDialog({ resourceKey }: { resourceKey: BuiltInResourceKey }) {
  const { t } = useTranslation('admin')
  const lang = useContentLang()
  const saved = useResourceText(resourceKey, lang)
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [errors, setErrors] = useState<{ title?: boolean; body?: boolean }>({})
  const [fields, setFields] = useState<Record<string, string>>({})
  const dir = lang === 'ar' ? 'rtl' : 'ltr'
  const base = defaultText(resourceKey, lang)
  const contentFields = CONTENT_FIELDS[resourceKey]
  const shownTitle = saved.title ?? base.title

  function onOpenChange(next: boolean) {
    if (next) {
      setTitle(shownTitle)
      setBody(saved.body ?? base.body)
      const tl = i18n.getFixedT(lang, 'learner')
      setFields(
        Object.fromEntries(contentFields.map((k) => [k, saved.field(k) ?? tl(`resources.${k}`)])),
      )
      setErrors({})
    }
    setOpen(next)
  }

  function onSave() {
    const e = { title: !title.trim(), body: !body.trim() }
    setErrors(e)
    if (e.title || e.body) {
      requestAnimationFrame(() =>
        document
          .getElementById(e.title ? `re-${resourceKey}-title` : `re-${resourceKey}-body`)
          ?.focus(),
      )
      return
    }
    const cleaned = Object.fromEntries(
      Object.entries(fields)
        .map(([k, v]) => [k, v.trim()])
        .filter(([, v]) => v),
    )
    saveResourceEdit(resourceKey, lang, { title: title.trim(), body: body.trim(), fields: cleaned })
    toast.success(t('resources.internal.savedToast'), {
      description: t('resources.internal.savedDesc'),
    })
    announce(t('resources.internal.savedToast'))
    setOpen(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="self-start"
          aria-label={t('resources.internal.editLabel', { title: shownTitle })}
        >
          <Pencil aria-hidden="true" />
          {t('resources.internal.edit')}
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
              <h2 className="m-0 text-2xl">{t('resources.internal.editTitle')}</h2>
            </DialogTitle>
            <DialogDescription className="text-base text-ink-soft">
              {t('builder.editingIn', { lang: t(`editor.lang.${lang}`) })}
            </DialogDescription>
          </div>
          <TextField
            id={`re-${resourceKey}-title`}
            label={t('resources.internal.fieldTitle')}
            value={title}
            onChange={setTitle}
            error={errors.title ? t('builder.settingsRequired') : undefined}
            dir={dir}
            required
          />
          <TextField
            id={`re-${resourceKey}-body`}
            label={t('resources.internal.fieldBody')}
            value={body}
            onChange={setBody}
            error={errors.body ? t('builder.settingsRequired') : undefined}
            multiline
            dir={dir}
            required
          />
          {contentFields.length > 0 ? (
            <fieldset className="m-0 flex flex-col gap-4 rounded-2xl border border-sedra-pale bg-sedra-pale-50 p-4">
              <legend className="px-1 font-semibold text-ink">
                {t('resources.internal.contentHeading')}
              </legend>
              {contentFields.map((k) => (
                <TextField
                  key={k}
                  id={`re-${resourceKey}-${k}`}
                  label={t(`resources.internal.fields.${k}`)}
                  value={fields[k] ?? ''}
                  onChange={(v) => setFields((s) => ({ ...s, [k]: v }))}
                  multiline={k.endsWith('Body')}
                  rows={2}
                  dir={dir}
                />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
