import type {
  AdminLearner,
  ContentDraft,
  LearnerState,
  LiveSession,
  PersonaId,
  Prefs,
  SupportRequest,
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
const VERSION = 1

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
