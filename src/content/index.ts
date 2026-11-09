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

/** Learners only see published units; admin edits can unpublish a unit (default published). */
export function isUnitPublished(id: UnitId): boolean {
  return getDb().unitEdits[id]?.published ?? true
}

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function courseForProgramme(programmeId: ProgrammeId): Course {
  const c = COURSES.find((x) => x.programmeId === programmeId)
  if (!c) throw new Error(`No course for ${programmeId}`)
  return c
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
