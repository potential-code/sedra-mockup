import type { Course, OptionId, ProgrammeId, Unit, UnitStep } from '@shared/types'
import { Link, useBlocker, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  ChevronDown,
  Clapperboard,
  ExternalLink,
  Flag,
  HelpCircle,
  Layers,
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
import { LessonMedia, type MediaMode, videoFor } from './LessonMedia'
import { PracticePanel } from './PracticePanel'
import { StepNav } from './StepNav'
import { UnitOutline } from './UnitOutline'

const STEP_ORDER: UnitStep[] = ['media', 'check', 'practice']
const STEP_ICONS: Record<UnitStep, LucideIcon> = {
  media: Clapperboard,
  check: MessageCircleQuestion,
  practice: Sparkles,
}
const PRIMARY_BTN = 'flex-[1_1_10rem] shadow-md sm:flex-none'

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
                      className={cn('text-sm font-normal', here ? 'text-white' : 'text-ink-soft')}
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
  const prev = at > 0 ? published[at - 1] : undefined
  const next = at >= 0 ? published[at + 1] : undefined
  const isLast = !next
  const hasVideo = !!videoFor(unit, lang)

  usePageTitle(l(unit.title))

  // Restore the saved step when returning to the same unit (media is always paused).
  const [step, setStep] = useState<UnitStep>(() =>
    learner?.lastLocation?.unitId === unit.id ? learner.lastLocation.step : 'media',
  )
  const [mode, setMode] = useState<MediaMode>('watch')
  const mediaMode: MediaMode = hasVideo ? mode : 'read'

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

  function markDone() {
    if (progressRef.current.watchedOrRead) return
    updateUnitProgress(unit.id, { watchedOrRead: true })
    announce(t('media.doneAnnounce'))
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

  const nextLabel = isLast ? t('nav.finishCourse') : t('common:next')
  const simplified = prefs.view === 'simplified'

  const stepTitle =
    step === 'media'
      ? t('steps.mediaTitle')
      : step === 'check'
        ? t('steps.checkTitle')
        : t('steps.practiceTitle')

  const stepIndex = STEP_ORDER.indexOf(step)
  const prevStepIndex = useRef(stepIndex)
  const stepDir = stepIndex >= prevStepIndex.current ? 1 : -1
  useEffect(() => {
    prevStepIndex.current = stepIndex
  }, [stepIndex])
  const StepIcon = STEP_ICONS[step]
  const doneInCourse = published.filter((u) =>
    isUnitComplete(getUnitProgress(learner, u.id)),
  ).length

  return (
    <div className="container-page py-4 md:py-6">
      <CourseCard course={course} programmeId={unit.programmeId} simplified={simplified} />
      <div className="lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:items-start lg:gap-8 xl:grid-cols-[20rem_minmax(0,1fr)]">
        {/* Course outline with course progress on the start side (template unit player). */}
        <aside
          aria-labelledby="outline-title"
          className="hidden overflow-hidden rounded-3xl bg-white shadow-md lg:block"
        >
          <div className="bg-sedra-pale-50 px-4 pt-4 pb-3">
            <h2 id="outline-title" className="m-0 text-lg">
              {t('outline.title', { course: l(course.title) })}
            </h2>
            {!simplified && (
              <div className="mt-2">
                <p className="m-0 text-base font-semibold text-ink-soft">
                  {t('outline.progress', { done: doneInCourse, total: published.length })}
                </p>
                <div
                  aria-hidden="true"
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-white"
                >
                  <motion.div
                    className="h-full rounded-full bg-sedra-mid ltr:origin-left rtl:origin-right"
                    initial={false}
                    animate={{ scaleX: doneInCourse / Math.max(1, published.length) }}
                    transition={
                      reduce ? { duration: 0 } : { type: 'spring', stiffness: 120, damping: 22 }
                    }
                  />
                </div>
              </div>
            )}
          </div>
          <div className="p-2">
            <UnitOutline
              units={published}
              currentId={unit.id}
              step={step}
              onStep={(s) => goStep(s)}
              onNavigate={() => {
                focusHeadingOnMount = true
              }}
            />
          </div>
        </aside>

        <article aria-labelledby="unit-title" className="@container flex min-w-0 flex-col gap-5">
          <header className="overflow-hidden rounded-3xl bg-white shadow-md">
            {/* Unit banner: photo under a SEDRA-green scrim so white text always has contrast. */}
            <div className="relative isolate overflow-hidden bg-sedra-green-800">
              <img
                src={asset(unit.image)}
                alt=""
                width={1200}
                height={896}
                className="absolute inset-0 -z-20 size-full scale-110 object-cover blur-[2px]"
              />
              <div
                aria-hidden="true"
                className="absolute inset-0 -z-10 bg-gradient-to-t from-sedra-green-800 via-sedra-green-800/90 to-sedra-green-800/80"
              />
              <div className="flex flex-col gap-4 p-3 @md:p-6 @2xl:flex-row @2xl:items-end @2xl:gap-6">
                <div className="flex min-w-0 flex-1 flex-col gap-3">
                  <p className="m-0 inline-flex items-center gap-2 self-start rounded-full bg-white px-3 py-1 text-base font-bold text-sedra-green shadow-sm">
                    <Layers aria-hidden="true" className="size-4" />
                    {t('unitOf', { n: unit.order, total: units.length })}
                  </p>
                  <h1
                    id="unit-title"
                    ref={h1Ref}
                    tabIndex={-1}
                    className="m-0 text-3xl text-white md:text-4xl"
                  >
                    {l(unit.title)}
                  </h1>
                  <p className="m-0 text-lg text-white">{l(unit.objective)}</p>
                </div>
                <img
                  src={asset(unit.image)}
                  alt=""
                  width={1200}
                  height={896}
                  className="hidden aspect-[4/3] w-60 shrink-0 rotate-2 rounded-2xl object-cover shadow-pop ring-4 ring-white/90 @2xl:block"
                />
              </div>
            </div>
            <div className="px-1 pt-4 pb-2 @md:px-4">
              <StepNav step={step} progress={progress} onStep={(s) => goStep(s)} />
            </div>
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
              <LessonMedia
                unit={unit}
                done={progress.watchedOrRead}
                onDone={markDone}
                mode={mediaMode}
                onModeChange={setMode}
                playerRef={playerRef}
                readHeadingRef={readHeadingRef}
              />
            )}

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
                onReplay={
                  hasVideo
                    ? () => {
                        setMode('watch')
                        goStep('media', () => {
                          playerRef.current?.focus()
                          playerRef.current?.replay()
                        })
                      }
                    : undefined
                }
                onReadLesson={() => {
                  setMode('read')
                  goStep('media', () => readHeadingRef.current?.focus())
                }}
                supportExtra={
                  <Link
                    to="/help"
                    className="mt-2 inline-flex min-h-12 items-center gap-2 font-semibold text-sedra-green underline"
                  >
                    <HelpCircle aria-hidden="true" className="size-5" />
                    {t('common:needHelp')}
                  </Link>
                }
              />
            )}

            {step === 'practice' && <PracticePanel unit={unit} />}
          </motion.section>

          {step !== 'media' && progress.checkReviewed && (
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

          {/* Sticky action area: the one prominent next step (brief §3 mobile layout). */}
          <div className="sticky bottom-[calc(4rem+1px+env(safe-area-inset-bottom)+0.5rem)] z-30 flex flex-wrap items-center gap-2 rounded-2xl border bg-white/95 p-3 shadow-pop backdrop-blur-md lg:bottom-4">
            {/* Same order on every step: Back (start), step position, then the one primary Next (end). */}
            {step === 'check' && (
              <Button variant="outline" onClick={() => goStep('media')}>
                <ArrowLeft aria-hidden="true" className="rtl-mirror" />
                {t('actions.backToLesson')}
              </Button>
            )}
            {step === 'practice' && (
              <Button variant="outline" onClick={() => goStep('check')}>
                <ArrowLeft aria-hidden="true" className="rtl-mirror" />
                {t('actions.backToQuestion')}
              </Button>
            )}
            {step === 'check' && !progress.checkReviewed ? (
              <p className="m-0 flex-1 basis-48 text-base text-ink-soft">
                {t('actions.checkHint')}
              </p>
            ) : (
              <p className="m-0 hidden flex-1 items-center gap-2 text-base font-semibold text-ink-soft sm:flex">
                <StepIcon aria-hidden="true" className="size-5" />
                {t('actions.stepOf', { n: stepIndex + 1 })}
              </p>
            )}
            {step === 'check' && progress.checkReviewed && (
              <Button variant="outline" onClick={() => goStep('practice')}>
                {t('actions.toPractice')}
              </Button>
            )}
            {step === 'media' && (
              <Button size="lg" className={PRIMARY_BTN} onClick={() => goStep('check')}>
                {t('actions.toQuestion')}
                <ArrowRight aria-hidden="true" className="rtl-mirror" />
              </Button>
            )}
            {((step === 'check' && progress.checkReviewed) || step === 'practice') && (
              <Button size="lg" className={PRIMARY_BTN} onClick={goNext}>
                {isLast ? <Flag aria-hidden="true" /> : null}
                {nextLabel}
                {!isLast && <ArrowRight aria-hidden="true" className="rtl-mirror" />}
              </Button>
            )}
          </div>

          {/* Bottom row (template unit player): Previous unit, position, Next unit. */}
          <nav
            aria-label={t('nav.unitNav')}
            className="flex flex-wrap items-center gap-2 rounded-2xl bg-white p-3 shadow-sm"
          >
            {prev ? (
              <Button variant="outline" onClick={() => goToUnit(prev)}>
                <ArrowLeft aria-hidden="true" className="rtl-mirror" />
                {t('nav.previousUnit')}
              </Button>
            ) : (
              <span aria-hidden="true" className="hidden sm:block sm:w-0" />
            )}
            <p className="m-0 flex flex-1 basis-32 items-center justify-center gap-2 text-base font-semibold text-ink-soft">
              <Layers aria-hidden="true" className="size-5" />
              {t('unitOf', { n: unit.order, total: units.length })}
            </p>
            {next ? (
              <Button variant="outline" onClick={() => goToUnit(next)}>
                {t('nav.nextUnit')}
                <ArrowRight aria-hidden="true" className="rtl-mirror" />
              </Button>
            ) : (
              <Button asChild variant="outline">
                <Link to="/programmes/$programmeId" params={{ programmeId: unit.programmeId }}>
                  {t('nav.courseSummary')}
                  <ArrowRight aria-hidden="true" className="rtl-mirror" />
                </Link>
              </Button>
            )}
          </nav>

          <details className="group rounded-3xl bg-white shadow-md lg:hidden">
            <summary className="flex min-h-14 cursor-pointer items-center gap-3 px-4 font-semibold text-ink">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-sedra-pale-100 text-sedra-green"
              >
                <ListOrdered className="size-5" />
              </span>
              <span className="flex-1">{t('outline.title', { course: l(course.title) })}</span>
              <ChevronDown
                aria-hidden="true"
                className="size-5 transition-transform group-open:rotate-180"
              />
            </summary>
            <div className="border-t p-2">
              <UnitOutline
                units={published}
                currentId={unit.id}
                step={step}
                onStep={(s) => goStep(s)}
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
          className="flex items-center gap-4 rounded-3xl border-2 border-sedra-green bg-white p-5 shadow-md"
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
