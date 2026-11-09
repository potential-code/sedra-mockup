import type { Invitation, Lang, ProgrammeId } from '@shared/types'
import { getDb, type LearnerPersonaId, update, useDb } from './db'

/**
 * Learner invitations (brief §2 'learner invitation entry'; §1 invitations are simulated).
 * Nothing is emailed: admin gets an 'Open invitation link (demo)' instead. Accepting an
 * invitation signs in the demo 'new-learner' account with the invited name and the programmes
 * SEDRA chose, starting from a clean state.
 */
export function createInvitation(input: {
  name: string
  email: string
  lang: Lang
  programmes: ProgrammeId[]
}): Invitation {
  const inv: Invitation = {
    id: `inv-${Date.now().toString(36)}`,
    name: input.name.trim(),
    email: input.email.trim(),
    lang: input.lang,
    programmes: input.programmes,
    status: 'pending',
    createdAt: new Date().toISOString(),
  }
  update((db) => ({ ...db, invitations: [inv, ...db.invitations] }))
  return inv
}

export function getInvitation(id: string): Invitation | undefined {
  return getDb().invitations.find((i) => i.id === id)
}

export function useInvitations(): Invitation[] {
  return useDb((db) => db.invitations)
}

/** Accept: mark accepted, reset the demo new-learner account for this person, sign in. */
export function acceptInvitation(id: string): boolean {
  const inv = getInvitation(id)
  if (!inv) return false
  const now = new Date().toISOString()
  update((db) => ({
    ...db,
    session: { personaId: 'new-learner' },
    prefs: { ...db.prefs, lang: inv.lang },
    invitations: db.invitations.map((i) =>
      i.id === id ? { ...i, status: 'accepted', acceptedAt: now } : i,
    ),
    learners: {
      ...db.learners,
      'new-learner': {
        onboarded: false,
        enrolled: inv.programmes,
        displayName: inv.name,
        invitationId: inv.id,
        progress: {},
      },
    },
  }))
  return true
}

/** Admin enrolment change for a demo learner account (Noor or the invited/new learner). */
export function setEnrolment(learner: LearnerPersonaId, programmes: ProgrammeId[]) {
  update((db) => ({
    ...db,
    learners: { ...db.learners, [learner]: { ...db.learners[learner], enrolled: programmes } },
  }))
}
