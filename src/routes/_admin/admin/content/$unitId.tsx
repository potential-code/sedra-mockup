import { createFileRoute } from '@tanstack/react-router'
import { ContentEditPage } from '@/features/admin/ContentEditPage'

export const Route = createFileRoute('/_admin/admin/content/$unitId')({
  component: ContentEditPage,
})
