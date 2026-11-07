import type { PracticeStatus, Unit } from '@shared/types'
import { Check, Clock, HandHelping, Lightbulb, type LucideIcon, Printer, Save } from 'lucide-react'
import { useId } from 'react'
import { useTranslation } from 'react-i18next'
import { announce } from '@/components/shared/LiveRegion'
import { Button } from '@/components/ui/button'
import { useLocalized } from '@/i18n'
import { cn } from '@/lib/utils'
import {
  getUnitProgress,
  setPlaybook,
  setPracticePlan,
  updateUnitProgress,
  useLearner,
} from '@/store/actions'

type PlanStatus = 'planned' | PracticeStatus

const STATUS_ICONS: Record<PlanStatus, LucideIcon> = {
  planned: Clock,
  done: Check,
  later: Clock,
  'with-help': HandHelping,
}

/**
 * LS08 communication cards (brief §5 LS08 scene 3). Pause cards come from unit.practice.choices.
 * Both are stored by index in learner.playbook.
 */
export const PLAYBOOK_MESSAGE_KEYS = ['talk', 'help'] as const

/**
 * HF06 / HF07 sorting cards (brief §5): button choices, no drag-and-drop. Stored in
 * progress.practiceChoices as [card1, card2, feeling]: 0 unset, 1 helpful, 2 not helpful;
 * feeling = index + 1.
 */
const SORT_CARDS: Partial<Record<string, { key: string; expected: 1 | 2 }[]>> = {
  HF06: [
    { key: 'clearDirections', expected: 1 },
    { key: 'ignores', expected: 2 },
  ],
  HF07: [
    { key: 'waits', expected: 1 },
    { key: 'interrupts', expected: 2 },
  ],
}
const FEELING_KEYS = ['comfortable', 'unsure', 'another'] as const

function ToggleChoice({
  pressed,
  onClick,
  children,
}: {
  pressed: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <Button
      type="button"
      variant="outline"
      aria-pressed={pressed}
      onClick={onClick}
      className={cn(
        'h-auto min-h-12 justify-start whitespace-normal text-start',
        pressed && 'bg-sedra-pale-100',
      )}
    >
      <span
        aria-hidden="true"
        className={cn(
          'flex size-6 shrink-0 items-center justify-center rounded-md border-2 border-sedra-green',
          pressed && 'bg-sedra-green text-white',
        )}
      >
        {pressed && <Check className="size-4" />}
      </span>
      {children}
    </Button>
  )
}

