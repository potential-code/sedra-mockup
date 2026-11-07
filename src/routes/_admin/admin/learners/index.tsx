import { createFileRoute } from '@tanstack/react-router'
import { LearnersPage } from '@/features/admin/LearnersPage'

export const Route = createFileRoute('/_admin/admin/learners/')({ component: LearnersPage })
