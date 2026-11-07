import { createFileRoute } from '@tanstack/react-router'
import { ResourcesAdminPage } from '@/features/admin/ResourcesAdminPage'

export const Route = createFileRoute('/_admin/admin/resources')({ component: ResourcesAdminPage })
