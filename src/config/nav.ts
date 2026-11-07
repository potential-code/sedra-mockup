import { BookOpen, CircleHelp, House, Video } from 'lucide-react'

/** Learner bottom navigation (brief §3): Home, Learn, Sessions, Help, each icon + text. */
export const LEARNER_NAV = [
  { key: 'home', to: '/learn', icon: House },
  { key: 'learn', to: '/programmes/$programmeId', icon: BookOpen },
  { key: 'sessions', to: '/sessions', icon: Video },
  { key: 'help', to: '/help', icon: CircleHelp },
] as const
