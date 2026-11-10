import type { ProgrammeId } from '@shared/types'
import { Link, useLocation } from '@tanstack/react-router'
import { ArrowRight, ChevronDown, ClipboardList, ExternalLink, FileText } from 'lucide-react'
import { type ReactNode, useDeferredValue, useEffect, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { enrolledProgrammes, findCourse, PROGRAMME_LABEL_KEY } from '@/components/learner/learning'
import { Reveal } from '@/components/motion/Reveal'
import { Button } from '@/components/ui/button'
import { getUnit } from '@/content'
import { usePageTitle } from '@/hooks/use-page-title'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import { useLearner, usePrefs } from '@/store/actions'
import {
  summariesKey,
  useExt01Approved,
  useResourceText,
  useResourceVisible,
} from '@/store/admin-content'
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
      <div className="grid min-w-0 grid-cols-1 content-center gap-3 p-5 sm:p-6 md:order-none md:p-9">
        <p className="m-0 w-fit rounded-full bg-white/15 px-3 py-1 text-base font-semibold text-white ring-1 ring-white/40">
          {t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)}
        </p>
        <h2
          id={`${SECTION_ID[programmeId]}-h`}
          tabIndex={-1}
          className="m-0 text-2xl text-white sm:text-3xl md:text-4xl"
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
  const hidden = useDb((db) => db.resourceHidden)
  // Only resources SEDRA shows to learners (admin Show / Hide).
  const items = all.filter((r) => r.courseId === courseId && !hidden?.[r.id])
  const plan = programmeId === 'hospitality' ? <HospitalityPlanCard /> : null
  if (items.length === 0 && !plan) return null
  const headingId = `${SECTION_ID[programmeId]}-more`
  return (
    <section aria-labelledby={headingId} className="grid grid-cols-1 gap-4">
      <h3 id={headingId} className="m-0 text-2xl">
        {t('resources.customHeading')}
      </h3>
      <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {plan}
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

/** Built-in "Hospitality practice plan" (HF08): text SEDRA can edit, link to the HF08 practice. */
function HospitalityPlanCard() {
  const { t } = useTranslation('learner')
  const { lang } = useLocalized()
  const visible = useResourceVisible('hospitalityPlan')
  const edited = useResourceText('hospitalityPlan', lang)
  const hf08 = getUnit('HF08')
  if (!visible) return null
  const title = edited.title ?? t('resources.planHeading')
  return (
    <li className="max-w-none">
      <article className="card-pop grid h-full content-start gap-3 p-5">
        <span
          aria-hidden="true"
          className="grid size-11 place-items-center rounded-full bg-sedra-pale-100 text-sedra-green"
        >
          <ClipboardList className="size-6" />
        </span>
        <h4 className="m-0 text-lg font-bold text-sedra-green">{title}</h4>
        <p className="m-0 text-base">{edited.body ?? t('resources.planIntro')}</p>
        {hf08 ? (
          <Link
            to="/courses/$courseId/units/$unitId"
            params={{ courseId: hf08.courseId, unitId: hf08.id }}
            className="inline-flex min-h-12 items-center gap-2 justify-self-start font-semibold text-sedra-green underline underline-offset-4 hover:no-underline"
          >
            {t('resources.openPlanUnit')}
            <span className="sr-only">: {title}</span>
            <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
          </Link>
        ) : null}
      </article>
    </li>
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

type CourseFilterValue = 'all' | ProgrammeId

/** Course filter: show everything, or only one course's resources (no scrolling to find them). */
function CourseFilter({
  programmes,
  value,
  onChange,
}: {
  programmes: ProgrammeId[]
  value: CourseFilterValue
  onChange: (v: CourseFilterValue) => void
}) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  if (programmes.length < 2) return null
  const options: { key: CourseFilterValue; label: string }[] = [
    { key: 'all', label: t('resources.filterAll') },
    ...programmes.map((p) => {
      const course = findCourse(p)
      return {
        key: p as CourseFilterValue,
        label: course ? l(course.title) : t(`common:${PROGRAMME_LABEL_KEY[p]}`),
      }
    }),
  ]
  return (
    <fieldset className="m-0 grid gap-2 border-0 p-0">
      <legend className="mb-2 p-0 text-base font-semibold text-ink">
        {t('resources.filterLabel')}
      </legend>
      <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
        {options.map((o) => (
          <li key={o.key}>
            <Button
              type="button"
              variant={value === o.key ? 'default' : 'secondary'}
              className="rounded-full"
              aria-pressed={value === o.key}
              onClick={() => onChange(o.key)}
            >
              {o.label}
            </Button>
          </li>
        ))}
      </ul>
    </fieldset>
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
  const extApproved = useExt01Approved()
  // Admin Show / Hide (brief §2 Resources: SEDRA manages what learners see).
  const guideVisible = useResourceVisible('stopThinkDo')
  const playbookVisible = useResourceVisible('playbook')
  const lsSummaries = useResourceVisible(summariesKey('healthy-communication'))
  const hfSummaries = useResourceVisible(summariesKey('intro-hospitality'))
  const [course, setCourse] = useState<CourseFilterValue>('all')
  const q = useDeferredValue(query).trim().toLocaleLowerCase()
  // Enrolled programmes only (SEDRA manages enrolment).
  const programmes = enrolledProgrammes(useLearner())
  const hasLs = programmes.includes('life-skills') && (course === 'all' || course === 'life-skills')
  const hasHf = programmes.includes('hospitality') && (course === 'all' || course === 'hospitality')
  const lsCount = useMatchingUnits('life-skills', q).length
  const hfCount = useMatchingUnits('hospitality', q).length
  const count = (hasLs && lsSummaries ? lsCount : 0) + (hasHf && hfSummaries ? hfCount : 0)

  useEffect(() => {
    if (hash === 'ext01') {
      setShowOptional(true)
      setCourse('all')
      requestAnimationFrame(() => document.getElementById('ext01')?.scrollIntoView())
    }
  }, [hash])

  const optionalOpen = !simplified || showOptional

  return (
    <div className="container-page grid grid-cols-1 [&_[data-slot=button]]:max-w-full [&_[data-slot=button]]:shrink [&_:is(h2,h3,h4)]:break-words gap-12 py-8">
      <Reveal className="motif-tree grid grid-cols-1 gap-6 rounded-3xl bg-white p-6 shadow-md md:p-10">
        <div className="grid gap-3">
          <h1 className="m-0 text-3xl break-words sm:text-4xl md:text-5xl">
            {t('resources.heading')}
          </h1>
          <p className="m-0 text-lg text-ink">{t('resources.lead')}</p>
        </div>
        <SummarySearch id={id} query={query} onChange={setQuery} count={count} />
        <CourseFilter programmes={programmes} value={course} onChange={setCourse} />
      </Reveal>

      {hasLs ? (
        <CourseSection programmeId="life-skills">
          {guideVisible ? <StopThinkDoGuide /> : null}
          {simplified && (playbookVisible || extApproved) ? (
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
            className={cn(
              'grid grid-cols-1 items-stretch gap-6',
              extApproved && playbookVisible && 'lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]',
            )}
          >
            {optionalOpen ? (
              <>
                {playbookVisible ? <PlaybookCard /> : null}
                <ExternalVideoCard />
              </>
            ) : null}
          </div>
          {lsSummaries ? (
            <SummaryGrid programmeId="life-skills" q={q} headingId={`${id}-ls`} />
          ) : null}
        </CourseSection>
      ) : null}

      {hasHf ? (
        <CourseSection programmeId="hospitality">
          {hfSummaries ? (
            <SummaryGrid programmeId="hospitality" q={q} headingId={`${id}-hf`} />
          ) : null}
        </CourseSection>
      ) : null}
    </div>
  )
}
