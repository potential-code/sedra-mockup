import type { ProgrammeId } from '@shared/types'
import { useLocation } from '@tanstack/react-router'
import { ArrowDown, ChevronDown, ExternalLink, FileText, Printer } from 'lucide-react'
import { type ReactNode, useDeferredValue, useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { enrolledProgrammes, findCourse, PROGRAMME_LABEL_KEY } from '@/components/learner/learning'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { usePageTitle } from '@/hooks/use-page-title'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { useLearner, usePrefs } from '@/store/actions'
import { useDb } from '@/store/db'
import { ExternalVideoCard } from './ExternalVideoCard'
import { PlaybookCard } from './PlaybookCard'
import { StopThinkDoGuide } from './StopThinkDoGuide'
import { SummaryGrid, SummarySearch, useMatchingUnits } from './SummaryList'

const SECTION_ID: Record<ProgrammeId, string> = {
  'life-skills': 'course-healthy-communication',
  hospitality: 'course-intro-hospitality',
}

/** Course header band: green panel with the course name, photo on the end side. */
function CourseHeader({ programmeId }: { programmeId: ProgrammeId }) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const course = findCourse(programmeId)
  return (
    <div className="motif-tree-light grid grid-cols-1 overflow-hidden rounded-3xl bg-sedra-green-800 shadow-lg md:grid-cols-[1.2fr_1fr]">
      <div className="grid content-center gap-3 p-6 md:order-none md:p-9">
        <p className="m-0 w-fit rounded-full bg-white/15 px-3 py-1 text-base font-semibold text-white ring-1 ring-white/40">
          {t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)}
        </p>
        <h2
          id={`${SECTION_ID[programmeId]}-h`}
          tabIndex={-1}
          className="m-0 text-3xl text-white md:text-4xl"
        >
          {course ? l(course.title) : t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)}
        </h2>
        {course ? <p className="m-0 text-lg text-white">{l(course.purpose)}</p> : null}
      </div>
      {course ? (
        <img
          src={asset(course.image)}
          alt={l(course.imageAlt)}
          width={1200}
          height={896}
          className="order-first aspect-[16/9] size-full object-cover md:order-none md:aspect-auto md:max-h-80"
        />
      ) : null}
    </div>
  )
}

