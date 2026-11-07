import { createFileRoute } from '@tanstack/react-router'
import { PreferencesPage } from '@/features/preferences/PreferencesPage'

export const Route = createFileRoute('/_learner/preferences')({ component: PreferencesPage })
