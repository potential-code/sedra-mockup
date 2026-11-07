import { createFileRoute } from '@tanstack/react-router'
import { WelcomePage } from '@/features/welcome/WelcomePage'

export const Route = createFileRoute('/_public/welcome')({ component: WelcomePage })
