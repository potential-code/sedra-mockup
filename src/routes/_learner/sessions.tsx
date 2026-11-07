import { createFileRoute } from '@tanstack/react-router'
import { SessionsPage } from '@/features/sessions/SessionsPage'

export const Route = createFileRoute('/_learner/sessions')({ component: SessionsPage })
