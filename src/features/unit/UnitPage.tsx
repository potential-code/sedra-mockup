import type { ContentStep, Course, OptionId, ProgrammeId, Unit, UnitStep } from '@shared/types'
import { Link, useBlocker, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BookOpen,
  ChevronDown,
  Clapperboard,
  ExternalLink,
  Flag,
  Lightbulb,
  ListOrdered,
  type LucideIcon,
  MessageCircleQuestion,
  PartyPopper,
  Sparkles,
} from 'lucide-react'
import { motion } from 'motion/react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KnowledgeCheck } from '@/components/check/KnowledgeCheck'
import {
  completedCount,
  courseUnits,
  enrolledProgrammes,
  entryUnit,
  isEnrolled,
  PROGRAMME_LABEL_KEY,
} from '@/components/learner/learning'
import { NotEnrolled } from '@/components/learner/NotEnrolled'
import { ProgressRing } from '@/components/learner/ProgressRing'
import type { VideoPlayerHandle } from '@/components/player/VideoPlayer'
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
import { getCourse, getUnit, isUnitPublished, unitsForCourse } from '@/content'
import { usePageTitle } from '@/hooks/use-page-title'
import { useReducedMotion } from '@/hooks/use-reduced-motion'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'
import { cn } from '@/lib/utils'
import {
  getUnitProgress,
  isUnitComplete,
  setLastLocation,
  updateUnitProgress,
  useLearner,
  usePrefs,
} from '@/store/actions'
import { useExt01Approved } from '@/store/admin-content'
import { VideoBlock } from './LessonMedia'
import { PracticePanel } from './PracticePanel'
import { STEPS as STEP_ORDER, StepNav } from './StepNav'
import { Storyboard } from './Storyboard'
import { SummaryCard } from './SummaryCard'
import { UnitOutline } from './UnitOutline'

const STEP_ICONS: Record<UnitStep, LucideIcon> = {
  media: Clapperboard,
  summary: Lightbulb,
  read: BookOpen,
  check: MessageCircleQuestion,
  practice: Sparkles,
}
const PRIMARY_BTN = 'w-full shadow-md sm:w-auto'

/** Set before in-page navigation to another unit so its h1 receives focus on arrival. */
let focusHeadingOnMount = false

export function UnitPage() {
  const { courseId, unitId } = useParams({ from: '/_learner/courses/$courseId/units/$unitId' })
  const learner = useLearner()
  const unit = getUnit(unitId)
  const course = getCourse(courseId)
  if (!unit || !course || unit.courseId !== course.id) return <UnitNotFound />
  // SEDRA manages enrolment; unpublished units are hidden from learners.
  if (!isEnrolled(learner, unit.programmeId)) return <NotEnrolled />
  if (!isUnitPublished(unit.id)) return <UnitNotAvailable programmeId={unit.programmeId} />
  return <UnitView key={unit.id} unit={unit} course={course} />
}

