import { createFileRoute } from '@tanstack/react-router'
import { FuturePage } from '@/features/admin/FuturePage'

export const Route = createFileRoute('/_admin/admin/future')({ component: FuturePage })
