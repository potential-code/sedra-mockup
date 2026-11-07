import type {
  AdminLearner,
  ContentDraft,
  CourseId,
  Lang,
  LiveSession,
  ProgrammeId,
  UnitId,
} from '@shared/types'
import { DEMO_NOW } from '@/mocks/admin-seed'
import { getDb, update, useDb } from './db'

/**
 * Admin-only reads and simulated writes (brief §1: demonstrate but do not imply live
 * integration). Everything stays in this browser's demo db. Learner routes never import this.
 */

export const COURSE_IDS: CourseId[] = ['healthy-communication', 'intro-hospitality']
export const PROGRAMME_IDS: ProgrammeId[] = ['life-skills', 'hospitality']
export const UNITS_PER_COURSE = 8
const SEVEN_DAYS = 7 * 24 * 60 * 60 * 1000

/** Active = opened a unit or session in the seven days before the demo "now" (brief §9). */
export function isActive(l: AdminLearner, now = DEMO_NOW): boolean {
  const diff = new Date(now).getTime() - new Date(l.latestActivity).getTime()
  return diff >= 0 && diff <= SEVEN_DAYS
}

export function completedCourse(l: AdminLearner, course: CourseId): boolean {
  return (l.unitsCompleted[course] ?? 0) >= UNITS_PER_COURSE
}

export interface AdminMetrics {
  enrolled: number
  lifeSkills: number
  hospitality: number
  both: number
  active: number
  hcCompletions: number
  hfCompletions: number
  openSupport: number
}

/** All overview numbers are computed from the demo db so they always reconcile. */
export function computeMetrics(learners: AdminLearner[], supportOpen: number): AdminMetrics {
  const has = (l: AdminLearner, p: ProgrammeId) => l.programmes.includes(p)
  return {
    // Unique people: each learner record counts once, whatever the programmes.
    enrolled: new Set(learners.map((l) => l.id)).size,
    lifeSkills: learners.filter((l) => has(l, 'life-skills')).length,
    hospitality: learners.filter((l) => has(l, 'hospitality')).length,
    both: learners.filter((l) => has(l, 'life-skills') && has(l, 'hospitality')).length,
    active: learners.filter((l) => isActive(l)).length,
    hcCompletions: learners.filter((l) => completedCourse(l, 'healthy-communication')).length,
    hfCompletions: learners.filter((l) => completedCourse(l, 'intro-hospitality')).length,
    openSupport: supportOpen,
  }
}

export function useAdminLearners(): AdminLearner[] {
  return useDb((db) => db.adminLearners)
}

export function useSupportRequests() {
  return useDb((db) => db.supportRequests)
}

export function useAdminMetrics(): AdminMetrics {
  const learners = useAdminLearners()
  const requests = useSupportRequests()
  return computeMetrics(learners, requests.filter((r) => r.status === 'open').length)
}

/* ---------- learner filters ---------- */

export type ProgrammeFilter = 'all' | ProgrammeId | 'both'
export type ProgressFilter = 'all' | 'not-started' | 'in-progress' | 'completed'

export function progressBucket(l: AdminLearner): Exclude<ProgressFilter, 'all'> {
  const total = COURSE_IDS.reduce((s, c) => s + (l.unitsCompleted[c] ?? 0), 0)
  if (total === 0) return 'not-started'
  if (COURSE_IDS.some((c) => completedCourse(l, c))) return 'completed'
  return 'in-progress'
}

export function filterLearners(
  learners: AdminLearner[],
  programme: ProgrammeFilter,
  progress: ProgressFilter,
): AdminLearner[] {
  return learners.filter((l) => {
    if (programme === 'both' && l.programmes.length < 2) return false
    if (programme !== 'all' && programme !== 'both' && !l.programmes.includes(programme))
      return false
    if (progress !== 'all' && progressBucket(l) !== progress) return false
    return true
  })
}

/* ---------- content drafts (simulated) ---------- */

export function useContentDrafts(): ContentDraft[] {
  return useDb((db) => db.contentDrafts)
}

export function getContentDraft(unitId: UnitId, language: Lang): ContentDraft | undefined {
  return getDb().contentDrafts.find((d) => d.unitId === unitId && d.language === language)
}

/** Save a draft in this demo only. Nothing is published. */
export function saveContentDraft(draft: Omit<ContentDraft, 'updatedAt'>) {
  const next: ContentDraft = { ...draft, updatedAt: new Date().toISOString() }
  update((db) => ({
    ...db,
    contentDrafts: [
      ...db.contentDrafts.filter(
        (d) => !(d.unitId === draft.unitId && d.language === draft.language),
      ),
      next,
    ],
  }))
}

/* ---------- sessions (simulated) ---------- */

export function useAdminSessions(): LiveSession[] {
  return useDb((db) => db.sessions)
}

/** Update a demo session record. No Zoom booking, attendance sync or recording upload happens. */
export function saveSession(session: LiveSession) {
  update((db) => ({
    ...db,
    sessions: db.sessions.map((s) => (s.id === session.id ? session : s)),
  }))
}

/* ---------- CSV export (simulated, client-side only) ---------- */

function csvCell(v: string | number | boolean): string {
  const s = String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** UAE-time timestamp for exports, independent of the viewer's clock zone. */
function uaeStamp(iso: string): string {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Dubai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(new Date(iso))
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? ''
  return `${get('year')}-${get('month')}-${get('day')} ${get('hour')}:${get('minute')} GST`
}

export const CSV_FILE_NAME = 'sedra-demo-learners.csv'

export function buildLearnersCsv(learners: AdminLearner[]): string {
  const header = [
    'learner_id',
    'fictional_name',
    'programmes',
    'healthy_communication_units_completed',
    'intro_hospitality_units_completed',
    'latest_activity_uae',
    'active_last_7_days',
    'checks_reviewed',
    'checks_correct_first_try',
    'practice_done',
    'practice_later',
    'practice_with_help',
    'support_flag',
  ]
  const rows = learners.map((l) => [
    l.id,
    l.name,
    l.programmes.join(' + '),
    l.programmes.includes('life-skills') ? (l.unitsCompleted['healthy-communication'] ?? 0) : '',
    l.programmes.includes('hospitality') ? (l.unitsCompleted['intro-hospitality'] ?? 0) : '',
    uaeStamp(l.latestActivity),
    isActive(l) ? 'yes' : 'no',
    l.checksReviewed,
    l.checksCorrectFirstTry,
    l.practice.done,
    l.practice.later,
    l.practice.withHelp,
    l.supportFlag ? 'yes' : 'no',
  ])
  const lines = [
    'Demo data - fictional learners from the SEDRA learning mockup. Not a production learner record.',
    header.join(','),
    ...rows.map((r) => r.map(csvCell).join(',')),
  ]
  return `${lines.join('\r\n')}\r\n`
}

/** Generates the file in the browser and triggers a download. No server is involved. */
export function downloadLearnersCsv(learners: AdminLearner[]) {
  const blob = new Blob([buildLearnersCsv(learners)], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = CSV_FILE_NAME
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
