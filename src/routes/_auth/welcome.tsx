import { createFileRoute } from '@tanstack/react-router'
import { WelcomePage } from '@/features/welcome/WelcomePage'

export const Route = createFileRoute('/_auth/welcome')({ component: WelcomePage })