/** SEDRA-added resource cards for a course (admin demo): title, text, optional link. */
function CustomResources({ programmeId }: { programmeId: ProgrammeId }) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const courseId = findCourse(programmeId)?.id
  const all = useDb((db) => db.customResources)
  const items = all.filter((r) => r.courseId === courseId)
  if (items.length === 0) return null
  const headingId = `${SECTION_ID[programmeId]}-more`
  return (
    <section aria-labelledby={headingId} className="grid grid-cols-1 gap-4">
      <h3 id={headingId} className="m-0 text-2xl">
        {t('resources.customHeading')}
      </h3>
      <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {items.map((r) => (
          <li key={r.id} className="max-w-none">
            <article className="card-pop grid h-full content-start gap-3 p-5">
              <span
                aria-hidden="true"
                className="grid size-11 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green"
              >
                <FileText className="size-6" />
              </span>
              <h4 className="m-0 text-lg font-bold text-sedra-green">{l(r.title)}</h4>
              <p className="m-0 text-base whitespace-pre-line">{l(r.body)}</p>
              {r.url ? (
                <a
                  href={r.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex min-h-12 items-center gap-2 justify-self-start font-semibold text-sedra-green underline underline-offset-4 hover:no-underline"
                >
                  <ExternalLink aria-hidden="true" className="size-5 shrink-0" />
                  {t('resources.openLink')}
                  <span className="sr-only">: {l(r.title)}</span>
                  <span className="text-base font-normal text-ink-soft">
                    ({t('resources.opensNewTab')})
                  </span>
                </a>
              ) : null}
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}

function CourseSection({
  programmeId,
  children,
}: {
  programmeId: ProgrammeId
  children: ReactNode
}) {
  return (
    <section
      id={SECTION_ID[programmeId]}
      aria-labelledby={`${SECTION_ID[programmeId]}-h`}
      className="grid scroll-mt-4 grid-cols-1 gap-8"
    >
      <CourseHeader programmeId={programmeId} />
      {children}
      <CustomResources programmeId={programmeId} />
    </section>
  )
}

/** Big buttons that move to a course section and focus its heading (hash routing safe). */
function JumpLinks({ programmes }: { programmes: ProgrammeId[] }) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  if (programmes.length < 2) return null
  return (
    <nav aria-label={t('resources.jumpLabel')} className="grid gap-2">
      <p className="m-0 text-base font-semibold text-ink">{t('resources.jumpLabel')}</p>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {programmes.map((p) => {
          const course = findCourse(p)
          return (
            <li key={p}>
              <Button
                variant="secondary"
                className="rounded-full"
                onClick={() => {
                  const h = document.getElementById(`${SECTION_ID[p]}-h`)
                  h?.scrollIntoView({ block: 'start' })
                  h?.focus({ preventScroll: true })
                }}
              >
                <ArrowDown aria-hidden="true" />
                {course ? l(course.title) : t(`common:${PROGRAMME_LABEL_KEY[p]}`)}
              </Button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

/**
 * Resources (brief §2), grouped by course: Healthy Communication holds the Stop Think Do guide,
 * playbook, EXT01 and its summaries; Introduction to Hospitality holds its summaries. One search
 * field filters every summary. Simplified view folds optional cards behind one button.
 */
export function ResourcesPage() {
  const { t } = useTranslation('learner')
  usePageTitle(t('resources.pageTitle'))
  const id = useId()
  const { view } = usePrefs()
  const hash = useLocation({ select: (s) => s.hash })
  const simplified = view === 'simplified'
  const [showOptional, setShowOptional] = useState(hash === 'ext01')
  const [query, setQuery] = useState('')
  const q = useDeferredValue(query).trim().toLocaleLowerCase()
  // Enrolled programmes only (SEDRA manages enrolment).
  const programmes = enrolledProgrammes(useLearner())
  const hasLs = programmes.includes('life-skills')
  const hasHf = programmes.includes('hospitality')
  const lsCount = useMatchingUnits('life-skills', q).length
  const hfCount = useMatchingUnits('hospitality', q).length
  const count = (hasLs ? lsCount : 0) + (hasHf ? hfCount : 0)

  useEffect(() => {
    if (hash === 'ext01') {
      setShowOptional(true)
      requestAnimationFrame(() => document.getElementById('ext01')?.scrollIntoView())
    }
  }, [hash])

  const optionalOpen = !simplified || showOptional

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-12 py-8">
      <Reveal className="motif-tree grid grid-cols-1 gap-6 rounded-3xl bg-white p-6 shadow-md md:p-10">
        <div className="grid gap-3">
          <h1 className="m-0 text-4xl break-words md:text-5xl">{t('resources.heading')}</h1>
          <p className="m-0 text-lg text-ink">{t('resources.lead')}</p>
        </div>
        <SummarySearch id={id} query={query} onChange={setQuery} count={count} />
        <JumpLinks programmes={programmes} />
      </Reveal>

      {hasLs ? (
        <CourseSection programmeId="life-skills">
          <StopThinkDoGuide />
          {simplified ? (
            <Button
              variant="secondary"
              className="justify-self-start"
              aria-expanded={showOptional}
              aria-controls="optional-resources"
              onClick={() => setShowOptional((o) => !o)}
            >
              <ChevronDown aria-hidden="true" className={cn(showOptional && 'rotate-180')} />
              {showOptional ? t('resources.hideOptional') : t('resources.showOptional')}
            </Button>
          ) : null}
          <div
            id="optional-resources"
            hidden={!optionalOpen}
            className="grid grid-cols-1 items-stretch gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
          >
            {optionalOpen ? (
              <>
                <PlaybookCard />
                <ExternalVideoCard />
              </>
            ) : null}
          </div>
          <SummaryGrid programmeId="life-skills" q={q} headingId={`${id}-ls`} />
        </CourseSection>
      ) : null}

      {hasHf ? (
        <CourseSection programmeId="hospitality">
          <SummaryGrid programmeId="hospitality" q={q} headingId={`${id}-hf`} />
        </CourseSection>
      ) : null}

      {optionalOpen ? (
        <section
          aria-labelledby="print-heading"
          className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border-2 border-dashed border-border p-5"
        >
          <div className="grid gap-1">
            <h2 id="print-heading" className="m-0 text-xl">
              {t('resources.downloadsHeading')}
            </h2>
            <p className="m-0 text-base">{t('resources.downloadsBody')}</p>
          </div>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer aria-hidden="true" />
            {t('resources.print')}
          </Button>
        </section>
      ) : null}
    </div>
  )
}
