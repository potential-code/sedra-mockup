import type { CourseId, CustomResource } from '@shared/types'
import { AlertTriangle, Save, Trash2 } from 'lucide-react'
import { type ReactNode, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { toast } from 'sonner'
import { SelectField, TextField } from '@/components/admin/AdminUi'
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
import { COURSES } from '@/content'
import { useLocalized } from '@/i18n'
import { isHttpsUrl, removeCustomResource, saveCustomResource } from '@/store/admin-content'

/** Remove an admin-added resource, after a confirm step. Built-in guides and EXT01 have none. */
export function RemoveResourceButton({ r }: { r: CustomResource }) {
  const { t } = useTranslation('admin')
  const { l } = useLocalized()
  const [confirm, setConfirm] = useState(false)
  return (
    <>
      <Button
        type="button"
        variant="outline"
        aria-label={t('resources.custom.removeLabel', { title: l(r.title) })}
        onClick={() => setConfirm(true)}
      >
        <Trash2 aria-hidden="true" />
        {t('resources.custom.remove')}
      </Button>
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
    </>
  )
}

/** One Add / Edit dialog for admin-added resources (course, type, EN + AR text, link). */
export function ResourceDialog({
  resource,
  trigger,
}: {
  resource?: CustomResource
  trigger: ReactNode
}) {
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
  const [kind, setKind] = useState<'link' | 'text'>(resource && !resource.url ? 'text' : 'link')
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
    if (kind === 'link' && !isHttpsUrl(v.url)) e.url = 'resources.custom.errors.url'
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
      url: kind === 'link' ? v.url.trim() : undefined,
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
      <fieldset className="m-0 flex flex-col gap-2 border-0 p-0">
        <legend className="mb-1 p-0 font-semibold text-ink">
          {t('resources.custom.fields.type')}
        </legend>
        <div className="flex flex-wrap gap-3">
          {(['link', 'text'] as const).map((k) => (
            <label
              key={k}
              className="flex min-h-12 cursor-pointer items-center gap-3 rounded-xl border-2 border-input bg-white px-4 has-[:checked]:border-sedra-green has-[:checked]:bg-sedra-pale-50 has-[:focus-visible]:ring-3 has-[:focus-visible]:ring-ring"
            >
              <input
                type="radio"
                name="cr-type"
                value={k}
                checked={kind === k}
                onChange={() => {
                  setKind(k)
                  setErrors(({ url: _u, ...rest }) => rest)
                }}
                className="size-5 accent-sedra-green"
              />
              <span className="flex flex-col">
                <span className="font-semibold">{t(`resources.custom.kind.${k}`)}</span>
                <span className="text-sm text-ink-soft">{t(`resources.custom.kind.${k}Hint`)}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
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
      {kind === 'link' ? (
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
          required
        />
      ) : null}
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
