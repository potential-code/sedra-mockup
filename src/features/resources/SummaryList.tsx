import type { ProgrammeId, Unit } from '@shared/types'
import { Link } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'
import { Fragment, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { courseUnits, unitLinkParams } from '@/components/learner/learning'
import { useLocalized } from '@/i18n'
import { asset } from '@/lib/asset'

/** Units of a programme whose title or summary contains the (lower-cased) query. */
export function useMatchingUnits(programmeId: ProgrammeId, q: string): Unit[] {
  const { l } = useLocalized()
  return courseUnits(programmeId).filter(
    (u) => !q || `${l(u.title)} ${l(u.summary)}`.toLocaleLowerCase().includes(q),
  )
}

/** Marks the search word inside text (visual help only; the text reads the same). */
function Highlight({ text, q }: { text: string; q: string }): ReactNode {
  if (!q) return text
  const lower = text.toLocaleLowerCase()
  const out: ReactNode[] = []
  let from = 0
  let at = lower.indexOf(q, from)
  while (at !== -1) {
    out.push(text.slice(from, at))
    out.push(
      <mark key={at} className="rounded bg-sedra-pale px-0.5 text-ink">
        {text.slice(at, at + q.length)}
      </mark>,
    )
    from = at + q.length
    at = lower.indexOf(q, from)
  }
  out.push(text.slice(from))
  return out.map((n, i) => <Fragment key={typeof n === 'string' ? `t${i}` : `m${i}`}>{n}</Fragment>)
}

/** Big search field for the summaries (brief §2 Resources: searchable HTML summaries). */
export function SummarySearch({
  id,
  query,
  onChange,
  count,
}: {
  id: string
  query: string
  onChange: (v: string) => void
  count: number
}) {
  const { t } = useTranslation('learner')
  return (
    <div className="grid w-full max-w-2xl gap-2">
      <label htmlFor={`${id}-q`} className="text-lg font-bold text-sedra-green">
        {t('resources.search')}
      </label>
      <p id={`${id}-hint`} className="m-0 text-base text-ink-soft">
        {t('resources.searchHint')}
      </p>
      <div className="relative">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute start-2 top-1/2 flex size-10 -translate-y-1/2 items-center justify-center rounded-xl bg-sedra-green text-white"
        >
          <Search className="size-5" />
        </span>
        <input
          id={`${id}-q`}
          type="search"
          aria-describedby={`${id}-hint ${id}-count`}
          value={query}
          onChange={(e) => onChange(e.target.value)}
          className="min-h-14 w-full rounded-2xl border-2 border-input bg-white py-2 ps-15 pe-4 text-lg text-ink shadow-md transition-shadow focus-visible:border-ink focus-visible:shadow-lg"
        />
      </div>
      <p id={`${id}-count`} className="m-0 text-base font-semibold text-ink" aria-live="polite">
        {count === 0 ? t('resources.noResults') : t('resources.results', { count })}
      </p>
    </div>
  )
}

/** Summary cards for one course, with unit thumbnails (summaries = text alternatives). */
export function SummaryGrid({
  programmeId,
  q,
  headingId,
}: {
  programmeId: ProgrammeId
  q: string
  headingId: string
}) {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const units = useMatchingUnits(programmeId, q)
  return (
    <section aria-labelledby={headingId} className="grid grid-cols-1 gap-4">
      <h3 id={headingId} className="m-0 text-2xl">
        {t('resources.summariesHeading')}
      </h3>
      {units.length === 0 ? <p className="m-0">{t('resources.noResults')}</p> : null}
      <ul className="m-0 grid list-none grid-cols-1 gap-5 p-0 sm:grid-cols-2 xl:grid-cols-3">
        {units.map((u) => (
          <li key={u.id} className="max-w-none">
            <article className="card-pop grid h-full grid-rows-[auto_1fr] overflow-hidden">
              <div className="relative aspect-[16/9] overflow-hidden bg-sedra-pale-100">
                <img
                  src={asset(`images/units/${u.id}.webp`)}
                  alt=""
                  width={1200}
                  height={896}
                  className="size-full object-cover"
                />
                <span
                  aria-hidden="true"
                  className="absolute start-3 top-3 rounded-full bg-white px-3 py-1 text-base font-bold text-sedra-green shadow-md"
                >
                  {t('shared.unitOf', { n: u.order, total: 8 })}
                </span>
              </div>
              <div className="grid content-start gap-2 p-5">
                <h4 className="m-0 text-lg font-bold text-sedra-green">
                  <span className="sr-only">{t('shared.unitOf', { n: u.order, total: 8 })}: </span>
                  <Highlight text={l(u.title)} q={q} />
                </h4>
                <p className="m-0 text-base">
                  <Highlight text={l(u.summary)} q={q} />
                </p>
                <Link
                  to="/courses/$courseId/units/$unitId"
                  params={unitLinkParams(u)}
                  className="mt-1 inline-flex min-h-12 items-center gap-2 justify-self-start rounded-xl px-1 font-semibold text-sedra-green underline underline-offset-4 hover:no-underline"
                >
                  {t('shared.openUnit')}
                  <span className="sr-only">: {l(u.title)}</span>
                  <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
                </Link>
              </div>
            </article>
          </li>
        ))}
      </ul>
    </section>
  )
}
