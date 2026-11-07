import {
  CheckCircle2,
  ExternalLink,
  Eye,
  EyeOff,
  FileText,
  FolderOpen,
  Link2,
  MapPin,
  PlayCircle,
  Tag,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  AdminPageHeader,
  Chip,
  DemoTag,
  IconCircle,
  Notice,
  StatusLabel,
} from '@/components/admin/AdminUi'
import { Reveal, stagger } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { EXT01, getCourse } from '@/content'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'

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
      <AdminPageHeader title={t('resources.title')} intro={t('resources.intro')} icon={FolderOpen}>
        <DemoTag />
      </AdminPageHeader>

      <section
        aria-labelledby="ext01-title"
        className="mb-10 flex flex-col gap-5 rounded-3xl bg-white p-5 shadow-md sm:p-7"
      >
        <div className="flex flex-wrap items-start gap-4">
          <IconCircle icon={PlayCircle} tint="notice" size="lg" />
          <div className="flex min-w-0 flex-1 flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
              <Chip className="ltr-isolate">{EXT01.id}</Chip>
              <StatusLabel tone="warning">{t('resources.ext.reviewStatus')}</StatusLabel>
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
                    <h3 id={`res-${r.key}`} className="m-0 text-lg">
                      {t(`resources.internal.items.${r.key}.title`)}
                    </h3>
                    <p className="m-0">{t(`resources.internal.items.${r.key}.body`)}</p>
                    <div className="mt-auto flex flex-col gap-2 pt-2">
                      <StatusLabel tone="done">{t('resources.internal.status')}</StatusLabel>
                      <p className="m-0 text-sm text-ink-soft">
                        {t('resources.internal.download')}
                      </p>
                    </div>
                  </div>
                </article>
              </Reveal>
            )
          })}
        </ul>
      </section>
    </div>
  )
}
