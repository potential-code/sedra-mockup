import type {
  CourseId,
  CustomResource,
  Lang,
  LiveSession,
  Localized,
  ProgrammeId,
  Unit,
  UnitEdit,
  UnitId,
} from '@shared/types'
import { getUnit, isUnitPublished } from '@/content'
import { getDb, update, useDb } from './db'

/**
 * Admin authoring writes (demo only). Everything stays in this browser's demo db.
 * Owner decisions: only the 16 existing units can be edited or published/unpublished; no new
 * course or unit, no deletion. Recordings stay 'Pending recording'; nothing is uploaded.
 */

/* ---------- unit edits ---------- */

export function useUnitEdits(): Partial<Record<UnitId, UnitEdit>> {
  return useDb((db) => db.unitEdits)
}

/** Latest admin change for a set of units (ISO), or undefined if none were changed. */
export function latestEdit(
  edits: Partial<Record<UnitId, UnitEdit>>,
  ids: readonly UnitId[],
): string | undefined {
  return ids
    .map((id) => edits[id]?.updatedAt)
    .filter((d): d is string => !!d)
    .sort()
    .pop()
}

function setL(v: Localized, lang: Lang, text: string): Localized {
  return { ...v, [lang]: text }
}

/**
 * Build a Unit from editor fields for one language; the other language is kept from the
 * current unit. Media paths are never changed: the simulated file choice is not uploaded, so a
 * learner never gets a fake playable video.
 */
export function unitFromFields(current: Unit, lang: Lang, f: Record<string, string>): Unit {
  const lines = (f.transcript ?? '').split('\n').filter((s) => s.trim() !== '')
  const scenes =
    lines.length === current.scenes.length
      ? current.scenes.map((s, i) => ({ ...s, narration: setL(s.narration, lang, lines[i] ?? '') }))
      : current.scenes
  const correct = (['A', 'B', 'C'] as const).find((x) => x === f.correct_option)
  return {
    ...current,
    title: setL(current.title, lang, f.title ?? ''),
    objective: setL(current.objective, lang, f.objective ?? ''),
    sourcePages: f.source_pages?.trim() || current.sourcePages,
    summary: setL(current.summary, lang, f.summary ?? ''),
    imageAlt: setL(current.imageAlt, lang, f.image_alt ?? ''),
    // Only a unit with a produced sample can show it; 'pending' may hide it. Never fake 'sample'.
    // Media status is set from the English draft only (the Arabic draft has no video yet).
    mediaStatus:
      lang !== 'en'
        ? current.mediaStatus
        : current.media?.en && f.media_status === 'sample'
          ? 'sample'
          : 'pending',
    scenes,
    check: {
      ...current.check,
      question: setL(current.check.question, lang, f.question ?? ''),
      options: current.check.options.map((o) => ({
        ...o,
        text: setL(o.text, lang, f[`options_${o.id}`] ?? ''),
      })),
      correct: correct ?? current.check.correct,
      feedbackCorrect: setL(current.check.feedbackCorrect, lang, f.feedback_correct ?? ''),
      feedbackRetry: setL(current.check.feedbackRetry, lang, f.feedback_retry ?? ''),
    },
    practice: {
      ...current.practice,
      prompt: setL(current.practice.prompt, lang, f.practice_prompt ?? ''),
    },
  }
}

/** Publish an edited unit: learners see it at once (getUnit reads unitEdits). */
export function publishUnit(unit: Unit) {
  const edit: UnitEdit = { unit, published: true, updatedAt: new Date().toISOString() }
  update((db) => ({ ...db, unitEdits: { ...db.unitEdits, [unit.id]: edit } }))
}

/** Publish or unpublish a unit without changing its content. */
export function setUnitPublished(id: UnitId, published: boolean) {
  const unit = getUnit(id)
  if (!unit) return
  const edit: UnitEdit = { unit, published, updatedAt: new Date().toISOString() }
  update((db) => ({ ...db, unitEdits: { ...db.unitEdits, [id]: edit } }))
}

export { isUnitPublished }

/* ---------- sessions ---------- */

export function createSession(input: {
  programmeId: ProgrammeId
  title: Localized
  startsAt: string
  accessLink: string
}): LiveSession {
  const s: LiveSession = {
    id: `ses-${Date.now().toString(36)}`,
    programmeId: input.programmeId,
    title: input.title,
    startsAt: input.startsAt,
    timezone: 'Asia/Dubai',
    accessLink: input.accessLink,
    attendanceStatus: 'upcoming',
    recordingStatus: 'pending',
    demo: true,
  }
  update((db) => ({ ...db, sessions: [...db.sessions, s] }))
  return s
}

export function setSessionCancelled(id: string, cancelled: boolean) {
  update((db) => ({
    ...db,
    sessions: db.sessions.map((s) => (s.id === id ? { ...s, cancelled } : s)),
  }))
}

/* ---------- custom resources ---------- */

export function useCustomResources(): CustomResource[] {
  return useDb((db) => db.customResources)
}

export function saveCustomResource(input: {
  id?: string
  courseId: CourseId
  title: Localized
  body: Localized
  url?: string
}): CustomResource {
  const existing = input.id ? getDb().customResources.find((r) => r.id === input.id) : undefined
  const r: CustomResource = {
    id: existing?.id ?? `res-${Date.now().toString(36)}`,
    courseId: input.courseId,
    title: input.title,
    body: input.body,
    url: input.url || undefined,
    createdAt: existing?.createdAt ?? new Date().toISOString(),
  }
  update((db) => ({
    ...db,
    customResources: existing
      ? db.customResources.map((x) => (x.id === r.id ? r : x))
      : [...db.customResources, r],
  }))
  return r
}

export function removeCustomResource(id: string) {
  update((db) => ({ ...db, customResources: db.customResources.filter((r) => r.id !== id) }))
}

/** https link check for optional resource links. */
export function isHttpsUrl(v: string): boolean {
  try {
    const u = new URL(v.trim())
    return u.protocol === 'https:' && !!u.hostname && !/\s/.test(v.trim())
  } catch {
    return false
  }
}
