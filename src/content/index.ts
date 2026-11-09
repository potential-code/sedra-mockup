import type { Course, CourseId, ExternalResource, ProgrammeId, Unit, UnitId } from '@shared/types'
import { getDb } from '@/store/db'
import { COURSES } from './courses'
import { EXT01 } from './external'
import { UNITS } from './units'

/** Read-only content API. Data: units.ts (16 units), courses.ts (2 courses), external.ts (EXT01). */
export { COURSES, EXT01, UNITS }

/** Unit with any admin edit applied (demo edits live in the local demo db). */
export function getUnit(id: string): Unit | undefined {
  const base = UNITS.find((u) => u.id === id)
  if (!base) return undefined
  return getDb().unitEdits[base.id]?.unit ?? base
}

/** SEDRA publishes or unpublishes a whole course (default published). */
export function isCoursePublished(id: CourseId): boolean {
  return !getDb().courseUnpublished?.[id]
}

/** A unit is visible to learners when its course is published (no per-unit publishing). */
export function isUnitPublished(id: UnitId): boolean {
  const base = UNITS.find((u) => u.id === id)
  return base ? isCoursePublished(base.courseId) : false
}

/** Course with any SEDRA admin edit (title, purpose) applied. */
export function withCourseEdit(c: Course): Course {
  const edit = getDb().courseEdits?.[c.id]
  return edit ? { ...c, ...edit } : c
}

export function getCourse(id: string): Course | undefined {
  const c = COURSES.find((x) => x.id === id)
  return c ? withCourseEdit(c) : undefined
}

export function courseForProgramme(programmeId: ProgrammeId): Course {
  const c = COURSES.find((x) => x.programmeId === programmeId)
  if (!c) throw new Error(`No course for ${programmeId}`)
  return withCourseEdit(c)
}

/** Units of a course in order, with admin edits applied. Learner views pass publishedOnly. */
export function unitsForCourse(courseId: CourseId, opts?: { publishedOnly?: boolean }): Unit[] {
  return UNITS.filter((u) => u.courseId === courseId)
    .filter((u) => !opts?.publishedOnly || isUnitPublished(u.id))
    .map((u) => getUnit(u.id) ?? u)
    .sort((a, b) => a.order - b.order)
}

export function nextUnit(id: UnitId): Unit | undefined {
  const u = getUnit(id)
  if (!u) return undefined
  return unitsForCourse(u.courseId).find((x) => x.order === u.order + 1)
}

export function previousUnit(id: UnitId): Unit | undefined {
  const u = getUnit(id)
  if (!u) return undefined
  return unitsForCourse(u.courseId).find((x) => x.order === u.order - 1)
}

export type { ExternalResource }
