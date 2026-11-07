import type {
  Course,
  CourseId,
  Lang,
  LearnerState,
  LiveSession,
  ProgrammeId,
  Unit,
  UnitId,
  UnitProgress,
} from '@shared/types'
import { COURSES, getUnit, unitsForCourse } from '@/content'
import { getUnitProgress, isUnitComplete } from '@/store/actions'

/** Shared learner helpers: unit status, course progress, next step, UAE time. */

export const PROGRAMMES: ProgrammeId[] = ['life-skills', 'hospitality']
export const UNITS_PER_COURSE = 8

/** common.json key for each programme name (brief §4 label table). */
export const PROGRAMME_LABEL_KEY: Record<ProgrammeId, 'lifeSkills' | 'hospitalityForAll'> = {
  'life-skills': 'lifeSkills',
  hospitality: 'hospitalityForAll',
}

export function isProgrammeId(v: string): v is ProgrammeId {
  return v === 'life-skills' || v === 'hospitality'
}

/** Safe version of courseForProgramme (content may still be loading in the demo build). */
export function findCourse(programmeId: ProgrammeId): Course | undefined {
  return COURSES.find((c) => c.programmeId === programmeId)
}

export function courseUnits(programmeId: ProgrammeId): Unit[] {
  const course = findCourse(programmeId)
  return course ? unitsForCourse(course.id) : []
}

export type UnitStatus = 'notStarted' | 'inProgress' | 'complete'

export function unitStatus(p: UnitProgress): UnitStatus {
  if (isUnitComplete(p)) return 'complete'
  if (p.watchedOrRead || p.checkReviewed || p.attempts > 0 || p.practice) return 'inProgress'
  return 'notStarted'
}

export function completedCount(learner: LearnerState | null, units: Unit[]): number {
  return units.filter((u) => isUnitComplete(getUnitProgress(learner, u.id))).length
}

export function isComplete(learner: LearnerState | null, unitId: UnitId): boolean {
  return isUnitComplete(getUnitProgress(learner, unitId))
}

/**
 * Continue learning (brief §2 journeys): restore the last unit; otherwise the first incomplete
 * unit of the last programme, then of the other programme.
 */
export function nextStepUnit(learner: LearnerState | null): Unit | undefined {
  const last = learner?.lastLocation ? getUnit(learner.lastLocation.unitId) : undefined
  if (last) return last
  const first = learner?.lastProgramme ?? 'life-skills'
  const order: ProgrammeId[] = first === 'life-skills' ? PROGRAMMES : [...PROGRAMMES].reverse()
  for (const p of order) {
    const u = courseUnits(p).find((x) => !isUnitComplete(getUnitProgress(learner, x.id)))
    if (u) return u
  }
  return undefined
}

export function unitLinkParams(u: Pick<Unit, 'courseId' | 'id'>): {
  courseId: CourseId
  unitId: UnitId
} {
  return { courseId: u.courseId, unitId: u.id }
}

/** Date and time in UAE time (Asia/Dubai), in the active language. */
export function formatUaeDateTime(iso: string, lang: Lang): string {
  return new Intl.DateTimeFormat(lang === 'ar' ? 'ar-AE' : 'en-AE', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'Asia/Dubai',
  }).format(new Date(iso))
}

export function sortByStart(sessions: LiveSession[]): LiveSession[] {
  return [...sessions].sort((a, b) => a.startsAt.localeCompare(b.startsAt))
}
