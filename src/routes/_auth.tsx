import { createFileRoute } from '@tanstack/react-router'
import { AuthShell } from '@/components/layout/AuthShell'

export const Route = createFileRoute('/_auth')({ component: AuthShell })
