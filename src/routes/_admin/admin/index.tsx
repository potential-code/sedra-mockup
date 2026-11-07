import { createFileRoute } from '@tanstack/react-router'
import { OverviewPage } from '@/features/admin/OverviewPage'

export const Route = createFileRoute('/_admin/admin/')({ component: OverviewPage })
