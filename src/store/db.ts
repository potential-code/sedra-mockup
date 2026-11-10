import type {
  AdminLearner,
  ContentDraft,
  Course,
  CourseId,
  CustomResource,
  Invitation,
  LearnerState,
  LiveSession,
  PersonaId,
  Prefs,
  SupportRequest,
  UnitEdit,
  UnitId,
} from '@shared/types'
import { useSyncExternalStore } from 'react'
import { seedAdminLearners } from '@/mocks/admin-seed'
import { DEFAULT_PREFS, seedLearners, seedSessions, seedSupportRequests } from '@/mocks/seed'

/**
 * One versioned demo database in localStorage (brief §1: progress saved locally; Reset demo
 * data action; not a production learner record). Writes are synchronous so a quick refresh
 * never loses the last step (walkthrough A: refresh and resume).
 */
const KEY = 'sedra-demo-db'
const VERSION = 11

export type LearnerPersonaId = Exclude<PersonaId, 'admin'>

export interface DemoDb {
  version: number
  session: { personaId: PersonaId | null }
  prefs: Prefs
  learners: Record<LearnerPersonaId, LearnerState>
  sessions: LiveSession[]
  supportRequests: SupportRequest[]
  adminLearners: AdminLearner[]
  contentDrafts: ContentDraft[]
  invitations: Invitation[]
  unitEdits: Partial<Record<UnitId, UnitEdit>>
  customResources: CustomResource[]
  /** SEDRA admin edits to course title and purpose (demo only). */
  courseEdits: Partial<Record<CourseId, Pick<Course, 'title' | 'purpose'> & { image?: string }>>
  /** Publishing is per course, not per unit. Missing = published. */
  courseUnpublished: Partial<Record<CourseId, boolean>>
  /** SEDRA edits to the built-in resources (title and short description, per language). */
  resourceEdits: Partial<Record<BuiltInResourceKey, ResourceTextEdit>>
  /** EXT01 is hidden from learners until SEDRA approves it after review (brief §9). */
  ext01Approved: boolean
  /**
   * Resources SEDRA hid from learners (key: built-in key, 'EXT01', 'summaries:<courseId>' or a
   * custom resource id). Optional so older saved demo data still loads; missing = visible.
   */
  resourceHidden?: Partial<Record<string, boolean>>
}

export type BuiltInResourceKey = 'stopThinkDo' | 'playbook' | 'hospitalityPlan'
export interface ResourceTextEdit {
  title: Partial<Record<'en' | 'ar', string>>
  body: Partial<Record<'en' | 'ar', string>>
  /** Content fields inside the resource (e.g. Stop Think Do step names and texts). */
  fields?: Partial<Record<string, Partial<Record<'en' | 'ar', string>>>>
}

function seed(keep?: Pick<DemoDb, 'session' | 'prefs'>): DemoDb {
  return {
    version: VERSION,
    session: keep?.session ?? { personaId: null },
    prefs: keep?.prefs ?? { ...DEFAULT_PREFS },
    learners: seedLearners(),
    sessions: seedSessions(),
    supportRequests: seedSupportRequests(),
    adminLearners: seedAdminLearners(),
    contentDrafts: [],
    invitations: [],
    unitEdits: {},
    customResources: [],
    courseEdits: {},
    courseUnpublished: {},
    resourceEdits: {},
    ext01Approved: false,
    resourceHidden: {},
  }
}

function load(): DemoDb {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return seed()
    const parsed = JSON.parse(raw) as DemoDb
    if (parsed?.version !== VERSION) return seed()
    return parsed
  } catch {
    return seed()
  }
}

let state: DemoDb = load()
const listeners = new Set<() => void>()

function persist() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state))
  } catch {
    // Storage blocked (private mode): the demo still works for this visit.
  }
}

// Save the seed on first load so tools and other tabs see the same demo db.
persist()

export function getDb(): DemoDb {
  return state
}

/** Immutable update: pass a function that returns the next state. */
export function update(fn: (db: DemoDb) => DemoDb) {
  state = fn(state)
  persist()
  for (const l of listeners) l()
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** React hook: select a slice of the demo db. Keep selectors returning stable references. */
export function useDb<T>(selector: (db: DemoDb) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  )
}

/** Reset demo data: re-seed everything, keep the signed-in persona and preferences. */
export function resetDemo() {
  update((db) => seed({ session: db.session, prefs: db.prefs }))
}

// Other tabs: keep in sync.
if (typeof window !== 'undefined') {
  window.addEventListener('storage', (e) => {
    if (e.key !== KEY) return
    state = load()
    for (const l of listeners) l()
  })
}
