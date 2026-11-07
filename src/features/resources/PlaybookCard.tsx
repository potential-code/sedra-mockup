import { Link } from '@tanstack/react-router'
import { ArrowRight, BookHeart, MessageCircle, PauseCircle } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { getUnit } from '@/content'
import { PLAYBOOK_MESSAGE_KEYS } from '@/features/unit/PracticePanel'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
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
    {
      key: 'pause',
      icon: PauseCircle,
      title: t('resources.myPause'),
      value: pause,
      tilt: 'md:-rotate-2',
    },
    {
      key: 'message',
      icon: MessageCircle,
      title: t('resources.myMessage'),
      value: message,
      tilt: 'md:rotate-2',
    },
  ]

  return (
    <section
      aria-labelledby="playbook-heading"
      className="motif-tree-light grid h-full grid-cols-1 content-start gap-5 rounded-3xl bg-sedra-green-800 p-6 text-white shadow-lg md:p-7"
    >
      <div className="flex items-start gap-3">
        <span
          aria-hidden="true"
          className="flex size-12 shrink-0 items-center justify-center rounded-2xl bg-white text-sedra-green-800 shadow-md"
        >
          <BookHeart className="size-7" />
        </span>
        <div className="grid min-w-0 grid-cols-1 gap-1">
          <h3 id="playbook-heading" className="m-0 text-2xl text-white">
            {t('resources.playbookHeading')}
          </h3>
          <p className="m-0 text-white">{t('resources.playbookIntro')}</p>
        </div>
      </div>
      <ol
        className="m-0 flex list-none flex-wrap gap-2 p-0"
        aria-label={t('resources.guideHeading')}
      >
        {(['stop', 'think', 'do'] as const).map((k, i) => (
          <li
            key={k}
            className="inline-flex items-center gap-2 rounded-full bg-white/10 py-1 ps-1 pe-4 font-bold text-white ring-1 ring-white/40"
          >
            <span
              aria-hidden="true"
              className="flex size-7 items-center justify-center rounded-full bg-white text-sm text-sedra-green-800"
            >
              {i + 1}
            </span>
            <span className="sr-only">{i + 1}. </span>
            {t(`resources.${k}`)}
          </li>
        ))}
      </ol>
      <div className="grid grid-cols-1 gap-4 py-1 sm:grid-cols-2">
        {cards.map(({ key, icon: Icon, title, value, tilt }) => (
          <div
            key={key}
            className={cn(
              'grid content-start gap-2 rounded-2xl bg-white p-4 text-ink shadow-lg',
              'motion-safe:transition-transform motion-safe:duration-300 motion-safe:hover:rotate-0 motion-safe:hover:-translate-y-1',
              tilt,
            )}
          >
            <h4 className="m-0 flex items-center gap-2 text-lg font-bold text-sedra-green">
              <Icon aria-hidden="true" className="size-6" />
              {title}
            </h4>
            <p className={cn('m-0', !value && 'text-ink-soft')}>
              {value ?? t('resources.notChosen')}
            </p>
          </div>
        ))}
      </div>
      {pb?.saved ? (
        <p className="m-0 text-base text-white">{t('resources.playbookSaved')}</p>
      ) : null}
      {ls08 ? (
        <Link
          to="/courses/$courseId/units/$unitId"
          params={{ courseId: ls08.courseId, unitId: ls08.id }}
          className="inline-flex min-h-12 items-center gap-2 justify-self-start rounded-xl bg-white px-5 font-semibold text-sedra-green-800 shadow-md hover:bg-sedra-pale-50 motion-safe:transition-transform motion-safe:active:scale-[0.97]"
        >
          {t('resources.openPlaybookUnit')}
          <ArrowRight aria-hidden="true" className="size-5 rtl-mirror" />
        </Link>
      ) : null}
    </section>
  )
}
