import type { LifeSkillsUnitId } from '@shared/types'
import { BookmarkCheck, Hand, HandHeart, Heart, type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

export const BADGE_UNITS: LifeSkillsUnitId[] = ['LS02', 'LS04', 'LS06', 'LS08']

/** One picture per Life Skills milestone (brief §5 badge names). */
export const BADGE_ICONS: Partial<Record<LifeSkillsUnitId, LucideIcon>> = {
  LS02: Hand,
  LS04: Heart,
  LS06: HandHeart,
  LS08: BookmarkCheck,
}

const SCALLOPS = Array.from({ length: 18 }, (_, i) => {
  const a = (i / 18) * Math.PI * 2
  return { cx: 50 + Math.cos(a) * 38, cy: 46 + Math.sin(a) * 38 }
})

/**
 * Static badge medallion (brief §2, §5: no animation, no sound). Purely visual: the badge name
 * and earned / not-yet text must sit next to it as text. Not yet = dashed outline only.
 */
export function BadgeMedallion({
  unitId,
  earned,
  size = 'lg',
  className,
}: {
  unitId: LifeSkillsUnitId
  earned: boolean
  size?: 'sm' | 'lg'
  className?: string
}) {
  const Icon = BADGE_ICONS[unitId] ?? Hand
  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative aspect-square w-full',
        size === 'lg' ? 'max-w-32' : 'max-w-20',
        className,
      )}
    >
      <svg aria-hidden="true" viewBox="0 0 100 100" className="absolute inset-0 size-full">
        {earned ? (
          <>
            {/* ribbon tails */}
            <path d="M34 70 L26 98 L38 91 L44 100 L50 74 Z" className="fill-sedra-mid" />
            <path d="M66 70 L74 98 L62 91 L56 100 L50 74 Z" className="fill-sedra-green-800" />
            {SCALLOPS.map((s) => (
              <circle
                key={`${s.cx}-${s.cy}`}
                cx={s.cx}
                cy={s.cy}
                r="8"
                className="fill-sedra-pale"
              />
            ))}
            <circle cx="50" cy="46" r="38" className="fill-sedra-pale" />
            <circle cx="50" cy="46" r="31" className="fill-sedra-green" />
            <circle
              cx="50"
              cy="46"
              r="27"
              fill="none"
              strokeWidth="1.5"
              strokeDasharray="2 3"
              className="stroke-white/60"
            />
          </>
        ) : (
          <>
            <circle cx="50" cy="46" r="40" className="fill-white" />
            <circle
              cx="50"
              cy="46"
              r="40"
              fill="none"
              strokeWidth="2.5"
              strokeDasharray="6 5"
              className="stroke-ink-soft"
            />
            <circle cx="50" cy="46" r="30" className="fill-sedra-pale-50" />
          </>
        )}
      </svg>
      <Icon
        strokeWidth={1.75}
        className={cn(
          'absolute start-1/2 top-[46%] -translate-y-1/2 ltr:-translate-x-1/2 rtl:translate-x-1/2',
          'size-[38%]',
          earned ? 'text-white' : 'text-ink-soft',
        )}
      />
    </div>
  )
}