function UnitNotAvailable({ programmeId }: { programmeId: ProgrammeId }) {
  const { t } = useTranslation('unit')
  usePageTitle(t('notPublished.title'))
  return (
    <div className="container-page py-8">
      <div className="flex max-w-xl flex-col gap-4 rounded-2xl border bg-white p-6">
        <h1 className="m-0 text-3xl">{t('notPublished.title')}</h1>
        <p className="m-0">{t('notPublished.body')}</p>
        <Button asChild className="self-start">
          <Link to="/programmes/$programmeId" params={{ programmeId }}>
            <ArrowLeft aria-hidden="true" className="rtl-mirror" />
            {t('notPublished.back')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

function UnitNotFound() {
  const { t } = useTranslation('unit')
  usePageTitle(t('notFound.title'))
  return (
    <div className="container-page py-8">
      <div className="flex max-w-xl flex-col gap-4 rounded-2xl border bg-white p-6">
        <h1 className="m-0 text-3xl">{t('notFound.title')}</h1>
        <p className="m-0">{t('notFound.body')}</p>
        <Button asChild className="self-start">
          <Link to="/learn">
            <ArrowLeft aria-hidden="true" className="rtl-mirror" />
            {t('notFound.back')}
          </Link>
        </Button>
      </div>
    </div>
  )
}

/** Course details on top (name, purpose, progress); the course menu and unit sit below it. */
function CourseCard({
  course,
  programmeId,
  simplified,
}: {
  course: Course
  programmeId: ProgrammeId
  simplified: boolean
}) {
  const { t } = useTranslation('unit')
  const { l } = useLocalized()
  const learner = useLearner()
  const programmes = enrolledProgrammes(learner)
  const units = unitsForCourse(course.id, { publishedOnly: true })
  const done = units.filter((u) => isUnitComplete(getUnitProgress(learner, u.id))).length
  return (
    // Slim course bar: name, progress and course switch in one row so the unit starts near the top.
    <section
      aria-labelledby="course-card-title"
      className="mb-4 flex flex-wrap items-center gap-x-6 gap-y-3 rounded-2xl bg-white p-3 shadow-md lg:mb-5"
    >
      <div className="flex min-w-0 flex-1 basis-72 items-center gap-3">
        {!simplified && course.image ? (
          <img
            src={asset(course.image)}
            alt=""
            width={160}
            height={120}
            className="hidden aspect-[4/3] w-16 shrink-0 rounded-xl object-cover sm:block"
          />
        ) : null}
        <div className="min-w-0">
          <p id="course-card-title" className="m-0 text-lg leading-snug font-bold text-sedra-green">
            {t(`common:${PROGRAMME_LABEL_KEY[programmeId]}`)}
          </p>
          <p className="m-0 text-base text-ink-soft">{l(course.title)}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <ProgressRing value={done / Math.max(1, units.length)} size={44} stroke={5}>
          <span aria-hidden="true" className="text-sm font-bold text-ink">
            {done}/{units.length}
          </span>
        </ProgressRing>
        <span className="text-base font-semibold text-ink">
          {t('learner:shared.unitsComplete', { done, total: units.length })}
        </span>
      </div>
      {programmes.length > 1 && (
        <nav aria-label={t('courses.label')} className="flex flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-ink-soft">{t('courses.label')}:</span>
          <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
            {programmes.map((p) => {
              const target = entryUnit(learner, p)
              const here = p === programmeId
              if (!target) return null
              const us = courseUnits(p)
              const d = completedCount(learner, us)
              return (
                <li key={p} className="max-w-none">
                  <Link
                    to="/courses/$courseId/units/$unitId"
                    params={{ courseId: target.courseId, unitId: target.id }}
                    aria-current={here ? 'true' : undefined}
                    className={cn(
                      'inline-flex min-h-12 items-center gap-2 rounded-full border-2 px-4 font-semibold transition-colors',
                      here
                        ? 'border-sedra-green bg-sedra-green text-white'
                        : 'border-sedra-pale bg-white text-sedra-green hover:border-sedra-green',
                    )}
                  >
                    {t(`common:${PROGRAMME_LABEL_KEY[p]}`)}
                    <span
                      className={cn(
                        'text-sm font-normal whitespace-nowrap',
                        here ? 'text-white' : 'text-ink-soft',
                      )}
                    >
                      {d}/{us.length}
                    </span>
                    {here ? <span className="sr-only">({t('courses.current')})</span> : null}
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
      )}
    </section>
  )
}

function UnitView({ unit, course }: { unit: Unit; course: Course }) {
  const { t } = useTranslation('unit')
  const { l, lang } = useLocalized()
  const navigate = useNavigate()
  const prefs = usePrefs()
  const learner = useLearner()
  const reduce = useReducedMotion()
  const progress = getUnitProgress(learner, unit.id)
  const units = unitsForCourse(unit.courseId)
  // Learners only move through published units: Previous / Next skip unpublished ones.
  const published = unitsForCourse(unit.courseId, { publishedOnly: true })
  const at = published.findIndex((u) => u.id === unit.id)
  const next = at >= 0 ? published[at + 1] : undefined
  const isLast = !next

  usePageTitle(l(unit.title))

  // Restore the saved step when returning to the same unit (media is always paused).
  const [step, setStep] = useState<UnitStep>(() =>
    learner?.lastLocation?.unitId === unit.id ? learner.lastLocation.step : 'media',
  )

  const h1Ref = useRef<HTMLHeadingElement>(null)
  const stepHeadingRef = useRef<HTMLHeadingElement>(null)
  const readHeadingRef = useRef<HTMLHeadingElement>(null)
  const playerRef = useRef<VideoPlayerHandle>(null)
  const afterStepChange = useRef<(() => void) | null>(null)
  const draftRef = useRef<{ selected?: OptionId; unchecked: boolean }>({ unchecked: false })
  const progressRef = useRef(progress)
  progressRef.current = progress
  const openerRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (focusHeadingOnMount) {
      focusHeadingOnMount = false
      h1Ref.current?.focus()
    }
  }, [])

  // Save where the learner is so "Continue learning" restores the same unit and step.
  useEffect(() => {
    setLastLocation({ unitId: unit.id, step }, unit.programmeId)
  }, [unit.id, unit.programmeId, step])

  useEffect(() => {
    const fn = afterStepChange.current
    if (!fn) return
    afterStepChange.current = null
    fn()
  })

  const goStep = useCallback((s: UnitStep, then?: () => void) => {
    playerRef.current?.pause()
    afterStepChange.current = then ?? (() => stepHeadingRef.current?.focus())
    setStep(s)
  }, [])

  // Leaving unfinished work prompts Keep learning / Leave and save (brief §3).
  const blocker = useBlocker({
    shouldBlockFn: ({ current, next: to }) => {
      if (current.pathname === to.pathname) return false
      const p = progressRef.current
      const unfinished = (p.watchedOrRead && !p.checkReviewed) || draftRef.current.unchecked
      if (unfinished) {
        openerRef.current =
          document.activeElement instanceof HTMLElement ? document.activeElement : null
        playerRef.current?.pause()
      }
      return unfinished
    },
    enableBeforeUnload: false,
    withResolver: true,
  })

  /** Finish a content block (Video, Summary, Read). Video or Read counts as watched or read. */
  function finish(block: ContentStep) {
    const p = progressRef.current
    const seen = p.seen?.includes(block) ? p.seen : [...(p.seen ?? []), block]
    const route = block === 'media' || block === 'read'
    updateUnitProgress(unit.id, { seen, ...(route ? { watchedOrRead: true } : {}) })
    if (route && !p.watchedOrRead) announce(t('media.doneAnnounce'))
  }

  function goToUnit(target: Unit) {
    focusHeadingOnMount = true
    void navigate({
      to: '/courses/$courseId/units/$unitId',
      params: { courseId: target.courseId, unitId: target.id },
    })
  }

  function goNext() {
    if (next) goToUnit(next)
    else
      void navigate({ to: '/programmes/$programmeId', params: { programmeId: unit.programmeId } })
  }

  const simplified = prefs.view === 'simplified'
  const [showUnits, setShowUnits] = useState(true)
  // Demo: every unit is open; the first unfinished unit after this one is marked "Up next".
  const upNext = published.find(
    (u) => u.order > unit.order && !isUnitComplete(getUnitProgress(learner, u.id)),
  )

  const stepTitle = t(`steps.${step}Title`)
  // The one primary action per block: finish it and open the next block.
  const nextStep = STEP_ORDER[STEP_ORDER.indexOf(step) + 1]

  const stepIndex = STEP_ORDER.indexOf(step)
  const prevStepIndex = useRef(stepIndex)
  const stepDir = stepIndex >= prevStepIndex.current ? 1 : -1
  useEffect(() => {
    prevStepIndex.current = stepIndex
  }, [stepIndex])
  const StepIcon = STEP_ICONS[step]

  return (
    <div className="container-page py-4 md:py-6">
      <CourseCard course={course} programmeId={unit.programmeId} simplified={simplified} />
      <div
        className={cn(
          'lg:grid lg:items-start lg:gap-6',
          showUnits ? 'lg:grid-cols-[18rem_minmax(0,1fr)]' : 'lg:grid-cols-1',
        )}
      >
        {/* Units only (number, title, status). Learning blocks live once, in the step bar. */}
        {showUnits && (
          <aside
            aria-labelledby="outline-title"
            className="hidden overflow-hidden rounded-3xl bg-white shadow-md lg:block"
          >
            <div className="flex items-center justify-between gap-2 px-4 pt-4 pb-2">
              <h2 id="outline-title" className="m-0 text-lg">
                {t('outline.units')}
              </h2>
              <Button variant="outline" size="sm" onClick={() => setShowUnits(false)}>
                {t('outline.hide')}
              </Button>
            </div>
            <div className="p-2 pt-0">
              <UnitOutline
                units={published}
                currentId={unit.id}
                nextId={upNext?.id}
                thumbnails={false}
                onNavigate={() => {
                  focusHeadingOnMount = true
                }}
              />
            </div>
          </aside>
        )}

        <article aria-labelledby="unit-title" className="@container flex min-w-0 flex-col gap-5">
          <header className="flex flex-col gap-4 rounded-3xl bg-white p-4 shadow-md @md:p-6">
            {!showUnits && (
              <Button
                variant="outline"
                size="sm"
                className="hidden self-start lg:inline-flex"
                onClick={() => setShowUnits(true)}
              >
                <ListOrdered aria-hidden="true" />
                {t('outline.show')}
              </Button>
            )}
            <div className="flex flex-col gap-1">
              <p className="m-0 text-base font-semibold text-ink-soft">
                {t('unitOf', { n: unit.order, total: units.length })}
              </p>
              <h1
                id="unit-title"
                ref={h1Ref}
                tabIndex={-1}
                className="m-0 text-3xl leading-tight text-sedra-green md:text-4xl"
              >
                {l(unit.title)}
              </h1>
              <p className="m-0 text-lg text-ink">{l(unit.objective)}</p>
            </div>
            <StepNav step={step} progress={progress} onStep={(s) => goStep(s)} />
          </header>

          <motion.section
            key={step}
            aria-labelledby="step-title"
            className="flex flex-col gap-5 rounded-3xl bg-white p-3 shadow-md @md:p-6"
            initial={reduce ? false : { opacity: 0, x: 32 * stepDir * (lang === 'ar' ? -1 : 1) }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
          >
            <div className="flex items-center gap-3">
              <span
                aria-hidden="true"
                className="hidden size-11 shrink-0 items-center justify-center rounded-2xl bg-sedra-pale-100 text-sedra-green @xs:flex"
              >
                <StepIcon className="size-6" />
              </span>
              <h2 id="step-title" ref={stepHeadingRef} tabIndex={-1} className="m-0 text-2xl">
                {stepTitle}
              </h2>
            </div>

            {step === 'media' && (
              <VideoBlock
                unit={unit}
                onEnded={() => finish('media')}
                onRead={() => goStep('read')}
                playerRef={playerRef}
              />
            )}

            {step === 'summary' && <SummaryCard unit={unit} hideTitle />}

            {step === 'read' && <Storyboard ref={readHeadingRef} unit={unit} showImage={false} />}

            {step === 'check' && (
              <KnowledgeCheck
                check={unit.check}
                initialSelected={progress.selected}
                initialOutcome={progress.checkReviewed ? progress.checkOutcome : undefined}
                onReview={(selected, outcome) =>
                  updateUnitProgress(unit.id, {
                    checkReviewed: true,
                    checkOutcome: outcome,
                    selected,
                    attempts: progressRef.current.attempts + 1,
                  })
                }
                onDraftChange={(selected, unchecked) => {
                  draftRef.current = { selected, unchecked }
                }}
              />
            )}

            {step === 'practice' && <PracticePanel unit={unit} />}
          </motion.section>

          {(step === 'check' || step === 'practice') && progress.checkReviewed && (
            <AfterReview
              unit={unit}
              course={course}
              isLast={isLast}
              simplified={simplified}
              unitComplete={isUnitComplete(progress)}
              unfinishedInCourse={
                published.filter((u) => !isUnitComplete(getUnitProgress(learner, u.id))).length
              }
            />
          )}

          {/* One action bar: says what comes next and moves there (no separate "done" or unit row). */}
          <div className="sticky bottom-[calc(4rem+1px+env(safe-area-inset-bottom)+0.5rem)] z-30 flex flex-wrap items-center gap-3 rounded-2xl border bg-white/95 p-3 shadow-pop backdrop-blur-md lg:bottom-4">
            <p
              className={cn(
                'm-0 flex-1 basis-48 items-center gap-2 text-base font-semibold text-ink-soft',
                // On phones the button alone says what's next; the hint stays when there is no button.
                step === 'check' && !progress.checkReviewed ? 'flex' : 'hidden sm:flex',
              )}
            >
              <StepIcon aria-hidden="true" className="size-5 shrink-0" />
              {step === 'check' && !progress.checkReviewed
                ? t('actions.checkHint')
                : `${t('actions.stepOf', { n: stepIndex + 1, total: STEP_ORDER.length })}. ${t('actions.takeTime')}`}
            </p>
            {(step === 'media' || step === 'summary' || step === 'read') && nextStep && (
              <Button
                size="lg"
                className={PRIMARY_BTN}
                onClick={() => {
                  finish(step)
                  goStep(nextStep)
                }}
              >
                {t(`actions.next.${nextStep}`)}
                <ArrowRight aria-hidden="true" className="rtl-mirror" />
              </Button>
            )}
            {step === 'check' && progress.checkReviewed && (
              <Button size="lg" className={PRIMARY_BTN} onClick={() => goStep('practice')}>
                {t('actions.next.practice')}
                <ArrowRight aria-hidden="true" className="rtl-mirror" />
              </Button>
            )}
            {step === 'practice' && (
              <Button size="lg" className={PRIMARY_BTN} onClick={goNext}>
                {isLast ? <Flag aria-hidden="true" /> : null}
                {isLast ? t('nav.finishCourse') : t('actions.doneToUnit', { n: unit.order + 1 })}
                {!isLast && <ArrowRight aria-hidden="true" className="rtl-mirror" />}
              </Button>
            )}
          </div>

          <details className="group rounded-3xl bg-white shadow-md lg:hidden">
            <summary className="flex min-h-14 cursor-pointer items-center gap-3 px-4 font-semibold text-ink">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-sedra-pale-100 text-sedra-green"
              >
                <ListOrdered className="size-5" />
              </span>
              <span className="flex-1">{t('outline.units')}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="border-t p-2">
              <UnitOutline
                units={published}
                currentId={unit.id}
                nextId={upNext?.id}
                thumbnails={false}
                onNavigate={() => {
                  focusHeadingOnMount = true
                }}
              />
            </div>
          </details>
        </article>
      </div>

      <AlertDialog open={blocker.status === 'blocked'}>
        <AlertDialogContent
          onCloseAutoFocus={(e) => {
            e.preventDefault()
            openerRef.current?.focus()
          }}
          onEscapeKeyDown={() => blocker.reset?.()}
        >
          <AlertDialogHeader>
            <AlertDialogTitle>{t('leave.title')}</AlertDialogTitle>
            <AlertDialogDescription>{t('leave.body')}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => blocker.reset?.()}>
              {t('leave.keep')}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                const d = draftRef.current
                if (d.unchecked && d.selected) updateUnitProgress(unit.id, { selected: d.selected })
                blocker.proceed?.()
              }}
            >
              {t('leave.leave')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

/** Shown after the check is reviewed: badge, last-unit acknowledgement, LS01 extra video. */
function AfterReview({
  unit,
  course,
  isLast,
  simplified,
  unitComplete,
  unfinishedInCourse,
}: {
  unit: Unit
  course: Course
  isLast: boolean
  simplified: boolean
  /** Brief §4: complete = watch or read done + check reviewed. */
  unitComplete: boolean
  unfinishedInCourse: number
}) {
  const { t } = useTranslation('unit')
  const extApproved = useExt01Approved()
  const { l } = useLocalized()
  if (!unit.badge && !isLast && !(unit.id === 'LS01' && !simplified)) return null
  const finished = unfinishedInCourse === 0

  return (
    <div className="flex flex-col gap-4">
      {/* Brief §2: milestone badges are static (no animation, no sound). */}
      {unit.badge && unitComplete && (
        <section
          aria-labelledby="badge-title"
          className="flex flex-col items-start gap-4 rounded-3xl border-2 border-sedra-green bg-white p-5 shadow-md sm:flex-row sm:items-center"
        >
          <span
            aria-hidden="true"
            className="flex size-16 shrink-0 items-center justify-center rounded-full bg-sedra-green text-white ring-4 ring-sedra-pale"
          >
            <Award className="size-9" />
          </span>
          <div className="min-w-0">
            <h2 id="badge-title" className="m-0 text-xl">
              {t('badge.title', { badge: l(unit.badge) })}
            </h2>
            <p className="m-0 mt-1">{t('badge.body')}</p>
          </div>
        </section>
      )}
      {isLast && (
        <section
          aria-labelledby="complete-title"
          className="grid overflow-hidden rounded-3xl bg-white shadow-md @xl:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]"
        >
          <img
            src={asset(course.image)}
            alt=""
            width={1200}
            height={800}
            className="aspect-[16/9] h-full w-full object-cover @xl:aspect-auto"
          />
          <div className="flex flex-col gap-3 p-5">
            <span
              aria-hidden="true"
              className={cn(
                'flex size-12 items-center justify-center rounded-full',
                finished ? 'bg-success text-white' : 'bg-sedra-pale-100 text-sedra-green',
              )}
            >
              {finished ? <PartyPopper className="size-6" /> : <Flag className="size-6" />}
            </span>
            <h2 id="complete-title" className="m-0 text-2xl">
              {finished
                ? t('complete.title', { course: l(course.title) })
                : t('complete.notYetTitle')}
            </h2>
            <p className="m-0">
              {unfinishedInCourse > 0
                ? t('complete.notYetBody', { count: unfinishedInCourse })
                : unit.programmeId === 'hospitality'
                  ? t('complete.bodyHospitality')
                  : t('complete.body')}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button asChild variant="outline">
                <Link to="/programmes/$programmeId" params={{ programmeId: unit.programmeId }}>
                  <ListOrdered aria-hidden="true" />
                  {t('nav.courseSummary')}
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link to="/achievements">
                  <Award aria-hidden="true" />
                  {t('complete.achievements')}
                </Link>
              </Button>
            </div>
          </div>
        </section>
      )}
      {unit.id === 'LS01' && !simplified && extApproved && (
        <Link
          to="/resources"
          hash="ext01"
          className="inline-flex min-h-12 items-center gap-2 self-start rounded-2xl bg-white px-4 font-semibold text-sedra-green underline underline-offset-4 shadow-sm"
        >
          <ExternalLink aria-hidden="true" className="size-5" />
          {t('extraVideo')}
        </Link>
      )}
    </div>
  )
}
