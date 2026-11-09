import type { Unit } from '@shared/types'
import { Clock, Eye, MessageSquareQuote, MonitorSmartphone } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { useLocalized } from '@/i18n'
import { DoneControl } from './DoneControl'
import { UnitImage } from './UnitImage'

interface Props {
  unit: Unit
  done: boolean
  onDone: () => void
  /** Hide the image when the pending panel above already shows it. */
  showImage?: boolean
}

/**
 * "Read lesson": the complete storyboard (four 7.5 s scenes) as an equal learning route
 * (brief §4), drawn as a numbered timeline of scene cards. The heading is focusable so
 * "Read lesson" actions can move focus here.
 */
export const Storyboard = forwardRef<HTMLHeadingElement, Props>(function Storyboard(
  { unit, done, onDone, showImage = true },
  headingRef,
) {
  const { t } = useTranslation('unit')
  const { l, lang } = useLocalized()

  return (
    <section aria-labelledby={`${unit.id}-read`} className="flex flex-col gap-4">
      <h3 id={`${unit.id}-read`} ref={headingRef} tabIndex={-1} className="m-0 text-2xl">
        {t('read.title')}
      </h3>
      {showImage && (
        <UnitImage
          src={unit.image}
          alt={l(unit.imageAlt)}
          className="aspect-[16/9] rounded-2xl shadow-sm"
        />
      )}
      <ol className="m-0 flex list-none flex-col gap-4 p-0">
        {unit.scenes.map((s, i) => (
          <li key={s.time} className="relative flex max-w-none gap-3">
            {/* Timeline node + connector (decorative; the heading says "Scene n"). */}
            <div aria-hidden="true" className="flex shrink-0 flex-col items-center">
              <span className="flex size-10 items-center justify-center rounded-full bg-sedra-green text-lg font-bold text-white shadow-md">
                {i + 1}
              </span>
              {i < unit.scenes.length - 1 && (
                <span className="-mb-4 mt-1 w-1 flex-1 rounded-full bg-sedra-pale" />
              )}
            </div>
            <article className="min-w-0 flex-1 rounded-2xl border bg-white p-4 shadow-sm">
              <h4 className="m-0 flex flex-wrap items-center gap-x-3 gap-y-1 text-lg font-bold text-ink">
                {t('read.scene', { n: i + 1 })}
                <span className="inline-flex items-center gap-1 rounded-full bg-sedra-pale-50 px-2.5 py-0.5 text-base font-semibold text-ink-soft ring-1 ring-border">
                  <Clock aria-hidden="true" className="size-4" />
                  <span className="ltr-isolate">
                    {lang === 'ar' ? s.time.replace(/ s$/, ' ث') : s.time}
                  </span>
                </span>
              </h4>
              <dl className="m-0 mt-3 grid gap-3">
                <div>
                  <dt className="flex items-center gap-2.5 text-base font-semibold text-ink-soft">
                    <MessageSquareQuote
                      aria-hidden="true"
                      className="size-5 shrink-0 text-sedra-green"
                    />
                    {t('read.narration')}
                  </dt>
                  <dd className="ms-[1.875rem] m-0 text-lg font-medium">{l(s.narration)}</dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2.5 text-base font-semibold text-ink-soft">
                    <MonitorSmartphone
                      aria-hidden="true"
                      className="size-5 shrink-0 text-sedra-green"
                    />
                    {t('read.onScreen')}
                  </dt>
                  <dd className="ms-[1.875rem] m-0 mt-1 inline-block rounded-lg bg-sedra-pale-100 px-2.5 py-1 font-semibold">
                    {l(s.onScreen)}
                  </dd>
                </div>
                <div>
                  <dt className="flex items-center gap-2.5 text-base font-semibold text-ink-soft">
                    <Eye aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
                    {t('read.visual')}
                  </dt>
                  <dd className="ms-[1.875rem] m-0">{l(s.visual)}</dd>
                </div>
              </dl>
            </article>
          </li>
        ))}
      </ol>
      <DoneControl
        done={done}
        onDone={onDone}
        doneText={t('read.doneStatus')}
        actionText={t('read.markRead')}
      />
    </section>
  )
})
