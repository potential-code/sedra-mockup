import type { AdminLearner, ProgrammeId } from '@shared/types'

/**
 * Fictional admin learners. Owned by the admin build: must reconcile with brief §9 totals
 * (40 unique, 30 Life Skills + 24 Hospitality incl. 14 in both, 28 active in 7 days,
 * 12 Healthy Communication completions, 8 Hospitality completions, 3 open support requests).
 *
 * Every name is invented. No medical, diagnosis or disability fields, and no ranking.
 * Deterministic: the same 40 records every time (Reset demo data restores them).
 */

/** Fixed demo "now" so "active in the last seven days" always reconciles (brief §9). */
export const DEMO_NOW = '2026-11-07T08:00:00.000Z'

const NAMES = [
  'Amal K.',
  'Bilal R.',
  'Chiamaka O.',
  'Dina S.',
  'Ethan M.',
  'Farah H.',
  'Gabriel T.',
  'Hessa A.',
  'Imran Q.',
  'Joy P.',
  'Karim N.',
  'Layla F.',
  'Mateo G.',
  'Nadia B.',
  'Omar Y.',
  'Priya V.',
  'Rami D.',
  'Sara L.',
  'Tariq E.',
  'Uma J.',
  'Wafa Z.',
  'Yusuf C.',
  'Zara I.',
  'Adel W.',
  'Bea M.',
  'Daniyal S.',
  'Esra K.',
  'Faisal U.',
  'Grace A.',
  'Hamad R.',
  'Ines T.',
  'Jamal O.',
  'Kavya N.',
  'Lina H.',
  'Maryam D.',
  'Nikhil P.',
  'Rania G.',
  'Salem B.',
  'Tala F.',
  'Zayed M.',
] as const

/** 14 learners enrolled in both programmes (counted once in total learners). */
const BOTH = new Set([2, 5, 8, 11, 14, 17, 20, 23, 26, 29, 32, 35, 38, 40])
/** 10 learners in Hospitality for All only. The remaining 16 are Life Skills only. */
const HOSPITALITY_ONLY = new Set([3, 9, 12, 15, 21, 27, 30, 33, 36, 39])
/** 12 learners with no unit or session opened in the last seven days. */
const INACTIVE = new Set([4, 9, 12, 13, 18, 24, 27, 31, 33, 34, 36, 38])
/** 12 learners who completed all 8 Healthy Communication units. */
const HC_COMPLETE = new Set([1, 2, 5, 6, 8, 10, 11, 16, 19, 20, 25, 28])
/** 8 learners who completed all 8 Introduction to Hospitality units. */
const HF_COMPLETE = new Set([2, 3, 5, 14, 15, 21, 23, 30])
/** Learners with an open support request in src/mocks/seed.ts (sr-1, sr-2, sr-3). */
const SUPPORT = new Set([7, 15, 22])

const HOUR = 60 * 60 * 1000
const DAY = 24 * HOUR

function programmesFor(n: number): ProgrammeId[] {
  if (BOTH.has(n)) return ['life-skills', 'hospitality']
  if (HOSPITALITY_ONLY.has(n)) return ['hospitality']
  return ['life-skills']
}

export function seedAdminLearners(): AdminLearner[] {
  const now = new Date(DEMO_NOW).getTime()
  return NAMES.map((name, i) => {
    const n = i + 1
    const programmes = programmesFor(n)
    const unitsCompleted: AdminLearner['unitsCompleted'] = {}
    if (programmes.includes('life-skills')) {
      // Partial progress stays 0..7, so only HC_COMPLETE reach 8.
      unitsCompleted['healthy-communication'] = HC_COMPLETE.has(n) ? 8 : (n * 3) % 8
    }
    if (programmes.includes('hospitality')) {
      unitsCompleted['intro-hospitality'] = HF_COMPLETE.has(n) ? 8 : (n * 5) % 8
    }
    const completed =
      (unitsCompleted['healthy-communication'] ?? 0) + (unitsCompleted['intro-hospitality'] ?? 0)

    // Active: within 5 days 8 hours of DEMO_NOW. Inactive: 8 to 27 days before.
    const ago = INACTIVE.has(n) ? (8 + (n % 20)) * DAY : (n % 6) * DAY + (n % 5) * 2 * HOUR
    const latestActivity = new Date(now - ago).toISOString()

    // Completion needs the check reviewed, so reviewed >= units completed.
    const checksReviewed = completed + (completed < 16 && n % 4 === 0 ? 1 : 0)
    const checksCorrectFirstTry = Math.max(
      0,
      checksReviewed - (n % 3) - (checksReviewed > 6 ? 1 : 0),
    )
    const withHelp = Math.min(completed, n % 3)
    const later = Math.min(completed - withHelp, n % 4)
    const done = Math.max(0, completed - withHelp - later - (n % 2))

    return {
      id: `L-${String(n).padStart(2, '0')}`,
      name,
      programmes,
      unitsCompleted,
      latestActivity,
      checksReviewed,
      checksCorrectFirstTry,
      practice: { done, later, withHelp },
      supportFlag: SUPPORT.has(n),
    }
  })
}
