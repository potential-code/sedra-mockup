import type { CourseId, CustomResource } from '@shared/types'
import { AlertTriangle, ExternalLink, FilePlus2, Pencil, Plus, Save, Trash2 } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { Chip, IconCircle, SelectField, StatusLabel, TextField } from '@/components/admin/AdminUi'
import { announce } from '@/components/shared/LiveRegion'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { COURSES, getCourse } from '@/content'
import { useLocalized } from '@/i18n'
import {
  isHttpsUrl,
  removeCustomResource,
  saveCustomResource,
  useCustomResources,
} from '@/store/admin-content'

/** Admin-added resources (db.customResources). EXT01 and built-in guides are not editable here. */
export function CustomResourcesSection() {
  const { t } = useTranslation('admin')
  const resources = useCustomResources()
  return (
    <section aria-labelledby="custom-res" className="mt-10 flex flex-col gap-3">
      <div className="flex flex-wrap items-center gap-3">
        <IconCircle icon={FilePlus2} />
        <h2 id="custom-res" className="m-0 min-w-0 flex-1 basis-48 text-2xl">
          {t('resources.custom.heading')}
        </h2>
        <ResourceDialog
          trigger={
            <Button type="button">
              <Plus aria-hidden="true" />
              {t('resources.custom.add')}
            </Button>
          }
        />
      </div>
      <p className="m-0 text-ink-soft">{t('resources.custom.intro')}</p>
      <p className="m-0 text-sm text-ink-soft">{t('resources.custom.builtInNote')}</p>
      {resources.length === 0 ? (
        <p className="m-0 rounded-2xl bg-white p-5 shadow-sm">{t('resources.custom.empty')}</p>
      ) : (
        <ul className="m-0 mt-2 grid list-none gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
          {resources.map((r) => (
            <li key={r.id} className="max-w-none">
              <ResourceCard r={r} />
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}

function ResourceCard({ r }: { r: CustomResource }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const [confirm, setConfirm] = useState(false)
  const course = getCourse(r.courseId)
  const id = `cres-${r.id}`
  return (
    <article aria-labelledby={id} className="card-pop flex h-full flex-col gap-3 p-5">
      <div className="flex flex-wrap gap-1.5">
        <Chip>{course ? l(course.title) : r.courseId}</Chip>
      </div>
      <h3 id={id} className="m-0 text-lg">
        {l(r.title)}
      </h3>
      <p className="m-0">{l(r.body)}</p>
      {r.url ? (
        <p className="m-0 flex items-start gap-1.5 text-sm break-all">
          <ExternalLink aria-hidden="true" className="mt-0.5 size-4 shrink-0 text-sedra-green" />
          <span className="ltr-isolate">{r.url}</span>
        </p>
      ) : (
        <StatusLabel tone="neutral">{t('resources.custom.noLink')}</StatusLabel>
      )}
      <div className="mt-auto flex flex-wrap gap-2 pt-2">
        <ResourceDialog
          resource={r}
          trigger={
            <Button
              type="button"
              variant="outline"
              aria-label={t('resources.custom.editLabel', { title: l(r.title) })}
            >
              <Pencil aria-hidden="true" />
              {t('resources.custom.edit')}
            </Button>
          }
        />
        <Button
          type="button"
          variant="outline"
          aria-label={t('resources.custom.removeLabel', { title: l(r.title) })}
          onClick={() => setConfirm(true)}
        >
          <Trash2 aria-hidden="true" />
          {t('resources.custom.remove')}
        </Button>
      </div>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {t('resources.custom.removeTitle', { title: l(r.title) })}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base text-ink">
              {t('resources.custom.removeBody')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="min-h-12">{t('resources.custom.keep')}</AlertDialogCancel>
            <AlertDialogAction
              className="min-h-12"
              onClick={() => {
                removeCustomResource(r.id)
                toast.success(t('resources.custom.removedToast'))
                announce(t('resources.custom.removedToast'))
              }}
            >
              {t('resources.custom.remove')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </article>
  )
}

function ResourceDialog({ resource, trigger }: { resource?: CustomResource; trigger: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-h-[92dvh] overflow-y-auto rounded-2xl bg-white p-5 sm:max-w-2xl sm:p-6">
        {open ? <ResourceForm resource={resource} onDone={() => setOpen(false)} /> : null}
      </DialogContent>
    </Dialog>
  )
}

type Key = 'titleEn' | 'titleAr' | 'bodyEn' | 'bodyAr' | 'url'

function ResourceForm({ resource, onDone }: { resource?: CustomResource; onDone: () => void }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const summaryRef = useRef<HTMLDivElement>(null)
  const [courseId, setCourseId] = useState<CourseId>(resource?.courseId ?? 'healthy-communication')
  const [v, setV] = useState<Record<Key, string>>({
    titleEn: resource?.title.en ?? '',
    titleAr: resource?.title.ar ?? '',
    bodyEn: resource?.body.en ?? '',
    bodyAr: resource?.body.ar ?? '',
    url: resource?.url ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<Key, string>>>({})
  const set = (k: Key) => (x: string) => setV((s) => ({ ...s, [k]: x }))
  const err = (k: Key) => (errors[k] ? t(errors[k]) : undefined)

  function onSave() {
    const e: Partial<Record<Key, string>> = {}
    for (const k of ['titleEn', 'titleAr', 'bodyEn', 'bodyAr'] as const) {
      if (!v[k].trim()) e[k] = `resources.custom.errors.${k}`
    }
    if (v.url.trim() && !isHttpsUrl(v.url)) e.url = 'resources.custom.errors.url'
    setErrors(e)
    if (Object.keys(e).length > 0) {
      requestAnimationFrame(() => summaryRef.current?.focus())
      return
    }
    saveCustomResource({
      id: resource?.id,
      courseId,
      title: { en: v.titleEn.trim(), ar: v.titleAr.trim() },
      body: { en: v.bodyEn.trim(), ar: v.bodyAr.trim() },
      url: v.url.trim() || undefined,
    })
    toast.success(t('resources.custom.savedToast'), {
      description: t('resources.custom.savedDescription'),
    })
    announce(t('resources.custom.savedToast'))
    onDone()
  }

  const entries = Object.entries(errors) as [Key, string][]

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
          <h2 className="m-0 text-2xl">
            {resource
              ? t('resources.custom.formTitleEdit', { title: l(resource.title) })
              : t('resources.custom.formTitleNew')}
          </h2>
        </DialogTitle>
        <DialogDescription className="text-base text-ink-soft">
          {t('resources.custom.formIntro')}
        </DialogDescription>
      </div>
      {entries.length > 0 ? (
        <div
          ref={summaryRef}
          tabIndex={-1}
          role="alert"
          className="rounded-2xl border-2 border-destructive bg-white p-4"
        >
          <p className="m-0 flex items-center gap-2 font-bold text-destructive">
            <AlertTriangle aria-hidden="true" className="size-5 shrink-0" />
            {t('resources.custom.errorSummary', { n: entries.length })}
          </p>
          <ul className="m-0 mt-1 flex flex-col gap-1 ps-5">
            {entries.map(([k, msg]) => (
              <li key={k}>
                <button
                  type="button"
                  className="min-h-11 text-start font-semibold text-sedra-green underline underline-offset-4"
                  onClick={() => document.getElementById(`cr-${k}`)?.focus()}
                >
                  {t(msg)}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
      <SelectField
        id="cr-course"
        label={t('resources.custom.fields.course')}
        value={courseId}
        onChange={(x) => setCourseId(x as CourseId)}
        options={COURSES.map((c) => ({ value: c.id, label: l(c.title) }))}
      />
      <div className="grid gap-4 md:grid-cols-2">
        <TextField
          id="cr-titleEn"
          label={t('resources.custom.fields.titleEn')}
          value={v.titleEn}
          onChange={set('titleEn')}
          error={err('titleEn')}
          dir="ltr"
          required
        />
        <TextField
          id="cr-titleAr"
          label={t('resources.custom.fields.titleAr')}
          value={v.titleAr}
          onChange={set('titleAr')}
          error={err('titleAr')}
          dir="rtl"
          required
        />
        <TextField
          id="cr-bodyEn"
          label={t('resources.custom.fields.bodyEn')}
          value={v.bodyEn}
          onChange={set('bodyEn')}
          error={err('bodyEn')}
          multiline
          rows={3}
          dir="ltr"
          required
        />
        <TextField
          id="cr-bodyAr"
          label={t('resources.custom.fields.bodyAr')}
          value={v.bodyAr}
          onChange={set('bodyAr')}
          error={err('bodyAr')}
          multiline
          rows={3}
          dir="rtl"
          required
        />
      </div>
      <TextField
        id="cr-url"
        type="url"
        inputMode="url"
        label={t('resources.custom.fields.url')}
        value={v.url}
        onChange={set('url')}
        error={err('url')}
        hint={t('resources.custom.urlHint')}
        dir="ltr"
      />
      <div className="flex flex-wrap gap-3">
        <Button type="submit">
          <Save aria-hidden="true" />
          {t('resources.custom.save')}
        </Button>
        <Button type="button" variant="outline" onClick={onDone}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
