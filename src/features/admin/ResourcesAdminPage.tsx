import { ExternalLink, Eye, EyeOff } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminPageHeader, DemoTag, Notice, StatusLabel } from '@/components/admin/AdminUi'
import { Button } from '@/components/ui/button'
import { EXT01, getCourse } from '@/content'
import { useLocalized } from '@/i18n'

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

  return (
    <div>
      <AdminPageHeader title={t('resources.title')} intro={t('resources.intro')}>
        <DemoTag />
      </AdminPageHeader>

      <section
        aria-labelledby="ext01-title"
        className="mb-8 flex flex-col gap-4 rounded-2xl border bg-white p-5"
      >
        <div className="flex flex-wrap items-center gap-2">
          <span className="ltr-isolate rounded-lg bg-sedra-pale-100 px-2 py-0.5 font-bold">
            {EXT01.id}
          </span>
          <StatusLabel tone="warning">{t('resources.ext.reviewStatus')}</StatusLabel>
        </div>
        <h2 id="ext01-title" className="m-0 text-2xl">
          {l(EXT01.title)}
        </h2>
        <dl className="m-0 flex flex-col gap-3">
          <div>
            <dt className="font-semibold">{t('resources.ext.placement')}</dt>
            <dd className="m-0">
              {t('resources.ext.placementValue', {
                course: course ? l(course.title) : EXT01.courseId,
              })}
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{t('resources.ext.originalUrl')}</dt>
            <dd className="m-0 break-all">
              <code className="ltr-isolate">{EXT01.originalUrl}</code>
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{t('resources.ext.embedUrl')}</dt>
            <dd className="m-0 break-all">
              <code className="ltr-isolate">{EXT01.embedUrl}</code>
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{t('resources.ext.fallbackLabel')}</dt>
            <dd className="m-0">
              {EXT01.fallbackLabel.en} /{' '}
              <span lang="ar" dir="rtl">
                {EXT01.fallbackLabel.ar}
              </span>
            </dd>
          </div>
          <div>
            <dt className="font-semibold">{t('resources.ext.completion')}</dt>
            <dd className="m-0">
              <StatusLabel tone="neutral">{t('resources.ext.notRequired')}</StatusLabel>
            </dd>
          </div>
        </dl>
        <Notice>
          <p>{t('resources.ext.reviewNote')}</p>
        </Notice>
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
            <div className="aspect-video w-full max-w-3xl overflow-hidden rounded-xl border bg-black">
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
        <h2 id="internal-res" className="m-0 text-2xl">
          {t('resources.internal.heading')}
        </h2>
        <p className="m-0 text-ink-soft">{t('resources.internal.intro')}</p>
        <ul className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
          {INTERNAL_RESOURCES.map((r) => {
            const c = getCourse(r.course)
            return (
              <li
                key={r.key}
                className="flex max-w-none flex-col gap-2 rounded-2xl border bg-white p-4"
              >
                <h3 className="m-0 text-lg">{t(`resources.internal.items.${r.key}.title`)}</h3>
                <p className="m-0 text-sm text-ink-soft">
                  <span className="ltr-isolate">{r.unit}</span>
                  {c ? ` · ${l(c.title)}` : ''}
                </p>
                <p className="m-0">{t(`resources.internal.items.${r.key}.body`)}</p>
                <StatusLabel tone="done">{t('resources.internal.status')}</StatusLabel>
                <p className="m-0 text-sm text-ink-soft">{t('resources.internal.download')}</p>
              </li>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
