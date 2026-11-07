import { createFileRoute, redirect } from '@tanstack/react-router'
import { AdminShell } from '@/components/layout/AdminShell'
import { getDb } from '@/store/db'

export const Route = createFileRoute('/_admin')({
  beforeLoad: () => {
    if (getDb().session.personaId !== 'admin') throw redirect({ to: '/welcome' })
  },
  component: AdminShell,
})
