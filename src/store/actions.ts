import type {
  LastLocation,
  LearnerState,
  PersonaId,
  Prefs,
  ProgrammeId,
  UnitId,
  UnitProgress,
} from '@shared/types'
import { PERSONAS } from '@/mocks/seed'
import { type DemoDb, getDb, type LearnerPersonaId, update, useDb } from './db'

/* ---------- session ---------- */

export function signInAs(personaId: PersonaId) {
  update((db) => ({ ...db, session: { personaId } }))
  return PERSONAS.find((p) => p.id === personaId)
}

export function signOut() {
  update((db) => ({ ...db, session: { personaId: null } }))
}

export function useSession() {
  const personaId = useDb((db) => db.session.personaId)
  const persona = PERSONAS.find((p) => p.id === personaId) ?? null
  return { personaId, persona, role: persona?.role ?? null }
}

/* ---------- preferences ---------- */

export function setPrefs(patch: Partial<Prefs>) {
  update((db) => ({ ...db, prefs: { ...db.prefs, ...patch } }))
}

export function usePrefs(): Prefs {
  return useDb((db) => db.prefs)
}

/* ---------- learner progress ---------- */

const EMPTY: UnitProgress = { watchedOrRead: false, checkReviewed: false, attempts: 0 }

function learnerId(db: DemoDb): LearnerPersonaId | null {
  const id = db.session.personaId
  return id === 'new-learner' || id === 'noor' ? id : null
}

function patchLearner(fn: (l: LearnerState) => LearnerState) {
  update((db) => {
    const id = learnerId(db)
    if (!id) return db
    return { ...db, learners: { ...db.learners, [id]: fn(db.learners[id]) } }
  })
}

/** Current learner state, or null for admin / signed out. */
export function useLearner(): LearnerState | null {
  return useDb((db) => {
    const id = learnerId(db)
    return id ? db.learners[id] : null
  })
}

export function getUnitProgress(l: LearnerState | null, unitId: UnitId): UnitProgress {
  return l?.progress[unitId] ?? EMPTY
}

/** Completion = Watch or read done + Check reviewed. Practice never blocks (brief §4). */
export function isUnitComplete(p: UnitProgress | undefined): boolean {
  return !!p?.watchedOrRead && !!p?.checkReviewed
}

export function updateUnitProgress(unitId: UnitId, patch: Partial<UnitProgress>) {
  patchLearner((l) => ({
    ...l,
    progress: { ...l.progress, [unitId]: { ...(l.progress[unitId] ?? EMPTY), ...patch } },
  }))
}

export function setLastLocation(loc: LastLocation, programme: ProgrammeId) {
  patchLearner((l) => ({ ...l, lastLocation: loc, lastProgramme: programme }))
}

export function setOnboarded() {
  patchLearner((l) => ({ ...l, onboarded: true }))
}

export function setPlaybook(playbook: LearnerState['playbook']) {
  patchLearner((l) => ({ ...l, playbook }))
}

export function setPracticePlan(practicePlan: LearnerState['practicePlan']) {
  patchLearner((l) => ({ ...l, practicePlan }))
}

export function readLearnerSnapshot(): LearnerState | null {
  const db = getDb()
  const id = learnerId(db)
  return id ? db.learners[id] : null
}
