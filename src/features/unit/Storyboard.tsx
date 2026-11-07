import type { Unit } from '@shared/types'
import { CheckCircle2 } from 'lucide-react'
import { forwardRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
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
 * (brief §4). The heading is focusable so "Read lesson" actions can move focus here.
 */
export const Storyboard = forwardRef<HTMLHeadingElement, Props>(function Storyboard(
  { unit, done, onDone, showImage = true },
  headingRef,
) {
  const { t } = useTranslation('unit')
  const { l } = useLocalized()

  return (
    <section aria-labelledby={`${unit.id}-read`} className="flex flex-col gap-4">
      <h3 id={`${unit.id}-read`} ref={headingRef} tabIndex={-1} className="m-0 text-xl">
        {t('read.title')}
      </h3>
      {showImage && (
        <UnitImage src={unit.image} alt={l(unit.imageAlt)} className="rounded-2xl border" />
      )}
      <ol className="m-0 flex list-none flex-col gap-3 p-0">
        {unit.scenes.map((s, i) => (
          <li key={s.time} className="max-w-none rounded-2xl border bg-white p-4">
            <h4 className="m-0 text-lg font-bold text-ink">
              {t('read.scene', { n: i + 1 })}{' '}
              <span className="font-normal text-ink-soft">
                (<span className="ltr-isolate">{s.time}</span>)
              </span>
            </h4>
            <dl className="m-0 mt-2 grid gap-2">
              <div>
                <dt className="text-base font-semibold text-ink-soft">{t('read.narration')}</dt>
                <dd className="m-0">{l(s.narration)}</dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-ink-soft">{t('read.onScreen')}</dt>
                <dd className="m-0">{l(s.onScreen)}</dd>
              </div>
              <div>
                <dt className="text-base font-semibold text-ink-soft">{t('read.visual')}</dt>
                <dd className="m-0">{l(s.visual)}</dd>
              </div>
            </dl>
          </li>
        ))}
      </ol>
      {done ? (
        <p className="m-0 flex items-center gap-2 font-semibold text-success">
          <CheckCircle2 aria-hidden="true" className="size-5" />
          {t('read.doneStatus')}
        </p>
      ) : (
        <Button type="button" variant="outline" className="self-start" onClick={onDone}>
          <CheckCircle2 aria-hidden="true" />
          {t('read.markRead')}
        </Button>
      )}
    </section>
  )
})
