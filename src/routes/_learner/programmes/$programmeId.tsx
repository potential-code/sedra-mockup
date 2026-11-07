import { createFileRoute } from '@tanstack/react-router'
import { ProgrammePage } from '@/features/programme/ProgrammePage'

export const Route = createFileRoute('/_learner/programmes/$programmeId')({
  component: ProgrammePage,
})
