import { createFileRoute } from '@tanstack/react-router'
import { HelpPage } from '@/features/help/HelpPage'

export const Route = createFileRoute('/_learner/help')({ component: HelpPage })
