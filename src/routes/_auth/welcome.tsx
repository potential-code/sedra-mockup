import { createFileRoute } from '@tanstack/react-router'
import { WelcomePage } from '@/features/welcome/WelcomePage'

/** `invite`: learner invitation id from the (demo) invitation link, e.g. /welcome?invite=inv-1. */
export interface WelcomeSearch {
  invite?: string
}

export const Route = createFileRoute('/_auth/welcome')({
  validateSearch: (search: Record<string, unknown>): WelcomeSearch => ({
    invite: typeof search.invite === 'string' && search.invite ? search.invite : undefined,
  }),
  component: WelcomePage,
})
