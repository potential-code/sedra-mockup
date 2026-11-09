import { createFileRoute } from '@tanstack/react-router'
import { CourseBuilderPage } from '@/features/admin/CourseBuilderPage'

export const Route = createFileRoute('/_admin/admin/courses/$courseId')({
  component: CourseBuilderPage,
})
