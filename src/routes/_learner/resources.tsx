import { createFileRoute } from '@tanstack/react-router'
import { ResourcesPage } from '@/features/resources/ResourcesPage'

export const Route = createFileRoute('/_learner/resources')({ component: ResourcesPage })
