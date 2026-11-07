import { Brain, CircleCheck, Hand } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { ReadAloud } from '@/components/learner/ReadAloud'

/**
 * Stop Think Do guide as HTML (brief §2 Resources). Adapted from the Life Skills lesson plan
 * pp 6, 11 and 12; breathing is one optional choice, never required (brief §3 Emotional safety).
 */
export function StopThinkDoGuide() {
  const { t } = useTranslation('learner')
  const steps = [
    { key: 'stop', n: 1, icon: Hand },
    { key: 'think', n: 2, icon: Brain },
    { key: 'do', n: 3, icon: CircleCheck },
  ] as const
  const rows = [1, 2, 3, 4] as const
  const whys = [1, 2, 3, 4] as const
  const readText = [
    t('resources.guideIntro'),
    ...steps.map((s) => `${s.n}. ${t(`resources.${s.key}`)}. ${t(`resources.${s.key}Body`)}`),
  ].join(' ')

  return (
    <section
      aria-labelledby="guide-heading"
      className="grid grid-cols-1 gap-5 rounded-2xl border bg-white p-5 shadow-sm md:p-6"
    >
      <div className="grid grid-cols-1 gap-2">
        <h2 id="guide-heading" className="m-0 text-2xl">
          {t('resources.guideHeading')}
        </h2>
        <p className="m-0">{t('resources.guideIntro')}</p>
        <ReadAloud text={readText} what={t('resources.guideHeading')} />
      </div>

      <ol className="m-0 grid list-none gap-3 p-0 md:grid-cols-3">
        {steps.map(({ key, n, icon: Icon }) => (
          <li
            key={key}
            className="grid grid-cols-1 content-start gap-2 rounded-xl bg-sedra-pale-50 p-4"
          >
            <h3 className="m-0 flex items-center gap-2 text-xl">
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-full bg-sedra-green text-white"
              >
                {n}
              </span>
              <Icon aria-hidden="true" className="size-6" />
              <span>
                <span className="sr-only">{n}. </span>
                {t(`resources.${key}`)}
              </span>
            </h3>
            <p className="m-0">{t(`resources.${key}Body`)}</p>
          </li>
        ))}
      </ol>

      <div className="grid grid-cols-1 gap-2">
        <h3 className="m-0 text-xl">{t('resources.calmHeading')}</h3>
        <p className="m-0">{t('resources.calmIntro')}</p>
        <div className="overflow-x-auto">
          <table className="w-full table-fixed border-collapse break-words text-start">
            <thead>
              <tr>
                <th scope="col" className="border-b-2 border-sedra-green p-3 text-start text-ink">
                  {t('resources.technique')}
                </th>
                <th scope="col" className="border-b-2 border-sedra-green p-3 text-start text-ink">
                  {t('resources.benefit')}
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r} className="border-b">
                  <th scope="row" className="p-3 text-start align-top font-semibold">
                    {t(`resources.t${r}`)}
                  </th>
                  <td className="p-3 align-top">{t(`resources.b${r}`)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-2">
        <h3 className="m-0 text-xl">{t('resources.whyHeading')}</h3>
        <ul className="m-0 grid list-disc gap-1 ps-6">
          {whys.map((w) => (
            <li key={w}>{t(`resources.why${w}`)}</li>
          ))}
        </ul>
      </div>
    </section>
  )
}
