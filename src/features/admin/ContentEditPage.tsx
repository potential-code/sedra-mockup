import type { Lang, Unit, UnitId } from '@shared/types'
import { Link, useParams } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowLeft,
  Captions,
  CircleCheck,
  Eye,
  FileText,
  FileVideo,
  Languages,
  ListChecks,
  type LucideIcon,
  Pencil,
  Save,
  Sprout,
  Video,
} from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import {
  AdminPageHeader,
  FieldCode,
  FieldError,
  IconCircle,
  SelectField,
  StatusLabel,
  TextField,
} from '@/components/admin/AdminUi'
import { ContentLangSwitch, useContentLang } from '@/components/admin/ContentLangSwitch'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { getUnit } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { getContentDraft, saveContentDraft } from '@/store/admin-actions'
import { publishUnit, unitFromFields } from '@/store/admin-content'
import {
  type FieldErrors,
  type FieldKey,
  type Fields,
  fieldsFromUnit,
  type ReviewStatus,
  validateForPublish,
} from './content-fields'
import { PracticeChoicesEditor } from './PracticeChoicesEditor'

function BackLink({ courseId }: { courseId?: string }) {
  const { t } = useTranslation('admin')
  const cls =
    'mb-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 font-semibold text-sedra-green shadow-sm transition-shadow hover:shadow-md'
  if (courseId) {
    return (
      <Link to="/admin/courses/$courseId" params={{ courseId }} className={cls}>
        <ArrowLeft aria-hidden="true" className="rtl-mirror size-5" />
        {t('editor.backToCourse')}
      </Link>
    )
  }
  return (
    <Link
      to="/admin/content"
      className="mb-4 inline-flex min-h-12 items-center gap-2 rounded-full bg-white px-4 font-semibold text-sedra-green shadow-sm transition-shadow hover:shadow-md"
    >
      <ArrowLeft aria-hidden="true" className="rtl-mirror size-5" />
      {t('editor.back')}
    </Link>
  )
}

/** Load the saved demo draft for a language, or prefill from the unit content. */
function initialFields(unit: Unit, lang: Lang): Fields {
  const base = fieldsFromUnit(unit, lang)
  const saved = getContentDraft(unit.id, lang)
  if (!saved) return base
  return { ...base, ...saved.fields, review_status: saved.reviewStatus } as Fields
}

/** /admin/content/$unitId: simulated content editor with publish validation (brief §9). */
export function ContentEditPage() {
  const { t } = useTranslation('admin')
  const { unitId } = useParams({ from: '/_admin/admin/content/$unitId' })
  const unit = getUnit(unitId)
  if (!unit) {
    return (
      <div>
        <BackLink />
        <AdminPageHeader
          title={t('editor.notFoundTitle')}
          intro={t('editor.notFoundBody')}
          icon={Pencil}
        />
      </div>
    )
  }
  return <Editor key={unit.id} unit={unit} />
}

