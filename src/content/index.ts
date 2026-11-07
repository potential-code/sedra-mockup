import type { Course, CourseId, ExternalResource, ProgrammeId, Unit, UnitId } from '@shared/types'
import { COURSES } from './courses'
import { EXT01 } from './external'
import { UNITS } from './units'

/** Read-only content API. Data: units.ts (16 units), courses.ts (2 courses), external.ts (EXT01). */
export { COURSES, EXT01, UNITS }

export function getUnit(id: string): Unit | undefined {
  return UNITS.find((u) => u.id === id)
}

export function getCourse(id: string): Course | undefined {
  return COURSES.find((c) => c.id === id)
}

export function courseForProgramme(programmeId: ProgrammeId): Course {
  const c = COURSES.find((x) => x.programmeId === programmeId)
  if (!c) throw new Error(`No course for ${programmeId}`)
  return c
}

export function unitsForCourse(courseId: CourseId): Unit[] {
  return UNITS.filter((u) => u.courseId === courseId).sort((a, b) => a.order - b.order)
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
