import { createFileRoute, redirect } from '@tanstack/react-router'
import { LearnerShell } from '@/components/layout/LearnerShell'
import { getDb } from '@/store/db'

export const Route = createFileRoute('/_learner')({
  beforeLoad: () => {
    const id = getDb().session.personaId
    if (id !== 'new-learner' && id !== 'noor') throw redirect({ to: '/welcome' })
  },
  component: LearnerShell,
})
