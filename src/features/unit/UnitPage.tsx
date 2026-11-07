import type { Course, OptionId, Unit, UnitStep } from '@shared/types'
import { Link, useBlocker, useNavigate, useParams } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRight,
  Award,
  ExternalLink,
  Flag,
  HelpCircle,
  ListOrdered,
} from 'lucide-react'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { KnowledgeCheck } from '@/components/check/KnowledgeCheck'
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
import { getCourse, getUnit, nextUnit, previousUnit, unitsForCourse } from '@/content'
import { usePageTitle } from '@/hooks/use-page-title'
import { useLocalized } from '@/i18n'
import {
  getUnitProgress,
  isUnitComplete,
  setLastLocation,
  updateUnitProgress,
  useLearner,
  usePrefs,
} from '@/store/actions'
import { LessonMedia, type MediaMode, videoFor } from './LessonMedia'
import { PracticePanel } from './PracticePanel'
import { StepNav } from './StepNav'
import { UnitOutline } from './UnitOutline'

/** Set before in-page navigation to another unit so its h1 receives focus on arrival. */
let focusHeadingOnMount = false

export function UnitPage() {
  const { courseId, unitId } = useParams({ from: '/_learner/courses/$courseId/units/$unitId' })
  const unit = getUnit(unitId)
  const course = getCourse(courseId)
  if (!unit || !course || unit.courseId !== course.id) return <UnitNotFound />
  return <UnitView key={unit.id} unit={unit} course={course} />
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

function UnitView({ unit, course }: { unit: Unit; course: Course }) {
  const { t } = useTranslation('unit')
  const { l, lang } = useLocalized()
  const navigate = useNavigate()
  const prefs = usePrefs()
  const learner = useLearner()
  const progress = getUnitProgress(learner, unit.id)
  const units = unitsForCourse(unit.courseId)
  const prev = previousUnit(unit.id)
  const next = nextUnit(unit.id)
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

  return (
    <div className="container-page py-4 md:py-6">
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start lg:gap-8">
        <article aria-labelledby="unit-title" className="flex min-w-0 flex-col gap-5">
          <header className="flex flex-col gap-3">
            <Link
              to="/programmes/$programmeId"
              params={{ programmeId: unit.programmeId }}
              className="flex min-h-12 items-center gap-2 self-start rounded-lg font-semibold text-sedra-green underline-offset-4 hover:underline"
            >
              <ArrowLeft aria-hidden="true" className="size-5 rtl-mirror" />
              {t('nav.backToCourse', { course: l(course.title) })}
            </Link>
            <p className="m-0 font-semibold text-ink-soft">
              {t('unitOf', { n: unit.order, total: units.length })}
            </p>
            <h1 id="unit-title" ref={h1Ref} tabIndex={-1} className="m-0 text-3xl md:text-4xl">
              {l(unit.title)}
            </h1>
            <p className="m-0">{l(unit.objective)}</p>
            <nav aria-label={t('nav.unitNav')} className="flex flex-wrap gap-2">
              {prev ? (
                <Button variant="outline" size="sm" onClick={() => goToUnit(prev)}>
                  <ArrowLeft aria-hidden="true" className="rtl-mirror" />
                  {t('nav.previousUnit')}
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link to="/programmes/$programmeId" params={{ programmeId: unit.programmeId }}>
                    <ListOrdered aria-hidden="true" />
                    {t('nav.courseOverview')}
                  </Link>
                </Button>
              )}
              {next ? (
                <Button variant="outline" size="sm" onClick={() => goToUnit(next)}>
                  {t('nav.nextUnit')}
                  <ArrowRight aria-hidden="true" className="rtl-mirror" />
                </Button>
              ) : (
                <Button asChild variant="outline" size="sm">
                  <Link to="/programmes/$programmeId" params={{ programmeId: unit.programmeId }}>
                    {t('nav.courseSummary')}
                    <ArrowRight aria-hidden="true" className="rtl-mirror" />
                  </Link>
                </Button>
              )}
            </nav>
          </header>

          <StepNav step={step} progress={progress} onStep={(s) => goStep(s)} />

          <section aria-labelledby="step-title" className="flex flex-col gap-4">
            <h2 id="step-title" ref={stepHeadingRef} tabIndex={-1} className="m-0 text-2xl">
              {stepTitle}
            </h2>

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
          </section>

          {step !== 'media' && progress.checkReviewed && (
            <AfterReview
              unit={unit}
              course={course}
              isLast={isLast}
              simplified={simplified}
              unitComplete={isUnitComplete(progress)}
              unfinishedInCourse={
                units.filter((u) => !isUnitComplete(getUnitProgress(learner, u.id))).length
              }
            />
          )}

          {/* Sticky action area: the one prominent next step (brief §3 mobile layout). */}
          <div className="sticky bottom-[calc(4rem+1px+env(safe-area-inset-bottom))] z-30 -mx-4 flex flex-wrap items-center gap-2 border-t bg-white px-4 py-3 shadow-[0_-4px_12px_rgb(0_0_0/0.06)] md:static md:mx-0 md:rounded-2xl md:border">
            {step === 'media' && (
              <Button size="lg" onClick={() => goStep('check')}>
                {t('actions.toQuestion')}
                <ArrowRight aria-hidden="true" className="rtl-mirror" />
              </Button>
            )}
            {step === 'check' && !progress.checkReviewed && (
              <>
                <p className="m-0 flex-1 basis-48 text-base text-ink-soft">
                  {t('actions.checkHint')}
                </p>
                <Button variant="outline" onClick={() => goStep('media')}>
                  <ArrowLeft aria-hidden="true" className="rtl-mirror" />
                  {t('actions.backToLesson')}
                </Button>
              </>
            )}
            {step === 'check' && progress.checkReviewed && (
              <>
                <Button size="lg" onClick={goNext}>
                  {isLast ? <Flag aria-hidden="true" /> : null}
                  {nextLabel}
                  {!isLast && <ArrowRight aria-hidden="true" className="rtl-mirror" />}
                </Button>
                <Button variant="outline" onClick={() => goStep('practice')}>
                  {t('actions.toPractice')}
                </Button>
              </>
            )}
            {step === 'practice' && (
              <>
                <Button size="lg" onClick={goNext}>
                  {isLast ? <Flag aria-hidden="true" /> : null}
                  {nextLabel}
                  {!isLast && <ArrowRight aria-hidden="true" className="rtl-mirror" />}
                </Button>
                <Button variant="outline" onClick={() => goStep('check')}>
                  <ArrowLeft aria-hidden="true" className="rtl-mirror" />
                  {t('actions.backToQuestion')}
                </Button>
              </>
            )}
          </div>

          <details className="rounded-2xl border bg-white lg:hidden">
            <summary className="flex min-h-12 cursor-pointer items-center gap-2 px-4 font-semibold text-ink">
              <ListOrdered aria-hidden="true" className="size-5" />
              {t('outline.title', { course: l(course.title) })}
            </summary>
            <div className="border-t p-2">
              <UnitOutline
                units={units}
                currentId={unit.id}
                onNavigate={() => {
                  focusHeadingOnMount = true
                }}
              />
            </div>
          </details>
        </article>

        <aside
          aria-labelledby="outline-title"
          className="sticky top-4 hidden rounded-2xl border bg-white p-3 lg:block"
        >
          <h2 id="outline-title" className="m-0 px-3 pb-2 text-lg">
            {t('outline.title', { course: l(course.title) })}
          </h2>
          <UnitOutline
            units={units}
            currentId={unit.id}
            onNavigate={() => {
              focusHeadingOnMount = true
            }}
          />
        </aside>
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
  const { l } = useLocalized()
  if (!unit.badge && !isLast && !(unit.id === 'LS01' && !simplified)) return null

  return (
    <div className="flex flex-col gap-3">
      {unit.badge && unitComplete && (
        <section
          aria-labelledby="badge-title"
          className="flex items-start gap-3 rounded-2xl border-2 border-sedra-green bg-white p-4"
        >
          <Award aria-hidden="true" className="mt-1 size-8 shrink-0 text-sedra-green" />
          <div>
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
          className="flex flex-col gap-2 rounded-2xl bg-sedra-pale-50 p-4"
        >
          <h2 id="complete-title" className="m-0 text-xl">
            {unfinishedInCourse === 0
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
        </section>
      )}
      {unit.id === 'LS01' && !simplified && (
        <Link
          to="/resources"
          hash="ext01"
          className="inline-flex min-h-12 items-center gap-2 self-start font-semibold text-sedra-green underline underline-offset-4"
        >
          <ExternalLink aria-hidden="true" className="size-5" />
          {t('extraVideo')}
        </Link>
      )}
    </div>
  )
}
