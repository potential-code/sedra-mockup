import { Link } from '@tanstack/react-router'
import { ArrowRight, MessageCircle, PauseCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getUnit } from '@/content'
import { PLAYBOOK_MESSAGE_KEYS } from '@/features/unit/PracticePanel'
import { useLocalized } from '@/i18n'
import { useLearner } from '@/store/actions'

/**
 * Visual "My communication playbook" card (brief §2 Resources, LS08). Shows the learner's saved
 * pause and help message: playbook.pause indexes LS08 practice.choices; playbook.message
 * indexes PLAYBOOK_MESSAGE_KEYS (unit:playbook.message.*), same as the LS08 practice panel.
 */
export function PlaybookCard() {
  const { t } = useTranslation('learner')
  const { l } = useLocalized()
  const learner = useLearner()
  const ls08 = getUnit('LS08')
  const choices = ls08?.practice.choices ?? []
  const pb = learner?.playbook
  const pauseChoice = pb?.pause !== undefined ? choices[pb.pause] : undefined
  const pause = pauseChoice ? l(pauseChoice) : undefined
  const messageKey = pb?.message !== undefined ? PLAYBOOK_MESSAGE_KEYS[pb.message] : undefined
  const message = messageKey ? t(`unit:playbook.message.${messageKey}`) : undefined

  const cards = [
    { key: 'pause', icon: PauseCircle, title: t('resources.myPause'), value: pause },
    { key: 'message', icon: MessageCircle, title: t('resources.myMessage'), value: message },
  ]

  return (
    <section
      aria-labelledby="playbook-heading"
      className="grid grid-cols-1 gap-4 rounded-2xl bg-sedra-pale-50 p-5 md:p-6"
    >
      <div className="grid grid-cols-1 gap-1">
        <h2 id="playbook-heading" className="m-0 text-2xl">
          {t('resources.playbookHeading')}
        </h2>
        <p className="m-0">{t('resources.playbookIntro')}</p>
      </div>
      <ol
        className="m-0 flex list-none flex-wrap gap-2 p-0"
        aria-label={t('resources.guideHeading')}
      >
        {(['stop', 'think', 'do'] as const).map((k, i) => (
          <li
            key={k}
            className="rounded-full border-2 border-sedra-green bg-white px-4 py-1 font-bold text-sedra-green"
          >
            {i + 1}. {t(`resources.${k}`)}
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {cards.map(({ key, icon: Icon, title, value }) => (
          <div
            key={key}
            className="grid grid-cols-1 content-start gap-2 rounded-xl border-2 bg-white p-4"
          >
            <h3 className="m-0 flex items-center gap-2 text-lg">
              <Icon aria-hidden="true" className="size-6" />
              {title}
            </h3>
            <p className="m-0">{value ?? t('resources.notChosen')}</p>
          </div>
        ))}
      </div>
      {pb?.saved ? (
        <p className="m-0 text-base text-ink-soft">{t('resources.playbookSaved')}</p>
      ) : null}
      {ls08 ? (
        <Link
          to="/courses/$courseId/units/$unitId"
          params={{ courseId: ls08.courseId, unitId: ls08.id }}
          className="inline-flex min-h-12 items-center gap-2 justify-self-start font-semibold text-sedra-green underline"
        >
          {t('resources.openPlaybookUnit')}
          <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
        </Link>
      ) : null}
    </section>
  )
}