/** Optional practice (brief §4): never blocks progress; status Done / Later / With help. */
export function PracticePanel({ unit }: { unit: Unit }) {
  const { t } = useTranslation('unit')
  const { l } = useLocalized()
  const learner = useLearner()
  const progress = getUnitProgress(learner, unit.id)
  const ids = useId()
  const isPlaybook = unit.id === 'LS08'
  const isPlan = unit.id === 'HF08'
  const choices = unit.practice.choices ?? []
  const picked = progress.practiceChoices ?? []

  const statuses: PlanStatus[] = isPlan
    ? ['planned', 'done', 'later', 'with-help']
    : ['done', 'later', 'with-help']
  const currentStatus: PlanStatus | undefined = isPlan
    ? (learner?.practicePlan?.status ?? progress.practice)
    : progress.practice

  const sortCards = SORT_CARDS[unit.id]
  function setSlot(slot: number, value: number) {
    const next = [0, 0, 0].map((d, i) => picked[i] ?? d)
    next[slot] = value
    updateUnitProgress(unit.id, { practiceChoices: next })
  }

  const maxPick = unit.id === 'LS05' ? 2 : undefined

  function toggleChoice(i: number) {
    let next: number[]
    if (unit.practice.multiple) {
      if (picked.includes(i)) next = picked.filter((x) => x !== i)
      // LS05 brief: "Choose two possible explanations".
      else if (maxPick && picked.length >= maxPick) return
      else next = [...picked, i]
    } else {
      next = picked.includes(i) ? [] : [i]
    }
    updateUnitProgress(unit.id, { practiceChoices: next })
    if (isPlan) setPracticePlan({ ...learner?.practicePlan, action: next[0] })
  }

  function setStatus(s: PlanStatus) {
    if (isPlan) setPracticePlan({ ...learner?.practicePlan, status: s })
    if (s !== 'planned') updateUnitProgress(unit.id, { practice: s })
    announce(t('practice.saved', { status: t(`practice.status.${s}`) }))
  }

  const playbook = learner?.playbook
  function savePlaybook() {
    if (playbook?.pause === undefined || playbook.message === undefined) {
      announce(t('playbook.chooseBoth'))
      return
    }
    setPlaybook({ ...playbook, saved: true })
    updateUnitProgress(unit.id, { practice: 'done' })
    announce(t('playbook.savedAnnounce'))
  }

  return (
    <div className="flex flex-col gap-5">
      <p className="m-0">{l(unit.practice.prompt)}</p>

      {!isPlaybook && !sortCards && choices.length > 0 && (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 p-0 font-semibold">
            {maxPick
              ? t('practice.chooseTwo')
              : unit.practice.multiple
                ? t('practice.chooseMany')
                : t('practice.chooseOne')}
          </legend>
          <div className="grid gap-2 sm:grid-cols-2">
            {choices.map((c, i) => (
              <ToggleChoice key={c.en} pressed={picked.includes(i)} onClick={() => toggleChoice(i)}>
                {l(c)}
              </ToggleChoice>
            ))}
          </div>
        </fieldset>
      )}

      {isPlaybook && (
        <div className="flex flex-col gap-4">
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 font-semibold">{t('playbook.pauseLegend')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {choices.map((c, i) => (
                <ToggleChoice
                  key={c.en}
                  pressed={playbook?.pause === i}
                  onClick={() => setPlaybook({ ...playbook, pause: i, saved: false })}
                >
                  {l(c)}
                </ToggleChoice>
              ))}
            </div>
          </fieldset>
          <fieldset className="m-0 border-0 p-0">
            <legend className="mb-2 p-0 font-semibold">{t('playbook.messageLegend')}</legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {PLAYBOOK_MESSAGE_KEYS.map((k, i) => (
                <ToggleChoice
                  key={k}
                  pressed={playbook?.message === i}
                  onClick={() => setPlaybook({ ...playbook, message: i, saved: false })}
                >
                  {t(`playbook.message.${k}`)}
                </ToggleChoice>
              ))}
            </div>
          </fieldset>
          <Button type="button" className="self-start" onClick={savePlaybook}>
            <Save aria-hidden="true" />
            {t('playbook.save')}
          </Button>
          {playbook?.saved && playbook.pause !== undefined && playbook.message !== undefined && (
            <section
              aria-labelledby={`${ids}-reminder`}
              className="rounded-2xl border-2 border-sedra-green bg-white p-4"
            >
              <h4 id={`${ids}-reminder`} className="m-0 text-lg font-bold text-sedra-green">
                {t('playbook.cardTitle')}
              </h4>
              <ul className="m-0 mt-2 ps-6">
                <li>{t('playbook.steps')}</li>
                <li>
                  {t('playbook.myPause')} {l(choices[playbook.pause])}
                </li>
                <li>
                  {t('playbook.myMessage')}{' '}
                  {t(`playbook.message.${PLAYBOOK_MESSAGE_KEYS[playbook.message] ?? 'talk'}`)}
                </li>
              </ul>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="mt-3"
                onClick={() => window.print()}
              >
                <Printer aria-hidden="true" />
                {t('playbook.print')}
              </Button>
            </section>
          )}
        </div>
      )}

      {sortCards && (
        <div className="flex flex-col gap-4">
          {sortCards.map((card, ci) => {
            const value = picked[ci] ?? 0
            return (
              <fieldset key={card.key} className="m-0 rounded-2xl border bg-white p-4">
                <legend className="px-1 font-semibold">{t(`sort.cards.${card.key}`)}</legend>
                <div className="mt-1 flex flex-wrap gap-2">
                  {([1, 2] as const).map((v) => (
                    <ToggleChoice key={v} pressed={value === v} onClick={() => setSlot(ci, v)}>
                      {v === 1 ? t('sort.helpful') : t('sort.notHelpful')}
                    </ToggleChoice>
                  ))}
                </div>
                {value !== 0 && (
                  <p className="m-0 mt-2 flex items-start gap-2 text-base">
                    <Lightbulb aria-hidden="true" className="mt-1 size-5 shrink-0 text-notice" />
                    {value === card.expected
                      ? t(`sort.feedback.${card.key}`)
                      : t('sort.thinkAgain', { card: t(`sort.cards.${card.key}`) })}
                  </p>
                )}
              </fieldset>
            )
          })}
          {unit.id === 'HF07' && (
            <fieldset className="m-0 border-0 p-0">
              <legend className="mb-2 p-0 font-semibold">{t('sort.feelingLegend')}</legend>
              <div className="grid gap-2 sm:grid-cols-3">
                {FEELING_KEYS.map((k, i) => (
                  <ToggleChoice
                    key={k}
                    pressed={picked[2] === i + 1}
                    onClick={() => setSlot(2, picked[2] === i + 1 ? 0 : i + 1)}
                  >
                    {t(`sort.feelings.${k}`)}
                  </ToggleChoice>
                ))}
              </div>
            </fieldset>
          )}
        </div>
      )}

      {isPlan && picked.length === 0 ? (
        <p className="m-0 text-base text-ink-soft">{t('practice.planFirst')}</p>
      ) : (
        <fieldset className="m-0 border-0 p-0">
          <legend className="mb-2 p-0 font-semibold">{t('practice.statusLegend')}</legend>
          <div className="flex flex-wrap gap-2">
            {statuses.map((s) => {
              const Icon = STATUS_ICONS[s]
              const pressed = currentStatus === s
              return (
                <Button
                  key={s}
                  type="button"
                  variant={pressed ? 'default' : 'outline'}
                  aria-pressed={pressed}
                  onClick={() => setStatus(s)}
                >
                  <Icon aria-hidden="true" />
                  {t(`practice.status.${s}`)}
                </Button>
              )
            })}
          </div>
        </fieldset>
      )}
      <p className="m-0 text-base text-ink-soft">{t('practice.optionalNote')}</p>
    </div>
  )
}
