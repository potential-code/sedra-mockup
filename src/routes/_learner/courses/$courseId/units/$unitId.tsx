import { createFileRoute } from '@tanstack/react-router'
import { UnitPage } from '@/features/unit/UnitPage'

export const Route = createFileRoute('/_learner/courses/$courseId/units/$unitId')({
  component: UnitPage,
})
