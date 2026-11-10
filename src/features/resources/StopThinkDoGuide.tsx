import {
  ArrowDown10,
  Brain,
  CircleCheck,
  Eye,
  Hand,
  PersonStanding,
  Sparkles,
  Wind,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ReadAloud } from '@/components/learner/ReadAloud'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import { useResourceText } from '@/store/admin-content'

/*
  Step colours (all measured on the token values; high contrast swaps every fill to black/white):
  Stop  white on sedra-green-800, Think ink on notice-soft (cream) with a brown icon disc,
  Do    white on sedra-green. Text never sits on lime; lime is only a decorative stripe.
*/
const STEPS = [
  {
    key: 'stop',
    n: 1,
    icon: Hand,
    card: 'bg-sedra-green-800 text-white',
    disc: 'bg-white text-sedra-green-800',
    num: 'text-white/15',
  },
  {
    key: 'think',
    n: 2,
    icon: Brain,
    card: 'bg-notice-soft text-ink ring-2 ring-inset ring-sedra-brown/30',
    disc: 'bg-sedra-brown text-white',
    num: 'text-sedra-brown/15',
  },
  {
    key: 'do',
    n: 3,
    icon: CircleCheck,
    card: 'bg-sedra-green text-white',
    disc: 'bg-white text-sedra-green',
    num: 'text-white/15',
  },
] as const

const WAYS = [
  { n: 1, icon: Wind },
  { n: 2, icon: PersonStanding },
  { n: 3, icon: Eye },
  { n: 4, icon: ArrowDown10 },
] as const

/**
 * Stop Think Do guide as HTML (brief §2 Resources). Adapted from the Life Skills lesson plan
 * pp 6, 11 and 12; breathing is one optional choice, never required (brief §3 Emotional safety).
 */
export function StopThinkDoGuide() {
  const { t } = useTranslation('learner')
  const { lang: uiLang } = useLocalized()
  const edited = useResourceText('stopThinkDo', uiLang)
  const heading = edited.title ?? t('resources.guideHeading')
  const intro = edited.body ?? t('resources.guideIntro')
  const whys = [1, 2, 3, 4] as const
  const readText = [
    intro,
    ...STEPS.map(
      (s) =>
        `${s.n}. ${edited.field(s.key) ?? t(`resources.${s.key}`)}. ${edited.field(`${s.key}Body`) ?? t(`resources.${s.key}Body`)}`,
    ),
  ].join(' ')

  return (
    <section aria-labelledby="guide-heading" className="grid grid-cols-1 gap-6">
      <div className="grid grid-cols-1 gap-2">
        <h3 id="guide-heading" className="m-0 text-3xl">
          {heading}
        </h3>
        <p className="m-0 text-lg">{intro}</p>
        <ReadAloud text={readText} what={heading} />
      </div>

      <ol className="m-0 grid list-none grid-cols-1 gap-4 p-0 md:grid-cols-3">
        {STEPS.map(({ key, n, icon: Icon, card, disc, num }) => (
          <li key={key} className="max-w-none">
            <div
              className={cn(
                'relative grid h-full content-start gap-3 overflow-hidden rounded-3xl p-6 shadow-lg',
                card,
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'pointer-events-none absolute -end-2 -top-6 text-[8rem] leading-none font-bold select-none',
                  num,
                )}
              >
                {n}
              </span>
              <span
                aria-hidden="true"
                className={cn(
                  'flex size-16 items-center justify-center rounded-2xl shadow-md',
                  disc,
                )}
              >
                <Icon className="size-9" strokeWidth={2.2} />
              </span>
              <h4 className="m-0 text-3xl font-bold text-current">
                <span className="sr-only">{n}. </span>
                {edited.field(key) ?? t(`resources.${key}`)}
              </h4>
              <p className="m-0 text-lg">
                {edited.field(`${key}Body`) ?? t(`resources.${key}Body`)}
              </p>
              <span aria-hidden="true" className="mt-auto h-1.5 w-12 rounded-full bg-sedra-lime" />
            </div>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-4 rounded-3xl bg-white p-5 shadow-md md:p-7">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h4 className="m-0 text-2xl font-bold text-sedra-green">{t('resources.calmHeading')}</h4>
          <p className="m-0 inline-flex items-center gap-2 rounded-full bg-success-soft px-4 py-1.5 text-base font-semibold text-success">
            <Sparkles aria-hidden="true" className="size-5" />
            {t('resources.calmIntro')}
          </p>
        </div>
        <ul className="m-0 grid list-none grid-cols-1 gap-3 p-0 sm:grid-cols-2 lg:grid-cols-4">
          {WAYS.map(({ n, icon: Icon }) => (
            <li
              key={n}
              className="grid content-start gap-2 rounded-2xl border-2 border-sedra-pale-100 bg-sedra-pale-50 p-4"
            >
              <span
                aria-hidden="true"
                className="flex size-12 shrink-0 items-center justify-center rounded-full bg-white text-sedra-green shadow-sm"
              >
                <Icon className="size-6" />
              </span>
              <div className="grid min-w-0 gap-1">
                <p className="m-0 font-bold text-ink">{t(`resources.t${n}`)}</p>
                <p className="m-0 text-base text-ink-soft">{t(`resources.b${n}`)}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="grid grid-cols-1 gap-3">
        <h4 className="m-0 text-2xl font-bold text-sedra-green">{t('resources.whyHeading')}</h4>
        <ul className="m-0 flex list-none flex-wrap gap-2 p-0">
          {whys.map((w) => (
            <li
              key={w}
              className="inline-flex max-w-full items-center gap-2 rounded-full bg-white px-4 py-2 font-semibold text-ink shadow-sm"
            >
              <CircleCheck aria-hidden="true" className="size-5 shrink-0 text-sedra-green" />
              {t(`resources.why${w}`)}
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
