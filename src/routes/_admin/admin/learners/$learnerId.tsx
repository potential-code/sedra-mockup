import { createFileRoute } from '@tanstack/react-router'
import { LearnerDetailPage } from '@/features/admin/LearnerDetailPage'

export const Route = createFileRoute('/_admin/admin/learners/$learnerId')({
  component: LearnerDetailPage,
})
