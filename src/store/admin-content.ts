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
import { useMemo } from 'react'
import { isUnitPublished } from '@/content'
import {
  type AddedBlock,
  type AddedUnit,
  type BuiltInResourceKey,
  getDb,
  update,
  useDb,
} from './db'

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
      ...practiceChoices(current, lang, f),
    },
  }
}

/** Practice answer choices from the editor (one per line) merged into the other language. */
function practiceChoices(current: Unit, lang: Lang, f: Partial<Record<string, string>>) {
  const lines = (f.practice_choices ?? '')
    .split('\n')
    .map((x) => x.trim())
    .filter(Boolean)
  const choices = lines.map((line, i) =>
    setL(current.practice.choices?.[i] ?? { en: '', ar: '' }, lang, line),
  )
  return {
    choices: choices.length > 0 ? choices : undefined,
    multiple: choices.length > 0 && f.practice_multiple === 'yes',
  }
}

/** Publish an edited unit: learners see it at once (getUnit reads unitEdits). */
export function publishUnit(unit: Unit) {
  const edit: UnitEdit = { unit, published: true, updatedAt: new Date().toISOString() }
  update((db) => ({ ...db, unitEdits: { ...db.unitEdits, [unit.id]: edit } }))
}

/** Publish or unpublish a whole course (units have no separate publish). */
export function setCoursePublished(id: CourseId, published: boolean) {
  update((db) => ({
    ...db,
    courseUnpublished: { ...(db.courseUnpublished ?? {}), [id]: !published },
  }))
}

export function useCoursePublished(id: CourseId): boolean {
  return useDb((db) => !db.courseUnpublished?.[id])
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

/** Demo: SEDRA edits a course's title and purpose. Learner pages show the new text. */
export function saveCourseEdit(courseId: CourseId, edit: { title: Localized; purpose: Localized }) {
  update((db) => ({ ...db, courseEdits: { ...(db.courseEdits ?? {}), [courseId]: edit } }))
}

export function useCourseEdits() {
  return useDb((db) => db.courseEdits ?? EMPTY_OBJ)
}

/** Demo: SEDRA edits a built-in resource's title and short description in one language. */
export function saveResourceEdit(
  key: BuiltInResourceKey,
  lang: Lang,
  text: { title: string; body: string; fields?: Record<string, string> },
) {
  update((db) => {
    const prev = db.resourceEdits?.[key] ?? { title: {}, body: {} }
    const fields = { ...(prev.fields ?? {}) }
    for (const [k, v] of Object.entries(text.fields ?? {})) fields[k] = { ...fields[k], [lang]: v }
    return {
      ...db,
      resourceEdits: {
        ...(db.resourceEdits ?? {}),
        [key]: {
          title: { ...prev.title, [lang]: text.title },
          body: { ...prev.body, [lang]: text.body },
          fields,
        },
      },
    }
  })
}

/** Saved override for one built-in resource in one language (undefined = use the default text). */
export function useResourceText(key: BuiltInResourceKey, lang: Lang) {
  const edit = useDb((db) => db.resourceEdits?.[key])
  return {
    title: edit?.title[lang],
    body: edit?.body[lang],
    field: (k: string) => edit?.fields?.[k]?.[lang],
  }
}

/* ---------- demo: add units and learning blocks ---------- */

const newId = (p: string) =>
  `${p}-${Date.now().toString(36)}${Math.random().toString(36).slice(2, 5)}`

const EMPTY_UNITS: AddedUnit[] = []
const EMPTY_OBJ = {}

export function useAddedUnits(courseId: CourseId): AddedUnit[] {
  // Select the stored array (stable reference), then filter: a fresh array per read loops React.
  const all = useDb((db) => db.addedUnits ?? EMPTY_UNITS)
  return useMemo(() => all.filter((u) => u.courseId === courseId), [all, courseId])
}

export function addUnit(
  input: Omit<AddedUnit, 'id' | 'blocks'> & { blocks: Omit<AddedBlock, 'id'>[] },
) {
  const unit: AddedUnit = {
    ...input,
    id: newId('unit'),
    blocks: input.blocks.map((b) => ({ ...b, id: newId('block') })),
  }
  update((db) => ({ ...db, addedUnits: [...(db.addedUnits ?? []), unit] }))
  return unit
}

export function removeAddedUnit(id: string) {
  update((db) => ({ ...db, addedUnits: (db.addedUnits ?? []).filter((u) => u.id !== id) }))
}

/** Extra blocks on any unit (built-in unit ID or an added unit's ID). */
export function useAddedBlocks(unitId: string): AddedBlock[] {
  return useDb(
    (db) =>
      db.addedBlocks?.[unitId] ??
      (db.addedUnits ?? []).find((u) => u.id === unitId)?.blocks ??
      EMPTY_BLOCKS,
  )
}
const EMPTY_BLOCKS: AddedBlock[] = []

export function addBlock(unitId: string, block: Omit<AddedBlock, 'id'>) {
  const b: AddedBlock = { ...block, id: newId('block') }
  update((db) => {
    const added = (db.addedUnits ?? []).find((u) => u.id === unitId)
    if (added) {
      return {
        ...db,
        addedUnits: db.addedUnits.map((u) =>
          u.id === unitId ? { ...u, blocks: [...u.blocks, b] } : u,
        ),
      }
    }
    return {
      ...db,
      addedBlocks: {
        ...(db.addedBlocks ?? {}),
        [unitId]: [...(db.addedBlocks?.[unitId] ?? []), b],
      },
    }
  })
}

export function removeBlock(unitId: string, blockId: string) {
  update((db) => {
    const added = (db.addedUnits ?? []).find((u) => u.id === unitId)
    if (added) {
      return {
        ...db,
        addedUnits: db.addedUnits.map((u) =>
          u.id === unitId ? { ...u, blocks: u.blocks.filter((x) => x.id !== blockId) } : u,
        ),
      }
    }
    return {
      ...db,
      addedBlocks: {
        ...(db.addedBlocks ?? {}),
        [unitId]: (db.addedBlocks?.[unitId] ?? []).filter((x) => x.id !== blockId),
      },
    }
  })
}

export function updateBlock(unitId: string, block: AddedBlock) {
  update((db) => {
    const added = (db.addedUnits ?? []).find((u) => u.id === unitId)
    if (added) {
      return {
        ...db,
        addedUnits: db.addedUnits.map((u) =>
          u.id === unitId
            ? { ...u, blocks: u.blocks.map((x) => (x.id === block.id ? block : x)) }
            : u,
        ),
      }
    }
    return {
      ...db,
      addedBlocks: {
        ...(db.addedBlocks ?? {}),
        [unitId]: (db.addedBlocks?.[unitId] ?? []).map((x) => (x.id === block.id ? block : x)),
      },
    }
  })
}

/** EXT01 review: learners see the video only after SEDRA approves it. */
export function useExt01Approved(): boolean {
  return useDb((db) => db.ext01Approved === true)
}

export function setExt01Approved(approved: boolean) {
  update((db) => ({ ...db, ext01Approved: approved }))
}
