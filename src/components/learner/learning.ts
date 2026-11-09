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
import { COURSES, getUnit, isUnitPublished, unitsForCourse } from '@/content'
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

/** Published units of a programme's course (learners never see unpublished units). */
export function courseUnits(programmeId: ProgrammeId): Unit[] {
  const course = findCourse(programmeId)
  return course ? unitsForCourse(course.id, { publishedOnly: true }) : []
}

/** Programmes SEDRA enrolled this learner in, in a stable order (no self-enrolment). */
export function enrolledProgrammes(learner: LearnerState | null): ProgrammeId[] {
  if (!learner) return []
  const enrolled = learner.enrolled ?? PROGRAMMES
  return PROGRAMMES.filter((p) => enrolled.includes(p))
}

export function isEnrolled(learner: LearnerState | null, programmeId: ProgrammeId): boolean {
  return enrolledProgrammes(learner).includes(programmeId)
}

/** First visit: no unit opened or started in any enrolled programme yet. */
export function hasStartedLearning(learner: LearnerState | null): boolean {
  if (!learner) return false
  const enrolled = enrolledProgrammes(learner)
  const last = learner.lastLocation ? getUnit(learner.lastLocation.unitId) : undefined
  if (last && enrolled.includes(last.programmeId)) return true
  return enrolled.some((p) =>
    courseUnits(p).some((u) => unitStatus(getUnitProgress(learner, u.id)) !== 'notStarted'),
  )
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
 * unit of the last programme, then of the other enrolled programme. Enrolled + published only.
 */
export function nextStepUnit(learner: LearnerState | null): Unit | undefined {
  const enrolled = enrolledProgrammes(learner)
  const lastId = learner?.lastLocation?.unitId
  const last = lastId ? getUnit(lastId) : undefined
  if (last && enrolled.includes(last.programmeId) && isUnitPublished(last.id)) return last
  const first = learner?.lastProgramme
  const order: ProgrammeId[] =
    first && enrolled.includes(first) ? [first, ...enrolled.filter((p) => p !== first)] : enrolled
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

/** Programme status from its units: complete when all done, in progress once anything started. */
export function programmeStatus(learner: LearnerState | null, units: Unit[]): UnitStatus {
  if (units.length > 0 && completedCount(learner, units) === units.length) return 'complete'
  return units.some((u) => unitStatus(getUnitProgress(learner, u.id)) !== 'notStarted')
    ? 'inProgress'
    : 'notStarted'
}

/** Parts for a calendar tile (UAE time). The full date stays in text next to the tile. */
export function uaeDateParts(
  iso: string,
  lang: Lang,
): { month: string; day: string; weekday: string; time: string } {
  const locale = lang === 'ar' ? 'ar-AE' : 'en-AE'
  const d = new Date(iso)
  const part = (o: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat(locale, { ...o, timeZone: 'Asia/Dubai' }).format(d)
  return {
    month: part({ month: 'short' }),
    day: part({ day: 'numeric' }),
    weekday: part({ weekday: 'short' }),
    time: part({ hour: 'numeric', minute: '2-digit' }),
  }
}
