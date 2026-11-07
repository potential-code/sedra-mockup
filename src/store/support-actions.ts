import type { SupportRequest } from '@shared/types'
import { getDb, update, useDb } from './db'

/**
 * Help page support requests (brief §2 Help, §1: support notifications are simulated).
 * Saved in the local demo db only; nothing is sent.
 */
export function addSupportRequest(topic: SupportRequest['topic'], message: string): SupportRequest {
  const req: SupportRequest = {
    id: `sr-${Date.now().toString(36)}`,
    topic,
    message: message.trim(),
    createdAt: new Date().toISOString(),
    status: 'open',
    learnerId: getDb().session.personaId ?? undefined,
  }
  update((db) => ({ ...db, supportRequests: [...db.supportRequests, req] }))
  return req
}

/** All support requests in the demo db (stable reference from the store). */
export function useSupportRequests(): SupportRequest[] {
  return useDb((db) => db.supportRequests)
}
