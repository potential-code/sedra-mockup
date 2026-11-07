import { useTranslation } from 'react-i18next'
import { useUaeFormat } from '@/components/admin/format'
import type { AdminMetrics } from '@/store/admin-actions'

/**
 * Unique-learner breakdown: one bar of 40 people split into Life Skills only, both, and
 * Hospitality only, with bracket lines for each programme total (30 and 24). The drawing is
 * decorative (aria-hidden); the legend and sentence below carry every number as text, and each
 * segment also differs by pattern, not colour alone (brief §3).
 */
export function EnrolmentChart({ m, compact }: { m: AdminMetrics; compact?: boolean }) {
  const { t } = useTranslation('admin')
  const f = useUaeFormat()
  const total = m.enrolled || 1
  const lsOnly = m.lifeSkills - m.both
  const hfOnly = m.hospitality - m.both
  const pct = (n: number) => `${(n / total) * 100}%`

  const legend = [
    { key: 'lsOnly', n: lsOnly, swatch: 'bg-sedra-green' },
    { key: 'both', n: m.both, swatch: 'stripes' },
    { key: 'hfOnly', n: hfOnly, swatch: 'bg-sedra-brown' },
  ] as const

  return (
    <div className="flex flex-col gap-4">
      <div aria-hidden="true" className="relative pt-9 pb-9">
        {/* Life Skills bracket (top) */}
        <div
          className="absolute top-0 start-0 flex flex-col"
          style={{ inlineSize: pct(m.lifeSkills) }}
        >
          <span className="text-sm font-bold text-sedra-green">
            {t('programme.life-skills')} {f.number(m.lifeSkills)}
          </span>
          <span className="mt-1 h-1.5 rounded-full bg-sedra-green" />
        </div>
        <div className="flex h-9 w-full overflow-hidden rounded-xl ring-1 ring-border">
          <span className="block h-full bg-sedra-green" style={{ inlineSize: pct(lsOnly) }} />
          <span
            className="block h-full border-x-2 border-white bg-sedra-mid"
            style={{
              inlineSize: pct(m.both),
              backgroundImage:
                'repeating-linear-gradient(45deg, rgb(255 255 255 / .45) 0 6px, transparent 6px 12px)',
            }}
          />
          <span className="block h-full bg-sedra-brown" style={{ inlineSize: pct(hfOnly) }} />
        </div>
        {/* Hospitality bracket (bottom) */}
        <div
          className="absolute bottom-0 flex flex-col items-end"
          style={{ insetInlineStart: pct(lsOnly), inlineSize: pct(m.hospitality) }}
        >
          <span className="mb-1 h-1.5 w-full rounded-full bg-sedra-brown" />
          <span className="text-sm font-bold text-[#5f5233]">
            {t('programme.hospitality')} {f.number(m.hospitality)}
          </span>
        </div>
      </div>

      <ul className={`m-0 grid list-none gap-2 p-0 ${compact ? '' : 'sm:grid-cols-3'}`}>
        {legend.map((l) => (
          <li
            key={l.key}
            className="flex max-w-none items-center gap-3 rounded-xl bg-sedra-pale-50 px-3 py-2"
          >
            <span
              aria-hidden="true"
              className={`size-5 shrink-0 rounded-md ${l.swatch === 'stripes' ? 'bg-sedra-mid' : l.swatch}`}
              style={
                l.swatch === 'stripes'
                  ? {
                      backgroundImage:
                        'repeating-linear-gradient(45deg, rgb(255 255 255 / .55) 0 3px, transparent 3px 6px)',
                    }
                  : undefined
              }
            />
            <span className="shrink-0 text-2xl font-bold whitespace-nowrap text-ink tabular-nums">
              {f.number(l.n)}
            </span>
            <span className="text-sm leading-snug text-ink">
              {t(`overview.breakdown.${l.key}`)}
            </span>
          </li>
        ))}
      </ul>

      <p className="m-0 rounded-xl border border-dashed border-sedra-green/40 px-3 py-2">
        <span className="ltr-isolate block w-fit font-bold text-sedra-green">
          {t('overview.breakdownFormula', {
            ls: m.lifeSkills,
            hf: m.hospitality,
            both: m.both,
            total: m.lifeSkills + m.hospitality - m.both,
          })}
        </span>
        <span className="text-ink">
          {t('overview.breakdownText', {
            ls: m.lifeSkills,
            hf: m.hospitality,
            both: m.both,
            total: m.enrolled,
          })}
        </span>
      </p>
    </div>
  )
}