function Editor({ unit }: { unit: Unit }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  // Both language drafts live in state, so switching language never loses entered text.
  const [byLang, setByLang] = useState<Record<Lang, Fields>>(() => ({
    en: initialFields(unit, 'en'),
    ar: initialFields(unit, 'ar'),
  }))
  const lang = useContentLang()
  const [errors, setErrors] = useState<FieldErrors>({})
  const summaryRef = useRef<HTMLDivElement>(null)

  const fields = byLang[lang]
  const textDir = lang === 'ar' ? 'rtl' : 'ltr'

  const set = (k: FieldKey) => (v: string) => {
    setByLang((s) => ({ ...s, [lang]: { ...s[lang], [k]: v } }))
  }

  const err = (k: FieldKey) => (errors[k] ? t(errors[k]) : undefined)

  function persist() {
    const { review_status, ...rest } = fields
    saveContentDraft({
      unitId: unit.id as UnitId,
      language: lang,
      fields: rest,
      reviewStatus: review_status as ReviewStatus,
    })
  }

  function onPublish() {
    const e = validateForPublish(fields)
    setErrors(e)
    if (Object.keys(e).length > 0) {
      // Keep everything the editor typed; show a summary and move focus to it.
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    persist()
    // Build from the latest live unit so the other language keeps its current text.
    const current = getUnit(unit.id) ?? unit
    publishUnit(unitFromFields(current, lang, fields))
    toast.success(t('editor.publishToast'), { description: t('editor.liveToast') })
    announce(`${t('editor.publishToast')} ${t('editor.liveToast')}`)
  }

  function onChooseFile(file: File | undefined) {
    if (!file) return
    // Simulated: only the file name is recorded. Nothing is uploaded or played to learners.
    set('video_url')(file.name)
  }

  const errorEntries = Object.entries(errors) as [FieldKey, string][]
  const field = (k: FieldKey, extra: Partial<Parameters<typeof TextField>[0]> = {}) => (
    <TextField
      id={`f-${k}`}
      label={t(`editor.fields.${k}`)}
      code={k.startsWith('options_') ? 'options' : k}
      value={fields[k]}
      onChange={set(k)}
      error={err(k)}
      dir={textDir}
      {...extra}
    />
  )

  return (
    <div>
      <BackLink courseId={unit.courseId} />
      <AdminPageHeader
        title={t('editor.title', { id: unit.id, title: l(unit.title) })}
        intro={t('editor.intro')}
        icon={Pencil}
      />

      {errorEntries.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          aria-labelledby="err-summary-title"
          className="mb-6 rounded-2xl border-2 border-destructive bg-white p-5 shadow-md"
        >
          <h2
            id="err-summary-title"
            className="m-0 flex items-center gap-2 text-xl text-destructive"
          >
            <AlertTriangle aria-hidden="true" className="size-6 shrink-0" />
            {t('editor.errorSummary', { n: errorEntries.length })}
          </h2>
          <p className="mt-1 mb-2">{t('editor.errorSummaryHelp')}</p>
          <ul className="m-0 flex flex-col gap-1 ps-5">
            {errorEntries.map(([k, msg]) => (
              <li key={k}>
                <button
                  type="button"
                  className="min-h-11 text-start font-semibold text-sedra-green underline underline-offset-4"
                  onClick={() => document.getElementById(`f-${k}`)?.focus()}
                >
                  {t(`editor.fields.${k}`)}: {t(msg)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_20rem]">
        <form
          noValidate
          onSubmit={(e) => e.preventDefault()}
          className="flex min-w-0 flex-col gap-6"
        >
          <Section id="sec-language" title={t('editor.sections.language')} icon={Languages}>
            <p id="lang-hint" className="m-0 text-sm text-ink-soft">
              {t('editor.languageHint')}
            </p>
            <ContentLangSwitch onChange={() => setErrors({})} />
            {errors.language ? (
              <FieldError id="f-language-error">{t(errors.language)}</FieldError>
            ) : null}
          </Section>

          <Section id="sec-lesson" title={t('editor.sections.lesson')} icon={FileText}>
            {field('title', { required: true })}
            {field('objective', { multiline: true, rows: 2 })}
            {field('source_pages', { dir: 'ltr' })}
            {field('summary', { multiline: true, rows: 5, required: true })}
          </Section>

          <Section id="sec-media" title={t('editor.sections.media')} icon={Video} tint="info">
            {field('video_url', { dir: 'ltr', hint: t('editor.hints.video_url', { id: unit.id }) })}
            <div className="flex flex-col gap-1.5 rounded-xl border-2 border-dashed border-border bg-sedra-pale-50 p-3">
              <label
                htmlFor="f-video_file"
                className="inline-flex items-center gap-2 font-semibold text-ink"
              >
                <FileVideo aria-hidden="true" className="size-5 text-sedra-green" />
                {t('editor.chooseFile')}
              </label>
              <p id="f-video_file-hint" className="m-0 text-sm font-semibold text-notice">
                {t('editor.fileNotUploaded')}
              </p>
              <input
                id="f-video_file"
                type="file"
                accept="video/*"
                aria-describedby="f-video_file-hint"
                onChange={(e) => {
                  onChooseFile(e.target.files?.[0])
                  e.target.value = ''
                }}
                className="min-h-12 w-full max-w-full text-base file:me-3 file:min-h-12 file:cursor-pointer file:rounded-xl file:border-2 file:border-sedra-green file:bg-white file:px-4 file:font-semibold file:text-sedra-green"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              {field('duration_seconds', {
                dir: 'ltr',
                inputMode: 'numeric',
                hint: t('editor.hints.duration_seconds'),
              })}
              <SelectField
                id="f-media_status"
                label={t('editor.fields.media_status')}
                code="media_status"
                value={fields.media_status}
                onChange={set('media_status')}
                options={[
                  { value: 'sample', label: t('media.sample') },
                  { value: 'pending', label: t('media.pending') },
                ]}
              />
            </div>
            {field('captions_url', {
              dir: 'ltr',
              hint: t('editor.hints.captions_url', { id: unit.id }),
            })}
          </Section>

          <Section
            id="sec-alt"
            title={t('editor.sections.alternatives')}
            icon={Captions}
            tint="success"
          >
            <p className="m-0 text-sm text-ink-soft">{t('editor.alternativesHint')}</p>
            {field('transcript', { multiline: true, rows: 5, required: true })}
            {field('image_alt', { multiline: true, rows: 2, required: true })}
          </Section>

          <Section id="sec-check" title={t('editor.sections.check')} icon={ListChecks}>
            {field('question', { multiline: true, rows: 2, required: true })}
            <fieldset className="m-0 flex flex-col gap-4 rounded-xl border-2 border-dashed border-border p-4">
              <legend className="px-1 font-semibold text-ink">
                {t('editor.optionsLegend')}
                <FieldCode code="options" />
              </legend>
              {field('options_A', { required: true })}
              {field('options_B', { required: true })}
              {field('options_C', { required: true })}
            </fieldset>
            <SelectField
              id="f-correct_option"
              label={t('editor.fields.correct_option')}
              code="correct_option"
              value={fields.correct_option}
              onChange={set('correct_option')}
              error={err('correct_option')}
              options={[
                { value: '', label: t('editor.chooseOne') },
                { value: 'A', label: t('editor.optionLetter', { letter: 'A' }) },
                { value: 'B', label: t('editor.optionLetter', { letter: 'B' }) },
                { value: 'C', label: t('editor.optionLetter', { letter: 'C' }) },
              ]}
            />
            <div className="grid gap-4 md:grid-cols-2">
              {field('feedback_correct', { multiline: true, rows: 3, required: true })}
              {field('feedback_retry', { multiline: true, rows: 3, required: true })}
            </div>
          </Section>

          <Section id="sec-practice" title={t('editor.sections.practice')} icon={Sprout}>
            {field('practice_prompt', { multiline: true, rows: 3 })}
            <PracticeChoicesEditor
              value={fields.practice_choices}
              onChange={set('practice_choices')}
              multiple={fields.practice_multiple === 'yes' ? 'yes' : 'no'}
              onMultipleChange={set('practice_multiple')}
              dir={textDir}
            />
            <p className="m-0 text-sm text-ink-soft">{t('editor.practiceNote')}</p>
          </Section>

          {/* Sticky action bar: the one Save changes stays in reach while scrolling a long form. */}
          <div className="sticky bottom-3 z-20 flex flex-wrap items-center gap-3 rounded-2xl border border-border/70 bg-white/95 p-3 shadow-pop backdrop-blur sm:p-4">
            <p className="m-0 hidden min-w-0 flex-1 items-center gap-2 text-sm text-ink-soft sm:flex">
              <Languages aria-hidden="true" className="size-4 shrink-0 text-sedra-green" />
              {t('editor.barEditing', { lang: t(`editor.lang.${lang}`) })}
            </p>
            <Button type="button" onClick={onPublish} className="flex-1 sm:flex-none">
              <Save aria-hidden="true" />
              {t('editor.saveLive')}
            </Button>
          </div>
        </form>

        <UnitPreview unit={unit} fields={fields} dir={textDir} />
      </div>
    </div>
  )
}

/** Live preview of how the unit card and check read, from the fields being edited. */
function UnitPreview({ unit, fields, dir }: { unit: Unit; fields: Fields; dir: 'ltr' | 'rtl' }) {
  const { t } = useTranslation('admin')
  const options = (['A', 'B', 'C'] as const).map((id) => ({ id, text: fields[`options_${id}`] }))
  return (
    <aside aria-labelledby="preview-h" className="flex flex-col gap-3">
      <h2 id="preview-h" className="m-0 flex items-center gap-2 text-xl">
        <Eye aria-hidden="true" className="size-5" />
        {t('editor.preview.heading')}
      </h2>
      <div className="overflow-hidden rounded-2xl bg-white shadow-md">
        <div className="relative">
          <img
            src={asset(`images/units/${unit.id}.webp`)}
            alt={fields.image_alt}
            width={640}
            height={360}
            className="aspect-[16/9] w-full object-cover"
          />
          <span className="ltr-isolate absolute top-3 start-3 rounded-full bg-white px-3 py-0.5 text-sm font-bold text-sedra-green shadow-sm">
            {unit.id}
          </span>
        </div>
        <div className="flex flex-col gap-3 p-4" dir={dir}>
          <p className="m-0 text-xl font-bold text-sedra-green">
            {fields.title || t('editor.preview.noTitle')}
          </p>
          <p className="m-0 line-clamp-4 text-base text-ink">
            {fields.summary || t('editor.preview.noSummary')}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {fields.media_status === 'sample' ? (
              <StatusLabel tone="done" icon={Video}>
                {t('media.sample')}
              </StatusLabel>
            ) : (
              <StatusLabel tone="pending">{t('media.pending')}</StatusLabel>
            )}
          </div>
          <div className="rounded-xl bg-sedra-pale-50 p-3">
            <p className="m-0 mb-2 font-semibold text-ink">
              {fields.question || t('editor.preview.noQuestion')}
            </p>
            <ul className="m-0 flex list-none flex-col gap-1.5 p-0">
              {options.map((o) => {
                const correct = fields.correct_option === o.id
                return (
                  <li
                    key={o.id}
                    className={cn(
                      'flex max-w-none items-start gap-2 rounded-lg border-2 bg-white px-3 py-2 text-sm',
                      correct ? 'border-sedra-green' : 'border-transparent',
                    )}
                  >
                    <span className="ltr-isolate font-bold text-sedra-green">{o.id}</span>
                    <span className="min-w-0 flex-1">{o.text}</span>
                    {correct ? (
                      <span className="inline-flex shrink-0 items-center gap-1 font-semibold text-success">
                        <CircleCheck aria-hidden="true" className="size-4" />
                        {t('editor.preview.correct')}
                      </span>
                    ) : null}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>
      </div>
      <p className="m-0 text-sm text-ink-soft">{t('editor.preview.note')}</p>
    </aside>
  )
}

function Section({
  id,
  title,
  icon,
  tint,
  children,
}: {
  id: string
  title: string
  icon: LucideIcon
  tint?: 'green' | 'info' | 'notice' | 'success'
  children: ReactNode
}) {
  return (
    <section
      aria-labelledby={id}
      className="flex min-w-0 flex-col gap-4 rounded-2xl bg-white p-4 shadow-md sm:p-6"
    >
      <div className="flex items-center gap-3 border-b border-border/60 pb-3">
        <IconCircle icon={icon} tint={tint} />
        <h2 id={id} className="m-0 text-xl">
          {title}
        </h2>
      </div>
      {children}
    </section>
  )
}
