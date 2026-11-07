import { createFileRoute } from '@tanstack/react-router'
import { ContentPage } from '@/features/admin/ContentPage'

export const Route = createFileRoute('/_admin/admin/content/')({ component: ContentPage })
