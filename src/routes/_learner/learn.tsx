import { createFileRoute } from '@tanstack/react-router'
import { DashboardPage } from '@/features/learn/DashboardPage'

export const Route = createFileRoute('/_learner/learn')({ component: DashboardPage })
