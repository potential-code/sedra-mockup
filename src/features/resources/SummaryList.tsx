import { Link } from '@tanstack/react-router'
import { ArrowRight, Search } from 'lucide-react'
import { useDeferredValue, useId, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  courseUnits,
  PROGRAMME_LABEL_KEY,
  PROGRAMMES,
  unitLinkParams,
} from '@/components/learner/learning'
import { useLocalized } from '@/i18n'

/** Searchable HTML summaries of every unit (brief §2 Resources; summaries = text alternatives). */
export function SummaryList() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const id = useId()
  const [query, setQuery] = useState('')
  const q = useDeferredValue(query).trim().toLocaleLowerCase()

  const groups = PROGRAMMES.map((p) => ({
    p,
    units: courseUnits(p).filter(
      (u) => !q || `${l(u.title)} ${l(u.summary)}`.toLocaleLowerCase().includes(q),
    ),
  }))
  const count = groups.reduce((n, g) => n + g.units.length, 0)

  return (
    <section aria-labelledby={`${id}-h`} className="grid grid-cols-1 gap-4">
      <h2 id={`${id}-h`} className="m-0 text-2xl">
        {t('resources.summariesHeading')}
      </h2>
      <div className="grid max-w-xl gap-2">
        <label htmlFor={`${id}-q`} className="font-semibold">
          {t('resources.search')}
        </label>
        <p id={`${id}-hint`} className="m-0 text-base text-ink-soft">
          {t('resources.searchHint')}
        </p>
        <div className="relative">
          <Search
            aria-hidden="true"
            className="pointer-events-none absolute start-3 top-1/2 size-5 -translate-y-1/2 text-ink-soft"
          />
          <input
            id={`${id}-q`}
            type="search"
            aria-describedby={`${id}-hint ${id}-count`}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="min-h-12 w-full rounded-xl border-2 border-input bg-white py-2 ps-11 pe-4 text-lg text-ink focus-visible:border-ink"
          />
        </div>
        <p id={`${id}-count`} className="m-0 text-base" aria-live="polite">
          {count === 0 ? t('resources.noResults') : t('resources.results', { count })}
        </p>
      </div>
      {groups.map(({ p, units }) =>
        units.length ? (
          <div key={p} className="grid grid-cols-1 gap-3">
            <h3 className="m-0 text-xl">{t(`common:${PROGRAMME_LABEL_KEY[p]}`)}</h3>
            <ul className="m-0 grid list-none gap-3 p-0 lg:grid-cols-2">
              {units.map((u) => (
                <li key={u.id}>
                  <article className="grid grid-cols-1 gap-2 rounded-xl border bg-white p-4">
                    <h4 className="m-0 text-lg font-bold text-sedra-green">
                      {t('shared.unitOf', { n: u.order, total: 8 })}: {l(u.title)}
                    </h4>
                    <p className="m-0">{l(u.summary)}</p>
                    <Link
                      to="/courses/$courseId/units/$unitId"
                      params={unitLinkParams(u)}
                      className="inline-flex min-h-12 items-center gap-2 justify-self-start font-semibold text-sedra-green underline"
                    >
                      {t('shared.openUnit')}
                      <span className="sr-only">: {l(u.title)}</span>
                      <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
                    </Link>
                  </article>
                </li>
              ))}
            </ul>
          </div>
        ) : null,
      )}
    </section>
  )
}
