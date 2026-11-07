import { createFileRoute } from '@tanstack/react-router'
import { SessionsAdminPage } from '@/features/admin/SessionsAdminPage'

export const Route = createFileRoute('/_admin/admin/sessions')({ component: SessionsAdminPage })
