import { createFileRoute } from '@tanstack/react-router'
import { ReportsPage } from '@/features/admin/ReportsPage'

export const Route = createFileRoute('/_admin/admin/reports')({ component: ReportsPage })
