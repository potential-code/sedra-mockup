import { createFileRoute } from '@tanstack/react-router'
import { AchievementsPage } from '@/features/achievements/AchievementsPage'

export const Route = createFileRoute('/_learner/achievements')({ component: AchievementsPage })
